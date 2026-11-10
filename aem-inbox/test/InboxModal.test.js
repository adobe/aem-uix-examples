/** @jest-environment jsdom */
/* eslint-env browser */

const fs = require("fs");
const path = require("path");
const vm = require("vm");
const babel = require("@babel/core");
const React = require("react");
const ReactDOM = require("react-dom");
const { act } = require("react-dom/test-utils");

const filename = path.join(__dirname, "..", "src", "aem-assets-assetsview-1", "web-src", "src", "components", "InboxModal.js");
const componentCode = new Map(
    ["InboxModal", "InboxPanel", "useInbox", "WorkItemDetails", "WorkItemList", "inboxUtils"].map(name => {
        const modulePath = path.join(path.dirname(filename), `${name}.js`);
        const { code } = babel.transformSync(fs.readFileSync(modulePath, "utf8"), {
            filename: modulePath,
            configFile: false,
            babelrc: false,
            presets: [["@babel/preset-env", { targets: { node: "current" } }]],
            plugins: ["@babel/plugin-transform-react-jsx"],
        });
        return [name, code];
    })
);

let container;
let fetchInbox;
let getIMSInfo;
let attach;
let closeDialog;
let abort;
let logError;
let InboxModal;
let InboxPanel;
let getCurrentResourceInfo;

beforeEach(() => {
    container = document.createElement("div");
    document.body.appendChild(container);
    fetchInbox = jest.fn();
    getIMSInfo = jest.fn().mockResolvedValue({ accessToken: "test-access-token" });
    closeDialog = jest.fn().mockResolvedValue(undefined);
    getCurrentResourceInfo = jest.fn().mockResolvedValue({ path: "/content/dam/current.jpg" });
    attach = jest.fn().mockResolvedValue({
        host: {
            auth: { getIMSInfo },
            modal: { closeDialog },
            details: { getCurrentResourceInfo },
            discovery: { getAemHost: jest.fn().mockResolvedValue("https://author-p210602-e2203931.adobeaemcloud.com/") },
        },
    });
    abort = jest.fn();
    logError = jest.fn();
    const modules = new Map();
    function loadModule(name) {
        if (modules.has(name)) return modules.get(name);
        const exports = {};
        modules.set(name, exports);
        vm.runInNewContext(componentCode.get(name), {
        exports,
        fetch: fetchInbox,
        console: { error: logError },
        AbortController: class {
            constructor() {
                this.signal = {};
                this.abort = abort;
            }
        },
        require: (module) => {
            if (module.startsWith("./") && componentCode.has(module.slice(2))) {
                return loadModule(module.slice(2));
            }
            if (module === "react") return React;
            if (["@spectrum-icons/workflow/ArrowLeft", "@spectrum-icons/workflow/ChevronLeft", "@spectrum-icons/workflow/ChevronRight", "@spectrum-icons/workflow/Preview"].includes(module)) {
                return () => React.createElement("svg", { "aria-hidden": "true" });
            }
            if (module === "@adobe/uix-guest") return { attach };
            if (module === "@adobe/react-spectrum") {
                return {
                    Provider: ({ children }) => React.createElement("div", null, children),
                    defaultTheme: {},
                    ActionButton: ({ children, onPress, isDisabled, ...props }) => React.createElement(
                        "button", { ...props, onClick: onPress, disabled: isDisabled }, children
                    ),
                    Button: ({ children, onPress, isDisabled }) => React.createElement(
                        "button", { onClick: onPress, disabled: isDisabled }, children
                    ),
                };
            }
            throw new Error(`Unexpected module: ${module}`);
        },
        });
        return exports;
    }
    InboxModal = loadModule("InboxModal").default;
    InboxPanel = loadModule("InboxPanel").default;
});

afterEach(() => {
    act(() => { ReactDOM.unmountComponentAtNode(container); });
    container.remove();
});

async function renderModal() {
    await act(async () => {
        ReactDOM.render(React.createElement(InboxModal), container);
    });
}

function button(label) {
    return [...container.querySelectorAll("button")].find(node => (node.getAttribute("aria-label") || node.textContent) === label);
}

