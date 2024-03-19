/*
 * Copyright 2023 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */
import React, { useEffect, useState } from "react";
import { Provider, defaultTheme, Flex, View, Button } from "@adobe/react-spectrum";
import { attach } from "@adobe/uix-guest";
import Spinner from './Spinner';
import { WorkflowsSelection } from "./Workflows/WorkflowsSelection";
import { ContentFragmentsSelection } from "./Workflows/ContentFragmentsSelection";
import { EXTENSION_ID } from "./Constants";
import { useParams } from 'react-router-dom';
import { WorkflowSubmittingResult } from "./Workflows/WorkflowSubmittingResult";

export const WorkflowsModal = () => {
  const [sharedContext, setSharedContext] = useState(false);
  const [workflowTitle, setWorkflowTitle] = useState("");
  const [workflowModel, setWorkflowModel] = useState("");
  const [contentFragmentsToProceed, setContentFragmentsToProceed] = useState([]);
  const [isSubmittingWorkflows, setIsSubmittingWorkflows] = useState(false);

  const { fragmentIds } = useParams();
  if (!fragmentIds) {
    console.error('Content fragment ids parameter is missed');
    return;
  }

  useEffect(() => {
    const init = async () => {
      const connection = await attach({ id: EXTENSION_ID });
      setSharedContext(connection.sharedContext);
    };
    init().catch((e) =>
        console.log("Extension got the error during initialization:", e)
    );
  }, []);

  const startWorkflowHandler = () => {
    setIsSubmittingWorkflows(true);
  };

  const openWorkflowsFailures = () => {
    window.open(`http://${sharedContext.get('aemHost')}/ui#/aem/libs/cq/workflow/admin/console/content/failures.html`);
  };

  const openWorkflowsInstances = () => {
    window.open(`http://${sharedContext.get('aemHost')}/ui#/aem/libs/cq/workflow/admin/console/content/instances.html`);
  };

  const openWorkflowsArchive = () => {
    window.open(`http://${sharedContext.get('aemHost')}/ui#/aem/libs/cq/workflow/admin/console/content/archive.html`);
  };

  return (
      <Provider theme={defaultTheme} colorScheme={'light'}>
        {sharedContext ? (
            <Flex direction="column" width="97%" height="100%">
              {!isSubmittingWorkflows && (
                  <>
                    <WorkflowsSelection
                        aemHost={sharedContext.get('aemHost')}
                        token={sharedContext.get('auth').imsToken}
                        setWorkflowTitle={setWorkflowTitle}
                        setWorkflowModel={setWorkflowModel}
                    />
                    <ContentFragmentsSelection
                        aemHost={sharedContext.get('aemHost')}
                        token={sharedContext.get('auth').imsToken}
                        fragmentIds={fragmentIds.split(',')}
                        setContentFragmentsToProceed={setContentFragmentsToProceed}
                    />
                  </>
              )}
              {isSubmittingWorkflows && (
                  <>
                    <WorkflowSubmittingResult
                        contentFragments={contentFragmentsToProceed}
                        aemHost={sharedContext.get('aemHost')}
                        token={sharedContext.get('auth').imsToken}
                        workflowTitle={workflowTitle}
                        workflowModel={workflowModel}
                    />
                  </>
              )}

              <Flex alignSelf="end" gap="size-200" marginTop="size-250">
                {isSubmittingWorkflows && (
                    <>
                      <Button variant="primary" onPress={openWorkflowsFailures}>
                        Workflow Failures
                      </Button>
                      <Button variant="primary" onPress={openWorkflowsInstances}>
                        Workflow Instances
                      </Button>
                      <Button variant="primary" onPress={openWorkflowsArchive}>
                        Workflow Archive
                      </Button>
                    </>
                )}
                {!isSubmittingWorkflows && (
                    <Button
                        variant="accent"
                        alignSelf="end"
                        marginTop="size-250"
                        onPress={startWorkflowHandler}
                        isDisabled={!(workflowTitle && workflowModel)}
                    >Start Workflow</Button>
                )}
              </Flex>
            </Flex>
        ) : (
            <View width="97%" height="100%">
              <Spinner />
            </View>
        )}
      </Provider>
  );
};
