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

const path = require('path');
const Generator = require('yeoman-generator');
const { utils, constants } = require('@adobe/generator-app-common-lib');
const { commonDependencyVersions } = constants;

class ExtensionWebAssetsGenerator extends Generator {
    constructor(args, opts) {
        super(args, opts);
        // required
        this.option('web-src-folder', {type: String});
        // this.option('skip-prompt', { default: false }) // useless for now
        this.option('config-path', {type: String});

        // props are used by templates
        this.props = {};
        this.props['extensionManifest'] = this.options['extension-manifest'];
        this.props['projectName'] = utils.readPackageJson(this).name;
    }

    writing() {
        this.destFolder = this.options['web-src-folder'];
        this.sourceRoot(path.join(__dirname, '.'));

        // Copy all the static files
        this.fs.copyTpl(
            this.templatePath('./templates/web/**/*'),
            this.destinationPath(this.destFolder),
            this.props
        );

        // Copy hooks folder
        this.fs.copyTpl(
            this.templatePath('./templates/hooks/*'),
            this.destinationPath('./hooks')
        );

        // Generate App.js
        this._generateAppRoute();

        // Generate ExtensionRegistration.js
        this._generateExtensionRegistration();

        // Generate React component files for side panels
        this._generatePanelFiles();

        // add .babelrc
        /// NOTE this is a global file and might conflict
        this.fs.writeJSON(this.destinationPath('.babelrc'), {
            plugins: ['@babel/plugin-transform-react-jsx']
        });
        // add dependencies
        utils.addDependencies(this, {
            '@adobe/aio-sdk': commonDependencyVersions['@adobe/aio-sdk'],
            '@adobe/exc-app': '^0.2.21',
            '@adobe/react-spectrum': '^3.4.0',
            '@adobe/uix-guest': '^0.10.5',
            '@react-spectrum/list': '^3.0.0-rc.0',
            '@spectrum-icons/workflow': '^3.2.0',
            'chalk': '^4',
            'core-js': '^3.6.4',
            'node-fetch': '^2.6.0',
            'node-html-parser': '^5.4.2-0',
            'react': '^16.13.1',
            'react-dom': '^16.13.1',
            'react-error-boundary': '^1.2.5',
            'react-router-dom': '^6.3.0',
            'regenerator-runtime': '^0.13.5'
        });
        utils.addDependencies(
            this,
            {
                '@babel/core': '^7.8.7',
                '@babel/plugin-transform-react-jsx': '^7.8.3',
                '@babel/polyfill': '^7.8.7',
                '@babel/preset-env': '^7.8.7',
                '@openwhisk/wskdebug': '^1.3.0',
                'jest': '^27.2.4'
            },
            true
        );
    }

    _generateAppRoute() {
        // Generic Project
        var relativeTemplatePath = './templates/_shared/stub-app.ejs';

        this.fs.copyTpl(
            this.templatePath(relativeTemplatePath),
            this.destinationPath(path.join(this.destFolder, `./src/components/App.js`)),
            this.props
        );
    }

    _generateExtensionRegistration() {
        // Generic Project
        var relativeTemplatePath = './templates/_shared/stub-extension-registration.ejs';

        this.fs.copyTpl(
            this.templatePath(relativeTemplatePath),
            this.destinationPath(path.join(this.destFolder, `./src/components/ExtensionRegistration.js`)),
            this.props
        );
    }

    _generatePanelFiles() {
        var relativeTemplatePath = './templates/_shared/stub-panel.ejs';
        const customPanels = this.props.extensionManifest.assetDetailsTabPanels || [];

        customPanels.forEach((panel) => {
            const panelComponentName = panel.componentName;
            this.fs.copyTpl(
                this.templatePath(relativeTemplatePath),
                this.destinationPath(path.join(this.destFolder, `./src/components/${panelComponentName}.js`)), {
                    PanelComponentName: panelComponentName
                }
            );
        })
    }
}

module.exports = ExtensionWebAssetsGenerator;
