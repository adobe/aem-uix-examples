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
import { Flex, Heading, Item, Picker, ProgressBar, Text, TextField } from "@adobe/react-spectrum";
import { useEffect, useState } from "react";
import { getWorkflows } from "../utils";

const LoadingWorkflows = () => {
  return (
      <Flex flex="1">
        <ProgressBar label="Loading workflows..." isIndeterminate />
      </Flex>
  );
};

const FetchError = ({ aemHost }) => {
  return (
      <Flex direction="column" justifyContent="center" alignItems="center" gap="size-200" height="100%">
        <Heading>Error fetching Workflows</Heading>
        <Text>
          There was an error fetching workflows from your connected AEM Instance: {aemHost}
        </Text>
      </Flex>
  );
};

const CountZero = ({ aemHost }) => {
  return (
      <Flex direction="column" justifyContent="center" alignItems="center" gap="size-200" height="100%">
        <Heading>No workflows found</Heading>
        <Text>There were no workflows found in your connected AEM Instance: {aemHost}</Text>
      </Flex>
  );
};

export const WorkflowsSelection = ({
  aemHost,
  token,
  setWorkflowTitle,
  setWorkflowModel,
}) => {
  const [workflows, setWorkflows] = useState([]);
  const [isLoadingWorkflows, setIsLoadingWorkflows] = useState(true);
  const [isErrorWithWorkflows, setIsErrorWithWorkflows] = useState(false);

  useEffect(() => {
    const init = async () => {
      const workflows = await getWorkflows({
        aemHost: aemHost,
        token: token,
      });
      setWorkflows(workflows);
      setIsErrorWithWorkflows(false);
      setIsLoadingWorkflows(false);
    };

    init().catch((e) => {
      console.log("Extension got the error during load workflows:", e);
      setIsErrorWithWorkflows(true);
      setIsLoadingWorkflows(false);
    });
  }, [aemHost, token]);

  if (isLoadingWorkflows === true) {
    return <LoadingWorkflows />;
  } else if (isErrorWithWorkflows === true) {
    return <FetchError aemHost={aemHost} />;
  } else if (workflows.length === 0) {
    return <CountZero aemHost={aemHost} />;
  } else {
    return (
        <Flex direction="row" width="100%" gap="size-200" justifyContent="space-between">
            <Flex flex="1" gap="size-200" justifyContent="space-evenly">
                <Picker
                    label="Workflow Model:"
                    items={workflows}
                    onSelectionChange={setWorkflowModel}
                    flex="1"
                >
                    {(item) => <Item key={item.value}>{item.label}</Item>}
                </Picker>
                <TextField label="Name:" onChange={setWorkflowTitle} flex="1" />
            </Flex>
        </Flex>
    );
  }
};
