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

import React, { useEffect } from 'react';
import {
  Flex,
  ProgressCircle,
} from '@adobe/react-spectrum';
import { announce } from "@react-aria/live-announcer";

/**
 * @param props
 */
export default function Spinner (props) {

  useEffect(() => {
    announce("Loading…", "polite");
  },[]);

  return (
    <Flex alignItems="center" justifyContent="center" height="50vh">
      <ProgressCircle size="L" aria-label="Loading…" isIndeterminate />
      {props.children}
    </Flex>
  );
}
