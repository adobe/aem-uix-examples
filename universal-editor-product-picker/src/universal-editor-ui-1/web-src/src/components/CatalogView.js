import React from 'react';

import {
  Text,
  Image,
  IllustratedMessage,
  Heading,
  Cell,
  Column,
  Row,
  TableView,
  TableBody,
  TableHeader,
  Flex,
  View,
} from '@adobe/react-spectrum';
import Folder from '@spectrum-icons/illustrations/Folder';
import ImageIcon from "@spectrum-icons/workflow/Image";
import NotFound from "@spectrum-icons/illustrations/NotFound";

const CatalogView = props => {
  const {
    config,
    items,
    loadingState,
    onClickItemList,
    onSelectionChange,
    onLoadMore,
    selectedKeys,
  } = props;

  return (
    <TableView
      aria-label="List of Items"
      selectionMode={config["selection-mode"]}
      selectionStyle="highlight"
      width="100%"
      height="100%"
      density="spacious"
      selectedKeys={selectedKeys}
      onAction={onClickItemList}
      onSelectionChange={onSelectionChange}
    >
      <TableHeader>
        <Column/>
      </TableHeader>
      <TableBody
        loadingState={loadingState}
        items={items}
        onLoadMore={onLoadMore}
      >
        {item => (
          <Row key={item.key}>
            <Cell>
              {item.isFolder ? (
                <Flex direction="row">
                  <Folder />
                  <View alignSelf={"center"} marginStart={10}>
                    <Text><span dangerouslySetInnerHTML={{ __html: item.name }} /></Text>
                  </View>
                </Flex>
              ) : (
                <Flex direction="row">
                  <Flex width="size-550">
                    {item.images && item.images.length > 0 ? (<Image src={item.images[0].url} alt={item.name} />) : (<ImageIcon size="L" />) }
                  </Flex>
                  <Flex direction="column" marginStart={10}>
                    <Text><span dangerouslySetInnerHTML={{ __html: item.name }} /></Text>
                    <Text UNSAFE_style={{ fontSize: "var(--spectrum-global-dimension-static-font-size-50)" }}>(SKU: {item.sku})</Text>
                  </Flex>
                </Flex>
              )}
            </Cell>
          </Row>
        )}
      </TableBody>
    </TableView>
  );
};

export { CatalogView };