async function renderPanel() {
    await act(async () => {
        ReactDOM.render(React.createElement(InboxPanel), container);
    });
}

test("asset panel shows only WorkItems with the exact current asset payload", async () => {
    const matching = Array.from({ length: 12 }, (_, index) => ({
        uri: `/var/workflow/instances/server/date/match-${index}/workItems/node1`,
        payload: "/content/dam/current.jpg",
        type: "WorkItem",
        currentAssignee: "asset-owners",
        startTime: 1788877920580,
    }));
    fetchInbox.mockResolvedValueOnce({
        ok: true,
        json: async () => [
            ...matching,
            { uri: "other-asset", payload: "/content/dam/other.jpg", type: "WorkItem" },
            { uri: "prefix-match", payload: "/content/dam/current.jpg/child", type: "WorkItem" },
            { uri: "task", payload: "/content/dam/current.jpg", type: "Task" },
            { uri: "no-payload", type: "WorkItem" },
        ],
    });
    await renderPanel();
    expect(getCurrentResourceInfo).toHaveBeenCalledTimes(1);
    expect(container.querySelectorAll('ul[aria-label="Workflow work items"] > li')).toHaveLength(10);
    expect(container.textContent).toContain("Page 1 of 2 | 1-10 of 12 work items");
    expect(button("Previous").disabled).toBe(true);
    expect(button("Previous").querySelector("svg")).not.toBeNull();
    expect(button("Next").querySelector("svg")).not.toBeNull();
    expect(button("Previous").textContent).toBe("");
    expect(button("Next").textContent).toBe("");
    expect(container.textContent).not.toContain("asset-owners");
    expect(container.textContent).not.toContain("other-asset");
    expect(container.textContent).not.toContain("prefix-match");
    expect(button("Close")).toBeUndefined();
    act(() => button("Next").click());
    expect(container.querySelectorAll('ul[aria-label="Workflow work items"] > li')).toHaveLength(2);
    expect(container.textContent).toContain("match-11");
    expect(container.textContent).toContain("Page 2 of 2 | 11-12 of 12 work items");
    expect(button("Next").disabled).toBe(true);
    fetchInbox.mockResolvedValueOnce({ ok: true, json: async () => ({ routes: [{ rid: "end", label: "End" }] }) });
    await act(async () => button("View match-11").click());
    expect(container.querySelector('[aria-label="Work item details"]')).not.toBeNull();
    expect(container.querySelector("dl").textContent).toContain("/content/dam/current.jpg");
    expect(container.querySelector("dl").textContent).toContain("asset-owners");
    expect(button("End")).toBeDefined();
    expect(button("Close")).toBeUndefined();
    expect(JSON.parse(fetchInbox.mock.calls[1][1].body).item).toBe(matching[11].uri);
    act(() => button("Back to work items").click());
    expect(container.querySelectorAll('ul[aria-label="Workflow work items"] > li')).toHaveLength(2);
    expect(container.textContent).toContain("Page 2 of 2");
    expect(fetchInbox).toHaveBeenCalledTimes(2);
    act(() => button("Previous").click());
    expect(container.querySelectorAll('ul[aria-label="Workflow work items"] > li')).toHaveLength(10);
});

test("asset panel shows an empty state when only other assets have work items", async () => {
    fetchInbox.mockResolvedValueOnce({
        ok: true,
        json: async () => [{ payload: "/content/dam/other.jpg", type: "WorkItem" }],
    });
    await renderPanel();
    expect(container.textContent).toContain("No work items found for this asset.");
});

test("asset panel reports a missing asset path without requesting the global inbox", async () => {
    getCurrentResourceInfo.mockResolvedValueOnce({});
    await renderPanel();
    expect(container.querySelector('[role="alert"]').textContent).toBe("The current asset path is not available.");
    expect(fetchInbox).not.toHaveBeenCalled();
});

test("asset panel retries requests and re-reads the current asset", async () => {
    fetchInbox.mockResolvedValueOnce({ ok: false, status: 502 })
        .mockResolvedValueOnce({ ok: true, json: async () => [] });
    await renderPanel();
    expect(container.querySelector('[role="alert"]').textContent).toContain("HTTP 502");
    await act(async () => button("Retry").click());
    expect(getCurrentResourceInfo).toHaveBeenCalledTimes(2);
    expect(container.textContent).toContain("No work items found for this asset.");
});

