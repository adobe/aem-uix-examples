/*
 * <license header>
 */

import React, { useState, useEffect } from 'react'
import { generatePath } from "react-router";
import { attach } from "@adobe/uix-guest"
import {
  Flex,
  Form,
  ProgressCircle,
  Provider,
  Content,
  defaultTheme,
  TextField,
  ButtonGroup,
  Button,
  Heading,
  View,
  Divider
} from '@adobe/react-spectrum'
import { useParams } from "react-router-dom"
import { triggerExportToAdobeTarget } from '../utils'
import { extensionId } from "./Constants"

const CF_PUBLISH_PROMPT_MESSAGE =
  "The Adobe Target offer may not be displayed correctly if the Content Fragment is not published.<br>Do you also want to publish the Content Fragment?";
const CF_PUBLISH_PROMPT_MESSAGE_MULTIPLE =
  "The Adobe Target offers may not be displayed correctly if the pages are not published.<br>Do you also want to publish the pages?";
const CF_PUBLISH_WARNING = "Please note that publish will publish the Content Fragment Models and variations as well.";

function publishPromptMessage(multiple) {
  return {__html: multiple ? CF_PUBLISH_PROMPT_MESSAGE_MULTIPLE : CF_PUBLISH_PROMPT_MESSAGE};
}

function publishWarning() {
  return {__html: CF_PUBLISH_WARNING};
}

export default function ExporttoAdobeTargetOffersModal () {
  // Fields
  const [guestConnection, setGuestConnection] = useState()
  const [selectedContentFragments, setSelectedContentFragments] = useState([])
  const [inProgress, setInprogress] = useState(false);

  const { batchId } = useParams()

  useEffect(() => {
    if (!batchId) {
      console.error("batchId parameter is missing")
      return
    }
    const batchData = sessionStorage.getItem(batchId)
    if (!batchData) {
      console.error("Invalid batch specified for exporting")
      return
    }
    try {
      const cfs = JSON.parse(batchData)
      sessionStorage.removeItem(batchId)
      setSelectedContentFragments(cfs)
    } catch (e) {
      console.error(`Invalid batch data: ${e}`)
      return
    }
  }, [batchId]);

  useEffect(() => {
    (async () => {
      const guestConnection = await attach({ id: extensionId })
      setGuestConnection(guestConnection)
    })()
  }, [])

  const unpublishedContentFragments = selectedContentFragments.filter(cf => cf.status !== "published")
  const unpublishedContentFragmentsList = unpublishedContentFragments.map(cf => {
    const cfUrl = "/index.html#" + generatePath("/content-fragment/:fragmentId", {
      fragmentId: cf.id.substring(1),
    });
    const openCfHandler = (e) => {
      guestConnection.host.navigation.openEditor(cf.id);
      e.preventDefault();
    }
    return <li key={cf.id}><a href={cfUrl} onClick={openCfHandler}>{cf.title}</a></li>
  })

  const onCloseHandler = () => {
    guestConnection.host.modal.close()
  }

  const onExportWithoutPublishingHandler = async () => {
    setInprogress(true);

    try {
      const auth = await guestConnection.sharedContext.get("auth");
      const token = auth.imsToken;
      const imsOrg = auth.imsOrg;
      const repo = await guestConnection.sharedContext.get("aemHost");
      const paths = selectedContentFragments.map(el => el.id);
      await triggerExportToAdobeTarget(token, repo, imsOrg, paths);
      await guestConnection.host.toaster.display({
        variant: "positive",
        message: "Content fragment(s) exported successfully",
      });
    } catch (e) {
      console.error('Export to target got an error', e);
      await guestConnection.host.toaster.display({
        variant: "negative",
        message: "There was an error while exporting Content Fragment(s)",
      });
    }
    await guestConnection.host.modal.close();
  }

  const onPublishAndExportHandler = () => {
    setInprogress(true);
    setTimeout(() => {
      guestConnection.host.modal.close()
    }, 5000)
  }

  const onTaskCompleted = () => {

  }

  if (inProgress) {
    return (
      <Provider theme={defaultTheme} colorScheme='light'>
        <Content width="100%">
          <View>
            Processing...
          </View>
        </Content>
      </Provider>
    )
  }

  return (
    <Provider theme={defaultTheme} colorScheme='light'>
      <Content width="100%">
        <View>
          <div dangerouslySetInnerHTML={publishPromptMessage(selectedContentFragments.length > 1)}/>
        </View>
        <Divider size="S" marginTop="size-300" marginBottom="size-300"/>
        <View>
          {unpublishedContentFragmentsList.length > 1 ? "The following content fragments are not published:" : "The following content fragment is not published:"}
          <ul>
            {unpublishedContentFragmentsList}
          </ul>
        </View>
        <Divider size="S" marginTop="size-300" marginBottom="size-300"/>
        <View UNSAFE_style={{fontWeight: "bold"}}>
          <div dangerouslySetInnerHTML={publishWarning()}/>
        </View>

        <Flex width="100%" justifyContent="end" alignItems="center" marginTop="size-400">
          <ButtonGroup align="end">
            <Button variant="primary" onClick={onCloseHandler}>Cancel</Button>
            <Button variant="primary" onClick={onExportWithoutPublishingHandler}>Export without publishing</Button>
            <Button variant="accent" onClick={onPublishAndExportHandler}>Publish and Export</Button>
          </ButtonGroup>
        </Flex>
      </Content>
    </Provider>
  )
}
