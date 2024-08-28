/*
 * <license header>
 */

const convertProductSelectionsFromStringToList = (productsString) => {
  if (!productsString) {
    return [];
  }

  const products = productsString.split(',');
  if (!products) {
    return [];
  }

  return products.map((item) => {
    return {
      key: item,
      sku: item,
    };
  });
};

const convertProductSelectionsFromListToString = (products) => {
  if (!products) {
    return "";
  }
  return products.map(item => item.sku).join(",");
};

const reOrderSelections = (selections, e) => {
  const { keys, target } = e;
  let updatedSelections;

  // Extract keys from Set and filter out matching items from updatedSelections
  updatedSelections = selections.filter(item => !keys.has(item.key));
  // Convert keys Set to an array of objects with sku and key properties
  const keysArray = Array.from(keys).map(key => ({ sku: key, key }));
  // Find the index where to insert keys based on target
  let targetIndex = updatedSelections.findIndex(item => item.key === target.key);

  // Determine the new index based on the drop position in target
  if (target.dropPosition === 'before') {
    targetIndex = Math.max(0, targetIndex);
  } else if (target.dropPosition === 'after') {
    targetIndex = Math.min(updatedSelections.length, targetIndex + 1);
  }

  // Insert keysArray into updatedSelections at the calculated index
  updatedSelections.splice(targetIndex, 0, ...keysArray);

  return updatedSelections;
};

module.exports = {
  convertProductSelectionsFromStringToList,
  convertProductSelectionsFromListToString,
  reOrderSelections,
};
