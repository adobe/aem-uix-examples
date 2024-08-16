/*
 * <license header>
 */

import React from 'react';
import {
  defaultTheme,
  Provider,
  Flex,
  View,
  IllustratedMessage,
  Heading,
  Content,
} from '@adobe/react-spectrum';
import Error from '@spectrum-icons/illustrations/Error';

export default ({ error } = props) => {
  return (
    <Provider theme={defaultTheme} height="100%">
      <Flex direction="column" height="100%">
        <View padding="size-500">
          <IllustratedMessage>
            <Error />
            <Heading>Something went wrong</Heading>
            <Content>{error}</Content>
          </IllustratedMessage>
        </View>
      </Flex>
    </Provider>
  );
};
