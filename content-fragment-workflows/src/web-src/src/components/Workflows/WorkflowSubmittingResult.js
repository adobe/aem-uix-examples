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
import {
  Cell,
  Column,
  Heading,
  Row,
  TableView,
  TableBody,
  TableHeader,
} from "@adobe/react-spectrum";
import { SubmissionProgress } from "./SubmissionProgress";

export const WorkflowSubmittingResult = ({
   contentFragments,
   aemHost,
   token,
   workflowModel,
   workflowTitle,
}) => {
  const columns = [
    { name: "Title", key: "title", width: "3fr" },
    { name: "Workflow status", key: "workflow-status" },
  ];

  return (
      <>
        <Heading level={4}>Content fragments:</Heading>
        <TableView aria-label="Content fragments:">
          <TableHeader columns={columns}>
            {item => (<Column key={item.key} width={item.width}>{item.name}</Column>)}
          </TableHeader>
          <TableBody items={contentFragments}>
            {item => (
                <Row key={item.path}>
                  <Cell>{item.title}</Cell>
                  <Cell>
                    <SubmissionProgress
                        aemHost={aemHost}
                        token={token}
                        contentFragmentPath={item.path}
                        workflowModel={workflowModel}
                        workflowTitle={workflowTitle}
                    />
                  </Cell>
                </Row>
            )}
          </TableBody>
        </TableView>
      </>
  );
};
