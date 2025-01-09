const data = require("./data/items.json");
const getItems = (currentDir, page = 1, searchText = "") => {
    let items = {};
    let pageInfo = {}

    let filteredData = [];

    // Filter data by category
    if (currentDir !== "") {
        data?.forEach(item => {
            if (item.dir === currentDir) {
                filteredData.push(item);
            }
        });
    }

    // Filter data by search text
    if (searchText !== "") {
        const searchedData = [];
        filteredData?.forEach(item => {
            if (item.sku.includes(searchText)) {
                searchedData.push(item);
            }
        });
        if (searchedData.length > 0) {
            filteredData = searchedData;
        }
    }

    // Paginate the results
    const paginatedData = []
    if (page * 10 >= filteredData.length || filteredData.length < 10) {
        filteredData?.slice((page - 1) * 10, filteredData.length).forEach(item => {
            paginatedData.push(item);
        });
    } else {
        filteredData?.slice((page - 1) * 10, page * 10).forEach(item => {
            paginatedData.push(item);
        });
    }
    if (paginatedData.length > 0) {
        filteredData = paginatedData;
    }

    // Build the items object
    filteredData?.forEach(item => {
        items[item.sku] = item;
    });

    pageInfo = {
        current_page: page,
        page_size: 10,
        total_pages: filteredData.length > 0 ? Math.ceil(filteredData.length / 10) : 1,
    };

    return [items, pageInfo];
};

const getDirs = () => {
    let dirObject = {};

    const dirs = require('./data/dirs.json');

    dirs?.forEach(dir => {
        dirObject[dir.id] = dir;
    });

    return dirObject;
};

module.exports = {
    getDirs,
    getItems,
};
