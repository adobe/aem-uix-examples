/*
Copyright 2024 Adobe
All Rights Reserved.
NOTICE: Adobe permits you to use, modify, and distribute this file in
accordance with the terms of the Adobe license agreement accompanying
it.
*/

import {Text} from "@adobe/react-spectrum";
import {register} from "@adobe/uix-guest";
import {extensionId} from "./Constants";

function ExtensionRegistration() {
    const init = async () => {
        const guestConnection = await register({
            id: extensionId,
            methods: {
                rightPanel: {
                    addRails() {
                        return [
                            {
                                extension: 'ueRichTextDraft',
                                id: "ueRichTextDraft",
                                label: "Rich Texts draft manager",
                                header: "Content drafts",
                                url: `/index.html#/rich-text-drafts`,
                                hotkey: "w",
                                icon: "Draft",
                            }
                        ];
                    }
                },
            },
        });
    };
    init().catch(console.error);

    return <Text>IFrame for integration with Host (AEM)...</Text>
}

export default ExtensionRegistration;