test("uses host auth, filters before paginating, and reaches every work item without refetching", async () => {
    const items = Array.from({ length: 21 }, (_, index) => ({
        uri: `work-${index}`,
        type: "WorkItem",
        currentAssignee: `user-${index}@example.com`,
        startTime: 1792064066228,
    }));
    fetchInbox.mockResolvedValue({
        ok: true,
        json: async () => [{ uri: "hidden-task", type: "Task" }, ...items],
    });
    await renderModal();

    expect(attach).toHaveBeenCalledWith({ id: "com.sbsa.assets.console.extension.aem-inbox-uix" });
    expect(getIMSInfo).toHaveBeenCalledTimes(1);
    expect(fetchInbox).toHaveBeenCalledWith(
        "/api/v1/web/aem-assets-assetsview-1/inbox",
        expect.objectContaining({
            method: "POST",
            headers: { Accept: "application/json", "Content-Type": "application/json", Authorization: "Bearer test-access-token" },
            body: JSON.stringify({ hostname: "https://author-p210602-e2203931.adobeaemcloud.com/" }),
            signal: expect.any(Object),
        })
    );
    expect(container.querySelectorAll("tbody tr")).toHaveLength(10);
    expect(button("View work-0").textContent).toBe("work-0");
    expect(button("View work-0").querySelector("svg")).toBeNull();
    expect([...container.querySelectorAll("th")].map(node => node.textContent))
        .toEqual(["Work item", "Current assignee", "Start time"]);
    expect(container.querySelector("h1")).toBeNull();
    expect(container.querySelector("caption")).toBeNull();
    expect(container.querySelector('table[aria-label="Workflow work items"]')).not.toBeNull();
    expect(container.textContent).not.toContain("hidden-task");
    expect(container.textContent).toContain("Page 1 of 3 | 1-10 of 21 work items");
    expect(container.textContent).toContain("user-0@example.com");
    expect(container.textContent).toContain(new Date(1792064066228).toLocaleString());
    expect(button("Previous").disabled).toBe(true);

    act(() => button("Next").click());
    expect(container.querySelectorAll("tbody tr")).toHaveLength(10);
    expect(container.querySelector("tbody tr button").textContent).toBe("work-10");
    act(() => button("Next").click());
    expect(container.querySelectorAll("tbody tr")).toHaveLength(1);
    expect(container.textContent).toContain("Page 3 of 3 | 21-21 of 21 work items");
    expect(button("Next").disabled).toBe(true);
    act(() => button("Previous").click());
    expect(container.textContent).toContain("Page 2 of 3");
    expect(fetchInbox).toHaveBeenCalledTimes(1);
});

test.each([{ items: [] }, { items: [{ type: "Task" }] }])("shows an empty state when there are no WorkItems: %j", async ({ items }) => {
    fetchInbox.mockResolvedValue({ ok: true, json: async () => items });
    await renderModal();
    expect(container.textContent).toContain("No work items found.");
    expect(container.querySelector("nav")).toBeNull();
});

test("displays HTTP errors and retries with a fresh token", async () => {
    fetchInbox.mockResolvedValueOnce({ ok: false, status: 403 })
        .mockResolvedValueOnce({ ok: true, json: async () => [{ uri: "retry-item", type: "WorkItem" }] });
    await renderModal();
    expect(container.querySelector('[role="alert"]').textContent).toContain("HTTP 403");
    expect(logError).toHaveBeenCalledTimes(1);
    getIMSInfo.mockResolvedValue({ accessToken: "fresh-token" });
    await act(async () => button("Retry").click());
    expect(container.textContent).toContain("retry-item");
    expect(container.querySelector('[role="alert"]')).toBeNull();
    expect(getIMSInfo).toHaveBeenCalledTimes(2);
    expect(fetchInbox.mock.calls[1][1].headers.Authorization).toBe("Bearer fresh-token");
    expect(container.querySelector("nav")).toBeNull();
});

