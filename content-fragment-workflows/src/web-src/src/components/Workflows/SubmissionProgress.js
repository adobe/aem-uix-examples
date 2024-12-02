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
import { Badge, ProgressBar } from "@adobe/react-spectrum";
import { useEffect, useState } from "react";
import { startWorkflow } from "../utils";

export const SubmissionProgress = ({
  aemHost,
  token,
  contentFragmentPath,
  workflowModel,
  workflowTitle,
}) => {
  const [status, setStatus] = useState();

  useEffect(() => {
    const handleSubmit = async () => {
      setStatus('submitting');
      await startWorkflow({
        aemHost,
        token,
        workflowModel,
        workflowTitle,
        contentFragmentPath,
      });
      setStatus('success');
    };

    handleSubmit().catch((e) => {
      console.log("Extension got the error during workflow submitting:", e);
      setStatus('failure');
    });
  }, [aemHost, token, contentFragmentPath, workflowModel, workflowTitle]);

  switch (status) {
    case 'submitting':
      return <ProgressBar isIndeterminate label="Submitting workflow..." />;
    case 'success':
      return <Badge variant="positive">Workflow submission started</Badge>;
    case 'failure':
      return <Badge variant="negative">Workflow submission failed</Badge>;
    default:
      return <></>;
  }
};
