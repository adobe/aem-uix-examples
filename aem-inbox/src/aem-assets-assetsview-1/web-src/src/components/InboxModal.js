import React, { useState } from "react";
import { attach } from "@adobe/uix-guest";
import { Button, defaultTheme, Provider } from "@adobe/react-spectrum";
import WorkItemDetails from "./WorkItemDetails";
import WorkItemList from "./WorkItemList";
import useInbox from "./useInbox";

export default function InboxModal() {
    const [selectedItem, setSelectedItem] = useState(null);
    const [page, setPage] = useState(1);
    const { workItems, isLoading, error, guestConnection, retry } = useInbox();
    const [isClosing, setIsClosing] = useState(false);
    const [closeError, setCloseError] = useState(null);

    async function closeModal() {
        setIsClosing(true);
        setCloseError(null);
        try {
            const connection = guestConnection || await attach({
                id: "com.sbsa.assets.console.extension.aem-inbox-uix",
            });
            await connection.host.modal.closeDialog();
        } catch (error) {
            console.error("Failed to close inbox modal:", error.message);
            setCloseError(error.message);
        } finally {
            setIsClosing(false);
        }
    }

    const closeButton = (
        <Button variant="secondary" isDisabled={isClosing} onPress={closeModal}>
            Close
        </Button>
    );

    return (
        <Provider theme={defaultTheme}>
            <main style={{ padding: 24 }} aria-busy={isLoading}>
                {!selectedItem && (
                    <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 16 }}>
                        {closeButton}
                    </div>
                )}
                {closeError && <p role="alert">{closeError}</p>}
                {selectedItem ? (
                    <WorkItemDetails item={selectedItem} connection={guestConnection} onBack={() => setSelectedItem(null)} closeButton={closeButton} />
                ) : isLoading ? (
                    <p role="status">Loading work items...</p>
                ) : error ? (
                    <div>
                        <p role="alert">{error}</p>
                        <Button variant="secondary" onPress={() => { setPage(1); retry(); }}>
                            Retry
                        </Button>
                    </div>
                ) : workItems.length === 0 ? (
                    <p role="status">No work items found.</p>
                ) : (
                    <WorkItemList workItems={workItems} page={page} onPageChange={setPage} onSelect={setSelectedItem} />
                )}
            </main>
        </Provider>
    );
}
