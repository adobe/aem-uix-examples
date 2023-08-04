/*
 * <license header>
 */
import { useEffect } from 'react';
import { generatePath } from 'react-router';
import { Text } from '@adobe/react-spectrum';
import { extensionId } from './Constants';
import { register } from '@adobe/uix-guest';

/**
 *
 */
export default function () {
  useEffect(() => {
    const init = async () => {
      const registrationConfig = {
        id: extensionId,
        methods: {
          headerMenu: {
            getButtons () {
              return [
                {
                  id: `${extensionId}.manage-translations`,
                  label: 'Manage Translations',
                  icon: 'PublishCheck',
                  onClick: async () => {
                    const contentFragment = await guestConnection.host.contentFragment.getContentFragment();

                    const url = '/index.html#' + generatePath('/cf/:cfPaths/translations', {
                      cfPaths: encodeURIComponent(contentFragment.path),
                    });
                    console.log('Translations: ', url);

                    guestConnection.host.modal.showUrl({
                      title: 'Translations: ' + contentFragment.metadata.title,
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
  return <Text>IFrame for integration with Host (AEM)... CF Editor</Text>;
};