test.each([1, 10, 11])("shows pagination only above ten items and bold names for %i items", async count => {
    fetchInbox.mockResolvedValueOnce({
        ok: true,
        json: async () => Array.from({ length: count }, (_, index) => ({ uri: `work-${index}`, type: "WorkItem" })),
    });
    await renderModal();
    expect(container.querySelectorAll("tbody strong")).toHaveLength(Math.min(count, 10));
    expect(container.querySelector("nav") !== null).toBe(count > 10);
});

test("reports malformed responses instead of showing a success-shaped empty state", async () => {
    fetchInbox.mockResolvedValue({ ok: true, json: async () => ({ items: [] }) });
    await renderModal();
    expect(container.querySelector('[role="alert"]').textContent).toContain("expected an array");
});

test("reports missing tokens without sending an unauthenticated request", async () => {
    getIMSInfo.mockResolvedValue({ accessToken: "" });
    await renderModal();
    expect(container.querySelector('[role="alert"]').textContent).toContain("Please sign in again");
    expect(fetchInbox).not.toHaveBeenCalled();
});

test("reports connection and network failures", async () => {
    attach.mockRejectedValueOnce(new Error("Host connection unavailable"));
    await renderModal();
    expect(container.querySelector('[role="alert"]').textContent).toBe("Host connection unavailable");
    fetchInbox.mockRejectedValueOnce(new Error("Failed to fetch"));
    await act(async () => button("Retry").click());
    expect(container.querySelector('[role="alert"]').textContent).toBe("Failed to fetch");
});

test("shows loading and aborts pending requests when the modal unmounts", async () => {
    let rejectRequest;
    fetchInbox.mockImplementation(() => new Promise((resolve, reject) => { rejectRequest = reject; }));
    await renderModal();
    expect(container.textContent).toContain("Loading work items...");
    expect(container.querySelector("main").getAttribute("aria-busy")).toBe("true");
    await act(async () => button("Close").click());
    expect(closeDialog).toHaveBeenCalledTimes(1);
    await act(async () => {
        ReactDOM.unmountComponentAtNode(container);
        rejectRequest(new Error("Request aborted"));
    });
    expect(abort).toHaveBeenCalledTimes(1);
    expect(logError).not.toHaveBeenCalled();
});

test.each([true, false])("closes the host dialog after an inbox request with success=%s", async success => {
    fetchInbox.mockResolvedValue({ ok: success, status: 403, json: async () => [] });
    await renderModal();
    await act(async () => button("Close").click());
    expect(closeDialog).toHaveBeenCalledTimes(1);
    expect(attach).toHaveBeenCalledTimes(1);
});

test("reports close failures and allows another attempt", async () => {
    fetchInbox.mockResolvedValue({ ok: true, json: async () => [] });
    closeDialog.mockRejectedValueOnce(new Error("Unable to close dialog"));
    await renderModal();
    await act(async () => button("Close").click());
    expect(container.querySelector('[role="alert"]').textContent).toBe("Unable to close dialog");
    expect(logError).toHaveBeenCalledWith("Failed to close inbox modal:", "Unable to close dialog");
    expect(button("Close").disabled).toBe(false);
    await act(async () => button("Close").click());
    expect(closeDialog).toHaveBeenCalledTimes(2);
    expect(container.querySelector('[role="alert"]')).toBeNull();
});

test("can reconnect to close when the initial connection failed", async () => {
    attach.mockRejectedValueOnce(new Error("Host connection unavailable"));
    await renderModal();
    await act(async () => button("Close").click());
    expect(closeDialog).toHaveBeenCalledTimes(1);
    expect(attach).toHaveBeenCalledTimes(2);
});

const detailItem = {
    uri: "/var/workflow/instances/server438/2026-09-08/expiry/workItems/node1",
    payload: "/content/dam/ghana/example.jpg",
    currentAssignee: "asset-owners",
    startTime: 1788877920580,
    type: "WorkItem",
};

