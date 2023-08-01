/*
 * <license header>
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
