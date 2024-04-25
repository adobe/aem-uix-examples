/*
 * Copyright 2023 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */
import { isValidApplicationUrl } from './Utils.js';

describe('isValidApplicationUrl', () => {
  it('should return true for valid URLs', () => {
    const url = new URL('https://experience.adobe.com/#/@sitesinternal/aem/generate-variations/');
    expect(isValidApplicationUrl(url)).toBe(true);
  });

  it('should return false for invalid URLs', () => {
    const url = new URL('https://invalidurl.com');
    expect(isValidApplicationUrl(url)).toBe(false);
  });

  it('should return true for URLs with optional part after @', () => {
    const url = new URL('https://experience.adobe.com/#/@optionalpart/aem/generate-variations/');
    expect(isValidApplicationUrl(url)).toBe(true);
  });

  it('should return true for URLs without @', () => {
    const url = new URL('https://experience.adobe.com/#/aem/generate-variations/');
    expect(isValidApplicationUrl(url)).toBe(true);
  });
});
