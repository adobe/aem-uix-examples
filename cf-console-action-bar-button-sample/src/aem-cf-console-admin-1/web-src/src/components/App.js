/*
 * <license header>
 */

import React from "react";
import ErrorBoundary from "react-error-boundary";
import { HashRouter as Router, Routes, Route } from "react-router-dom";
import ExtensionRegistration from "./ExtensionRegistration";
import ClickMeModal from "./ClickMeModal";
import {Provider as ProviderV3, defaultTheme} from '@adobe/react-spectrum';
import Provider from '@react/react-spectrum/Provider';

function App() {
  return (
    <ProviderV3 theme={defaultTheme} colorScheme={`light`}>
      <Provider toastPlacement="bottom center" theme="light">
        <Router>
          <ErrorBoundary onError={onError} FallbackComponent={fallbackComponent}>
            <Routes>
              <Route index element={<ExtensionRegistration />} />
              <Route
                exact path="index.html"
                element={<ExtensionRegistration />} 
              />
              <Route
                exact path="content-fragment/:selection/click-me-modal"
                element={<ClickMeModal />}
              />
            </Routes>
          </ErrorBoundary>
        </Router>
      </Provider>
    </ProviderV3>
  )

  // Methods

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
    )
  }
}

export default App
