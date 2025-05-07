/*
Copyright 2025 Adobe. All rights reserved.
This file is licensed to you under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License. You may obtain a copy
of the License at http://www.apache.org/licenses/LICENSE-2.0
Unless required by applicable law or agreed to in writing, software distributed under
the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
OF ANY KIND, either express or implied. See the License for the specific language
governing permissions and limitations under the License.
*/

const fs = require('fs-extra')
const { readManifest, writeManifest } = require('../src/utils');
const { defaultExtensionManifest, customExtensionManifest } = require('./test-manifests');

jest.mock('fs');


describe('readManifest', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it.each([
        ['default', defaultExtensionManifest],
        ['custom', customExtensionManifest ],
    ])('should read and parse %s manifest file', async (desc, json) => {
        const mockPath = 'path/to/manifest.yml';

        fs.readFileSync.mockReturnValue(
            JSON.stringify(json)
        );

        const result = readManifest(mockPath);

        expect(fs.readFileSync).toHaveBeenCalledWith(mockPath, {"encoding": "utf8"});
        expect(result).toMatchObject(json);
    });

    it('should throw error if file cannot be read', () => {
        const mockPath = 'invalid/path';
        fs.readFileSync.mockImplementation(() => {
            throw new Error('File not found');
        });

        expect(() => readManifest(mockPath)).toThrow('File not found');
    });

    it('should return empty JSON if file is empty', () => {
        const mockPath = 'invalid/path';
        fs.readFileSync.mockImplementation(() => {
            const error = new Error('ENOENT');
            error.code = 'ENOENT';
            throw error;
        });

        const result = readManifest(mockPath);
        expect(result).toMatchObject({});
    });
});

describe('writeManifest', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it.each([
        ['default', defaultExtensionManifest],
        ['custom', customExtensionManifest ],
    ])('should write %s manifest to file', (desc, json) => {
        const mockPath = 'path/to/manifest.yml';

        fs.writeJsonSync = jest.fn();

        writeManifest(json, mockPath);

        expect(fs.writeJsonSync).toHaveBeenCalledWith(mockPath, json, {"spaces": 2});
    });

    it('should throw error if file cannot be written', () => {
        const mockPath = 'invalid/path';
        const mockYaml = { name: 'test' };

        fs.writeJsonSync.mockImplementation(() => {
            throw new Error('Cannot write file');
        });

        expect(() => writeManifest(mockPath, defaultExtensionManifest)).toThrow('Cannot write file');
    });
});

