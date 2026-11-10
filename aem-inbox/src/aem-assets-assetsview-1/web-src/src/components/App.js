import React from "react";
import ErrorBoundary from "react-error-boundary";
import { HashRouter as Router, Routes, Route } from "react-router-dom";
import ExtensionRegistration from "./ExtensionRegistration";
import InboxModal from "./InboxModal";
import InboxPanel from "./InboxPanel";

function App() {
    return (
        <Router>
            <ErrorBoundary onError={onError} FallbackComponent={fallbackComponent}>
                <Routes>
                    <Route index element={<ExtensionRegistration />} />
                    <Route exact path="index.html" element={<ExtensionRegistration />} />
                    <Route path="inbox-modal" element={<InboxModal />} />
                    <Route path="inbox-panel" element={<InboxPanel />} />
                </Routes>
            </ErrorBoundary>
        </Router>
    );

    function onError(error, componentStack) {
        console.error("Extension rendering error:", error, componentStack);
    }

    function fallbackComponent({ componentStack, error }) {
        return (
            <React.Fragment>
                <h1 style={{ textAlign: 'center', marginTop: '20px' }}>
                    Extension rendering error
                </h1>
                <pre>{componentStack + '\n' + error.message}</pre>
            </React.Fragment>
        );
    }
}

export default App;
