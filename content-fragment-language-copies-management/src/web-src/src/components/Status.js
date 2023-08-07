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

import React from 'react';
import { StatusLight } from '@adobe/react-spectrum';

/**
 * @param props
 */
function Status (props) {
  const statusLightVariants = {
    MODIFIED: 'notice',
    NEW: 'neutral',
    UNPUBLISHED: 'negative',
    DRAFT: 'info',
    PUBLISHED: 'celery',
    PENDING: 'info',
  };

  const status = props.status;
  const statusLightVariant = (status in statusLightVariants) ? statusLightVariants[status] : statusLightVariants.NEW;

  return (
      <StatusLight
          variant={statusLightVariant}
          justifySelf="end"
          right="size-15"
          position="absolute"
      >
        {status.toLowerCase().charAt(0).toUpperCase() + status.toLowerCase().slice(1)}
      </StatusLight>
  );
}

export default Status;
