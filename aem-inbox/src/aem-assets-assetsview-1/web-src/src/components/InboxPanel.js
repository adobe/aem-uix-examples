import React, { useState } from "react";
import { Button, defaultTheme, Provider } from "@adobe/react-spectrum";
import useInbox from "./useInbox";
import WorkItemList from "./WorkItemList";
import WorkItemDetails from "./WorkItemDetails";

export default function InboxPanel() {
    const { workItems, isLoading, error, retry, guestConnection } = useInbox(true);
    const [selectedItem, setSelectedItem] = useState(null);
    const [page, setPage] = useState(1);

    return (
        <Provider theme={defaultTheme}>
            <section aria-label="Asset work items" aria-busy={isLoading} style={{ padding: 16 }}>
                {selectedItem ? (
                    <WorkItemDetails item={selectedItem} connection={guestConnection} onBack={() => setSelectedItem(null)} />
                ) : isLoading ? (
                    <p role="status">Loading work items...</p>
                ) : error ? (
                    <div>
                        <p role="alert">{error}</p>
                        <Button variant="secondary" onPress={() => { setPage(1); retry(); }}>Retry</Button>
                    </div>
                ) : workItems.length === 0 ? (
                    <p role="status">No work items found for this asset.</p>
                ) : (
                    <WorkItemList compact workItems={workItems} page={page} onPageChange={setPage} onSelect={setSelectedItem} />
                )}
            </section>
        </Provider>
    );
}
