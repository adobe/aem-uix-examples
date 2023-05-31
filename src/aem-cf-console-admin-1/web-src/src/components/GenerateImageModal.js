/*
Copyright 2023 Adobe
All Rights Reserved.

NOTICE: Adobe permits you to use, modify, and distribute this file in
accordance with the terms of the Adobe license agreement accompanying
it.
*/

import {
    Button,
    ButtonGroup,
    Content,
    ContextualHelp,
    Flex,
    Form,
    Heading,
    Link,
    Provider,
    Text,
    TextField,
    defaultTheme
} from "@adobe/react-spectrum";
import React, {useEffect, useState} from "react";

import Spinner from "./Spinner";
import actionWebInvoke from "../utils";
import allActions from "../config.json";
import { attach } from "@adobe/uix-guest";
import { extensionId } from "./Constants";
import {useParams} from "react-router-dom";

export default function GenerateImageModal() {
    // Set up state used by the React component
    const [guestConnection, setGuestConnection] = useState();
  
    // State hooks to manage the application state
    const [imageDescription, setImageDescription] = useState(null);
    const [validationState, setValidationState] = useState({});
  
    const [actionInvokeInProgress, setActionInvokeInProgress] = useState(false);
    const [actionResponse, setActionResponse] = useState();
  
    // Get the selected content fragment paths from the route parameter `:selection`
    const { selection } = useParams();
    const fragmentIds = selection?.split('|') || [];
  
    console.log('Selected Fragment Ids', fragmentIds);
  
    if (!fragmentIds || fragmentIds.length === 0) {
      console.error('The Content Fragments are not selected, can NOT generate images');
      return;
    }
  
    // Asynchronously attach the extension to AEM, we must wait or the guestConnection to be set before doing anything in the modal
    useEffect(() => {
      (async () => {
        const myGuestConnection = await attach({ id: extensionId });
  
        setGuestConnection(myGuestConnection);
      })();
    }, []);
  
    // Determine view to display in the modal
    if (!guestConnection) {
      // If the guestConnection is not initialized, display a loading spinner
      return <Spinner />;
    } if (actionInvokeInProgress) {
      // If the 'Generate Image' action has been invoked but not completed, display a loading spinner
      return <Spinner />;
    } if (fragmentIds.length > 1) {
      // If more than one CF selected show warning and suggest to select only one CF
      return renderMoreThanOneCFSelectionError();
    } if (fragmentIds.length === 1 && !actionResponse) {
      // Display the 'Generate Image' modal and ask for image description
      return renderImgGenerationForm();
    } if (actionResponse) {
      // If the 'Generate Image' actio has completed, display the response
      return renderActionResponse();
    }
  
    /**
     * Renders the message suggesting to select only on CF at a time to not lose credits accidentally
     *
     * @returns the suggestion or error message to select one CF at a time
     */
    function renderMoreThanOneCFSelectionError() {
      return (
        <Provider theme={defaultTheme} colorScheme="light">
          <Content width="100%">
            <Text>
              As this operation
              <strong> uses credits from Generative AI services</strong>
              {' '}
              such as DALL.E 2 (or Stable Dufusion), we allow only one Generate Image at a time.
              <p />
            </Text>
  
            <Flex width="100%" justifyContent="end" alignItems="center" marginTop="size-400">
              <ButtonGroup align="end">
                <Button variant="negative" onPress={() => guestConnection.host.modal.close()}>Close</Button>
              </ButtonGroup>
            </Flex>
  
          </Content>
        </Provider>
      );
    }
  
    /**
     * Renders the form asking for image description in the natural language and
     * displays message this action uses credits from Generative AI services.
     *
     *
     * @returns the image description input field and credit usage message
     */
    function renderImgGenerationForm() {
      return (
  
        <Provider theme={defaultTheme} colorScheme="light">
          <Content width="100%">
  
            <Flex width="100%">
              <Form
                width="100%"
              >
                <TextField
                  label="Image Description"
                  description="The image description in natural language, for e.g. Alaskan adventure in wilderness, animals, and flowers."
                  isRequired
                  validationState={validationState?.propertyName}
                  onChange={setImageDescription}
                  contextualHelp={(
                    <ContextualHelp>
                      <Heading>Need help?</Heading>
                      <Content>
                        <Text>
                          The
                          <strong>description of an image</strong>
                          {' '}
                          you are looking for in the natural language, for e.g. &quot;Family vacation on the beach with blue ocean, dolphins, boats and drink&quot;
                        </Text>
                      </Content>
                    </ContextualHelp>
                    )}
                />
  
                <ButtonGroup align="end">
                  <Button variant="accent" onPress={onSubmitHandler}>Use Credits</Button>
                  <Button variant="accent" onPress={() => guestConnection.host.modal.close()}>Close</Button>
                </ButtonGroup>
              </Form>
            </Flex>
  
          </Content>
        </Provider>
  
      );
    }
  
    function buildAssetDetailsURL(aemImgURL) {
      const urlParts = aemImgURL.split('.com');
      const aemAssetdetailsURL = `${urlParts[0]}.com/ui#/aem/assetdetails.html${urlParts[1]}`;
  
      return aemAssetdetailsURL;
    }
  
    /**
     * Displays the action response received from the App Builder
     *
     * @returns Displays App Builder action and details
     */
    function renderActionResponse() {
      return (
        <Provider theme={defaultTheme} colorScheme="light">
          <Content width="100%">
  
            {actionResponse.status === 'success'
              && (
                <>
                  <Heading level="4">
                    Successfully generated an image and associated it to the selected Content Fragment.
                  </Heading>
  
                  <Text>
                    {' '}
                    Please see generated image in AEM-CS
                    {' '}
                    <Link>
                      <a href={buildAssetDetailsURL(actionResponse.aemImgURL)} target="_blank" rel="noreferrer">
                        here.
                      </a>
                    </Link>
                  </Text>
                </>
              )}
  
            {actionResponse.status === 'failure'
              && (
              <Heading level="4">
                Failed to generate, upload image, please check App Builder logs.
              </Heading>
              )}
  
            <Flex width="100%" justifyContent="end" alignItems="center" marginTop="size-400">
              <ButtonGroup align="end">
                <Button variant="negative" onPress={() => guestConnection.host.modal.close()}>Close</Button>
              </ButtonGroup>
            </Flex>
  
          </Content>
        </Provider>
      );
    }
  
    /**
     * Handle the Generate Image form submission.
     * This function calls the supporting Adobe I/O Runtime actions such as
     * - Call the Generative AI service (DALL.E) with 'image description' to generate an image
     * - Download the AI generated image to App Builder runtime
     * - Save the downloaded image to AEM DAM and update Content Fragement's image reference property to use this new image
     *
     * When invoking the Adobe I/O Runtime actions, the following parameters are passed as they're used by the action to connect to AEM:
     * - AEM Host to connect to
     * - AEM access token to connect to AEM with
     * - The Content Fragment path to update
     *
     * @returns In case of success the updated content fragment, otherwise failure message
     */
    async function onSubmitHandler() {
      console.log('Started Image Generation orchestration');
  
      // Validate the form input fields
      if (imageDescription?.length > 1) {
        setValidationState({ imageDescription: 'valid' });
      } else {
        setValidationState({ imageDescription: 'invalid' });
        return;
      }
  
      // Mark the extension as invoking the action, so the loading spinner is displayed
      setActionInvokeInProgress(true);
  
      // Set the HTTP headers to access the Adobe I/O runtime action
      const headers = {
        Authorization: `Bearer ${guestConnection.sharedContext.get('auth').imsToken}`,
        'x-gw-ims-org-id': guestConnection.sharedContext.get('auth').imsOrg,
      };
  
      // Set the parameters to pass to the Adobe I/O Runtime action
      const params = {
  
        aemHost: `https://${guestConnection.sharedContext.get('aemHost')}`,
  
        fragmentId: fragmentIds[0],
        imageDescription,
      };
  
      const generateImageAction = 'generate-image';
  
      try {
        const generateImageActionResponse = await actionWebInvoke(allActions[generateImageAction], headers, params);
  
        // Set the response from the Adobe I/O Runtime action
        setActionResponse(generateImageActionResponse);
  
        console.log(`Response from ${generateImageAction}:`, actionResponse);
      } catch (e) {
        // Log and store any errors
        console.error(e);
      }
  
      // Set the action as no longer being invoked, so the loading spinner is hidden
      setActionInvokeInProgress(false);
    }
  }
  