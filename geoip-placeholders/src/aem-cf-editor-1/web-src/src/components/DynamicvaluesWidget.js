/*
 * <license header>
 */

import React, { useEffect, useState } from "react";
import { attach } from "@adobe/uix-guest";
import { 
  Provider, 
  Flex,
  View,
  ComboBox,
  Item, 
  Content,
  ButtonGroup,
  Button, 
  lightTheme 
} from "@adobe/react-spectrum";
import { extensionId } from "./Constants";

export default function () {
  const [guestConnection, setGuestConnection] = useState();
  const [selectedOption, setSelectedOption] = useState();

  useEffect(() => {
    (async () => {
      const guestConnection = await attach({ id: extensionId });
      setGuestConnection(guestConnection);
    })();
  }, []);

  const onSelectionChangeHandler = async (variable) => {
    const selectedOption = options.find(el => el.id == variable);
    setSelectedOption(selectedOption);
  };

  const onApply = async () => {
    if (typeof selectedOption !== 'undefined') {
      await guestConnection.host.rte.applyInstructions([{
        type: "insertContent",
        value: '{' + selectedOption.id + '}'
      }]);
    }
    guestConnection.host.rte.closeWidget();
  };
  const onCancel = async () => {
    guestConnection.host.rte.closeWidget();
  };

  const options = [
    {
      id: "location.continent", 
      name: 'Continent',
      description: 'Continent where user is located.',
    },
    {
      id: "location.country", 
      name: 'Country',
      description: 'Country from which user search explore application.',
    },
    {
      id: "location.country_code", 
      name: 'Country Code',
      description: 'Country code from which user search explore application.',
    },
    {
      id: "location.region", 
      name: 'Region',
      description: 'Region where user is located. For US is a state for other countries may be other administrative unit.',
    },
    {
      id: "location.region_code", 
      name: 'Region Code',
      description: 'Code of the region where user is located. For US is a state code for other countries may be other administrative unit.',
    },
    {
      id: "location.city", 
      name: 'City',
      description: 'Name of a city where user is located.',
    },
    {
      id: "location.capital", 
      name: 'Capital',
      description: 'Capital city of a country from which user is searching application.',
    },
    {
      id: "location.timezone.id", 
      name: 'Time Zone',
      description: 'Full name of user time zone.',
    },
    {
      id: "location.timezone.abbr", 
      name: 'Time Zone Abbreviation',
      description: 'Short abbreviation of time zone where user is located',
    }
  ];

  return (
    <Provider theme={lightTheme} colorScheme="light">
      <Flex width="100%" direction="column">
        <View padding="size-200">
          <ComboBox
            defaultItems={options}
            onSelectionChange={onSelectionChangeHandler}
            width="100%"
            autoFocus
            >
            {item => <Item>{item.name}</Item>}
          </ComboBox>
        </View>
        <View 
          borderWidth="thin"
          borderColor="dark"
          borderRadius="medium"
          height="size-1700"
          padding="size-200" margin="size-200">
          <Content>{typeof selectedOption === 'undefined' ? '[no placeholder selected]' : selectedOption.description}</Content>
        </View>
        <View marginBottom="size-200" padding="size-200" alignSelf="end">
          <ButtonGroup>
            <Button variant="accent" style="fill" isDisabled={typeof selectedOption === 'undefined'} onPress={onApply}>Apply</Button>
            <Button variant="secondary" style="outline" onPress={onCancel}>Cancel</Button>
          </ButtonGroup>
        </View>
      </Flex>
    </Provider>
  );
}
