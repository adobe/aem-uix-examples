/*
 * <license header>
 */

import React, { useState, useEffect } from "react";

const defaultConfig = {
  "commerce-endpoint": "",
  "commerce-root-category-id": "2",
  "selectionMode": "single",
};

export default function (guestConnection, setError) {
  const [config, setConfig] = useState();
  const envConfig = process.env.CATALOG_SERVICE_CONFIG ? JSON.parse(process.env.CATALOG_SERVICE_CONFIG) : {};

  const validateConfig = (config) => {
    if (!config["commerce-endpoint"]) {
      setError('Config initialization error: "commerce-endpoint" is not configured');
    }
  };

  useEffect(() => {
    const connectionConfig = guestConnection?.configuration || {};
    const config = {...defaultConfig, ...envConfig, ...connectionConfig};
    validateConfig(config);

    setConfig(config);
  }, [guestConnection]);

  return config;
}
