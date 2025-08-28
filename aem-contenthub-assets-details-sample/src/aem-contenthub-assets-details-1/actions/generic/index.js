/*
* <license header>
*/

const { Core } = require('@adobe/aio-sdk')
const { checkMissingRequestInputs } = require('../utils')
const axios = require('axios')
const { getAccessToken } = require('./token-exchange');

/**
 * Get Workfront configuration from environment variables
 */
function getWorkfrontConfig(params) {
    const requiredVars = ['WORKFRONT_BASE_URL', 'AEM_AUTHOR', 'DOCUMENT_PROVIDER_ID'];
    
    const missingVars = requiredVars.filter(varName => !params[varName]);
    
    if (missingVars.length > 0) {
        throw new Error(`Missing required Workfront environment variables: ${missingVars.join(', ')}`);
    }
    
    return {
        baseUrl: params.WORKFRONT_BASE_URL,
        aemAuthor: params.AEM_AUTHOR,
        documentProviderID: params.DOCUMENT_PROVIDER_ID
    };
}

/**
 * Create a task in Workfront
 */
async function createWorkfrontTask(taskData, accessToken, params) {
    const workfrontConfig = getWorkfrontConfig(params);
    const taskUrl = `${workfrontConfig.baseUrl}/task`;
    
    const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`
    };

    const response = await axios.post(taskUrl, taskData, { headers });
    
    if (!response.data) {
        throw new Error(`Task creation failed with status: ${response.status}`);
    }
    
    return response.data;
}

/**
 * Link asset to task in Workfront
 */
async function linkAssetToTask(assetId, taskID, accessToken, params) {
    const workfrontConfig = getWorkfrontConfig(params);
    const linkUrl = `${workfrontConfig.baseUrl}/extdoc?action=linkExternalDocumentObjects`;
    
    const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`
    };

    // Format the asset ID for Workfront
    const encodedAssetId = encodeURIComponent(assetId);
    const fullAssetId = `urn:workfront:documents:aem:${workfrontConfig.aemAuthor}:${encodedAssetId}`;

    // Create the objects string
    const objectsString = JSON.stringify({
        [assetId]: {
            ID: fullAssetId,
            name: 'asset-test',
            ext: 'jpg',
            isFolder: 'false'
        }
    });

    const linkData = {
        objects: objectsString,
        refObjCode: 'TASK',
        refObjID: taskID,
        documentProviderID: workfrontConfig.documentProviderID,
        providerType: 'AEM'
    };

    const response = await axios.put(linkUrl, linkData, { 
        headers,
        timeout: 30000
    });

    return response.status === 200;
}

/**
 * Handle task creation and asset linking
 */
async function handleCreateTask(params, logger) {
    try {
        // Get access token
        const accessToken = await getAccessToken(params);
        logger.info('Access token retrieved successfully');
        
        // Create task
        const taskData = {
            name: params.taskName || 'Task from AEM Asset',
            projectID: params.DEFAULT_PROJECT_ID,
            description: 'Task created from AEM Content Hub asset',
            plannedStartDate: new Date().toISOString().split('T')[0] + 'T00:00:00:000-0800',
            plannedCompletionDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] + 'T00:00:00:000-0800'
        };

        const taskResult = await createWorkfrontTask(taskData, accessToken.access_token, params);
        const taskID = taskResult?.data?.ID || taskResult?.taskID;
        logger.info(`Created task with ID: ${taskID}`);

        // Link asset to task
        let assetLinked = false;
        
        if (params.assetId) {
            assetLinked = await linkAssetToTask(
                params.assetId, 
                taskID, 
                accessToken.access_token,
                params
            );
        }

        return {
            statusCode: 200,
            body: {
                success: true,
                taskID: taskID,
                taskCreated: true,
                assetLinked: assetLinked,
                message: `Task created successfully with ID: ${taskID}. Asset linking: ${assetLinked ? 'Success' : 'Failed'}`
            }
        };
        
    } catch (error) {
        logger.error('Error creating task:', error.message);
        
        return {
            statusCode: 500,
            body: {
                error: `Task creation failed: ${error.message}`,
                details: {
                    message: error.message,
                    status: error.response?.status
                }
            }
        };
    }
}

/**
 * Main function executed by Adobe I/O Runtime
 */
async function main(params) {
    const logger = Core.Logger('main', { level: params.LOG_LEVEL || 'info' });

    try {
        // Handle preflight OPTIONS request
        if (params.__ow_method === 'OPTIONS') {
            return { statusCode: 200, body: {} };
        }

        // Check for required parameters
        const requiredParams = ['action'];
        const errorMessage = checkMissingRequestInputs(params, requiredParams, []);
        if (errorMessage) {
            return {
                statusCode: 400,
                body: { error: errorMessage }
            };
        }

        // Route to appropriate handler
        switch (params.action) {
            case 'createTaskAndLinkAsset':
                return await handleCreateTask(params, logger);
                
            default:
                return {
                    statusCode: 400,
                    body: { error: `Unknown action: ${params.action}` }
                };
        }

    } catch (error) {
        logger.error('Server error:', error);
        return {
            statusCode: 500,
            body: { error: 'Internal server error' }
        };
    }
}

exports.main = main;