test("modal table shows a clickable workflow name and retains its complete URI for details", async () => {
    const uri = "/var/workflow/instances/server592/2026-10-06_3/dam-xmp-writeback_644/workItems/node1_var_workflow_instances_server592_2026-10-06_3_dam-xmp-writeback_644";
    fetchInbox.mockResolvedValueOnce({ ok: true, json: async () => [{ ...detailItem, uri }] });
    await renderModal();
    expect(container.querySelector("tbody td").textContent).toBe("dam-xmp-writeback_644");
    expect(container.textContent).not.toContain(uri);
    expect(container.querySelectorAll("tbody td")).toHaveLength(3);
    expect(button("View dam-xmp-writeback_644").querySelector("svg")).toBeNull();
    fetchInbox.mockResolvedValueOnce({ ok: true, json: async () => ({ routes: [] }) });
    await act(async () => button("View dam-xmp-writeback_644").click());
    expect(container.querySelector('[aria-label="Work item details"]')).not.toBeNull();
    expect(JSON.parse(fetchInbox.mock.calls[1][1].body).item).toBe(uri);
});

async function openDetails(response) {
    fetchInbox.mockResolvedValueOnce({ ok: true, json: async () => [detailItem] });
    await renderModal();
    fetchInbox.mockResolvedValueOnce(response);
    await act(async () => button("View expiry").click());
}

test.each(["https://author.example.com", "https://author.example.com/"])("modal item name loads authenticated routes from %s and preserves pagination", async author => {
    const connection = await attach();
    attach.mockClear();
    connection.host.discovery.getAemHost.mockResolvedValue(author);
    fetchInbox.mockResolvedValueOnce({
        ok: true,
        json: async () => Array.from({ length: 11 }, (_, index) => ({ ...detailItem, uri: `${detailItem.uri}-${index}` })),
    });
    await renderModal();
    expect(container.querySelectorAll("tbody button")).toHaveLength(10);
    act(() => button("Next").click());
    getIMSInfo.mockResolvedValue({ accessToken: "routes-token" });
    fetchInbox.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
            results: 1,
            routes: [
                { rid: "retry-current-step", label: "Current Step (Retry this step)" },
                { rid: "319010625", label: "End" },
            ],
        }),
    });
    await act(async () => button("View expiry").click());
    expect(fetchInbox.mock.calls[1][0]).toBe("/api/v1/web/aem-assets-assetsview-1/inbox");
    expect(fetchInbox.mock.calls[1][1].method).toBe("POST");
    expect(fetchInbox.mock.calls[1][1].headers["Content-Type"]).toBe("application/json");
    expect(JSON.parse(fetchInbox.mock.calls[1][1].body)).toEqual({
        hostname: author,
        item: `${detailItem.uri}-10`,
    });
    expect(fetchInbox.mock.calls[1][1].headers.Authorization).toBe("Bearer routes-token");
    expect(container.querySelector("dl").textContent).toContain(detailItem.payload);
    expect(container.querySelector("dl").textContent).toContain("asset-owners");
    expect(container.querySelector("dl").textContent).toContain(new Date(detailItem.startTime).toLocaleString());
    expect(button("Back to work items").querySelector("svg")).not.toBeNull();
    expect(button("Back to work items").textContent).toBe("");
    expect(button("Back to work items").parentElement).toBe(button("Close").parentElement);
    expect(container.querySelectorAll("button").length).toBeGreaterThan(1);
    expect(container.querySelector(".inbox-detail__path").textContent).toBe(detailItem.payload);
    expect([...container.querySelectorAll(".inbox-detail__section-title")].map(node => node.textContent))
        .toEqual(["Item information", "Actions"]);
    expect(container.querySelector(".inbox-detail__section-header .inbox-detail__badge").textContent).toBe("2");
    expect([...container.querySelectorAll("li")].map(node => node.textContent)).toEqual(["Current Step (Retry this step)", "End"]);
    expect(container.querySelector("h1, caption")).toBeNull();
    act(() => button("Back to work items").click());
    expect(container.textContent).toContain("Page 2 of 2");
    expect(fetchInbox).toHaveBeenCalledTimes(2);
});

