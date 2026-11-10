import React from "react";
import { ActionButton } from "@adobe/react-spectrum";
import ChevronLeft from "@spectrum-icons/workflow/ChevronLeft";
import ChevronRight from "@spectrum-icons/workflow/ChevronRight";
import Preview from "@spectrum-icons/workflow/Preview";
import { formatStartTime, getWorkItemName } from "./inboxUtils";

const PAGE_SIZE = 10;

export default function WorkItemList({ workItems, page, onPageChange, onSelect, compact = false }) {
    const pageCount = Math.max(1, Math.ceil(workItems.length / PAGE_SIZE));
    const firstIndex = (page - 1) * PAGE_SIZE;
    const visibleItems = workItems.slice(firstIndex, firstIndex + PAGE_SIZE);

    return (
        <React.Fragment>
            {compact ? (
            <ul aria-label="Workflow work items" style={{ listStyle: "none", margin: 0, padding: 0 }}>
                {visibleItems.map((item, index) => (
                    <li key={`${item.uri || "work-item"}-${firstIndex + index}`} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16, padding: "12px 8px" }}>
                        <strong style={{ minWidth: 0, overflowWrap: "anywhere" }}>{getWorkItemName(item.uri)}</strong>
                        <ActionButton aria-label={`View ${getWorkItemName(item.uri)}`} title="View work item" onPress={() => onSelect(item)}>
                            <Preview />
                        </ActionButton>
                    </li>
                ))}
            </ul>
            ) : (
                <div style={{ overflowX: "auto" }}>
                    <table aria-label="Workflow work items" style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
                        <thead>
                            <tr>
                                <th scope="col">Work item</th>
                                <th scope="col">Current assignee</th>
                                <th scope="col">Start time</th>
                            </tr>
                        </thead>
                        <tbody>
                            {visibleItems.map((item, index) => (
                                <tr key={`${item.uri || "work-item"}-${firstIndex + index}`}>
                                    <td style={{ padding: "12px 8px", overflowWrap: "anywhere" }}>
                                        <button type="button" className="inbox-work-item-link" aria-label={`View ${getWorkItemName(item.uri)}`} onClick={() => onSelect(item)}>
                                            <strong>{getWorkItemName(item.uri)}</strong>
                                        </button>
                                    </td>
                                    <td style={{ padding: "12px 8px" }}>{item.currentAssignee || "-"}</td>
                                    <td style={{ padding: "12px 8px" }}>{formatStartTime(item.startTime)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
            {workItems.length > PAGE_SIZE && (
            <nav aria-label="Work item pagination" style={{ display: "flex", gap: 16, alignItems: "center", marginTop: 16 }}>
                <ActionButton aria-label="Previous" title="Previous page" isDisabled={page === 1} onPress={() => onPageChange(current => current - 1)}>
                    <ChevronLeft />
                </ActionButton>
                <span role="status">
                    Page {page} of {pageCount} | {firstIndex + 1}-{Math.min(firstIndex + PAGE_SIZE, workItems.length)} of {workItems.length} work items
                </span>
                <ActionButton aria-label="Next" title="Next page" isDisabled={page === pageCount} onPress={() => onPageChange(current => current + 1)}>
                    <ChevronRight />
                </ActionButton>
            </nav>
            )}
        </React.Fragment>
    );
}
