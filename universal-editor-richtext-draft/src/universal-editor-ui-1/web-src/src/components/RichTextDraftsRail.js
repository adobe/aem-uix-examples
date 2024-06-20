/*
Copyright 2022 Adobe
All Rights Reserved.
NOTICE: Adobe permits you to use, modify, and distribute this file in
accordance with the terms of the Adobe license agreement accompanying
it.
*/

import {
    ActionButton,
    Content,
    defaultTheme,
    Divider,
    Flex,
    Heading,
    ProgressCircle,
    Provider, TextArea,
    View,
    Text
} from "@adobe/react-spectrum";
import {attach} from "@adobe/uix-guest";
import {useEffect, useState} from "react";
import Add from "@spectrum-icons/workflow/Add";
import Revert from "@spectrum-icons/workflow/Revert";
import Select from "@spectrum-icons/workflow/Select";
import Delete from "@spectrum-icons/workflow/Delete";
import {extensionId, saveDraftAction, STORAGE_KEY_DRAFT_LIST, TYPE_REACH_TEXT, DRAFT_MIN_LENGTH} from "./Constants";
import actionWebInvoke from "../utils";
import allActions from '../config.json';

function saveDraftsInStorage(itemsDraftList) {
    localStorage.setItem(STORAGE_KEY_DRAFT_LIST, JSON.stringify(Array.from(itemsDraftList.entries())));
}

