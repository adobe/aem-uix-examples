const chalk = require('chalk')

module.exports = (config) => {
    console.log(chalk.magenta(chalk.bold('For a developer preview of your UI extension in the AEM environment, follow the URL:')))
    const appUrl =  `https://${config.ow.namespace}.${config.app.hostname}`
    const base64EncodedUrl = Buffer.from(appUrl).toString('base64')
    console.log(chalk.magenta(chalk.bold(`  -> https://experience.adobe.com/aem/extension-manager/preview/${base64EncodedUrl}`)))
};
