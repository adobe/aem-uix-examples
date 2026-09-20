/*
Copyright 2024 Adobe
All Rights Reserved.
NOTICE: Adobe permits you to use, modify, and distribute this file in
accordance with the terms of the Adobe license agreement accompanying
it.
*/

import { Text } from "@adobe/react-spectrum";
import { register } from "@adobe/uix-guest";
import { extensionId } from "./Constants";
import metadata from '../../../../app-metadata.json';

/**
 * Parses the programId and environmentId from an AEM Cloud author URL.
 * Searches for the pattern: author-p{programId}-e{environmentId}.adobeaemcloud.com
 *
 * @param {string} location - The URL to parse (from editorState.location)
 * @returns {{ programId: string, environmentId: string } | null}
 */
function parseAemLocation(location) {
    const match = (location || '').match(/author-p(\d+)-e(\d+)/);
    return match ? { programId: match[1], environmentId: match[2] } : null;
}

function parseConfigArray(value) {
    if (!value) return [];
    if (Array.isArray(value)) return value;
    try {
        const parsed = JSON.parse(value);
        return Array.isArray(parsed) ? parsed : [];
    } catch {
        return [];
    }
}

function isButtonVisible(location, config) {
    const program = parseConfigArray(config?.program);
    const environment = parseConfigArray(config?.environment);

    // No filter configured → always show
    if (program.length === 0 && environment.length === 0) {
        return true;
    }

    const parsed = parseAemLocation(location);

    if (program.length > 0 && !program.includes(parsed?.programId)) {
        return false;
    }
    if (environment.length > 0 && !environment.includes(parsed?.environmentId)) {
        return false;
    }

    return true;
}

function ExtensionRegistration() {
    console.log(`[${extensionId}] ExtensionRegistration component rendered`);

    const init = async () => {
        console.log(`[${extensionId}] Calling register()...`);
        let guestConnection;
        guestConnection = await register({
            id: extensionId,
            metadata,
            methods: {
                headerMenu: {
                    async getButtons() {
                        const config = guestConnection.configuration ?? {};
                        const editorState = await guestConnection.host.editorState.get();
                        const { location } = editorState;

                        console.log(`[${extensionId}] Configuration received:`, config);
                        console.log(`[${extensionId}] Editor location:`, location);

                        const parsed = parseAemLocation(location);
                        if (parsed) {
                            console.log(`[${extensionId}] Parsed domain — programId: ${parsed.programId}, environmentId: ${parsed.environmentId}`);
                        } else {
                            console.log(`[${extensionId}] AEM Cloud URL pattern not found in location — button will be shown by default`);
                        }

                        const visible = isButtonVisible(location, config);
                        console.log(`[${extensionId}] Button visibility decision: ${visible ? 'SHOW' : 'HIDE'}`);

                        if (!visible) {
                            return [];
                        }

                        return [
                            {
                                id: extensionId + '-button',
                                label: 'Sample Action',
                                icon: 'Plug',
                                onClick() {
                                    const modalURL = '/index.html#/action-modal';
                                    guestConnection.host.modal.showUrl({
                                        title: 'Sample Action',
                                        url: modalURL,
                                        width: '500px',
                                        height: '300px',
                                    });
                                },
                            },
                        ];
                    },
                },
            },
        });
        console.log(`[${extensionId}] register() resolved — guestConnection:`, guestConnection);
    };
    init().catch((err) => console.error(`[${extensionId}] register() failed:`, err));

    return <Text>IFrame for integration with Host (AEM)...</Text>;
}

export default ExtensionRegistration;
