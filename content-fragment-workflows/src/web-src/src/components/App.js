/*
 * Copyright 2023 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License")
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */

import React from 'react';
import ErrorBoundary from 'react-error-boundary';
import { HashRouter, Routes, Route } from 'react-router-dom';
import { WorkflowsModal } from './WorkflowsModal';
import CFAdminConsoleExtensionRegistration from './CFAdminConsoleExtensionRegistration';
import CFEditorExtensionRegistration from './CFEditorExtensionRegistration';

/**
 *
 */
function App () {
  return (
    <HashRouter>
      <ErrorBoundary onError={onError} FallbackComponent={fallbackComponent}>
        <Routes>
          <Route index element={<CFEditorExtensionRegistration />} />
          <Route exact path="index.html" element={<CFEditorExtensionRegistration />} />
          <Route exact path="cf-editor" element={<CFEditorExtensionRegistration />} />
          <Route exact path="cf-admin-console" element={<CFAdminConsoleExtensionRegistration />} />
          <Route exact path="workflows/:fragmentIds" element={<WorkflowsModal />} />
        </Routes>
      </ErrorBoundary>
    </HashRouter>
  );

  // Methods

  // error handler on UI rendering failure
  /**
   * @param e
   * @param componentStack
   */
  function onError (e, componentStack) {}

  // component to show if UI fails rendering
  /**
   * @param root0
   * @param root0.componentStack
   * @param root0.error
   */
  function fallbackComponent ({ componentStack, error }) {
    return (
      <React.Fragment>
        <h1 style={{ textAlign: 'center', marginTop: '20px' }}>
          Phly, phly... Something went wrong :(
        </h1>
        <pre>{componentStack + '\n' + error.message}</pre>
      </React.Fragment>
    );
  }
}

export default App;