export default function RichTextDraftsRail() {

    const [connection, setConnection] = useState(null);
    const [editorState, setEditorState] = useState();
    const [reachTexts, setReachTexts] = useState([]);
    const [selectedItem, setSelectedItem] = useState(null);
    const [draftText, setDraftText] = useState('');
    const [selectedDraft, setSelectedDraft] = useState(null);
    const [validationState, setValidationState] = useState({});
    const [isLoading, setIsLoading] = useState(false)
    const [itemsDraftList, setItemsDraftList] = useState(new Map(JSON.parse(localStorage.getItem(STORAGE_KEY_DRAFT_LIST))));


    useEffect(() => {
        (async () => {
            const guestConnection = await attach({id: extensionId});
            setConnection(guestConnection);

            // Get the editor state
            const data = await guestConnection.host.editorState.get();
            setEditorState(data)

            // Create a map of all the editable elements
            const editableMap = data?.editables.reduce((map, item) => map.set(item.id, item), new Map());

            // Filter the editable element to get only reach text elements
            const texts = data?.editables
                .filter(editable => editable.type === TYPE_REACH_TEXT)
                .map(editable => ({
                    ...editable,
                    resource: editable.resource.length > 0 ? editable.resource : editableMap.get(editable.parentid).resource
                }));
            setReachTexts(texts)

            // Create a map of drafts by each reach text element
            texts.forEach(text => {
                if (!itemsDraftList.has(text.id)) {
                    itemsDraftList.set(text.id, []);
                }
            });
            setItemsDraftList(itemsDraftList)
        })()
    }, []);

    function addNewDraft() {
        // Validate the draft content
        if (draftText?.length > DRAFT_MIN_LENGTH) {
            setValidationState({draftText: 'valid'});
        } else {
            setValidationState({draftText: 'invalid'});
            return;
        }

        // Add draft the list, persist it and update the states
        itemsDraftList.get(selectedItem.id)
            .push({
                id: `${selectedItem.id}-${itemsDraftList.get(selectedItem.id).length}`,
                itemId: selectedItem.id,
                text: draftText
            });
        saveDraftsInStorage(itemsDraftList);
        setItemsDraftList(itemsDraftList)

        setSelectedItem(null)
    }


    function revertItemChange() {
        setSelectedItem(null);
        setValidationState({});
    }

    async function saveDraft(reachTextItem, itemDraft) {
        // Build the headers
        const headers = {
            Authorization: `Bearer ${connection.sharedContext.get('token')}`,
            'x-gw-ims-org-id': connection.sharedContext.get('orgId'),
        };

        // Build the payload
        const value = itemDraft.text;
        const connectionName = Object.keys(editorState.connections)?.[0];
        const protocol = editorState.connections[connectionName].split(':')[0]
        const payload = {
            connections: [{
                name: connectionName,
                protocol: protocol,
                uri: editorState.connections[connectionName].substring(protocol.length + 1),
            }],
            target: {
                prop: reachTextItem.prop,
                resource: reachTextItem.resource,
                type: reachTextItem.type
            },
            value
        };

        try {
            // Show the spinner
            setIsLoading(true)

            // Call the Adobe I/O Runtime action to save the draft
            const response = await actionWebInvoke(allActions[saveDraftAction], headers, payload);

            // Handle the response from the Adobe I/O Runtime action
            if (response?.success) {
                reachTextItem.content = value
                itemsDraftList.delete(reachTextItem.id)
                setItemsDraftList(itemsDraftList)
                saveDraftsInStorage(itemsDraftList)

                // Reload the page to see the change
                const url = editorState.location.split('?')[0]
                await connection.host.remoteApp.triggerEvent('extension:reloadPage', 'main', url);
            }
        } catch (e) {
            // Log and store any errors
            console.error(e);
        } finally {
            setIsLoading(false)
        }
    }

    function deleteDraft(itemDraft) {
        itemsDraftList.set(itemDraft.itemId, itemsDraftList.get(itemDraft.itemId).filter(function (item) {
                return item.id !== itemDraft.id
            })
        )
        saveDraftsInStorage(itemsDraftList)
        setItemsDraftList(itemsDraftList)
        setSelectedDraft(null)
    }

    function handleSelectedDraft(id) {
        if (selectedDraft === id) {
            setSelectedDraft(null)
        } else {
            setSelectedDraft(id)
        }
    }

    function selectItem(reachTextItem) {
        setSelectedItem(reachTextItem)
        setDraftText(reachTextItem.content)
    }

    return (
        <Provider theme={defaultTheme} colorScheme='light' height='100vh'>
            <Content height='100%'>
                <View padding='size-200'>
                    <Heading marginBottom='size-100' level='3'>Rich Texts draft manager</Heading>
                    <Divider size='S' marginBottom='size-100'/>
                    <View>
                        {reachTexts?.map((reachTextItem, i) => {
                                return (
                                    <Flex direction='column' gap='size-65' marginBottom='size-100' key={reachTextItem.id}>
                                        <Text>{reachTextItem.label}</Text>
                                        <Flex direction='column' width='100%'
                                              isHidden={!(selectedItem?.id === reachTextItem.id)}>
                                            <TextArea
                                                width='100%'
                                                onChange={setDraftText}
                                                defaultValue={reachTextItem.content}
                                                value={draftText}
                                                validationState={validationState?.draftText}
                                            />
                                            <Flex direction='row'>
                                                <ActionButton aria-label="Icon only" margin='5px'
                                                              onPress={() => revertItemChange()}>
                                                    <Revert/>
                                                </ActionButton>
                                                <ActionButton aria-label="Icon only" margin='5px'
                                                              onPress={() => addNewDraft()}>
                                                    <Add/>
                                                </ActionButton>
                                            </Flex>
                                        </Flex>

                                        <View isHidden={!(!selectedItem || selectedItem?.id !== reachTextItem.id)}>
                                            <ActionButton onPress={() => selectItem(reachTextItem)}
                                                          isQuiet
                                                          width='100%'
                                                          height='100%'
                                            >
                                                <View
                                                    borderWidth='thin'
                                                    borderColor='black'
                                                    borderRadius='medium'
                                                    padding='size-250'
                                                >
                                                    <Text>
                                                        <div dangerouslySetInnerHTML={{__html: reachTextItem.content}}/>
                                                    </Text>
                                                </View>
                                            </ActionButton>
                                        </View>

                                        {(itemsDraftList.has(reachTextItem.id)) && itemsDraftList.get(reachTextItem.id).map((itemDraft, i) => {
                                            return (
                                                <Flex direction='column' key={itemDraft.id}>
                                                    <View key={itemDraft.id}
                                                          backgroundColor='static-white'
                                                          padding='size-100'
                                                          borderColor='gray-500'
                                                          borderWidth="thin"
                                                          isHidden={!(!selectedDraft || selectedDraft !== itemDraft.id)}>
                                                        <ActionButton onPress={() => handleSelectedDraft(itemDraft.id)}
                                                                      isQuiet width='100%' height='100%'>
                                                            <Text>{itemDraft.text.substr(0, 30)}...</Text>
                                                        </ActionButton>
                                                    </View>
                                                    <Flex direction='column' isHidden={selectedDraft !== itemDraft.id}>
                                                        <ActionButton onPress={() => handleSelectedDraft(itemDraft.id)}
                                                                      isQuiet width='100%' height='100%'>
                                                            <View key={itemDraft.id}
                                                                  backgroundColor='static-white'
                                                                  padding='size-100' borderColor='gray-500'
                                                                  borderWidth='thin'>
                                                                <Flex direction='column' alignItems='center'
                                                                      justifyContent='center' height='20%'
                                                                      gap={"size-200"} isHidden={!isLoading}>
                                                                    <ProgressCircle size='s' aria-label='Saving...'
                                                                                    isIndeterminate/>
                                                                </Flex>
                                                                <Text isHidden={isLoading}>
                                                                    {itemDraft.text}
                                                                </Text>
                                                            </View>
                                                        </ActionButton>
                                                        <Flex direction='row' justifyContent='end'>
                                                            <ActionButton
                                                                margin='size-50'
                                                                onPress={() => saveDraft(reachTextItem, itemDraft)}
                                                                isDisabled={isLoading}>
                                                                <Select/>
                                                            </ActionButton>
                                                            <ActionButton
                                                                margin='size-50'
                                                                onPress={() => deleteDraft(itemDraft)}
                                                                isDisabled={isLoading}>
                                                                <Delete/>
                                                            </ActionButton>
                                                        </Flex>
                                                    </Flex>
                                                </Flex>
                                            );
                                        })}
                                        <Divider size='S' marginBottom='size-100' marginTop='size-100'/>
                                    </Flex>
                                )
                            }
                        )}
                    </View>
                </View>
            </Content>
        </Provider>
    );
}
