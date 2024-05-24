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
    TableHeader
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
    const {
        items,
        loadingState,
        selectedItems,
        disabledKeys,
        clickListItem,
        selectItem,
        onLoadMore,
        onSortChange
    } = props;

    return (
        <TableView
            aria-label="List of Items"
            selectionMode="single"
            selectionStyle="highlight"
            width="100%"
            height="100%"
            density="spacious"
            renderEmptyState={renderEmptyState}
            selectedKeys={selectedItems}
            disabledKeys={disabledKeys}
            onAction={clickListItem}
            onSelectionChange={selectItem}
            onSortChange={onSortChange}
        >
            <TableHeader>
                <Column key="image" width={50}></Column>
                <Column key="name" defaultWidth="30%" allowsSorting={true} allowsResizing={true}>Name</Column>
                <Column key="sku" allowsSorting={true}>SKU</Column>
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
                                <Folder />
                            ) : (
                                item.images && item.images.length > 0 ? (
                                    <Image src={item.images[0].url} alt={item.name} objectFit="contain" />
                                ) : (
                                    <ImageIcon size="L" />
                                )
                            )}
                        </Cell>
                        <Cell>
                            <Text><span dangerouslySetInnerHTML={{ __html: item.name }} /></Text>
                        </Cell>
                        <Cell>
                            {!item.isFolder && item.sku}
                        </Cell>
                    </Row>
                )}
            </TableBody>
        </TableView>
    );
};

export { CatalogView };

// sort: {attribute: "name", direction: ASC}