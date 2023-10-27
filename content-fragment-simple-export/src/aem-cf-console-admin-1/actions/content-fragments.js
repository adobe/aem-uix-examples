/* 
* <license header>
*/

const fetch = require('node-fetch');
const filesLib = require('@adobe/aio-lib-files');

async function generateExportFile(params, logger) {
  const apiEndpoint = `https://${params.aemHost}/adobe/sites/cf/graphql`;
  const headers = {
    "Content-Type": "application/json",
    Accept: "application/json",
    "x-adobe-accept-unsupported-api": 1,
    'Authorization': 'Bearer ' + params.authConfig.imsToken,
  };

  const query = `
    query (
      $first: Int
      $after: String
      $filter: String
      $sort: String
    ) {
      contentFragments(
        sort: $sort
        after: $after
        limit: $first
        filter: $filter
      ) {
        edges {
          node {
            id
            path
            title
            status
            statusPreview
            created {
              at
              by
            }
            modified {
              at
              by
            }
            modifiedOrCreated {
              at
              by
            }
            published {
              at
              by
            }
            model {
              name
              path
            }
            parent {
              title
            }
          }
        }
        pageInfo {
          endCursor
          hasNextPage
        }
      }
    }
  `;
  const variables = {
    sort: "modifiedOrCreated DESC",
    after: null,
    first: 50,
    filter: "path=/content/dam/ui-extensibility;status=new,published;",
    withStatusPreview: true,
    withTags: true,
  };

  const fs = await filesLib.init();
  const filepath = 'private/cf-export.csv';

  const wtStream = await fs.createWriteStream(filepath);
  wtStream.write("Title,Model,Folder,Status,Path\n");

  let hasNextPage;
  do {
    const result = await makeRequest(apiEndpoint, headers, query, variables, logger);

    if (result.data.contentFragments.edges.length === 0) {
      break;
    }

    wtStream.write(convertToCsv(result.data.contentFragments.edges));

    variables.after = result.data.contentFragments.pageInfo.endCursor;
    hasNextPage = result.data.contentFragments.pageInfo.hasNextPage;

  } while (hasNextPage);

  await wtStream.end();

  const presignUrl = await fs.generatePresignURL(filepath, { expiryInSeconds: 3000, permissions: 'r' });
  return presignUrl;
}

async function makeRequest(apiEndpoint, headers, query, variables, logger) {
  const res = await fetch(apiEndpoint, {
    method: "POST",
    headers,
    body: JSON.stringify({ query, variables }),
  });

  if (!res.ok) {
    logger.error(res);
    throw new Error("request to " + apiEndpoint + " failed with status code " + res.status);
  }

  return await res.json();
}

function convertToCsv(data) {
  return data.map((item) => {
    return `"${item.node.title}","${item.node.model.name}","${item.node.parent.title}","${item.node.status}","${item.node.path}"`;
  }).join('\n');
}

module.exports = {
  generateExportFile,
};
