# Adobe Experience Manager UI Extensibility Examples

This repository contains a working example of the usage of UI Extensibility in AEM.

## Goal

Through examples, we aim to demonstrate the potential of UI Extensibility and foster creativity.

## Installation

Each folder contains a fully working UI Extension integrated with AEM.

In addition to git clone and/or forking this repo, you can generate an app from the [@adobe/aio-cli](https://github.com/adobe/aio-cli)

_Example to generate the a button for CF Console:_

`aio app init --repo adobe/aem-uix-examples/cf-console-header-menu-button-sample`


## Examples

Here is the list of examples:
- [Address Autocomplete](./address-autocomplete/)
- [Custom AEM Content Fragment Console Action Bar Button](./cf-console-action-bar-button-sample/)
- [AEM Content Fragments Console Header Menu Button](./cf-console-header-menu-button-sample/)
- [Customized AEM Content Fragment Editor Form Field](./cf-editor-form-field-customization-sample/)
- [AEM Content Fragment Editor Form Field Dropdown](./cf-editor-form-field-dropdown-sample/)
- [Custom AEM Content Fragment Editor RTE Toolbar Button](./cf-editor-rte-toolbar-button-sample/)
- [Export Content Fragment to Adobe Target](./content-fragment-export-to-target/)
- [Content Fragment Language Copies Management](./content-fragment-language-copies-management/)
- [Image genaration through 3rd party GenAI](./openai-dalle-content-fragment-admin/)
- [Slack Integration for Content Fragment management](./slack-content-fragment-admin/)
- [Workfront Task Management for Universal Editor](./universal-editor-task-management/)

## Deployment
Each example has its own GitHub Actions deployment file that should be used as a starting point for individual extensions.

The root-level GitHub deployment file `deploy_prod.yml` is intended as a custom, all-in-one approach for deploying examples with stored secrets. Each example that needs to be deployed at a workspace must have an associated secret. For example, `cf-console-action-bar-button-sample` must have a secret named `cf_console_action_bar_button_sample` (with hyphens replaced by underscores) and the contents of the `.env` file as its value. Deployment will be triggered on merging PRs and push events on the main branch. Deployment will be skipped if this secret is unavailable.

## Contributing

Contributions are welcomed! Read the [Contributing Guide](./.github/CONTRIBUTING.md) for more information.

## Licensing

This project is licensed under the Apache V2 License. See [LICENSE](./LICENSE) for more information.
