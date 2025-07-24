/*
 * Copyright 2023 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License")
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */

import React, { useEffect, useState } from 'react';
import {
  Provider,
  defaultTheme,
  Heading,
  Button,
  ButtonGroup,
  Content,
  Form,
  Text,
} from '@adobe/react-spectrum';
import { Item, ListView } from '@react-spectrum/list';
import Spinner from './spinner';
import Status from './status';
import { getTranslations, quickPublishTranslations, unPublishTranslations } from '../utils';
import { useParams } from 'react-router-dom';
import { attach } from '@adobe/uix-guest';
import { extensionId } from './Constants';

/**
 *
 */
export default function () {
  const [isLoading, setIsLoading] = useState(true);
  const [translations, setTranslations] = useState([]);
  const [selectedTranslations, setSelectedTranslations] = useState([]);
  const [managementIsDisabled, setManagementIsDisabled] = useState(true);
  const [, setGuestConnection] = useState();
  const [sharedContext, setSharedContext] = useState();

  const { cfPaths } = useParams();
  if (!cfPaths) {
    console.error('Content fragment paths parameter is missed');
    return;
  }
  const cfPathsList = cfPaths.split(',');

  useEffect(() => {
    let interval;

    const init = async () => {
      const guestConnection = await attach({ id: extensionId });

      setGuestConnection(guestConnection);
      setSharedContext(guestConnection.sharedContext);

      await refreshTranslationsList(guestConnection.sharedContext);
      setIsLoading(false);

      interval = setInterval(() => {
        (async () => await refreshTranslationsList(guestConnection.sharedContext))();
      }, 3000);
    };
    init().catch(console.error);

    return () => clearInterval(interval);
  }, []);

  // Calculate if all items are selected
  const allItemsSelected = selectedTranslations.size === translations.length && translations.length > 0;
  const selectAllButtonText = allItemsSelected ? 'Clear All' : 'Select All';

  return (
      <Provider theme={defaultTheme} colorScheme={'light'}>
        <Content width="97%">
          {isLoading
            ? (
              <Spinner />
              )
            : translations.length
              ? (
              <Form necessityIndicator="label">
                <ListView
                    selectionMode="multiple"
                    aria-label="Static ListView items example"
                    margin="size-175"
                    onSelectionChange={onSelectionChangeHandler}
                    selectedKeys={selectedTranslations}
                >
                  {translations.map(translation => {
                    return (
                        <Item key={translation.path} textValue={translation.path}>
                          <Text>
                            {translation.locale} ({translation.title})
                          </Text>
                          <Status status={translation.status}/>
                        </Item>
                    );
                  })}
                </ListView>
                <ButtonGroup align="start" margin="size-175">
                  <Button
                      variant="secondary"
                      type="button"
                      isDisabled={translations.length === 0}
                      onClick={onSelectAllHandler}
                  >
                    {selectAllButtonText}
                  </Button>
                </ButtonGroup>
                <ButtonGroup align="end" margin="size-175">
                  <Button
                      variant="cta"
                      type="button"
                      isDisabled={managementIsDisabled}
                      onClick={onQuickPublishHandler}
                  >
                    Publish
                  </Button>
                  <Button
                      variant="cta"
                      type="button"
                      isDisabled={managementIsDisabled}
                      onClick={onUnPublishHandler}
                  >
                    Unpublish
                  </Button>
                </ButtonGroup>
              </Form>
                )
              : (
              <>
                <Heading level={3}>There are no translations</Heading>
              </>
                )}
        </Content>
      </Provider>
  );

  // Handlers

  /**
   * @param sharedContext
   */
  async function refreshTranslationsList (sharedContext) {
    const translations = await getTranslations(cfPathsList, sharedContext.get('auth'), sharedContext.get('aemHost'));
    setTranslations(translations);
  }

  /**
   * @param selection
   */
  function onSelectionChangeHandler (selection) {
    console.log('Selected translations: ', [...selection]);
    setSelectedTranslations(selection);
    setManagementIsDisabled(selection.size === 0);
  }

  /**
   * Toggle between selecting all items and deselecting all items
   */
  function onSelectAllHandler () {
    if (allItemsSelected) {
      // Clear all items
      setSelectedTranslations(new Set());
      setManagementIsDisabled(true);
    } else {
      // Select all items
      const allKeys = new Set(translations.map(translation => translation.path));
      setSelectedTranslations(allKeys);
      setManagementIsDisabled(false);
    }
  }

  /**
   *
   */
  async function onQuickPublishHandler () {
    setIsLoading(true);
    setManagementIsDisabled(true);
    await quickPublishTranslations(selectedTranslations, sharedContext.get('auth'), sharedContext.get('aemHost'));
    await refreshTranslationsList(sharedContext);
    setIsLoading(false);
  }

  /**
   *
   */
  async function onUnPublishHandler () {
    setIsLoading(true);
    setManagementIsDisabled(true);
    await unPublishTranslations(selectedTranslations, sharedContext.get('auth'), sharedContext.get('aemHost'));
    await refreshTranslationsList(sharedContext);
    setIsLoading(false);
  }
};
