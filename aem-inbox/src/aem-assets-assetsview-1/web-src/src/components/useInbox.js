import { useEffect, useState } from "react";
import { attach } from "@adobe/uix-guest";

export default function useInbox(currentAssetOnly = false) {
    const [workItems, setWorkItems] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [loadAttempt, setLoadAttempt] = useState(0);
    const [guestConnection, setGuestConnection] = useState(null);

    useEffect(() => {
        const controller = new AbortController();
        let cancelled = false;

        async function loadWorkItems() {
            setIsLoading(true);
            setError(null);
            try {
                const connection = await attach({
                    id: "com.sbsa.assets.console.extension.aem-inbox-uix",
                });
                if (cancelled) return;
                setGuestConnection(connection);
                let assetPath;
                if (currentAssetOnly) {
                    const resource = await connection.host.details.getCurrentResourceInfo();
                    if (!resource || typeof resource.path !== "string" || !resource.path.startsWith("/content/dam/")) {
                        throw new Error("The current asset path is not available.");
                    }
                    assetPath = resource.path;
                }
                const { accessToken } = await connection.host.auth.getIMSInfo();
                if (cancelled) return;
                if (typeof accessToken !== "string" || !accessToken.trim()) {
                    throw new Error("No access token is available. Please sign in again.");
                }
                const author = await connection.host.discovery.getAemHost();
                if (cancelled) return;
                const response = await fetch("/api/v1/web/aem-assets-assetsview-1/inbox", {
                    method: "POST",
                    headers: {
                        Accept: "application/json",
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${accessToken}`,
                    },
                    body: JSON.stringify({ hostname: author }),
                    signal: controller.signal,
                });
                if (!response.ok) {
                    throw new Error(`Inbox request failed (HTTP ${response.status}).`);
                }
                const items = await response.json();
                if (!Array.isArray(items)) {
                    throw new Error("The inbox API returned an invalid response: expected an array.");
                }
                if (cancelled) return;
                setWorkItems(items.filter(item => item && item.type === "WorkItem" &&
                    (!currentAssetOnly || item.payload === assetPath)));
            } catch (loadError) {
                if (cancelled) return;
                console.error("Failed to load inbox work items:", loadError.message);
                setError(loadError.message);
            } finally {
                if (!cancelled) setIsLoading(false);
            }
        }

        loadWorkItems();
        return () => {
            cancelled = true;
            controller.abort();
        };
    }, [loadAttempt, currentAssetOnly]);

    return { workItems, isLoading, error, guestConnection, retry: () => setLoadAttempt(attempt => attempt + 1) };
}
