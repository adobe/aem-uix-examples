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
module.exports = {
  root: true,
  ignorePatterns: ["**/*.generated.js"],
  extends: [
    "@adobe/helix",
    "eslint:recommended",
    "plugin:react/recommended"
  ],
  plugins: [
    "react-hooks",
    "unused-imports"
  ],
  rules: {
    'no-console': 'off',
    'no-unused-vars': 'off',
    'no-use-before-define': 'off',
    'no-nested-ternary': 'off',
    'arrow-body-style': 'off',
    'react/prop-types': 'off',
    'max-statements-per-line': 'off',
    'import/no-extraneous-dependencies': 'off',
    'unused-imports/no-unused-imports': 'error',
    'react-hooks/rules-of-hooks': 'error',
    'max-len': [ 'error', {
      'ignoreTemplateLiterals': true,
      'ignoreStrings': true,
      'code': 120
    }]
  },
  env: {
    browser: true,
    jest: true,
  },
  settings: {
    react: {
      version: "detect"
    }
  }
};
