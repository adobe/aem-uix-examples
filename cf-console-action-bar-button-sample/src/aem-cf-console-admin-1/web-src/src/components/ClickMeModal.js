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

const columns = [
  {name: 'Title', uid: 'title'},
  {name: 'Id', uid: 'id'},
  {name: 'Path', uid: 'path'}
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
    <Content width="100%">
      <Text>Number of Fragments Selected: {fragmentIds.length}</Text>
      <ErrorBoundary onError={onError} FallbackComponent={fallbackComponent}>
      <TableView
      aria-label="Content Fragments Table">
        <TableHeader columns={columns}>
          {column => (
            <Column
              key={column.uid}>
              {column.name}
            </Column>
          )}
        </TableHeader>
        <TableBody items={fragments}>
          {item => (
            <Row>
              {columnKey => <Cell>{item[columnKey]}</Cell>}
            </Row>
          )}
        </TableBody>
      </TableView>
      </ErrorBoundary>
      <Flex width="100%" justifyContent="end" alignItems="center" marginTop="size-400">
        <ButtonGroup align="end">
          <Button variant="primary" onClick={onCloseHandler}>Close</Button>
        </ButtonGroup>
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
                  Phly, phly... Something went wrong :(
              </h1>
              <pre>{componentStack + "\n" + error.message}</pre>
          </React.Fragment>
      );
  }
}
