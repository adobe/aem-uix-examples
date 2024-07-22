# Image genaration through GenAI

This extension will connect AEM to a 3rd-party GenAI (OpenAI Dall-E in our case). This extension includes:
- an Action Button with Content Fragment Console
- a Modal for the user to enter the prompt for generation
- a serverless function that will
  1. Generate an image through the 3rd-party GenAI
  2. Upload this asset to AEM Assets
  3. Link the asset to the Content Fragment

## Reading List
1. [Experience League Tutorial](https://experienceleague.adobe.com/docs/experience-manager-learn/cloud-service/developing/extensibility/content-fragments/example-extensions/image-generation-and-image-upload.html?lang=en) - AEM image asset generation using OpenAI
2. [UI Extensibility Docs Homepage](https://developer.adobe.com/uix/docs)

## Setup

- Populate the `.env` file in the project root and fill it as shown [below](#env)

## Local Dev

- `aio app run` to start your local Dev server
- App will run on `localhost:9080` by default

By default the UI will be served locally but actions will be deployed and served from Adobe I/O Runtime. To start a
local serverless stack and also run your actions locally use the `aio app run --local` option.

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

- Main configuration file that defines an application's implementation. 
- More information on this file, application configuration, and extension configuration 
  can be found [here](https://developer.adobe.com/app-builder/docs/guides/appbuilder-configuration/#appconfigyaml)

### Contributing

Contributions are welcomed! Read the [Contributing Guide](../.github/CONTRIBUTING.md) for more information.

### Licensing

This project is licensed under the Apache V2 License. See [LICENSE](../LICENSE) for more information.

test change 1
