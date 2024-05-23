/*
 * <license header>
 */

import getCategoriesInCategory from './queries/categories.graphql.js';
import getProductsInCategory from './queries/products.graphql.js';
import productSearch from './queries/productSearch.graphql.js';
import actions from "./config.json";

async function performCommerceServiceQuery(query, variables) {
  const headers = {
    'Content-Type': 'application/json',
    // @todo
    'graphqlapi': '',
  };

  const apiCall = new URL(actions['graphql-proxy']);
  apiCall.searchParams.append('query', query.replace(/(?:\r\n|\r|\n|\t|[\s]{4})/g, ' ')
      .replace(/\s\s+/g, ' '));
  apiCall.searchParams.append('variables', variables ? JSON.stringify(variables) : null);
  const response = await fetch(apiCall, {
    method: 'GET',
    headers,
  });

  if (!response.ok) {
    return null;
  }

  const queryResponse = await response.json();

  return queryResponse.data;
}

const getItems = async (folderKey, page = 1, searchText = "") => {
  let newItems = {};
  let pageInfo = {};
  try {
    const products = await performCommerceServiceQuery(
        searchText === "" ? getProductsInCategory : productSearch,
        {
          id: folderKey,
          currentPage: page,
          phrase: searchText,
        }
    );
    products?.productSearch?.items.forEach(product => {
      const { productView } = product;

      try {
        productView.images.forEach(image => {
          const url = new URL(image.url, window.location);
          url.searchParams.set('width', 40);
          image.url = url.toString();
        });
      } catch { }

      newItems[productView.sku] = {
        ...productView
      };
    });
    pageInfo = products?.productSearch?.page_info;
  } catch (err) {
    console.error('Could not retrieve products', err);
  }

  return [newItems, pageInfo];
};

const getCategories = async (folderKey) => {
  let categoryObject = {};

  try {
    const categories = await performCommerceServiceQuery(getCategoriesInCategory, { id: folderKey });
    categories?.categories.forEach(category => {
      categoryObject[category.id] = category;
    });
  } catch (err) {
    console.error('Could not retrieve categories', err);
  }

  return categoryObject;
}

module.exports = {
  getItems,
  getCategories,
}
