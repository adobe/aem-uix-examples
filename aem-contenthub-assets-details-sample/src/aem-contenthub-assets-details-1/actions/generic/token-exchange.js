/*
* <license header>
*/

const axios = require('axios');
const qs = require('qs');
const jwt = require('jsonwebtoken');
const util = require('util');

class IMSJWTTokenExchange {
    constructor(host, proxy) {
        if (host === undefined) {
            throw new Error("Client lib must have a target host defined, imsHost or jilHost");
        }
        this.host = host;
        
        if (proxy) {
            const { HttpsProxyAgent } = require("https-proxy-agent");
            const httpsAgent = new HttpsProxyAgent({host: proxy.host, port: proxy.port});
            this.request = axios.create({
                baseURL: `https://${this.host}`,
                timeout: 10000,
                httpsAgent
            });
        } else {
            this.request = axios.create({
                baseURL: `https://${this.host}`,
                timeout: 10000
            });
        }

        // Request interceptor for logging
        this.request.interceptors.request.use(function (config) {
            console.debug(`>> ${config.method} ${config.url}`);
            if (config.verbose) {
                console.debug(JSON.stringify(config, null, 2));
            }
            return config;
        }, function (error) {
            console.error(`Failed making request ${error.message}`);
            return Promise.reject(error);
        });

        // Response interceptor for logging
        this.request.interceptors.response.use(function (response) {
            console.debug(`<< ${response.config.method} ${response.config.url} ${response.status}`);
            if (response.config.verbose) {
                console.debug(util.inspect(response.data));
            }
            return response;
        }, function (error) {
            if (error.config) {
                console.error(`Error performing operation ${error.message} request ${error.config.url}`);
            } else {
                console.error(`Error performing operation ${error.message} request (no config)`);
            }
            if (error.response) {
                console.error(util.inspect(error.response.data));
            }
            return Promise.reject(error);
        });
    }

    checkRequired(options, key) {
        if (options[key] === undefined) {
            throw new Error(`${key} is a required option.`);
        }
    }

    /**
     * Exchanges a integration for an access token using JWT Token exchange with IMS.
     * @returns {
     *    access_token,
     *    token_type,
     *    expires_in
     *  }
     */
    async exchangeJwt(options) {
        this.checkRequired(options, "issuer");
        this.checkRequired(options, "subject");
        this.checkRequired(options, "expiration_time_seconds");
        this.checkRequired(options, "metascope");
        this.checkRequired(options, "client_id");
        this.checkRequired(options, "client_secret");
        this.checkRequired(options, "privateKey");

        const jwt_payload = {
            iss: options.issuer,
            sub: options.subject,
            exp: options.expiration_time_seconds,
            aud: `https://${this.host}/c/${options.client_id}`
        };

        options.metascope.forEach((v) => {
            jwt_payload[`https://${this.host}/s/${v}`] = true;
        });

        // Sign with RSA256
        const jwt_token = jwt.sign(jwt_payload, options.privateKey, { algorithm: 'RS256' });

        if (options.publicKey) {
            console.debug(jwt.verify(jwt_token, options.publicKey, { complete: true }));
        }

        const body = qs.stringify({
            client_id: options.client_id,
            client_secret: options.client_secret,
            jwt_token: jwt_token
        });

        const config = {
            headers: { 'content-type': 'application/x-www-form-urlencoded' },
            verbose: options.verbose
        };

        const response = await this.request.post(`/ims/exchange/jwt`, body, config);
        if (response.status === 200) {
            return response.data;
        }
        throw new Error("Failed to exchange jwt.");
    }
}

/**
 * Deep validation helper function
 */
const assertPresent = (config, path, missing) => {
    const pathElements = path.split(".");
    let c = config;
    for (let p of pathElements) {
        if (!c[p]) {
            missing.push(path);
            return;
        }
        c = c[p];
    }
};

/**
 * Get integration configuration from environment variables with deep validation
 */
function getIntegrationConfig(params) {
    const integrationConfig = {
        integration: {
            imsEndpoint: params.IMS_ENDPOINT,
            org: params.ORGANIZATION_ID,
            id: params.TECHNICAL_ACCOUNT_ID,
            technicalAccount: {
                clientId: params.TECHNICAL_ACCOUNT_CLIENT_ID,
                clientSecret: params.TECHNICAL_ACCOUNT_CLIENT_SECRET
            },
            metascopes: params.METASCOPES,
            privateKey: params.PRIVATE_KEY,
            publicKey: params.PUBLIC_KEY
        }
    };

    // Deep validation
    const missing = [];
    assertPresent(integrationConfig, "integration.imsEndpoint", missing);
    assertPresent(integrationConfig, "integration.org", missing);
    assertPresent(integrationConfig, "integration.id", missing);
    assertPresent(integrationConfig, "integration.technicalAccount.clientId", missing);
    assertPresent(integrationConfig, "integration.technicalAccount.clientSecret", missing);
    assertPresent(integrationConfig, "integration.metascopes", missing);
    assertPresent(integrationConfig, "integration.privateKey", missing);
    assertPresent(integrationConfig, "integration.publicKey", missing);

    if (missing.length > 0) {
        throw new Error(`The following configuration elements are missing: ${missing.join(", ")}`);
    }

    return integrationConfig;
}

/**
 * Get access token using production-ready JWT exchange
 */
async function getAccessToken(params) {
    const integrationConfig = getIntegrationConfig(params);
    
    // Create JWT exchange instance
    const jwtExchange = new IMSJWTTokenExchange(integrationConfig.integration.imsEndpoint);
    
    // Exchange JWT for access token
    return await jwtExchange.exchangeJwt({
        issuer: `${integrationConfig.integration.org}`,
        subject: `${integrationConfig.integration.id}`,
        expiration_time_seconds: Math.floor((Date.now() / 1000) + 3600 * 8),
        metascope: integrationConfig.integration.metascopes.split(","),
        client_id: integrationConfig.integration.technicalAccount.clientId,
        client_secret: integrationConfig.integration.technicalAccount.clientSecret,
        privateKey: integrationConfig.integration.privateKey,
        publicKey: integrationConfig.integration.publicKey,
        verbose: params.LOG_LEVEL === 'debug'
    });
}

module.exports = {
    IMSJWTTokenExchange,
    getIntegrationConfig,
    getAccessToken,
    assertPresent
};
