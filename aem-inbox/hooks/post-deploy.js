const chalk = require('chalk');
const fs = require('fs');
const yaml = require('js-yaml');

module.exports = (config) => {
  try {
    const yamlFile = fs.readFileSync(`${config.root}/app.config.yaml`, 'utf8');
    const { extensions } = yaml.load(yamlFile);
    const previewData = {
      extensionPoint: Object.keys(extensions)[0],
      url: config.project.workspace.app_url,
    };
    const base64EncodedData = Buffer.from(JSON.stringify(previewData)).toString('base64');
    const env = process.env.AIO_CLI_ENV === 'stage' ? '-stage' : '';
    console.log(chalk.magenta(chalk.bold('For a developer preview of your UI extension in the AEM environment, follow the URL:')));
    console.log(chalk.magenta(chalk.bold(`  -> https://experience${env}.adobe.com/aem/extension-manager/preview/${base64EncodedData}`)));
  } catch (error) {
    console.error('Unable to generate the extension preview URL:', error.message);
  }
};
