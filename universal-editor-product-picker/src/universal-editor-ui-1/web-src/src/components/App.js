/*
 * <license header>
 */

import React from "react";
import ErrorBoundary from "react-error-boundary";
import { HashRouter as Router, Routes, Route } from "react-router-dom";
import CFAdminEditorExtensionRegistration from './CFAdminEditorExtensionRegistration';
import ExtensionRegistration from "./ExtensionRegistration";
import ProductField from "./ProductField";
import ProductPickerModal from "./ProductPickerModal";

function App() {
  return (
    <Router>
      <ErrorBoundary onError={onError} FallbackComponent={fallbackComponent}>
        <Routes>
          <Route index element={<ExtensionRegistration />} />
          <Route
            exact path="index.html"
            element={<ExtensionRegistration />}
          />
          <Route
            exact path="/cf-admin-console"
            element={<CFAdminEditorExtensionRegistration />}
          />
          <Route
            exact path="/product-field"
            element={<ProductField />}
          />
          <Route
            exact path="/product-picker-modal"
            element={<ProductPickerModal />}
          />
        </Routes>
      </ErrorBoundary>
    </Router>
  );

  // error handler on UI rendering failure
  function onError(e, componentStack) {}

  // component to show if UI fails rendering
  function fallbackComponent({ componentStack, error }) {
    return (
      <React.Fragment>
        <h1 style={{ textAlign: "center", marginTop: "20px" }}>
          Phly, phly... Something went wrong :(
        </h1>
        <pre>{componentStack + "\n" + error.message}</pre>
      </React.Fragment>
    );
  }
}

export default App;
