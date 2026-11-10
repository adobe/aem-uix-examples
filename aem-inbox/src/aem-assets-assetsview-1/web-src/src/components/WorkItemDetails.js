import React, { useEffect, useRef, useState } from "react";
import { ActionButton, Button } from "@adobe/react-spectrum";
import ArrowLeft from "@spectrum-icons/workflow/ArrowLeft";
import { formatStartTime } from "./inboxUtils";

export default function WorkItemDetails({ item, connection, onBack, closeButton }) {
    const submitting = useRef(false);
    const mounted = useRef(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitError, setSubmitError] = useState(null);
    const [submittedRoute, setSubmittedRoute] = useState(null);
    const [routes, setRoutes] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [loadAttempt, setLoadAttempt] = useState(0);

    useEffect(() => {
        mounted.current = true;
        return () => { mounted.current = false; };
    }, []);

    async function executeRoute(route) {
        if (submitting.current || submittedRoute !== null) return;
        submitting.current = true;
        setIsSubmitting(true);
        setSubmitError(null);
        try {
            const author = await connection.host.discovery.getAemHost();
            const { accessToken } = await connection.host.auth.getIMSInfo();
            if (!mounted.current) return;
            if (typeof accessToken !== "string" || !accessToken.trim()) {
                throw new Error("No access token is available. Please sign in again.");
            }
            const response = await fetch("/api/v1/web/aem-assets-assetsview-1/inbox", {
                method: "POST",
                headers: {
                    Accept: "application/json",
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${accessToken}`,
                },
                body: JSON.stringify({ hostname: author, item: item.uri, route: route.rid }),
            });
            if (!response.ok) {
                throw new Error(`Route execution failed (HTTP ${response.status}).`);
            }
            if (mounted.current) setSubmittedRoute(route.label);
        } catch (error) {
            console.error("Failed to execute work item route:", error.message);
            if (mounted.current) setSubmitError(error.message);
        } finally {
            if (mounted.current) setIsSubmitting(false);
            submitting.current = false;
        }
    }

    useEffect(() => {
        const controller = new AbortController();
        let cancelled = false;

        async function loadRoutes() {
            setIsLoading(true);
            setError(null);
            try {
                if (typeof item.uri !== "string" || !item.uri.startsWith("/var/workflow/") ||
                    /[?#]/.test(item.uri) || item.uri.split("/").some(segment => segment === "." || segment === "..")) {
                    throw new Error("The work item has an invalid workflow path.");
                }
                const author = await connection.host.discovery.getAemHost();
                const { accessToken } = await connection.host.auth.getIMSInfo();
                if (cancelled) return;
                if (typeof accessToken !== "string" || !accessToken.trim()) {
                    throw new Error("No access token is available. Please sign in again.");
                }
                const response = await fetch("/api/v1/web/aem-assets-assetsview-1/inbox", {
                    method: "POST",
                    headers: {
                        Accept: "application/json",
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${accessToken}`,
                    },
                    body: JSON.stringify({ hostname: author, item: item.uri }),
                    signal: controller.signal,
                });
                if (!response.ok) {
                    throw new Error(`Routes request failed (HTTP ${response.status}).`);
                }
                const data = await response.json();
                if (!data || !Array.isArray(data.routes) ||
                    !data.routes.every(route => route && typeof route.rid === "string" && typeof route.label === "string")) {
                    throw new Error("The routes API returned an invalid response.");
                }
                if (!cancelled) setRoutes(data.routes);
            } catch (loadError) {
                if (cancelled) return;
                console.error("Failed to load work item routes:", loadError.message);
                setError(loadError.message);
            } finally {
                if (!cancelled) setIsLoading(false);
            }
        }

        loadRoutes();
        return () => {
            cancelled = true;
            controller.abort();
        };
    }, [item, connection, loadAttempt]);

    return (
        <section aria-label="Work item details" className="inbox-detail">
            <div className="inbox-detail__navigation" style={{ marginBottom: 16 }}>
                <ActionButton aria-label="Back to work items" title="Back to work items" isDisabled={isSubmitting} onPress={onBack}>
                    <ArrowLeft />
                </ActionButton>
                {closeButton}
            </div>
            <div className="inbox-detail__layout">
                <section className="inbox-detail__card" aria-labelledby="inbox-item-information">
                    <h2 id="inbox-item-information" className="inbox-detail__section-title">Item information</h2>
                    <dl className="inbox-detail__metadata">
                        <div className="inbox-detail__field inbox-detail__field--wide">
                            <dt>Payload</dt>
                            <dd className="inbox-detail__path">{item.payload || "-"}</dd>
                        </div>
                        <div className="inbox-detail__field">
                            <dt>Start date</dt>
                            <dd>{formatStartTime(item.startTime)}</dd>
                        </div>
                        <div className="inbox-detail__field">
                            <dt>Assignee</dt>
                            <dd>{item.currentAssignee || "-"}</dd>
                        </div>
                    </dl>
                </section>
                <section className="inbox-detail__card" aria-label="Available routes" aria-busy={isLoading || isSubmitting}>
                    <div className="inbox-detail__section-header">
                        <h2 className="inbox-detail__section-title">Actions</h2>
                        {!isLoading && !error && <span className="inbox-detail__badge">{routes.length}</span>}
                    </div>
                    {isSubmitting && <p className="inbox-detail__notice" role="status">Submitting action...</p>}
                    {submitError && <p className="inbox-detail__notice inbox-detail__notice--error" role="alert">{submitError}</p>}
                    {submittedRoute !== null && <p className="inbox-detail__notice inbox-detail__notice--success" role="status">Action submitted successfully: {submittedRoute}</p>}
                    {isLoading ? (
                        <p className="inbox-detail__notice" role="status">Loading actions...</p>
                    ) : error ? (
                        <div>
                            <p className="inbox-detail__notice inbox-detail__notice--error" role="alert">{error}</p>
                            <Button variant="secondary" onPress={() => setLoadAttempt(attempt => attempt + 1)}>Retry routes</Button>
                        </div>
                    ) : routes.length === 0 ? (
                        <p className="inbox-detail__notice" role="status">No actions available.</p>
                    ) : (
                        <ul className="inbox-detail__routes">
                            {routes.map(route => (
                                <li key={route.rid}>
                                    <Button variant="secondary" isDisabled={isSubmitting || submittedRoute !== null} onPress={() => executeRoute(route)}>
                                        {route.label}
                                    </Button>
                                </li>
                            ))}
                        </ul>
                    )}
                </section>
            </div>
        </section>
    );
}
