/*
 * <license header>
 */

import React, { useEffect, useState } from 'react';
import {
  defaultTheme,
  Provider,
  Item,
  Breadcrumbs,
  Flex,
  View,
  Button,
  ButtonGroup,
  Grid,
  SearchField,
} from '@adobe/react-spectrum';
import { CatalogView }  from './CatalogView';
import { TagList } from './TagList';
import ExtensionError from './ExtensionError';

export default (props) => {
  const { config, getCategories, getProducts, onConfirm, onCancel, selectedProducts } = props;

  const [state, setState] = useState({
    error: null,
    loadingState: 'loading',
    categories: [],
    currentCategory: config['commerce-root-category-id'],
    items: [],
    breadcrumbs: [],
    pageInfo: {
      current_page: 1,
      page_size: 0,
      total_pages: 0,
    },
    searchText: "",
    selectedProducts: selectedProducts || [],
  });

  // initial list of categories, categories are loaded as a complete list
  useEffect(() => {
    (async () => {
      let categories = {};
      try {
        categories = await getCategories(config);
      } catch (err) {
        setState(state => ({
          ...state,
          error: 'Could not load categories',
        }));
        return;
      }

      // to distinguish between products and categories in view items
      Object.values(categories).forEach(c => {
        c.key = `category:${c.id}`;
        c.isFolder = true;
      });

      setState(state => {
        return {
          ...state,
          categories,
        };
      });
    })();
  }, []);

  // breadcrumbs
  useEffect(() => {
    (async () => {
      let breadcrumbs = [];
      if (state.categories.length !== 0 && state.searchText.length === 0) {
        breadcrumbs = state.categories[state.currentCategory]
          .path.split('/')
          .map(p => state.categories[p])
          .filter(p => p);
      }

      setState(state => {
        return {
          ...state,
          breadcrumbs,
        };
      });
    })();
  }, [state.categories, state.currentCategory, state.searchText]);

  // items: categories + 1st page of products
  useEffect(() => {
    setState(state => {
      return {
        ...state,
        loadingState: 'loading',
      };
    });

    (async () => {
      let categories = [];
      if (state.categories.length !== 0 && state.searchText.length === 0) {
        categories = Object.values(state.categories)
          .filter(category => category.parentId === state.currentCategory);
      }

      let products = {};
      let pageInfo = {};
      try {
        [products, pageInfo] = await getProducts(config, state.currentCategory, 1, state.searchText);
      } catch (err) {
        setState(state => ({
          ...state,
          error: 'Could not load items',
        }));
        return;
      }
      Object.values(products).forEach(i => {
        i.key = i.sku;
      });

      const items = [...categories, ...Object.values(products)];

      setState(state => {
        return {
          ...state,
          loadingState: 'idle',
          items,
          pageInfo,
        };
      });
    })();
  }, [state.categories, state.currentCategory, state.searchText]);

  // only for products, categories are always displayed as a complete list
  const onLoadMore = async () => {
    if (state.pageInfo.current_page >= state.pageInfo.total_pages || state.loadingState === 'loadingMore') {
      return;
    }

    setState(state => ({
      ...state,
      loadingState: 'loadingMore',
    }));

    const [products, pageInfo] = await getProducts(
      config,
      state.currentCategory,
      state.pageInfo.current_page + 1,
      state.searchText
    );
    Object.values(products).forEach(i => {
      i.key = i.sku;
    });
    const newItems = [ ...state.items, ...Object.values(products) ];

    setState(state => {
      return {
        ...state,
        items: newItems,
        pageInfo,
        loadingState: 'idle',
      };
    });
  };

  const onClickItemList = (key) => {
    if (!key.startsWith('category:')) {
      return;
    }

    setState(state => ({
      ...state,
      currentCategory: key.replace('category:', ''),
    }));
  };

  const onSelectionChange = (keys) => {
    if (keys.size === 0) {
      return;
    }

    const key = keys.anchorKey;
    if (key.startsWith('category:')) {
      onClickItemList(key);
    } else {
      let selectedProductsSet;

      if (config['selection-mode'] === 'multiple') {
        selectedProductsSet = new Set(state.selectedProducts);
        if (selectedProductsSet.has(key)) {
          selectedProductsSet.delete(key);
        } else {
          selectedProductsSet.add(key);
        }
      } else {
        selectedProductsSet = keys;
      }

      setState(state => ({
        ...state,
        selectedProducts: Array.from(selectedProductsSet),
      }));
    }
  };

  const onSearchSubmit = (searchText) => {
    setState(state => {
      return {
        ...state,
        searchText,
      };
    });
  };

  const onSearchClear = () => {
    setState(state => {
      return {
        ...state,
        searchText: "",
      };
    });
  };

  const setTagSelections = (selections) => {
    setState(state => ({
      ...state,
      selectedProducts: selections,
    }));
  };

  if (state.error) {
    return (
      <ExtensionError error={state.error} />
    );
  }

  return <Provider theme={defaultTheme} height="100%">
    <Flex direction="column" height="100%">
      <Grid
        areas={["breadcrumbs search"]}
        columns={["2fr", "1fr"]}
      >
        <Breadcrumbs gridArea="breadcrumbs" onAction={onClickItemList}>
          {state.breadcrumbs.map(c => <Item key={c.key}>{c.name}</Item>)}
        </Breadcrumbs>
        <SearchField
          gridArea="search"
          label="Products search:"
          labelPosition="side"
          defaultValue={state.searchText}
          onSubmit={onSearchSubmit}
          onClear={onSearchClear}
        />
      </Grid>
      <View height="75vh" minHeight="75vh">
        <CatalogView
          config={config}
          items={state.items}
          loadingState={state.loadingState}
          onClickItemList={onClickItemList}
          onSelectionChange={onSelectionChange}
          onLoadMore={onLoadMore}
          selectedKeys={state.selectedProducts}
        />
      </View>
      <Grid
        areas={["selectedProducts actions"]}
        columns={["2fr", "1fr"]}
      >
        <Flex direction="row" marginTop="size-200">
          <TagList
            gridArea="selectedProducts"
            marginTop="size-200"
            setSelections={setTagSelections}
            selections={state.selectedProducts}
          />
        </Flex>
        <ButtonGroup gridArea="actions" marginTop={30} marginStart="auto">
          <Button variant="secondary" onPress={onCancel}>Cancel</Button>
          {state.selectedProducts.length > 0 && (
            <Button variant="accent" onPress={() => {
              onConfirm(state.selectedProducts);
            }}>Confirm</Button>
          )}
        </ButtonGroup>
      </Grid>
    </Flex>
  </Provider>;
};
