/*
 * Copyright 2023 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */
import {
  Cell,
  Checkbox,
  Column,
  Heading,
  Row,
  TableView,
  TableBody,
  TableHeader,
  Text,
  View,
  Flex,
  ProgressBar,
  StatusLight,
} from "@adobe/react-spectrum";
import { useEffect, useState } from "react";
import { getContentFragments } from "../utils";

const extractReferences = (contentFragments, contentFragmentPaths) => {
  const references = [];

  for (const contentFragment of contentFragments) {
    if (contentFragmentPaths.includes(contentFragment.path) && contentFragment.references.length > 0) {
      for (const reference of contentFragment.references) {
        if (!references.some(item => item.path === reference.path)) {
          references.push(reference);
        }
      }
    }
  }

  return references;
};

const extractReferencedBy = (contentFragments, contentFragmentPaths) => {
  const referencedBy = [];

  for (const contentFragment of contentFragments) {
    if (contentFragmentPaths.includes(contentFragment.path) && contentFragment.referencedBy.length > 0) {
      for (const reference of contentFragment.referencedBy) {
        if (!referencedBy.some(item => item.path === reference.path)) {
          referencedBy.push(reference);
        }
      }
    }
  }

  return referencedBy;
};

const getUniqueContentFragments = (contentFragments, selectedReferencesValues, selectedReferencedByValues) => {
  const contentFragmentsToProceed = [
    ...contentFragments,
    ...extractReferences(contentFragments, selectedReferencesValues),
    ...extractReferencedBy(contentFragments, selectedReferencedByValues),
  ];

  return contentFragmentsToProceed.filter((item, index, array) => {
    const firstIndex = array.findIndex(obj => obj.path === item.path);
    return firstIndex === index;
  });
};

const LoadingContentFragments = () => {
  return (
      <View marginTop="size-175">
        <ProgressBar label="Loading content fragments..." isIndeterminate />
      </View>
  );
};

const FetchError = ({ aemHost }) => {
  return (
      <Flex direction="column" justifyContent="center" alignItems="center" gap="size-200" height="100%">
        <Heading>Error fetching content fragments</Heading>
        <Text>
          There was an error fetching content fragments from your connected AEM Instance: {aemHost}
        </Text>
      </Flex>
  );
};

const Status = ({status}) => {
  const statusLightVariants = {
    MODIFIED: "notice",
    NEW: "neutral",
    UNPUBLISHED: "negative",
    DRAFT: "info",
    PUBLISHED: "celery",
    PENDING: "info",
  };
  const statusLightVariant = (status in statusLightVariants) ? statusLightVariants[status] : statusLightVariants.NEW;

  return (
      <StatusLight variant={statusLightVariant}>
        {status.toLowerCase().charAt(0).toUpperCase() + status.toLowerCase().slice(1)}
      </StatusLight>
  );
};

