# AEM Inbox Extension

The Assets header's **Inbox** action opens a fullscreen host dialog at
`/#inbox-modal`. The modal attaches to the extension connection, obtains the
current bearer token with `host.auth.getIMSInfo()`, and POSTs to the App Builder
action `/api/v1/web/aem-assets-assetsview-1/inbox`. The request includes the
`Authorization: Bearer ...` header and JSON body `{ "hostname": "<aemauthor>" }`,
using the author host returned by `host.discovery.getAemHost()`. The action
validates the AEM Cloud author host, forwards the Authorization header to
`<aemauthor>/bin/workflow/inbox`, and returns only entries with
`type === "WorkItem"` as an array.

Only entries with `type === "WorkItem"` are displayed. The modal uses a table
with a clickable, bold workflow name, current assignee, and start time. The panel
uses a compact list with just the bold workflow name and preview icon button.
The API is fetched once per modal load and results
are paginated locally in pages of 10 after filtering. Previous and Next do not
make additional API requests. Loading, empty, and request error states are shown;
Retry obtains a fresh token and requests the inbox again.
The Close button dismisses the modal through `host.modal.closeDialog()` and is
available during loading and error states. The content omits an internal heading
and visible caption; both presentations retain an accessible label.

Both presentations show the workflow instance name (the path segment before `/workItems/`)
instead of the full URI. Clicking the modal's item name or the panel's preview
icon opens details using the original URI. Pagination is hidden for 10 or fewer items.
The details show its payload, start date, assignee, and
available route labels inside the same modal. The detail view separates item
information and route actions into responsive cards, with a payload filename
summary, full payload path, and inline loading, success, and error feedback.
The cards stack on narrow screens. Routes are fetched on demand by
POSTing to the same inbox action with JSON body
`{ "hostname": "<aemauthor>", "item": "<item.uri>" }` and a fresh bearer token
in the Authorization header. When `item` is present, the action validates the
workflow path and fetches `<aemauthor><item>.routes.json`, returning the routes
response object. Omitting `item` returns the WorkItem array as before. Route errors
are shown with a Retry routes action. Back to work items preserves the list page.
Routes are clickable actions. Clicking one POSTs JSON
`{ "hostname": "<aemauthor>", "item": "<item.uri>", "route": "<route.rid>" }`
to the same action with the bearer Authorization header. The action POSTs
form-encoded `item` and `route` parameters to `<aemauthor>/bin/workflow/inbox`.
The details remain visible after success with a confirmation, and route buttons
are disabled to prevent duplicate submissions. Failures are displayed and allow
another attempt. Viewing an item alone does not execute a route.

Both AEM requests run server-side through the action; the signed-in user must
have access to the workflow inbox and item routes. Tokens are obtained
from the host, not stored in source code.

## Development

### Asset inbox panel

The registered detail side panel loads `/#inbox-panel`. It obtains the current
asset path through `host.details.getCurrentResourceInfo()` and uses the same
authenticated inbox action as the modal. Only WorkItems whose `payload` exactly
matches that asset path are shown. The panel displays workflow names and eye
buttons in pages of 10 items. Clicking an eye button opens the shared
item details and workflow actions inside the panel. The Back button returns to
the listing and preserves the current page. The panel has no modal Close button.
Missing asset context and request failures are displayed with Retry.

The shared `useInbox` hook handles loading, authentication, cancellation, and
optional current-asset filtering for the modal and panel.

Use Node.js, npm, and the Adobe I/O CLI with an App Builder workspace configured:

```sh
npm install
aio app use
aio app run
```

Keep generated credentials and environment files out of source control.

## Verification and deployment

```sh
npm test -- --runInBand
npm run lint
aio app build
aio app deploy
```

## Main files

- [ExtensionRegistration.js](src/aem-assets-assetsview-1/web-src/src/components/ExtensionRegistration.js): header button and fullscreen dialog.
- [App.js](src/aem-assets-assetsview-1/web-src/src/components/App.js): registration and modal routes.
- [InboxModal.js](src/aem-assets-assetsview-1/web-src/src/components/InboxModal.js): inbox loading, selection, request states, and modal closing.
- [InboxPanel.js](src/aem-assets-assetsview-1/web-src/src/components/InboxPanel.js): paginated work items and detail navigation for the current asset.
- [useInbox.js](src/aem-assets-assetsview-1/web-src/src/components/useInbox.js): shared authenticated inbox loading and current-asset filtering.
- [WorkItemList.js](src/aem-assets-assetsview-1/web-src/src/components/WorkItemList.js): work item names, eye buttons, and pagination.
- [WorkItemDetails.js](src/aem-assets-assetsview-1/web-src/src/components/WorkItemDetails.js): item metadata, route loading, and action submission.
- [inboxUtils.js](src/aem-assets-assetsview-1/web-src/src/components/inboxUtils.js): shared work item name and date formatting.
- [Inbox action](src/aem-assets-assetsview-1/actions/core/inbox/index.js): action entry point and request dispatch.
- [validation.js](src/aem-assets-assetsview-1/actions/core/inbox/validation.js): input, author host, and Authorization header validation.
- [workflow.js](src/aem-assets-assetsview-1/actions/core/inbox/workflow.js): AEM inbox fetch, routes fetch, route execution, and upstream error handling.
- [response.js](src/aem-assets-assetsview-1/actions/core/inbox/response.js): shared JSON response formatting.
- [InboxModal.test.js](test/InboxModal.test.js): authentication, filtering, pagination, retry, and unmount tests.
