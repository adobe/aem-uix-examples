/*
 * <license header>
 */

import { useEffect } from 'react';
import { generatePath } from 'react-router';
import { Text } from '@adobe/react-spectrum';
import { extensionId } from './Constants';
import { register } from '@adobe/uix-guest';

export default function () {
  useEffect(() => {
    const init = async () => {
      const registrationConfig = {
        id: extensionId,
        methods: {
          actionBar: {
            getButtons () {
              return [
                {
                  id: `${extensionId}.manage-translations`,
                  label: 'Manage Translations',
                  icon: 'PublishCheck',
                  onClick: (selections) => {
                    const cfPaths = selections.map((selection) => selection.id);
                    const modalTitle = selections.map((selection) => {
                      return selection.title;
                    }).join(', ');

                    const url = '/index.html#' + generatePath('/cf/:cfPaths/translations', {
                      cfPaths: encodeURIComponent(cfPaths),
                    });
                    console.log('Translations iframe url: ', url);

                    guestConnection.host.modal.showUrl({
                      title: 'Translations: ' + modalTitle,
                      url,
                      width: '900px',
                    });
                  },
                },
              ];
            },
          },
        },
      };
      const guestConnection = await register(registrationConfig);
    };
    init().catch(console.error);
  }, []);
  return <Text>IFrame for integration with Host (AEM)... CF Admin Console</Text>;
};
