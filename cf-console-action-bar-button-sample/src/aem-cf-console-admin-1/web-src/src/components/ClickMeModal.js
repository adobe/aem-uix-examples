/*
 * <license header>
 */

import React, { useState, useEffect } from 'react'
import ErrorBoundary from 'react-error-boundary'
import { attach } from "@adobe/uix-guest"
import {
  Grid,
  Flex,
  Form,
  ProgressCircle,
  Provider,
  Content,
  defaultTheme,
  Text,
  TextField,
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
import CFTable from './CFTable';
import { useParams } from "react-router-dom"

import allActions from '../config.json'
import actionWebInvoke from '../utils'

import { extensionId } from "./Constants"

async function getCFInfo(auth, fragmentIds, aemHost) {
  console.log({fragmentIds, aemHost});
  const endpoint = allActions['get-cf-info'] + '?' + new URLSearchParams({
      aemHost,
      fragmentIds,
  });

  return fetch(endpoint, {
      method: 'GET',
      headers: new Headers({
          Authorization: `Bearer ${auth.imsToken}`,
          'x-gw-ims-org-id': auth.imsOrg,
      })
  })
      .then(response => response.json())
      .then(response => {
          return response;
      });
}

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

export default function ClickMeModal () {
  // Fields
  const [isContentLoading, setContentLoading] = useState(true);
  const [guestConnection, setGuestConnection] = useState();
  const [error, setError] = useState(null);
  const [auth, setAuth] = useState();
  const [fragments, setFragments] = useState([]);
  const { selection } = useParams();
  const fragmentIds = selection?.split('|') || [];

  console.log('Selected Fragment Ids', fragmentIds);

  if (!fragmentIds || fragmentIds.length === 0) {
    console.error('No Content Fragments are selected.');
    return;
  }

  useEffect(() => {
    (async () => {
      try {
        const guestConnection = await attach({ id: extensionId })

        setGuestConnection(guestConnection);

        const auth = guestConnection.sharedContext.get('auth');
        setAuth(auth);

        const aemHost = guestConnection.sharedContext.get('aemHost');

        const fragments = await getCFInfo(auth, fragmentIds.join(','), aemHost);
        console.log(fragments);
        setFragments(fragments);
      } catch(e) {
        setError(e.message);
      } finally {
        setContentLoading(false);
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
      <Flex direction="column" width="100%" wrap="wrap">
      <Heading level={3}>This extension displays the metadata of the {fragmentIds.length} content fragments you selected.</Heading>
      <View>
      <ErrorBoundary onError={onError} FallbackComponent={fallbackComponent}>
      <Accordion aria-label="Default" 
                 ariaLevel={1} 
                 multiselectable={true}
                 defaultSelectedIndex={[0]}
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
      <Flex width="100%" justifyContent="end" marginTop="size-400">
        <ButtonGroup align="end">
          <Button variant="primary" onClick={onCloseHandler}>Close</Button>
        </ButtonGroup>
      </Flex>
    </Flex>
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
