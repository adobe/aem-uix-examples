const query = `query getProductsInCategory($phrase: String = "", $id: String!, $currentPage: Int = 1) {
  productSearch(phrase: $phrase, filter: { attribute: "categoryIds", eq: $id }, current_page: $currentPage, page_size: 20) {
      items {
          productView {
              sku
              name
              images(roles: "thumbnail") {
                  url
              }
              urlKey
          }
      }
      page_info {
          current_page
          page_size
          total_pages
      }
      total_count
  }
}`;

export default query;