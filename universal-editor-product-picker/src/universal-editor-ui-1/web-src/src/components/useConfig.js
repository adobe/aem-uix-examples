/*
 * <license header>
 */
const defaultConfig = {
  "commerce-endpoint": "",
  "commerce-root-category-id": "2",
  "commerce-configs": "https://main--xwalk-playground--felix-test-org.hlx.live/tools/commerce/summit.json",
  "commerce-env": "prod",
  "selection-mode": "multiple",
};
function flattenMultiSheetConfig(configs, env) {
  // Ignore metadata
  Object.keys(configs).forEach(key => {
    if (key.startsWith(':')) {
      delete configs[key];
    }
  });
  // Flatten values
  Object.keys(configs).forEach(envKey => {
    const values = {};
    configs[envKey].data.forEach(e => {
      values[e.key] = e.value;
    });
    configs[envKey] = values;
  });
  return env && configs[env] ? configs[env] : Object.keys(configs)[0];
}
function flattenSingleSheetConfig(configs) {
  const values = {}
  configs.data.forEach(e => {
    values[e.key] = e.value;
  });
  return values;
}
// @todo: we can put commerceConfig in local storage for exchanging between different iframes.
export default async function (guestConnection, setError) {
  const validateConfig = (config) => {
    if (!config["commerce-endpoint"] && !config["commerce-configs"]) {
      setError('Configuration initialization error: "commerce-endpoint" or "commerce-configs" is not configured.');
    }
  };
  const loadRemoteCommerceConfig = async (configFile, env) => {
    const configs = await fetch(configFile).then(r => r.json());
    const readyConfig = configs[':type'] == 'multi-sheet'
      ? flattenMultiSheetConfig(configs, env)
      : flattenSingleSheetConfig(configs);
    const productPickerConfig = {
      "commerce-endpoint": readyConfig["commerce-endpoint"],
      "commerce-root-category-id": readyConfig["commerce-root-category-id"],
      "commerce-http-headers": {
        "Magento-Environment-Id": readyConfig["commerce-environment-id"],
        "Magento-Store-View-Code": readyConfig["commerce-store-view-code"],
        "Magento-Website-Code": readyConfig["commerce-website-code"],
        "x-api-key": readyConfig["commerce-x-api-key"],
        "Magento-Store-Code": readyConfig["commerce-store-code"],
        "Magento-Customer-Group": readyConfig["commerce-customer-group"],
        "Content-Type": "application/json",
      },
    };
    return productPickerConfig;
  };
  let envConfig = {};
  if (process.env.CATALOG_SERVICE_CONFIG !== undefined) {
    try {
      envConfig = JSON.parse(process.env.CATALOG_SERVICE_CONFIG);
    } catch (error) {
      setError('The CATALOG_SERVICE_CONFIG in your environment is not formatted correctly.');
    }
  }
  const connectionConfig = guestConnection?.configuration || {};
  let config = { ...defaultConfig, ...envConfig, ...connectionConfig };
  if (config["commerce-configs"]) {
    try {
      const commerceConfig = await loadRemoteCommerceConfig(config["commerce-configs"], config["commerce-env"]);
      config = { ...config, ...commerceConfig };
    } catch (err) {
      console.log(err)
      setError('Configuration error: Unable to load configs from the Commerce instance.\n.');
    }
  }
  validateConfig(config);
  return config;
}