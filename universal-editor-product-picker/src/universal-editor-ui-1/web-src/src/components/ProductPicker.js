import React, { useEffect, useState } from 'react';

import {
  defaultTheme,
  Provider,
  Item,
  Heading,
  Content,
  Breadcrumbs,
  Flex,
  View,
  IllustratedMessage,
  Button,
  ButtonGroup,
  Grid,
} from '@adobe/react-spectrum';
import Error from '@spectrum-icons/illustrations/Error';
import { SearchField } from '@adobe/react-spectrum';
import { CatalogView }  from './CatalogView';

export default  (props) => {
  const { catalogServiceConfig, getCategories, getProducts, onConfirm, onCancel, selectedProducts } = props;

  const [state, setState] = useState({
    loadingState: 'loading',
    categories: [],
    currentCategory: catalogServiceConfig['commerce-root-category-id'],
    items: [],
    breadcrumbs: [],
    error: null,

    selectedProducts: selectedProducts || [],
    pageInfo: {
      current_page: 1,
      page_size: 0,
      total_pages: 0,
    },
    searchText: "",
  });

  // initial list of categories
  useEffect(() => {
    (async () => {
      let categories = {};
      try {
        categories = await getCategories(catalogServiceConfig['commerce-root-category-id']);
      } catch (err) {
        setState(state => ({
          ...state,
          error: 'Could not load categories',
        }));
        return;
      }

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
      if (state.categories.length === 0) {
        return [];
      }

      const breadcrumbs = state.categories[state.currentCategory]
        .path.split('/')
        .map(p => state.categories[p])
        .filter(p => p);

      setState(state => {
        return {
          ...state,
          breadcrumbs: breadcrumbs,
        };
      });
    })();
  }, [state.categories, state.currentCategory]);

  // items: categories + products
  useEffect(() => {
    setState(state => {
      return {
        ...state,
        loadingState: 'loading',
      };
    });

    (async () => {
      const categories = Object.values(state.categories)
        .filter(category => category.parentId === state.currentCategory);

      let products = {};
      let pageInfo = {};
      try {
        [products, pageInfo] = await getProducts(state.currentCategory, 1, state.searchText);
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
          items: items,
        };
      });
    })();
  }, [state.categories, state.currentCategory]);

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
    const key = keys.anchorKey;
    if (!key) {
      return;
    }
    if (key.startsWith('category:')) {
      onClickItemList(key);
    } else {
      setState(state => ({
        ...state,
      }));
    }
  };

  if (state.error) {
    return (
      <Provider theme={defaultTheme} height="100%">
        <Flex direction="column" height="100%">
          <View padding="size-500">
            <IllustratedMessage>
              <Error />
              <Heading>Something went wrong</Heading>
              <Content>{state.error}</Content>
            </IllustratedMessage>
          </View>
        </Flex>
      </Provider>
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
      </Grid>
      <View height="70vh">
        <CatalogView
          items={state.items}
          loadingState={state.loadingState}
          onClickItemList={onClickItemList}
          onSelectionChange={onSelectionChange}
        />
      </View>

      <ButtonGroup marginTop={30} marginStart="auto">
        <Button variant="secondary" onPress={onCancel}>Cancel</Button>
      </ButtonGroup>
    </Flex>
  </Provider>;
};
