/*
* <license header>
*/

export const extensionId = 'sample-extension';

// Values the host passes as actionContext.context on card actions.
export const SourceType = {
  ASSETS: 'assets',
  COLLECTIONS: 'collections',
};

// Values the host passes as resourceType in card onActionClick.
export const ResourceType = {
  ASSET: 'asset',
  COLLECTION: 'collection',
};
