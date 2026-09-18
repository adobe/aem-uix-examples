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

const chalk = require('chalk');

module.exports = (config) => {
  try {
    // build the preview URL
    console.log(chalk.magenta(chalk.bold('For a developer preview of your UI extension in the AEM Content Hub environment, follow the URL after deployment:')));

    // check if the environment is stage, if so, we need to add the -stage suffix to the URL
    const env = process.env.AIO_CLI_ENV === 'stage' ? '-stage' : '';
    const appUrl = config.project.workspace.app_url;
    console.log(chalk.magenta(chalk.bold(`  -> https://experience${env}.adobe.com/?ext=${appUrl}#/assets/contenthub`)));
  } catch (error) {
    // if something went wrong, we do nothing, and just don't display the URL
  }
};
