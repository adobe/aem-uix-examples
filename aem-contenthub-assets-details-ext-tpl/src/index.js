/*
Copyright 2024 Adobe. All rights reserved.
This file is licensed to you under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License. You may obtain a copy
of the License at http://www.apache.org/licenses/LICENSE-2.0
Unless required by applicable law or agreed to in writing, software distributed under
the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
OF ANY KIND, either express or implied. See the License for the specific language
governing permissions and limitations under the License.
*/

const Generator = require('yeoman-generator');
const path = require('path');
const upath = require('upath');
const chalk = require('chalk');

const ExtensionActionGenerator = require('./generator-add-action');
const ExtensionWebAssetsGenerator = require('./generator-add-web-assets');

const {constants, utils} = require('@adobe/generator-app-common-lib');
const {runtimeManifestKey} = constants;
const {briefOverviews, promptTopLevelFields, promptMainMenu, promptDocs} = require('./prompts');
const {readManifest, writeManifest} = require('./utils');

const EXTENSION_MANIFEST_FILE = 'extension-manifest.json';

/*
      'initializing',
      'prompting',
      'configuring',
      'default',
      'writing',
      'conflicts',
      'install',
      'end'
      */

class MainGenerator extends Generator {
    constructor(args, opts) {
        super(args, opts);

        // options are inputs from CLI or yeoman parent generator
        this.option('skip-prompt', {default: false});
        this.option('is-test', {default: false});
    }

    async initializing() {
        // all paths are relative to root
        this.extFolder = 'src/aem-contenthub-assets-details-1';
        this.actionFolder = path.join(this.extFolder, 'actions')
        this.webSrcFolder = path.join(this.extFolder, 'web-src');
        this.extConfigPath = path.join(this.extFolder, 'ext.config.yaml');
        this.configName = 'aem/contenthub/assets/details/1';

        if (!this.options['is-test']) {
            this.extensionManifest = readManifest(EXTENSION_MANIFEST_FILE);
        } else {
            this.extensionManifest = this.options['extension-manifest'];
        }
    }

    async prompting() {
        if (!this.options['is-test']) {
            this.log(briefOverviews['templateInfo']);
            await promptTopLevelFields(this.extensionManifest)
                .then(() => promptMainMenu(this.extensionManifest))
                .then(() => writeManifest(this.extensionManifest, EXTENSION_MANIFEST_FILE))
                .then(() => {
                    this.log('\nExtension Manifest for Code Pre-generation');
                    this.log("------------------------------------------");
                    this.log(JSON.stringify(this.extensionManifest, null, '  '));
                });
        }
    }

    async writing() {
        // generate the generic action
        if (this.extensionManifest.runtimeActions) {
            this.extensionManifest.runtimeActions.forEach((action) => {
                this.composeWith({
                        Generator: ExtensionActionGenerator,
                        path: 'unknown'
                    },
                    {
                        // forward needed args
                        'action-folder': this.actionFolder,
                        'config-path': this.extConfigPath,
                        'full-key-to-manifest': runtimeManifestKey,
                        'action-name': action.name,
                        'extension-manifest': this.extensionManifest
                    });
            })
        }

        // generate the UI
        this.composeWith({
                Generator: ExtensionWebAssetsGenerator,
                path: 'unknown'
            },
            {
                'skip-prompt': this.options['skip-prompt'],
                'web-src-folder': this.webSrcFolder,
                'config-path': this.extConfigPath,
                'extension-manifest': this.extensionManifest,
            });

        const unixExtConfigPath = upath.toUnix(this.extConfigPath);
        // add the extension point config in root
        utils.writeKeyAppConfig(
            this,
            // key
            'extensions.' + this.configName,
            // value
            {
                // posix separator
                $include: unixExtConfigPath
            }
        );

        // add extension point operation
        utils.writeKeyYAMLConfig(
            this,
            this.extConfigPath,
            // key
            'operations', {
                view: [
                    {type: 'web', impl: 'index.html'}
                ]
            }
        );

        // add actions path, relative to config file
        utils.writeKeyYAMLConfig(this, this.extConfigPath, 'actions', path.relative(this.extFolder, this.actionFolder));

        // add web-src path, relative to config file
        utils.writeKeyYAMLConfig(this, this.extConfigPath, 'web', path.relative(this.extFolder, this.webSrcFolder));

        // add hooks path
        utils.writeKeyYAMLConfig(this, this.extConfigPath,
            'hooks', {
                'post-app-deploy': './hooks/post-deploy.js'
            }
        );
    }

    async end() {
        this.log(chalk.bold('\nSample code files have been generated.\n'));
        this.log(chalk.bold('Next Steps:'));
        this.log(chalk.bold('-----------'));
        this.log(chalk.bold('1) Populate your local environment variables in the ".env" file.'));
        this.log(chalk.bold('2) You can use `aio app run` or `aio app deploy` to see the sample code files in action.'));
        this.log('\n');
    }
}

module.exports = MainGenerator;
