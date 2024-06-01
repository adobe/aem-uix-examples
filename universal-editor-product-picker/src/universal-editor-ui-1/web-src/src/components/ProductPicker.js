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
import Spinner from './Spinner';
import { SearchField } from '@adobe/react-spectrum';
import { CatalogView }  from './CatalogView';

export default  (props) => {
  const { catalogServiceConfig, getCategories, getProducts, onConfirm, onCancel, selectedProducts } = props;

  const [state, setState] = useState({
    items: {},
    folder: catalogServiceConfig['commerce-root-category-id'],
    path: [],
    categories: {},
    loadingState: 'loading',
    selectedProducts: selectedProducts || [],
    error: null,
    pageInfo: {
      current_page: 1,
      page_size: 0,
      total_pages: 0,
    },
    searchText: "",
  });

  const clickListItem = (key) => {
    if (!key.startsWith('category:')) {
      return;
    }
    selectFolder(key.replace('category:', ''));
  };

  const selectFolder = (key) => {
    if (key.startsWith('category:')) {
      key = key.replace('category:', '');
    }
    setState(state => ({
      ...state,
      items: {},
      folder: key,
      loadingState: 'loading',
    }));
  };

  const onSelectionChange = (keys) => {
    console.log(" keys ", keys);
    console.log(" keys ", keys.size);


    let selectedProducts = [];
    if (keys.size > 0) {
      selectedProducts = keys;
    } else {
      selectedProducts = [];
    }

    setState(state => ({
      ...state,
      selectedProducts: selectedProducts,
    }));

    // const key = item.anchorKey;
    // if (!key) {
    //   return;
    // }
    // if (key.startsWith('category:')) {
    //   selectFolder(key);
    // } else {
    //   console.log(
    //       {
    //         ...state,
    //         selectedProducts: [key],
    //       }
    //   );
    //
    //
    //   setState(state => ({
    //     ...state,
    //     selectedProducts: [key],
    //   }));
    // }
  };

  const getPath = (categories) => {
    const pathString = categories[state.folder]?.path || '';
    return pathString.split('/').map(p => categories[p]).filter(p => p);
  };

  const onLoadMore = async () => {
    if (!state.pageInfo || state.pageInfo.current_page >= state.pageInfo.total_pages || state.loadingState === 'loadingMore') {
      return;
    }

    setState(state => ({
      ...state,
      loadingState: 'loadingMore',
    }));

    const [items, pageInfo] = await getProducts(state.folder, state.pageInfo?.current_page + 1, state.searchText);
    Object.values(items).forEach(i => {
      i.key = i.sku;
    });

    setState(state => {
      const newItems = { ...state.items, ...items };

      return {
        ...state,
        items: newItems,
        pageInfo,
        loadingState: 'idle',
      };
    });
  };

  const onSearchSubmit = (searchText) => {
    setState(state => {
      return {
        ...state,
        loadingState: 'loading',
        searchText,
      };
    });
  };

  const onSearchClear = () => {
    setState(state => {
      return {
        ...state,
        loadingState: 'loading',
        searchText: "",
      };
    });
  };

  useEffect(() => {
    setState(state => ({
      ...state,
      selectedProducts: selectedProducts || [],
    }));
  }, [selectedProducts]);

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
      const path = getPath(categories);

      setState(state => {
        return {
          ...state,
          categories,
          path,
        };
      });
    })();
  }, []);



  useEffect(() => {
    (async () => {
      let items = {};
      let pageInfo = {};
      try {
        [items, pageInfo] = await getProducts(state.folder, 1, state.searchText);
      } catch (err) {
        console.error(err);
        setState(state => ({
          ...state,
          error: 'Could not load items',
        }));
        return;
      }

      Object.values(items).forEach(i => {
        i.key = i.sku;
      });

      setState(state => {
        const path = getPath(state.categories);

        return {
          ...state,
          items,
          path,
          pageInfo,
          loadingState: 'idle',
        };
      });
    })();
  }, [state.folder, state.searchText]);

  // @todo use memo
  const items = (state.searchText === "")
      ? [
          ...Object.values(state.categories || {}).filter(c => c.parentId === state.folder),
          ...Object.values(state.items),
      ]
      : Object.values(state.items);

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
    {state.loadingState != 'loading' ? (
        <Flex direction="column" height="100%" gap="size-200" marginY="size-200">
          <Grid
              areas={["breadcrumbs search"]}
              columns={["2fr", "1fr"]}
          >
            {state.searchText === "" && (
                <Breadcrumbs gridArea="breadcrumbs" onAction={selectFolder}>
                  {state.path.map(c => <Item key={c.key}>{c.name}</Item>)}
                </Breadcrumbs>
            )}

            <SearchField
                gridArea="search"
                label="Products search:"
                labelPosition="side"
                defaultValue={state.searchText}
                onSubmit={onSearchSubmit}
                onClear={onSearchClear}
            />

          </Grid>
          <View height="70vh" marginTop="size-150">
            <CatalogView
                items={items}
                loadingState={state.loadingState}
                selectedKeys={state.selectedProducts}
                clickListItem={clickListItem}
                onSelectionChange={onSelectionChange}
                onLoadMore={onLoadMore}
            />
          </View>

          <ButtonGroup marginTop={30} marginStart="auto">
            <Button variant="secondary" onPress={onCancel}>Cancel</Button>
            {items.length > 0 && (
                <Button variant="accent" onPress={() => {
                  if (state.selectedProducts.size === 0) {
                    return;
                  }
                  onConfirm(state.selectedProducts);
            }}>Confirm</Button>
           )}
          </ButtonGroup>
        </Flex>
    ) : (
        <View width="97%" height="100%">
          <Spinner />
        </View>
    )}
  </Provider>;
};
