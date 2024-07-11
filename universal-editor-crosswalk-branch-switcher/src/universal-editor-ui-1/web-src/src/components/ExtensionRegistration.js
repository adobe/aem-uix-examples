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
                                extension: 'ueBranchSwitcher',
                                id: "ueBranchSwitcher",
                                label: "Crosswalk Branch Switcher",
                                header: "Branch Switcher",
                                url: `/index.html#/branch-switcher-rail`,
                                hotkey: "w",
                                icon: "Branch2",
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