export const ContentFragmentsSelection = ({
  aemHost,
  token,
  fragmentIds,
  setContentFragmentsToProceed,
}) => {
  const [isLoadingContentFragments, setIsLoadingContentFragments] = useState(true);
  const [isErrorWithContentFragments, setIsErrorWithContentFragments] = useState(false);
  const [contentFragments, setContentFragments] = useState([]);
  // Selected content fragments in the grid for which children references need to be processed
  const [selectedReferencesValues, setSelectedReferencesValues] = useState([]);
  // Selected content fragments in the grid for which parent references need to be processed
  const [selectedReferencedByValues, setSelectedReferencedByValues] = useState([]);

  useEffect(() => {
    const init = async () => {
      const contentFragments = await getContentFragments({
        aemHost,
        token,
        fragmentIds,
      });
      const fragmentPathsToProceedReferences = contentFragments.filter((item) => item.references.length > 0).map((item) => item.path);
      const fragmentPathsToProceedReferencedBy = contentFragments.filter((item) => item.referencedBy.length > 0).map((item) => item.path);

      // for table view
      setContentFragments(contentFragments);
      setSelectedReferencesValues(fragmentPathsToProceedReferences);
      setSelectedReferencedByValues(fragmentPathsToProceedReferencedBy);

      // for workflow processing within the parent component
      const contentFragmentsToProceed = getUniqueContentFragments(
          contentFragments,
          fragmentPathsToProceedReferences,
          fragmentPathsToProceedReferencedBy
      );
      setContentFragmentsToProceed(contentFragmentsToProceed);

      setIsErrorWithContentFragments(false);
      setIsLoadingContentFragments(false);
    };

    init().catch((e) => {
      console.log("Extension got the error during load content fragments:", e);
      setIsErrorWithContentFragments(true);
      setIsLoadingContentFragments(false);
    });
  }, [aemHost, token, fragmentIds.join(',')]);

  const onChangeReferencesHandler = (value, isSelected) => {
    const updatedSelectedReferencesValues = isSelected
        ? [...selectedReferencesValues, value]
        : selectedReferencesValues.filter(item => item !== value);

    // for table view
    setSelectedReferencesValues(updatedSelectedReferencesValues);
    // for workflow processing within the parent component
    const contentFragmentsToProceed = getUniqueContentFragments(
        contentFragments,
        updatedSelectedReferencesValues,
        selectedReferencedByValues
    );
    setContentFragmentsToProceed(contentFragmentsToProceed);
  };

  const onChangeReferencedByHandler = (value, isSelected) => {
    const updatedSelectedReferencedByValues = isSelected
        ? [...selectedReferencedByValues, value]
        : selectedReferencedByValues.filter(item => item !== value);

    // for table view
    setSelectedReferencedByValues(updatedSelectedReferencedByValues);
    // for workflow processing within the parent component
    const contentFragmentsToProceed = getUniqueContentFragments(
        contentFragments,
        selectedReferencesValues,
        updatedSelectedReferencedByValues
    );
    setContentFragmentsToProceed(contentFragmentsToProceed);
  };

  if (isLoadingContentFragments === true) {
    return <LoadingContentFragments />;
  } else if (isErrorWithContentFragments === true) {
    return <FetchError aemHost={aemHost} />;
  } else {
    const columns = [
      { name: "Title", key: "title", width: "3fr" },
      { name: "Status", key: "status", width: "1fr" },
      { name: "References", key: "references", width: "1fr" },
      { name: "Referenced By", key: "referenced-by", width: "1fr" },
    ];

    const items = contentFragments.map((contentFragment) => {
      return {
        ...contentFragment,
        referencesChecked: selectedReferencesValues.includes(contentFragment.path),
        referencedByChecked: selectedReferencedByValues.includes(contentFragment.path),
      };
    });

    return (
        <View>
          <Heading level={4}>Content to include in workflow:</Heading>
          <TableView aria-label="Editable Elements available for workflows">
            <TableHeader columns={columns}>
              {item => (<Column key={item.key} width={item.width}>{item.name}</Column>)}
            </TableHeader>
            <TableBody items={items}>
              {item => (
                  <Row key={item.path}>
                    <Cell>{item.title}</Cell>
                    <Cell>
                      <Status status={item.status} />
                    </Cell>
                    <Cell>
                      {item.references.length > 0 && (
                          <Checkbox
                              aria-label={`Include children references for ${item.title}`}
                              onChange={(isSelected) => onChangeReferencesHandler(item.path, isSelected)}
                              isSelected={item.referencesChecked}
                          />
                      )}
                    </Cell>
                    <Cell>
                      {item.referencedBy.length > 0 && (
                          <Checkbox
                              aria-label={`Include parent references for ${item.title}`}
                              onChange={(isSelected) => onChangeReferencedByHandler(item.path, isSelected)}
                              isSelected={item.referencedByChecked}
                          />
                      )}
                    </Cell>
                  </Row>
              )}
            </TableBody>
          </TableView>
        </View>
    );
  }
};
