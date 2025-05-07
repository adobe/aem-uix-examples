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

const helpers = require('yeoman-test');
const assert = require('yeoman-assert');
const cloneDeep = require('lodash.clonedeep');

const yaml = require('js-yaml');
const fs = require('fs');
const path = require('path');

const ExtensionActionGenerator = require('../src/generator-add-action');

const { ActionGenerator, constants } = require('@adobe/generator-app-common-lib');
const { runtimeManifestKey, defaultRuntimeKind } = constants;
const { customExtensionManifest } = require('./test-manifests');

const extFolder = 'src/aem-contenthub-assets-details-1';
const actionFolder = path.join(extFolder, 'actions');
const extConfigPath = path.join(extFolder, 'ext.config.yaml');
const actionName = 'generic';

const basicGeneratorOptions = {
  'action-folder': actionFolder,
  'config-path': extConfigPath,
  'full-key-to-manifest': runtimeManifestKey,
  'action-name': actionName,
  'extension-manifest': customExtensionManifest
};

describe('prototype', () => {
  test('exports a yeoman generator', () => {
    expect(ExtensionActionGenerator.prototype).toBeInstanceOf(ActionGenerator);
  })
});

/**
 * Checks that all the files are generated.
 *
 * @param {string} actionName an action name
 */
function assertGeneratedFiles (actionName) {
  assert.file(basicGeneratorOptions['config-path']);

  assert.file(`${basicGeneratorOptions['action-folder']}/${actionName}/index.js`);

  // assert.file(`test/${actionName}.test.js`)
  assert.file(`${extFolder}/e2e/${actionName}.e2e.test.js`);

  assert.file(`${basicGeneratorOptions['action-folder']}/utils.js`);
  assert.file(`${extFolder}/test/utils.test.js`);
}

/**
 * Checks that a correct action section has been added to the App Builder project configuration file.
 *
 * @param {string} actionName an action name
 */
function assertManifestContent (actionName) {
  const json = yaml.load(fs.readFileSync(basicGeneratorOptions['config-path']).toString());
  expect(json.runtimeManifest.packages).toBeDefined();
  const packages = json.runtimeManifest.packages;
  const packageName = Object.keys(packages)[0];
  expect(json.runtimeManifest.packages[packageName].actions[actionName]).toEqual({
    function: `actions/${actionName}/index.js`,
    web: 'yes',
    runtime: defaultRuntimeKind,
    inputs: {
      LOG_LEVEL: 'debug',
      API_ENDPOINT: '$API_ENDPOINT'
    },
    annotations: {
      'final': true,
      'require-adobe-auth': false
    }
  });
}

/**
 * Checks that .env has the required environment variables.
 */
function assertEnvContent () {
  const theFile = '.env';
  assert.fileContent(
    theFile,
    '#API_ENDPOINT='
  );
}

/**
 * Checks that an action file contains correct code snippets.
 *
 * @param {string} actionName an action name
 */
function assertActionCodeContent (actionName) {
  const theFile = `${basicGeneratorOptions['action-folder']}/${actionName}/index.js`;
  assert.fileContent(
    theFile,
    'const apiEndpoint = `${params.API_ENDPOINT}`'
  );
  assert.fileContent(
    theFile,
    'const requiredHeaders = [\'Authorization\']'
  );
}

describe('run', () => {
  test('test a generator invocation with custom code generation', async () => {
    const options = cloneDeep(basicGeneratorOptions);
    await helpers.run(ExtensionActionGenerator)
      .withOptions(options)
      .inTmpDir(dir => {
        // ActionGenerator expects to have the ".env" file created
        fs.writeFileSync('.env', '')
      });

    assertGeneratedFiles(actionName);
    assertManifestContent(actionName);
    assertActionCodeContent(actionName);
    assertDependencies(
      fs,
      { 'node-fetch': expect.any(String) }, 
      { '@openwhisk/wskdebug': expect.any(String) }
    );
    assertEnvContent();
  });
})
