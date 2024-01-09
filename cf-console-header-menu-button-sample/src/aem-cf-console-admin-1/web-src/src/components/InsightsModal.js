/*
Copyright 2024 Adobe. All rights reserved.
This file is licensed to you under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License. You may obtain a copy
of the License at http://www.apache.org/licenses/LICENSE-2.0
Unless required by applicable law or agreed to in writing, software distributed under
the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
OF ANY KIND, either express or implied. See the License for the specific language
governing permissions and limitations under the License.
*/

import React, { useState, useEffect } from "react";
import { attach } from "@adobe/uix-guest";
import {
  Flex,
  ProgressCircle,
  Provider,
  Content,
  defaultTheme,
  Text,
  Button,
  Heading,
  MenuTrigger,
  Menu,
  ActionButton,
  Item,
  View
} from "@adobe/react-spectrum";
import "./InsightsModal.css";

import { extensionId } from "./Constants";

const AUSTIN = "Austin";
const AUSTIN_WEATHER_FORECAST_URL = "https://api.weather.gov/gridpoints/EWX/157,95/forecast";
const NEW_YORK = "New York";
const NEW_YORK_WEATHER_FORECAST_URL = "https://api.weather.gov/gridpoints/OKX/33,37/forecast";
const LOS_ANGELES = "Los Angeles";
const LOS_ANGELES_WEATHER_FORECAST_URL = "https://api.weather.gov/gridpoints/LOX/152,49/forecast";

const getWeatherForecast = async (city) => {
  let url = AUSTIN_WEATHER_FORECAST_URL;
  if (city === NEW_YORK) {
    url = NEW_YORK_WEATHER_FORECAST_URL;
  } else if (city === LOS_ANGELES) {
    url = LOS_ANGELES_WEATHER_FORECAST_URL;
  }

  const resp = await fetch(url);
  if (!resp.ok) {
    throw new Error(`Error fetching weather forecast for ${city}`);
  }
  const forecast = await resp.json();
  const data = forecast?.properties?.periods?.[0] ?? null;
  if (data !== null) {
    data.city = city;
  }
  return data;
};

export default InsightsModal = () => {
  const [guestConnection, setGuestConnection] = useState();

  const [weatherForecast, setWeatherForecast] = useState(null);

  useEffect(() => {
    (async () => {
      const guestConnection = await attach({ id: extensionId });

      setGuestConnection(guestConnection);
    })();
  }, []);

  const onActionBtnHandler = async (city) => {
    try {
      const result = await getWeatherForecast(city);
      setWeatherForecast(result);
    } catch (error) {
      console.log("error", error);
    }
  };

  const onCloseHandler = () => {
    guestConnection.host.modal.close();
  };

  return (
    <Provider theme={defaultTheme} colorScheme="light">
      <Content width="100%">
        <View marginBottom="size-100">
          <MenuTrigger>
            <ActionButton>
              Display Weather Forecast
            </ActionButton>
            <Menu onAction={onActionBtnHandler}>
              <Item key={AUSTIN}>{AUSTIN}</Item>
              <Item key={NEW_YORK}>{NEW_YORK}</Item>
              <Item key={LOS_ANGELES}>{LOS_ANGELES}</Item>
            </Menu>
          </MenuTrigger>
        </View>

        {(weatherForecast !== null) &&
          <Flex height="size-3000" gap="size-100">
            <View flexBasis="20%" flexGrow="0" flexShrink="0">
              <img src={weatherForecast.icon} className="weather-forecast-img" />
            </View>
            <View UNSAFE_className="weather-forecast-description">
              <Heading level={2} marginTop="0">{weatherForecast.city}</Heading>
              <p>
                Temperature: {weatherForecast.temperature}°{weatherForecast.temperatureUnit} /{" "}
                {Math.round(((weatherForecast.temperature - 32) * 50) / 9) / 10}°C
              </p>
              <p>{weatherForecast.shortForecast}</p>
              <p>{weatherForecast.detailedForecast}</p>
              <p>{new Date(weatherForecast.startTime).toLocaleString()}</p>
            </View>
          </Flex>
        }

        <Button variant="primary" onPress={onCloseHandler} position="fixed" bottom="0px" right="8px">
          Close
        </Button>
      </Content>
    </Provider>
  );
};
