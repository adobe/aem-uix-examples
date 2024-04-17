# Configurable Buttons for Rich Text Editor

This project is a sample project that demonstrates how to configure the Rich Text Editor in the Content Fragment Editor.
The toolbar is configurable and can be customized to include or exclude buttons as needed. This extension contains a single
action that returns the configuration for the toolbar.Currently button configuration is hardcode in the action and be applied
for Content Fragment created on the model `CF_MODEL_TITLE = test_model_title` and remove 'bold' buttons
(or other button from the `ALLOWED_BUTTONS`list by updating value of `BUTTON_TO_REMOVE` constant) from the toolbar.

## Setup

- Populate the `.env` file in the project root and fill it as shown [below](#env)

## Local Dev

- `aio app run -e  aem/cf-editor/1` to start your local Dev server
- App will run on `localhost:9080` by default

By default the UI will be served locally but actions will be deployed and served from Adobe I/O Runtime. To start a
local serverless stack and also run your actions locally use the `aio app run --local` option.


## Deploy & Cleanup

- `aio app deploy` to build and deploy all actions on Runtime and static files to CDN
- `aio app undeploy` to undeploy the app

## Config

Currently button configuration is hardcode in the action
`cf-editor-rte-toolbar-configurable-buttons/src/aem-cf-editor-1/actions/getCFModelConfig/index.js`.
you can update it to use your CF model name(update value for `CF_MODEL_TITLE` constant) and remove 'bold' buttons(or 
other button from the `ALLOWED_BUTTONS`list by updating value of `BUTTON_TO_REMOVE` constant) from the toolbar.

Check this [doc](https://experienceleague.adobe.com/docs/experience-manager-65/content/assets/content-fragments/content-fragments-models.html?lang=en) that describe on how to create new CF model:

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

