/* 
* <license header>
*/

const sortIgnoreFilters = ["sortKey", "sortDirection"];

const filterKeyMap = {
  folder: "path",
  query: "fts",
  createdFrom: "createdAfter",
  createdTo: "createdBefore",
  publishedFrom: "publishedAfter",
  publishedTo: "publishedBefore",
  modifiedOrCreatedFrom: "modifiedOrCreatedAfter",
  modifiedOrCreatedTo: "modifiedOrCreatedBefore",
  model: "modelPath",
  tag: "tags",
};

const sortKeyMap = {
  name: "title",
  modifiedDate: "modifiedOrCreated",
  createdDate: "created",
};

const isoDateAdapter = (value) => {
  return new Date(value).toISOString();
};

const modelAdapter = (value) => {
  return value
      .map((singleModel) => {
        return singleModel.split("->")[1];
      })
      .join(",");
};

const tagsAdapter = (value) => {
  return value
      .map((tag) => {
        return tag.id.trim();
      })
      .join(",");
};

const arrayAdapter = (value) => {
  return value.join(",");
};

const filterValueAdapters = {
    status: arrayAdapter,
    locale: arrayAdapter,
    createdBy: arrayAdapter,
    createdFrom: isoDateAdapter,
    createdTo: isoDateAdapter,
    modifiedOrCreatedBy: arrayAdapter,
    modifiedOrCreatedFrom: isoDateAdapter,
    modifiedOrCreatedTo: isoDateAdapter,
    publishedBy: arrayAdapter,
    publishedTo: isoDateAdapter,
    publishedFrom: isoDateAdapter,
    model: modelAdapter,
    tag: tagsAdapter,
};

const buildFilterItemExpression = ([key, value]) => {
  if (sortIgnoreFilters.includes(key)) {
    return undefined;
  }

  const adaptedKey = filterKeyMap[key] || key;
  const adaptedValue = filterValueAdapters[key] ? filterValueAdapters[key](value) : value;

  return `${adaptedKey}=${adaptedValue};`;
};

const buildFilterExpression = (filters) => {
  return Object.entries(filters).reduce((expr, pair) => {
    const newExpr = buildFilterItemExpression(pair);

    if (newExpr) {
      expr = expr + newExpr;
    }

    return expr;
  }, "");
};

const buildSortExpression = (filters) => {
  const sortKey = sortKeyMap[filters.sortKey || "modifiedDate"] || filters.sortKey;
  return `${sortKey} ${filters.sortDirection === "ascending" ? "ASC" : "DESC"}`;
};

module.exports = {
  buildFilterExpression,
  buildSortExpression,
};
