# Domain-Based Action Button

## Universal Editor Extensibility

This extension is an example of extending the Universal Editor with a header menu action button whose visibility is controlled by AEM Cloud program and environment IDs.

The Universal Editor is a headless content management system that allows users to create, manage, and publish content across multiple channels. It provides core features that are extendable with custom functionality using extensions.

### Documentation

- [UIExtensibility Documentation](https://developer.adobe.com/uix/docs)
- [Universal Editor Extension Points](https://developer.adobe.com/uix/docs/services/aem-universal-editor/)
- [Universal Editor Data API](https://developer.adobe.com/uix/docs/services/aem-universal-editor/api/data/)

## Functionality

The `universal-editor-domain-button-sample` extension adds an action button to the Universal Editor header menu. The button is only shown when the editor is running in an AEM Cloud environment that matches the configured program and/or environment IDs.

The extension reads the current page location from `guestConnection.host.editorState.get()` and extracts the program and environment IDs from the AEM Cloud author URL pattern:

```
https://author-p{programId}-e{environmentId}.adobeaemcloud.com/
```

### Visibility Rules

| `program` configured | `environment` configured | Behaviour |
|---|---|---|
| No | No | Always visible |
| Yes | No | Visible if current program ID is in the list |
| No | Yes | Visible if current environment ID is in the list |
| Yes | Yes | Visible only if both match |

## Configuration

The extension is configured via the Adobe Extension Manager. The following properties are supported:

| Property | Type | Description |
|---|---|---|
| `program` | JSON string array | AEM program IDs where the button should be visible |
| `environment` | JSON string array | AEM environment IDs where the button should be visible |

**Example configuration:**

```json
{
  "program": "[\"62254\"]",
  "environment": "[\"555348\"]"
}
```

> **Note:** Values must be provided as JSON-serialized strings (as required by the Extension Manager).

## Setup

- Populate the `.env` file in the project root and fill it as shown [below](#env)

## Local Dev

- `npm install` to install dependencies
- `aio app run` to start your local Dev server
- App will run on `localhost:9080` by default

## Deploy & Cleanup

- `aio app deploy` to build and deploy all actions on Runtime and static files to CDN
- `aio app undeploy` to undeploy the app

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

Main configuration file that defines the application's implementation. More information on this file, application configuration, and extension configuration can be found [here](https://developer.adobe.com/app-builder/docs/guides/appbuilder-configuration/#appconfigyaml).
