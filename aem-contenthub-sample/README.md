# Content Hub Extension Sample

A Content Hub UI extension built on `aem/assets/contenthub/1`. Demonstrates all three supported namespaces:

- **assetDetails** — adds a custom tab panel to the Asset Details Dialog side rail (`TabPanel.js`)
- **card** — adds a custom action button to asset cards and collection tiles; clicking it opens a modal (`CardActionModal.js`). `getActionButtons` receives `actionContext` with a `context` field (`'assets'|'collection'|'collections'|'share'`). `onActionClick` receives `(resourceType, buttonId, resourceId, actionContext)`.
- **selectionBar** — adds a custom bulk action button to the selection bar shown when assets are selected; clicking it opens a modal (`SelectionBarModal.js`).

You can keep only the namespace block(s) you need in `ExtensionRegistration.js` (and the matching routes in `App.js`).

---

## Prerequisites

- Node.js 18 or higher
- [Adobe I/O CLI](https://developer.adobe.com/runtime/docs/guides/tools/cli_install/): `npm install -g @adobe/aio-cli`
- An Adobe Developer Console account with an App Builder project (the project must have I/O Runtime enabled)
- Access to a Content Hub environment with the extensibility feature flag enabled on your org

---

## Setup & Local Dev

```bash
# 1. Install dependencies
npm install

# 2. Log in to Adobe I/O (opens a browser)
aio login

# 3. Pick the org / project / workspace explicitly, instead of relying on
#    whatever was last selected globally on your machine
aio console org select
aio console project select
aio console workspace select

# 4. Link this app to the selected Console project/workspace and populate .env
aio app use -g

# 5. Build actions and web assets
aio app build

# 6. Start the local dev server (runs on https://localhost:9080)
aio app run
```

> **Port 9080 already in use?** `aio app run` silently falls back to a random port if 9080 is taken (e.g. by another `aio app run` process left running from a different sample/checkout). Check with `lsof -i :9080` and stop the other process, or run `kill <PID>`, before starting this one — otherwise your test URLs below (which assume `localhost:9080`) won't match.

---

## Testing the Extension Locally

### Step 1 — Accept the self-signed certificate

Open this URL in your browser and accept the cert (click **Advanced → Proceed to localhost**, or type `thisisunsafe` on the page):

```
https://localhost:9080
```

You only need to do this once per browser session.

### Step 2 — Open Content Hub with the extension loaded

Use this URL. The `features=ASSETS-66401` parameter enables the extensibility feature flag per session — required if your org does not have it permanently enabled:

```
https://experience.adobe.com/?devMode=true&features=ASSETS-66401&ext=https://localhost:9080#/assets/contenthub/
```

> If your org already has the flag enabled permanently you can omit `&features=ASSETS-66401`.

### Step 3 — Verify each namespace

**assetDetails (tab panel)**
1. Click any asset to open the Asset Details Dialog
2. Look for the **"Extension Template"** tab in the side rail
3. Click it — the panel should load and display the asset's URN

**card (asset card action)**
1. Hover over any asset card — click the **⋯** (three-dot) menu
2. Click **"Custom label"**
3. A modal should open showing the asset's Resource Type and Resource ID
4. Click **Close** — the modal should dismiss

**card (collection tile action)**
1. Navigate to the Collections grid
2. Hover over a collection tile — click its **⋯** menu
3. Click **"Custom label"** (same button configuration as the asset card action — `resourceType` in the modal tells you which kind of resource was clicked)
4. A modal should open showing `resourceType: collection`

**selectionBar (bulk action)**
1. Select one or more assets (checkbox appears on hover)
2. The selection bar appears at the bottom — click **"Custom label"**
3. A modal should open listing the selected asset URNs
4. Click **Close**

---

## Allowed Repos

`ExtensionRegistration.js` has an `allowedRepos` array. It is **empty by default**, meaning the extension registers for any repo (correct for local dev). Before deploying to Production, populate it with your delivery repo IDs:

```js
const allowedRepos = [
  'delivery-p12345-e167890.adobeaemcloud.com',
];
```

---

## Deploy

```bash
# Deploy to Stage
aio app use -w Stage
aio app deploy

# Deploy to Production
aio app use -w Production
aio app deploy
```

After deploying to Production, approve the extension in [Extension Manager](https://experience.adobe.com/aem/extension-manager) to make it visible to all users without the `ext=` parameter.

---

## Config

### `.env`

Generated automatically by `aio app use`. Do **not** commit this file to source control.

```bash
# AIO_runtime_auth=<your-runtime-auth>
# AIO_runtime_namespace=<your-runtime-namespace>
# PORT=9080   # pins the local dev server port; omit to let aio pick a free port
```

### `app.config.yaml`

Main configuration file — declares the `aem/assets/contenthub/1` extension point and includes `src/aem-assets-contenthub-1/ext.config.yaml` for the runtime manifest.

---

## Run Tests

```bash
# Unit tests
aio app test

# E2E tests
aio app test --e2e
```
