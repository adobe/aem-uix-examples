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
  const { getDirs, getItems, onConfirm, onCancel, selectedItems } = props;

  const [state, setState] = useState({
    error: null,
    loadingState: 'loading',
    dirs: [],
    currentDir: "1",
    items: [],
    breadcrumbs: [],
    pageInfo: {
      current_page: 1,
      page_size: 0,
      total_pages: 0,
    },
    searchText: "",
    selectedItems: selectedItems || [],
  });

  // initial list of categories, categories are loaded as a complete list
  useEffect(() => {
    (async () => {
      let dirs = {};
      try {
        dirs = getDirs();
      } catch (err) {
        setState(state => ({
          ...state,
          error: 'Could not load categories',
        }));
        return;
      }

      // to distinguish between products and categories in view items
      Object.values(dirs).forEach(c => {
        c.key = `dir:${c.id}`;
        c.isFolder = true;
      });

      setState(state => {
        return {
          ...state,
          dirs,
        };
      });
    })();
  }, []);

  // breadcrumbs
  useEffect(() => {
    (async () => {
      let breadcrumbs = [];
      if (state.dirs.length !== 0 && state.searchText.length === 0) {
        breadcrumbs = state.dirs[state.currentDir]
          .path.split('/')
          .map(p => state.dirs[p])
          .filter(p => p);
      }

      setState(state => {
        return {
          ...state,
          breadcrumbs,
        };
      });
    })();
  }, [state.dirs, state.currentDir, state.searchText]);

  // items: categories + 1st page of products
  useEffect(() => {
    setState(state => {
      return {
        ...state,
        loadingState: 'loading',
      };
    });

    (async () => {
      let dirs = [];
      if (state.dirs.length !== 0 && state.searchText.length === 0) {
        dirs = Object.values(state.dirs)
          .filter(dir => dir.parentId === state.currentDir);
      }
      let items = {};
      let pageInfo = {};
      try {
        [items, pageInfo] = getItems(state.currentDir, 1, state.searchText);
      } catch (err) {
        setState(state => ({
          ...state,
          error: 'Could not load items',
        }));
        return;
      }
      Object.values(items).forEach(i => {
        i.key = i.sku;
      });

      const itemsList = [...dirs, ...Object.values(items)];

      setState(state => {
        return {
          ...state,
          loadingState: 'idle',
          items: itemsList,
          pageInfo,
        };
      });
    })();
  }, [state.dirs, state.currentDir, state.searchText]);

  // only for products, categories are always displayed as a complete list
  const onLoadMore = async () => {
    if (state.pageInfo.current_page >= state.pageInfo.total_pages || state.loadingState === 'loadingMore') {
      return;
    }

    setState(state => ({
      ...state,
      loadingState: 'loadingMore',
    }));

    const [items, pageInfo] = getItems(
      state.currentDir,
      state.pageInfo.current_page + 1,
      state.searchText
    );
    Object.values(items).forEach(i => {
      i.key = i.sku;
    });
    const newItems = [ ...state.items, ...Object.values(items) ];

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
    if (!key.startsWith('dir:')) {
      return;
    }

    setState(state => ({
      ...state,
      currentDir: key.replace('dir:', ''),
    }));
  };

  const onSelectionChange = (keys) => {
    if (keys.size === 0) {
      return;
    }

    const key = keys.anchorKey;
    if (key.startsWith('dir:')) {
      onClickItemList(key);
    } else {
      let selectedItemsSet;

      selectedItemsSet = keys;

      setState(state => ({
        ...state,
        selectedItems: Array.from(selectedItemsSet),
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
      selectedItems: selections,
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
          config={{ "selection-mode": "multiple" }}
          items={state.items}
          loadingState={state.loadingState}
          onClickItemList={onClickItemList}
          onSelectionChange={onSelectionChange}
          onLoadMore={onLoadMore}
          selectedKeys={state.selectedItems}
        />
      </View>
      <Grid
        areas={["selectedItems actions"]}
        columns={["2fr", "1fr"]}
      >
        <Flex direction="row" marginTop="size-200">
          <TagList
            gridArea="selectedItems"
            marginTop="size-200"
            setSelections={setTagSelections}
            selections={state.selectedItems}
          />
        </Flex>
        <ButtonGroup gridArea="actions" marginTop={30} marginStart="auto">
          <Button variant="secondary" onPress={onCancel}>Cancel</Button>
          {state.selectedItems.length > 0 && (
            <Button variant="accent" onPress={() => {
              onConfirm(state.selectedItems);
            }}>Confirm</Button>
          )}
        </ButtonGroup>
      </Grid>
    </Flex>
  </Provider>;
};
