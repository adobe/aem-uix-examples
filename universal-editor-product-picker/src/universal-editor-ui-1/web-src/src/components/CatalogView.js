import React from 'react';

import {
    Item,
    Text,
    Flex,
    Image, ListView, IllustratedMessage, Heading,
} from '@adobe/react-spectrum';
import Folder from '@spectrum-icons/illustrations/Folder';
import ImageIcon from "@spectrum-icons/workflow/Image";
import NotFound from "@spectrum-icons/illustrations/NotFound";

const renderEmptyState = () => (
    <IllustratedMessage>
        <NotFound />
        <Heading>No items found</Heading>
    </IllustratedMessage>
);

const CatalogView = props => {
    const { items, loadingState, selectedItems, disabledKeys, clickListItem, selectItem, onLoadMore } = props;

    return (
        <ListView aria-label="List of Items"
                  selectionMode="single"
                  selectionStyle="highlight"
                  items={items}
                  loadingState={loadingState}
                  width="100%"
                  height="100%"
                  density="spacious"
                  onAction={clickListItem}
                  selectedKeys={selectedItems}
                  onSelectionChange={selectItem}
                  disabledKeys={disabledKeys}
                  renderEmptyState={renderEmptyState}
                  onLoadMore={onLoadMore}
        >
            {item => {
                if (item.isFolder) {
                    return (
                      <Item key={item.key} textValue={item.name}>
                        <Folder />
                        <Text>{item.name}</Text>
                      </Item>
                    );
                }

                return (
                  <Item key={item.key} textValue={item.name}>
                    <Flex direction="row">
                      <Flex width="size-550">
                        {item.images && item.images.length > 0 ? (<Image src={item.images[0].url} alt={item.name} objectFit="contain" />) : (<ImageIcon size="L" />) }
                      </Flex>
                      <Flex direction="column">
                        <Text><span dangerouslySetInnerHTML={{ __html: item.name }} /></Text>
                        <Text UNSAFE_style={{ fontSize: "var(--spectrum-global-dimension-static-font-size-50)" }}>(SKU: <span dangerouslySetInnerHTML={{ __html: item.sku }} />)</Text>
                       </Flex>
                    </Flex>
                  </Item>
                );
            }}
        </ListView>
    );
};

export { CatalogView };