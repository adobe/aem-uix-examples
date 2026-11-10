export function getWorkItemName(uri) {
    if (typeof uri !== "string" || !uri) return "-";
    return uri.split("/workItems/")[0].split("/").filter(Boolean).pop() || "-";
}

export function formatStartTime(startTime) {
    const date = new Date(startTime);
    return typeof startTime === "number" && !Number.isNaN(date.getTime())
        ? date.toLocaleString()
        : "-";
}
