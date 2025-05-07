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
const Generator = require('yeoman-generator');

const ExtensionMainGenerator = require('../src/index');
const ExtensionActionGenerator = require('../src/generator-add-action');
const ExtensionWebAssetsGenerator = require('../src/generator-add-web-assets');
const { utils } = require('@adobe/generator-app-common-lib');

const { defaultExtensionManifest, customExtensionManifest } = require('./test-manifests');

const composeWith = jest.spyOn(Generator.prototype, 'composeWith').mockImplementation(jest.fn());
const prompt = jest.spyOn(Generator.prototype, 'prompt') // prompt answers are mocked by "yeoman-test"
const writeKeyAppConfig = jest.spyOn(utils, 'writeKeyAppConfig').mockImplementation(jest.fn());
const writeKeyYAMLConfig = jest.spyOn(utils, 'writeKeyYAMLConfig').mockImplementation(jest.fn());

beforeEach(() => {
  composeWith.mockClear();
  prompt.mockClear();
  writeKeyAppConfig.mockClear();
  writeKeyYAMLConfig.mockClear();
});

describe('prototype', () => {
  test('exports a yeoman generator', () => {
    expect(ExtensionMainGenerator.prototype).toBeInstanceOf(Generator);
  });
});

describe('run', () => {
  const srcFolder = 'src/aem-contenthub-assets-details-1'
  const configName = 'aem/contenthub/assets/details/1'
  const extConfig = 'ext.config.yaml'

  test('test a generator invocation with default code generation', async () => {
    const options = {
      'is-test': true,
      'extension-manifest': defaultExtensionManifest
    }
    await helpers.run(ExtensionMainGenerator)
        .withOptions(options);
    expect(prompt).not.toHaveBeenCalled();
    expect(composeWith).toHaveBeenCalledTimes(1);
    expect(composeWith).toHaveBeenCalledWith(
        expect.objectContaining({
          Generator: ExtensionWebAssetsGenerator,
          path: 'unknown'
        }),
        expect.any(Object)
    );
    expect(writeKeyAppConfig).toHaveBeenCalledTimes(1);
    expect(writeKeyYAMLConfig).toHaveBeenCalledTimes(4);
    expect(writeKeyAppConfig).toHaveBeenCalledWith(expect.any(ExtensionMainGenerator), `extensions.${configName}`, { $include: `${srcFolder}/${extConfig}` });
    expect(writeKeyYAMLConfig).toHaveBeenCalledWith(expect.any(ExtensionMainGenerator), global.n(`${srcFolder}/${extConfig}`), 'operations', { view: [{ impl: 'index.html', type: 'web' }] });
    expect(writeKeyYAMLConfig).toHaveBeenCalledWith(expect.any(ExtensionMainGenerator), global.n(`${srcFolder}/${extConfig}`), 'actions', 'actions');
    expect(writeKeyYAMLConfig).toHaveBeenCalledWith(expect.any(ExtensionMainGenerator), global.n(`${srcFolder}/${extConfig}`), 'web', 'web-src');
  });

  test('test a generator invocation with custom code generation', async () => {
    const options = {
      'is-test': true,
      'extension-manifest': customExtensionManifest
    }
    await helpers.run(ExtensionMainGenerator)
        .withOptions(options);
    expect(prompt).not.toHaveBeenCalled();
    expect(composeWith).toHaveBeenCalledTimes(3);
    expect(composeWith).toHaveBeenCalledWith(
        expect.objectContaining({
          Generator: ExtensionActionGenerator,
          path: 'unknown'
        }),
        expect.any(Object)
    );
    expect(composeWith).toHaveBeenCalledWith(
        expect.objectContaining({
          Generator: ExtensionActionGenerator,
          path: 'unknown'
        }),
        expect.any(Object)
    );
    expect(composeWith).toHaveBeenCalledWith(
        expect.objectContaining({
          Generator: ExtensionWebAssetsGenerator,
          path: 'unknown'
        }),
        expect.any(Object)
    );
    expect(writeKeyAppConfig).toHaveBeenCalledTimes(1);
    expect(writeKeyYAMLConfig).toHaveBeenCalledTimes(4);
    expect(writeKeyAppConfig).toHaveBeenCalledWith(expect.any(ExtensionMainGenerator), `extensions.${configName}`, { $include: `${srcFolder}/${extConfig}` });
    expect(writeKeyYAMLConfig).toHaveBeenCalledWith(expect.any(ExtensionMainGenerator), global.n(`${srcFolder}/${extConfig}`), 'operations', { view: [{ impl: 'index.html', type: 'web' }] });
    expect(writeKeyYAMLConfig).toHaveBeenCalledWith(expect.any(ExtensionMainGenerator), global.n(`${srcFolder}/${extConfig}`), 'actions', 'actions');
    expect(writeKeyYAMLConfig).toHaveBeenCalledWith(expect.any(ExtensionMainGenerator), global.n(`${srcFolder}/${extConfig}`), 'web', 'web-src');
  });
});
