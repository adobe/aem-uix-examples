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
  Grid
} from '@adobe/react-spectrum';
import Error from '@spectrum-icons/illustrations/Error';
import Spinner from './Spinner';
import { SearchField } from '@adobe/react-spectrum';
import { CatalogView }  from './CatalogView';

const Picker = props => {
  const { blocks, getItems, getCategories, handleSelection, handleClose } = props;

  const [state, setState] = useState({
    items: {},
    folder: "2",
    path: [],
    categories: {},
    loadingState: 'loading',
    block: null,
    disabledKeys: new Set(),
    selectedItems: new Set(),
    error: null,
    pageInfo: {
      current_page: 1,
      page_size: 0,
      total_pages: 0,
    },
    searchText: "",
  });

  const activeConfig = {'commerce-root-category-id': "2"};

  const clickListItem = (key) => {
    const block = blocks[state.block] || {};
    if (!key.startsWith('category:') || block?.selection === 'multiple') {
      return;
    }
    selectFolder(key.replace('category:', ''));
  }

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

  const selectItem = (item) => {
    const key = item.anchorKey;
    if (!key) {
      return;
    }
    if (key.startsWith('category:')) {
      selectFolder(key);
    } else {
      setState(state => ({
        ...state,
        selectedItems: [key],
      }));
    }
  };

  const calculateDisabledKeys = (block, items, categories) => {
    // Disable item or folder depending on the block type
    const disabledKeys = new Set();
    if (block.type === 'item' && block.selection === 'multiple') {
      getCategoriesToDisplay(categories).forEach(i => disabledKeys.add(i.key));
    } else if (block.type === 'folder' && block.selection === 'multiple') {
      Object.values(items).forEach(i => disabledKeys.add(i.sku));
    }

    return disabledKeys;
  };

  const getCategoriesToDisplay = (categories) => {
    if (Object.keys(categories).length === 0) {
      return [];
    }
    return Object.values(categories || {}).filter(c => c.parentId === state.folder);
  };

  const getPath = (categories) => {
    const pathString = categories[state.folder]?.path || '';
    return pathString.split('/').map(p => categories[p]).filter(p => p);
  }

  const onLoadMore = async () => {
    if (!state.pageInfo || state.pageInfo.current_page >= state.pageInfo.total_pages || state.loadingState === 'loadingMore') {
      return;
    }

    setState(state => ({
      ...state,
      loadingState: 'loadingMore',
    }));

    const [items, pageInfo] = await getItems(state.folder, state.pageInfo?.current_page + 1, state.searchText);
    Object.values(items).forEach(i => {
      i.key = i.sku;
    });

    setState(state => {
      const newItems = { ...state.items, ...items };
      const blockObj = state.block ? blocks[state.block] : {};
      const disabledKeys = calculateDisabledKeys(blockObj, newItems, state.categories);

      return {
        ...state,
        items: newItems,
        disabledKeys,
        pageInfo,
        loadingState: 'idle',
      }
    });
  }

  const onSearchSubmit = (searchText) => {
    setState(state => {
      return {
        ...state,
        loadingState: 'loading',
        searchText,
      }
    });
  };

  const onSearchClear = () => {
    setState(state => {
      return {
        ...state,
        loadingState: 'loading',
        searchText: "",
      }
    });
  };

  useEffect(() => {
    (async () => {
      let categories = {};
      try {
        categories = await getCategories(activeConfig['commerce-root-category-id']);
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
        }
      });
    })();
  }, [])

  useEffect(() => {
    (async () => {
      let items = {};
      let pageInfo = {};
      try {
        [items, pageInfo] = await getItems(state.folder, 1, state.searchText);
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
        const blockObj = state.block ? blocks[state.block] : {};
        const disabledKeys = calculateDisabledKeys(blockObj, items, state.categories);
        const path = getPath(state.categories);

        return {
          ...state,
          items,
          path,
          disabledKeys,
          pageInfo,
          loadingState: 'idle',
        }
      });
    })();
  }, [state.folder, state.searchText]);

  const items = (state.searchText === "")
      ? [...getCategoriesToDisplay(state.categories), ...Object.values(state.items)]
      : Object.values(state.items);

  if (state.error) {
    return <Provider theme={defaultTheme} height="100%">
      <Flex direction="column" height="100%">
        <View padding="size-500">
          <IllustratedMessage>
            <Error />
            <Heading>Something went wrong</Heading>
            <Content>{state.error}</Content>
          </IllustratedMessage>
        </View>
      </Flex>
    </Provider>;
  }

  return <Provider theme={defaultTheme} height="100%">
    {state.loadingState != 'loading' ? (
        <Flex direction="column" height="100%">
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
                state={state}
                loadingState={state.loadingState}
                selectedItems={state.selectedItems}
                disabledKeys={state.disabledKeys}
                clickListItem={clickListItem}
                selectItem={selectItem}
                onLoadMore={onLoadMore}
            />
          </View>
          <ButtonGroup marginTop={30} marginStart="auto">
            <Button variant="secondary" onPress={() => handleClose()}>Cancel</Button>
            {items.length > 0 && (
                <Button variant="accent" onPress={() => {
                  if (state.selectedItems.size === 0) {
                    return;
                  }
                  handleSelection(state.selectedItems[0]);
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
}

export default Picker;