test("route errors can be retried and empty routes are explicit", async () => {
    await openDetails({ ok: false, status: 403 });
    expect(container.querySelector('[role="alert"]').textContent).toContain("HTTP 403");
    expect(logError).toHaveBeenCalledWith("Failed to load work item routes:", "Routes request failed (HTTP 403).");
    fetchInbox.mockResolvedValueOnce({ ok: true, json: async () => ({ routes: [] }) });
    await act(async () => button("Retry routes").click());
    expect(container.textContent).toContain("No actions available.");
    expect(container.querySelector('[role="alert"]')).toBeNull();
    await act(async () => button("Close").click());
    expect(closeDialog).toHaveBeenCalledTimes(1);
});

test.each([{}, { routes: [null] }, { routes: [{ rid: "end" }] }])("invalid route response is shown as an error: %j", async data => {
    await openDetails({ ok: true, json: async () => data });
    expect(container.querySelector('[role="alert"]').textContent).toContain("invalid response");
    expect(container.textContent).not.toContain("No actions available.");
});

test("leaving details aborts loading and ignores a late route response", async () => {
    fetchInbox.mockResolvedValueOnce({ ok: true, json: async () => [detailItem] });
    await renderModal();
    let resolveRequest;
    fetchInbox.mockImplementationOnce(() => new Promise(resolve => { resolveRequest = resolve; }));
    await act(async () => button("View expiry").click());
    expect(container.textContent).toContain("Loading actions...");
    act(() => button("Back to work items").click());
    expect(abort).toHaveBeenCalledTimes(1);
    await act(async () => resolveRequest({ ok: true, json: async () => ({ routes: [{ rid: "late", label: "Late route" }] }) }));
    expect(container.textContent).not.toContain("Late route");
    expect(container.querySelector('table[aria-label="Workflow work items"]')).not.toBeNull();
    expect(logError).not.toHaveBeenCalled();
});

test("route buttons submit the ID with fresh auth and stay on details after success", async () => {
    await openDetails({ ok: true, json: async () => ({ routes: [{ rid: "319010625", label: "End" }] }) });
    getIMSInfo.mockResolvedValue({ accessToken: "execution-token" });
    let resolveRequest;
    fetchInbox.mockImplementationOnce(() => new Promise(resolve => { resolveRequest = resolve; }));
    await act(async () => {
        button("End").click();
        button("End").click();
    });
    expect(fetchInbox).toHaveBeenCalledTimes(3);
    expect(fetchInbox.mock.calls[2][0]).toBe("/api/v1/web/aem-assets-assetsview-1/inbox");
    expect(fetchInbox.mock.calls[2][1]).toMatchObject({
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: "Bearer execution-token" },
    });
    expect(JSON.parse(fetchInbox.mock.calls[2][1].body)).toEqual({
        hostname: "https://author-p210602-e2203931.adobeaemcloud.com/",
        item: detailItem.uri,
        route: "319010625",
    });
    expect(button("End").disabled).toBe(true);
    expect(button("Back to work items").disabled).toBe(true);
    expect(container.textContent).toContain("Submitting action...");
    await act(async () => resolveRequest({ ok: true }));
    expect(container.textContent).toContain("Action submitted successfully: End");
    expect(container.querySelector(".inbox-detail__notice--success").getAttribute("role")).toBe("status");
    expect(container.querySelector("dl")).not.toBeNull();
    expect(button("End").disabled).toBe(true);
    expect(button("Back to work items").disabled).toBe(false);
});

test("route execution errors allow retry and do not show success", async () => {
    await openDetails({ ok: true, json: async () => ({ routes: [{ rid: "end", label: "End" }] }) });
    fetchInbox.mockResolvedValueOnce({ ok: false, status: 502 });
    await act(async () => button("End").click());
    expect(container.querySelector('[role="alert"]').textContent).toBe("Route execution failed (HTTP 502).");
    expect(container.querySelector(".inbox-detail__notice--error")).not.toBeNull();
    expect(container.textContent).not.toContain("Action submitted successfully");
    expect(button("End").disabled).toBe(false);
    fetchInbox.mockResolvedValueOnce({ ok: true });
    await act(async () => button("End").click());
    expect(container.querySelector('[role="alert"]')).toBeNull();
    expect(container.textContent).toContain("Action submitted successfully: End");
});
