/*
 * <license header>
 */

import React from 'react';
import ErrorBoundary from 'react-error-boundary';
import { HashRouter, Routes, Route } from 'react-router-dom';
import ManageTranslationsModal from './ManageTranslationsModal';
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
          <Route exact path="cf/:cfPaths/translations" element={<ManageTranslationsModal />} />
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
