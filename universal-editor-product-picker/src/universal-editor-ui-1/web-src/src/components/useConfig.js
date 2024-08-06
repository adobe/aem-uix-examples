/*
 * <license header>
 */

import React, { useState, useEffect } from "react";

const defaultConfig = {
  "commerce-endpoint": "",
  "commerce-root-category-id": "2",
  "commerce-configs": "",
  "commerce-env": "prod",
  "selectionMode": "multiple",
};

export default function (guestConnection, setError) {
  // by default should be undefined, @see a rendering condition in ProductPickerModal "{guestConnection && config ? ("
  const [config, setConfig] = useState();

  const validateConfig = (config) => {
    if (!config["commerce-endpoint"] && !config["commerce-configs"]) {
      setError('Configuration initialization error: "commerce-endpoint" or "commerce-configs" is not configured.');
    }
  };

  const loadRemoteCommerceConfig = async (configFile, env) => {
    let configs = {};

    configs = await fetch(configFile).then(r => r.json());

    // Ignore metadata
    Object.keys(configs).forEach(key => {
      if (key.startsWith(':')) {
        delete configs[key];
      }
    });

    // Flatten values
    Object.keys(configs).forEach(key => {
      const values = {};
      configs[key].data.forEach(e => {
        values[e.key] = e.value;
      });
      configs[key] = values;
    });

    const envConfig = env && configs[env] ? configs[env] : Object.keys(configs)[0];

    const productPickerConfig = {
      "commerce-endpoint": envConfig["commerce-endpoint"],
      "commerce-root-category-id": envConfig["commerce-root-category-id"],
      "commerce-http-headers": {
        "Magento-Environment-Id": envConfig["commerce-environment-id"],
        "Magento-Store-View-Code": envConfig["commerce-store-view-code"],
        "Magento-Website-Code": envConfig["commerce-website-code"],
        "x-api-key": envConfig["commerce-x-api-key"],
        "Magento-Store-Code": envConfig["commerce-store-code"],
        "Magento-Customer-Group": envConfig["commerce-customer-group"],
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

  useEffect(() => {
    const mergeConfigs = async () => {
      const connectionConfig = guestConnection?.configuration || {};

      let config = { ...defaultConfig, ...envConfig, ...connectionConfig };
      validateConfig(config);

      if (config["commerce-configs"]) {
        try {
          const commerceConfig = await loadRemoteCommerceConfig(
            config["commerce-configs"],
            config["commerce-env"]
          );
          config = { ...config, ...commerceConfig };
        } catch (err) {
          setError('Configuration error: Unable to load configs from the Commerce instance.\n.');
        }
      }

      setConfig(config);
    };

    mergeConfigs().catch(console.error);
  }, [guestConnection]);

  console.log(config);
  return config;
}
