/*
Copyright 2024 Adobe. All rights reserved.
This file is licensed to you under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License. You may obtain a copy
of the License at http://www.apache.org/licenses/LICENSE-2.0
Unless required by applicable law or agreed to in writing, software distributed under
the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
OF ANY KIND, either express or implied. See the License for the specific language
governing permissions and limitations under the License.
*/

import React, { useState, useEffect, useCallback, useRef } from 'react'
import ErrorBoundary from 'react-error-boundary'
import { attach } from "@adobe/uix-guest"
import {
  Grid,
  Flex,
  Text,
  Content,
  ButtonGroup,
  Button,
  Heading,
  TableView,
  TableHeader,
  TableBody,
  Row,
  Cell,
  Column,
  View
} from '@adobe/react-spectrum'
import {Accordion, AccordionItem} from '@react/react-spectrum/Accordion';
import Spinner from './Spinner';
import { useParams } from "react-router-dom"

import { extensionId } from "./Constants"

import { getContentFragmentsInfo } from '../utils';

const versionColumns = [
  {name: 'Version Number', uid: 'title'},
  {name: 'Version ID', uid: 'id'},
  {name: 'Created At', uid: 'created'},
  {name: 'Created By', uid: 'createdBy'}
];

const fieldColumns = [
  {name: 'Name', uid: 'name'},
  {name: 'Type', uid: 'type'},
];

export default function DisplayMetadataModal () {
  // Fields
  const [isContentLoading, setIsContentLoading] = useState(true);
  const [guestConnection, setGuestConnection] = useState();
  const [error, setError] = useState(null);
  const [fragments, setFragments] = useState([]);
  const { selection } = useParams();
  const fragmentIds = selection?.split('|') || [];

  console.log('Selected Fragment Ids', fragmentIds);
  if (fragmentIds.length === 0) {
    console.error('No Content Fragments are selected.');
    return;
  }

  const heightRef = useRef(0);
  const containerRef = useCallback(async (node) => {
    if (node !== null && guestConnection !== null) {
      const height = Number((document.body.clientHeight).toFixed(0));
      if (heightRef.current !== height) {
        heightRef.current = height;
        await guestConnection.host.modal.set({
          height
        });
      }
    }
  }, [guestConnection]);

  useEffect(() => {
    (async () => {
      try {
        const guestConnection = await attach({ id: extensionId })

        setGuestConnection(guestConnection);
        console.log(guestConnection);

        const auth = guestConnection.sharedContext.get('auth');
        const aemHost = guestConnection.sharedContext.get('aemHost');

        const fragments = await getContentFragmentsInfo(aemHost, fragmentIds, auth);
        console.log(fragments);
        setFragments(fragments);
      } catch(e) {
        setError('Unable to retrieve information about selected fragments.');
      } finally {
        setIsContentLoading(false);
      }
    })()
  }, [])

  const onCloseHandler = () => {
    guestConnection.host.modal.close()
  }

  return (isContentLoading || !guestConnection) ? (
    <Flex width="100%" height="100vh" alignItems="center" justifyContent="center">
        <Spinner/>
    </Flex>
  ) : (error) ? (
    <Grid
        areas={[
            'content content',
            'footer  footer'
        ]}
        columns={['1fr', '3fr']}
        rows={['calc(100% - 55px)', '50px']}
        width="100%" height="100vh"
        gap="size-25">
    <Flex width="100%" height="100vh" alignItems="center" justifyContent="center" wrap="wrap" gridArea="content">
        <div style={{textAlign: "center", width: "100%", fontSize: "18px"}}><i>{error}</i></div>
    </Flex>
        <Flex justifyContent="end"
              alignItems="center" gridArea="footer">
            <Button variant="secondary" onPress={() => guestConnection.host.modal.close()}>Close</Button>
        </Flex>
    </Grid>
  ) : (
      <Content width="100%" height="95%" UNSAFE_style={{ overflowY: "hidden" }}>
      <Flex direction="column" ref={containerRef} wrap="wrap">
      <Heading level={3}>This extension displays the metadata of the {fragmentIds.length} content fragments you selected.</Heading>
      <View marginBottom="size-150">
      <ErrorBoundary onError={onError} FallbackComponent={fallbackComponent}>
      <Accordion aria-label="Default" 
                 ariaLevel={1} 
                 multiselectable={true}
                 >
        {fragments.map((cf, index) => 
            <AccordionItem
                key={index}
                disabled={false}
                header={cf.title}
            >
            <Heading level={4}>Fragment ID</Heading>
            {cf.id}
            <Heading level={4}>Created on</Heading>
            {new Date(cf.created.at).toDateString()} by {cf.created.by}
            {cf.published ? (
              <>
              <Heading level={4}>Last published on</Heading>
              {new Date(cf.published.at).toDateString()} by {cf.published.by}
              </>
            ) : <></>
            }
            <Heading level={4}>Version History</Heading>
            {cf.versions.length > 0 ? (
              <>
              <TableView
              aria-label="Versions Table"
              width="90%">
                <TableHeader columns={versionColumns}>
                  {column => (
                    <Column
                      key={column.uid}
                      allowsResizing>
                      {column.name}
                    </Column>
                  )}
                </TableHeader>
                <TableBody items={cf.versions}>
                  {item => (
                    <Row>
                      {columnKey => <Cell>{item[columnKey]}</Cell>}
                    </Row>
                  )}
                </TableBody>
              </TableView>
              </>
            ) : (
              <Text>No published versions.</Text>
            )}
            <Heading level={4}>Fields</Heading>
            {cf.fields?.length > 0 ? (
              <>
              <TableView
              aria-label="Fields Table"
              width="50%">
                <TableHeader columns={fieldColumns}>
                  {column => (
                    <Column
                      key={column.uid}>
                      {column.name}
                    </Column>
                  )}
                </TableHeader>
                <TableBody items={cf.fields.map((item, index) => ({...item, id: index + 1}))}>
                  {item => (
                    <Row>
                      {columnKey => <Cell>{item[columnKey]}</Cell>}
                    </Row>
                  )}
                </TableBody>
              </TableView>
              </>
            ) : (
              <Text>No fields.</Text>
            )}
            </AccordionItem>
        )}
      </Accordion>
      </ErrorBoundary>
      </View>
      <View position="relative" width="100%" height="size-300" marginBottom="size-150">
          <Button variant="primary" onPress={onCloseHandler} position="absolute" bottom="0" right="size-200">
            Close
          </Button>
      </View>
    </Flex>
    </Content>
  )

  // error handler on UI rendering failure
  function onError(e, componentStack) {
  }

  // component to show if UI fails rendering
  function fallbackComponent({componentStack, error}) {
      return (
          <React.Fragment>
              <h1 style={{textAlign: "center", marginTop: "20px"}}>
                  Phly, phly... Something went wrong
              </h1>
              <pre>{componentStack + "\n" + error.message}</pre>
          </React.Fragment>
      );
  }
}
