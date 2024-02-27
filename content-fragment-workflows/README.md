# AEM Workflows

## Documentation

- [Getting Started] (https://developer.adobe.com/uix/docs/getting-started/)
- [Content Fragments workflows] (https://developer.adobe.com/uix/docs/extension-manager/extension-developed-by-adobe/content-fragments-workflows/)

## Setup
To use this extension with your App Builder credentials, follow the instructions for creating an [App Builder Application](https://developer.adobe.com/app-builder/docs/getting_started/first_app/).

When bootstrapping your Application from the CLI, choose the CF Editor template; _In the future, we hope there will be a template for the workflows extension_. Once your Application has been bootstrapped from the CLI, clone this repository and the aem-workflows folder. Replace the following folders in your Application with the files and folders from this repository:
```
- actions/
- e2e/
- test/
- web-src/
- app.config.yaml  
```

## Local Dev

- `aio app run` to start your local Dev server
- App will run on `localhost:9080` by default

By default the UI will be served locally but actions will be deployed and served from Adobe I/O Runtime. To start a
local serverless stack and also run your actions locally use the `aio app run --local` option.

## Deployment
You can deploy this code using `aio app deploy` which will perform a deployment to a staging environment. Once it has been deployed, you can access the extension in the Universal Editor by adding the query param `?ext=https://223505-981amberantelope-stage.adobeio-static.net/index.html` to the URL of your AEM instance. Replace `223505-981amberantelope-stage.adobeio-static.net` with the URL of your deployed extension which can be found in the .aio file in your project root under `project > workspace > app_url`.

Once you have tested that the app works successfully with your test universal editor environment, follow the [instructions for publishing your extension found here](https://developer.adobe.com/app-builder/docs/getting_started/publish_app/).

## Test & Coverage

- Run `aio app test` to run unit tests for ui and actions
- Run `aio app test --e2e` to run e2e tests

## Deploy & Cleanup

- `aio app deploy` to build and deploy all actions on Runtime and static files to CDN
- `aio app undeploy` to undeploy the app

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
