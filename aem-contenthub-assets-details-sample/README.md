# Content Hub – Extend Expiry with Workfront Integration

This sample shows how to build an AEM Content Hub UI Extension that lets users request an asset-expiry extension directly from the Content Hub asset-details panel. On submission the extension creates a Workfront task and links the selected asset to that task – all through a single Adobe I/O Runtime action.

---

## Prerequisites

**App Builder & Local Setup**

- Access to [Adobe Developer Console](https://developer.adobe.com/uix/docs/guides/creating-project-in-dev-console/) in the correct IMS organization
- App Builder entitlement for your org
- Node.js and npm installed locally
- [Adobe I/O CLI](https://developer.adobe.com/uix/docs/guides/local-environment/) (`aio`) installed globally
- A GitHub Personal Access Token (required when initializing from the Content Hub sample repository)
- Familiarity with JavaScript/TypeScript, React, and basic REST APIs

**Content Hub UI Extension**

- [Content Hub](https://experienceleague.adobe.com/en/docs/experience-manager-cloud-service/content/assets/content-hub/product-overview) enabled for your AEM as a Cloud Service environment
- Permissions to access Content Hub

**Workfront Integration**

- A Workfront environment
- A [technical integration](https://experienceleague.adobe.com/en/docs/experience-manager-learn/getting-started-with-aem-headless/authentication/service-credentials) or API client capable of server-side authentication
- [Permissions](https://experienceleague.adobe.com/en/docs/workfront/using/administration-and-setup/add-users/access-levels/access-level-requirements-in-documentation) to [create tasks](https://experienceleague.adobe.com/en/docs/workfront/using/manage-work/tasks/create-tasks/create-tasks-in-project) and link external documents
- A Workfront admin to configure the document provider for AEM/Content Hub

---

## Step 1: Scaffold the Content Hub Extension and Set Up for Workfront Integration

Start by creating a new project in [Adobe Developer Console](https://developer.adobe.com/uix/docs/guides/creating-project-in-dev-console/).

Set up your [local development](https://developer.adobe.com/uix/docs/guides/local-environment/) environment. Next, initialize your project locally using the Adobe I/O CLI and the sample app that targets Content Hub Asset Details:

```bash
aio login
aio console org select
aio console project select
aio console workspace select   # e.g., Stage
aio app init --repo adobe/aem-uix-examples/aem-contenthub-assets-details-sample
```

During initialization, enable the `aem/contenthub/assets/details/1` extension and specify the repositories (delivery hosts) where the extension should be available. Edit [`src/aem-contenthub-assets-details-1/web-src/src/components/ExtensionRegistration.js`](src/aem-contenthub-assets-details-1/web-src/src/components/ExtensionRegistration.js#L10-L19) and update `allowedRepos` to include your Delivery host.

To enable secure server-to-server communication between your Content Hub extension, Adobe I/O Runtime, and Workfront, [configure IMS Technical Account](https://experienceleague.adobe.com/en/docs/experience-manager-learn/getting-started-with-aem-headless/authentication/service-credentials) with the required product access as both User and Admin in Admin Console and in Workfront.

### IMS Technical Account Setup

1. Go to **Admin Console**.
2. Navigate to **Products → Workfront → Workfront** link.
3. Add the Technical Account as both **User** and **Admin**.
4. Ensure your own user is also added as both User and Admin in Admin Console and in Workfront.
5. In Adobe Developer Console, create or verify a Server-to-Server (JWT) integration for Workfront.

### Workfront Configuration

1. Note your tenant base URL for `WORKFRONT_BASE_URL` (e.g., `https://<company>.my.workfront.com/attask/api/v15.0`).
2. Ensure a default project exists and note its `DEFAULT_PROJECT_ID`.
3. If using AEM external documents, get the `DOCUMENT_PROVIDER_ID` from **Setup → Documents → External Document Providers**.
4. Ensure permissions to create tasks in the default project and to link external documents.
5. Get Workfront user ID (used by `DOCUMENT_PROVIDER_ID` API when needed):

   ```bash
   curl --location 'https://<your-tenant>.my.workfront.com/attask/api-internal/user/realUser' \
     --header 'Authorization: Bearer <ACCESS_TOKEN>'
   # Response → use ID field as USER_ID in DOCUMENT_PROVIDER_ID API
   ```

6. One-time creation of `DOCUMENT_PROVIDER_ID` via API (optional):

   ```bash
   curl --location --request PUT \
     "https://<your-tenant>.my.workfront.com/attask/api/unsupported/user/<USER_ID>?action=initializeStatelessDocumentProviderForUser" \
     --header 'user-agent: Workfront Fusion/production' \
     --header 'content-type: application/json' \
     --header 'authorization: Bearer <ACCESS_TOKEN>' \
     --data '{
       "providerType": "AEM",
       "documentProviderConfigID": "<ACTIVE_AEM_INTEGRATION_CONFIG_ID>",
       "documentProviderConfigName": "Content Hub"
     }'
   ```

   - Replace `<USER_ID>` with the Workfront user ID.
   - Replace `<ACTIVE_AEM_INTEGRATION_CONFIG_ID>` with the ID of the active AEM provider configuration in Workfront.
   - The resulting configuration ID is what you set as `DOCUMENT_PROVIDER_ID` in your `.env`.

### Environment Variables

All secrets must be added to your App Builder workspace so they remain secure and environment-specific (for example, different values for Stage and Production). These secrets allow Runtime actions to reliably create Workfront tasks, link AEM assets, and call Workfront APIs. In Stage and Production, provide all secrets via `.env` files so that `aio` can inject them at build and deploy time.

The environment variables are mapped to Runtime action inputs in [`ext.config.yaml`](src/aem-contenthub-assets-details-1/ext.config.yaml#L19-L38). Here is the full list:

```bash
# IMS / Technical Account
IMS_ENDPOINT=ims-na1.adobelogin.com
METASCOPES=<comma-separated Workfront metascopes>
TECHNICAL_ACCOUNT_CLIENT_ID=<client_id>
TECHNICAL_ACCOUNT_CLIENT_SECRET=<client_secret>
TECHNICAL_ACCOUNT_EMAIL=<tech_account_email>
TECHNICAL_ACCOUNT_ID=<tech_account_id>
ORGANIZATION_ID=<org_id>
PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
PUBLIC_KEY="-----BEGIN PUBLIC KEY-----\n...\n-----END PUBLIC KEY-----\n"
CERTIFICATE_EXPIRATION_DATE=<optional>

# Workfront
WORKFRONT_BASE_URL=https://<your-workfront-domain>.my.workfront.com/attask/api/v15.0
AEM_AUTHOR=<your-aem-author-host>
DOCUMENT_PROVIDER_ID=<provider_id_configured_in_workfront>
DEFAULT_PROJECT_ID=<target_project_id_for_new_tasks>

# Runtime Namespace
AIO_runtime_namespace=<your_runtime_namespace>
```

Verify namespace:

```bash
aio runtime namespace get
```

When selecting a workspace using the Adobe I/O CLI, the namespace is automatically populated in `.env`.

---

## Step 2: Register the "Extend Expiry" Tab

To expose the Extend Expiry panel in Content Hub, register a custom tab in your extension registration code.

Use the `register` API from `@adobe/uix-guest`. The `ExtensionRegistration` component initializes the extension by connecting to the host application and declaring the methods that Content Hub can invoke on your extension.
Implement [assetDetails.getTabPanels()](src/aem-contenthub-assets-details-1/web-src/src/components/ExtensionRegistration.js#L30-L56) to declare your custom tab.

You can later enhance this logic to conditionally display the tab based on asset metadata, permissions, or user group membership.

---

## Step 3: Build the Extend Expiry Panel UI

In your panel component, build the interactive UI that allows users to submit requests to extend the expiration date of assets directly from Content Hub.

First, attach the panel to the Content Hub extension and [initialize the guest connection](src/aem-contenthub-assets-details-1/web-src/src/components/PanelExtendExpiryTab.js#L47-L48). This establishes a connection between your React component and the Content Hub host, allowing the panel to communicate with and consume host-provided APIs.  

Retrieve details about the [currently selected asset](src/aem-contenthub-assets-details-1/web-src/src/components/PanelExtendExpiryTab.js#L50-L51) using Content Hub Host APIs.

Render an extend expiration request form that captures inputs such as new expiry date, justification, notes, or any additional information required to process the request.  

On submission, send the data to an [Adobe I/O Runtime action](src/aem-contenthub-assets-details-1/web-src/src/components/PanelExtendExpiryTab.js#L70-L71). The backend action creates a Workfront task and links it to the selected asset. 

Finally, use the [Content Hub host toast API](src/aem-contenthub-assets-details-1/web-src/src/components/PanelExtendExpiryTab.js#L124-L128) to display feedback to the user after submission.

---

## Step 4: Handle Request and Create Workfront Task

In this integration, the backend exposes a [single entry point](src/aem-contenthub-assets-details-1/actions/generic/index.js#L176-L177) to handle all requests coming from the front-end panel. This entry point inspects the `action` parameter (for example, `createTaskAndLinkAsset`) and routes the request to the appropriate handler.

This action-dispatch pattern allows multiple backend operations to be handled through a single Runtime URL, while keeping the implementation modular, extensible, and easy to maintain.

The [`main` function](src/aem-contenthub-assets-details-1/actions/generic/index.js#L156-L194) validates required parameters and dispatches to the correct handler based on the `action` field.

Once the request is routed, the handler processes the information submitted through the extend-expiration request form and creates a [new task in Workfront](src/aem-contenthub-assets-details-1/actions/generic/index.js#L32-L48).

After the task is successfully created, the handler [links the task to the corresponding asset](src/aem-contenthub-assets-details-1/actions/generic/index.js#L53-L90) in AEM Content Hub.

By combining request routing, Workfront task creation, and asset linking within a single handler flow, the Extend Expiration Request process becomes fully automated – from submitting a request in Content Hub to creating and associating a Workfront task.

---

## Step 5: Preview and Deployment

During development, [run and preview](https://developer.adobe.com/uix/docs/guides/preview-extension-locally/) the extension locally:

```bash
aio app run
```

The app will run on `localhost:9080` by default. To run your actions locally as well, use:

```bash
aio app run --local
```

Once the application is in good shape, it can be fully deployed to your targeted workspace.

To switch workspaces, use:

```bash
aio app use -w <workspace-name>
```

After workspace switching, deploy with:

```bash
aio app deploy
```

After deployment, test the extension in Content Hub by enabling developer mode in the browser:

```
https://experience.adobe.com/?devMode=true&ext=<your-extension-url>
```

This allows you to load and validate your extension directly within Content Hub before releasing it to end users.

---

## Why Runtime Namespace Is Required

- The UI constructs the backend URL using the namespace to reach your deployed web action, e.g., `https://<AIO_runtime_namespace>.adobeio-static.net/api/v1/web/aem-contenthub-assets-details-1/generic`.
- This ensures requests route to the correct Adobe I/O Runtime workspace (dev / stage / prod). If the namespace is wrong or missing, reqyests return 404 or hit the wrong environment.
- You can see this in the [backend URL config in PanelExtendExpiryTab.js](src/aem-contenthub-assets-details-1/web-src/src/components/PanelExtendExpiryTab.js#L26).
- Ensure your Workfront API version in `WORKFRONT_BASE_URL` matches your tenant (the example uses `v15.0`).

---

## Troubleshooting

- **Missing env vars** – The action will return 500 with a message listing missing configuration elements.
- **401/403 from Workfront** – Verify `METASCOPES`, IMS integration credentials, and `WORKFRONT_BASE_URL`.
- **Unknown action** – Ensure the UI sends `action: createTaskAndLinkAsset` and your action is deployed.
- **Panel hidden** – Make sure your repo host is in `allowedRepos` in [`ExtensionRegistration.js`](src/aem-contenthub-assets-details-1/web-src/src/components/ExtensionRegistration.js#L10).

---

## Test & Coverage

```bash
aio app test          # unit tests for UI and actions
aio app test --e2e    # end-to-end tests
```

## Cleanup

```bash
aio app undeploy      # undeploy the app
```

## Config

### `.env`

You can generate this file using the command `aio app use`. 

```bash
# This file must **not** be committed to source control

## please provide your Adobe I/O Runtime credentials
# AIO_RUNTIME_AUTH=
# AIO_RUNTIME_NAMESPACE=
```

### `app.config.yaml`

- Main configuration file that defines an application's implementation. 
- More information on this file, application configuration, and extension configuration 
  can be found [here](https://developer.adobe.com/app-builder/docs/guides/appbuilder-configuration/#appconfigyaml)

#### Action Dependencies

- You have two options to resolve your actions' dependencies:

  1. **Packaged action file**: Add your action's dependencies to the root
   `package.json` and install them using `npm install`. Then set the `function`
   field in `app.config.yaml` to point to the **entry file** of your action
   folder. We will use `webpack` to package your code and dependencies into a
   single minified js file. The action will then be deployed as a single file.
   Use this method if you want to reduce the size of your actions.

  2. **Zipped action folder**: In the folder containing the action code add a
     `package.json` with the action's dependencies. Then set the `function`
     field in `app.config.yaml` to point to the **folder** of that action. We will
     install the required dependencies within that directory and zip the folder
     before deploying it as a zipped action. Use this method if you want to keep
     your action's dependencies separated.

## Debugging in VS Code

While running your local server (`aio app run`), both UI and actions can be debugged, to do so open the vscode debugger
and select the debugging configuration called `WebAndActions`.
Alternatively, there are also debug configs for only UI and each separate action.

## Typescript support for UI

To use typescript use `.tsx` extension for react components and add a `tsconfig.json` 
and make sure you have the below config added
```
 {
  "compilerOptions": {
      "jsx": "react"
    }
  } 
```

