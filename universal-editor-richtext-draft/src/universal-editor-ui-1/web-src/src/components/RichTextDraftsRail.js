/*
Copyright 2024 Adobe
All Rights Reserved.
NOTICE: Adobe permits you to use, modify, and distribute this file in
accordance with the terms of the Adobe license agreement accompanying
it.
*/

import {
    ActionButton,
    Content,
    ContextualHelp,
    defaultTheme,
    Divider,
    Flex,
    Heading,
    ProgressCircle,
    Provider,
    Text,
    TextArea,
    Tooltip,
    TooltipTrigger,
    View
} from "@adobe/react-spectrum";
import {attach} from "@adobe/uix-guest";
import {useEffect, useState} from "react";
import Add from "@spectrum-icons/workflow/Add";
import Delete from "@spectrum-icons/workflow/Delete";
import {
    DEFAULT_NUM_DRAFTS_TO_SHOW,
    DRAFT_MIN_LENGTH,
    extensionId,
    saveDraftAction,
    STORAGE_KEY_DRAFT_LIST,
    TYPE_REACH_TEXT
} from "./Constants";
import actionWebInvoke from "../utils";
import allActions from '../config.json';
import CheckmarkCircle from "@spectrum-icons/workflow/CheckmarkCircle";
import Copy from "@spectrum-icons/workflow/Copy";
import Cancel from "@spectrum-icons/workflow/Cancel";
import Send from "@spectrum-icons/workflow/Send";

function saveDraftsInStorage(itemsDraftList) {
    localStorage.setItem(STORAGE_KEY_DRAFT_LIST, JSON.stringify(Array.from(itemsDraftList.entries())));
}

function buildRichTexts(data, setReachTexts) {
    // Create a map of all the editable elements
    const editableMap = data?.editables.reduce((map, item) => map.set(item.id, item), new Map());
    // Filter the editable element to get only reach text elements
    const texts = data?.editables
        .filter(editable => editable.type === TYPE_REACH_TEXT)
        .map(editable => ({
            ...editable,
            content: editable.content.replace(/<[^>]*>/g, ''),
            resource: editable.resource.length > 0 ? editable.resource : editableMap.get(editable.parentid).resource
        }));
    setReachTexts(texts)
    return texts;
}

function buildItemDraftsList(texts, itemsDraftList, setItemsDraftList) {
    // Create a map of drafts by each reach text element
    texts.forEach(text => {
        if (!itemsDraftList.has(text.id)) {
            itemsDraftList.set(text.id, []);
        }
    });
    setItemsDraftList(itemsDraftList)
}

export default function RichTextDraftsRail() {

    const [connection, setConnection] = useState(null);
    const [editorState, setEditorState] = useState();
    const [reachTexts, setReachTexts] = useState([]);
    const [selectedItem, setSelectedItem] = useState(null);
    const [draftText, setDraftText] = useState('');
    const [selectedDraft, setSelectedDraft] = useState(null);
    const [validationState, setValidationState] = useState({});
    const [applyDraftError, setApplyDraftError] = useState(false);
    const [isLoading, setIsLoading] = useState(false)
    const [itemsDraftList, setItemsDraftList] = useState(new Map(JSON.parse(localStorage.getItem(STORAGE_KEY_DRAFT_LIST))));
    const [addDraft, setAddDraft] = useState(null);
    const [showAllDraft, setShowAllDraft] = useState(false);

    function cleanDraftStates() {
        setAddDraft(null);
        setSelectedDraft(null);
        setSelectedItem(null);
        setValidationState({});
        setDraftText('');
        setApplyDraftError(false);
    }

    useEffect(() => {
        (async () => {
            const guestConnection = await attach({id: extensionId});
            setConnection(guestConnection);
            // Get the editor state
            const data = await guestConnection.host.editorState.get();
            setEditorState(data);

            const texts = buildRichTexts(data, setReachTexts);

            buildItemDraftsList(texts, itemsDraftList, setItemsDraftList);

            window.addEventListener('click', (e) => {
                if (e.target.tagName !== 'TEXTAREA') {
                    cleanDraftStates();
                }
            })
        })()
    }, []);

    function addNewDraft(item, content = '') {
        // Validate the draft content
        const draft = {
            id: `${item.id}-${itemsDraftList.get(item.id)?.length + 1 ?? 1}`,
            itemId: item.id,
            text: content
        };
        setAddDraft(draft);
        setDraftText(content);
        setSelectedItem(item);

        setValidationState({});
        setSelectedDraft(draft);
    }

    function validateDraft(draft) {
        if (selectedItem?.content.length < DRAFT_MIN_LENGTH || draftText?.length > DRAFT_MIN_LENGTH) {
            setValidationState({draftId: draft.id, draftText: 'valid'});
            return true;
        }
        setValidationState({
            draftId: draft.id,
            draftText: 'invalid',
            error: `The draft must have at least ${DRAFT_MIN_LENGTH} characters`
        })
        return false;
    }

    function saveDraft(draft) {
        if (!validateDraft(draft)) {
            return;
        }

        // Add draft to the list, persist it and update the states
        const existingDraft = itemsDraftList.get(draft.itemId)?.find(elem => elem.id === draft.id);
        if (existingDraft) {
            existingDraft.text = draftText;
            setSelectedDraft(null);
        } else {
            draft.text = draftText;
            itemsDraftList.get(draft.itemId)
                .push(draft);
            setAddDraft(null);
        }

        setItemsDraftList(itemsDraftList);
        saveDraftsInStorage(itemsDraftList);

        cleanDraftStates();
    }

    async function applyDraft(reachTextItem, text) {
        if (!validateDraft(selectedDraft)) {
            return;
        }
        // Build the headers
        const headers = {
            Authorization: `Bearer ${connection.sharedContext.get('token')}`,
            'x-gw-ims-org-id': connection.sharedContext.get('orgId'),
        };

        // Build the payload
        const value = `<p>${text}</p>`;
        const connectionName = Object.keys(editorState.connections)?.[0];
        const protocol = editorState.connections[connectionName].split(':')[0];
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
            setIsLoading(true);

            // Call the Adobe I/O Runtime action to save the draft
            const response = await actionWebInvoke(allActions[saveDraftAction], headers, payload);

            if (!response?.success) {
                throw new Error('Error saving draft: ${response?.error}');
            }

            // Handle the response from the Adobe I/O Runtime action
            reachTextItem.content = text;
            itemsDraftList.delete(reachTextItem.id);
            setItemsDraftList(itemsDraftList);
            saveDraftsInStorage(itemsDraftList);

            // Reload the page to see the change
            const url = editorState.location.split('?')[0];
            await connection.host.remoteApp.triggerEvent('extension:reloadPage', 'main', url);

            cleanDraftStates();
        } catch (e) {
            setApplyDraftError(true);
            // Log and store any errors
            console.error(e);
        } finally {
            setIsLoading(false);
        }
    }

    function deleteDraft(itemDraft) {
        itemsDraftList.set(itemDraft.itemId, itemsDraftList.get(itemDraft.itemId).filter(function (item) {
                return item.id !== itemDraft.id;
            })
        )
        saveDraftsInStorage(itemsDraftList);
        setItemsDraftList(itemsDraftList);

        cleanDraftStates();
    }

    function handleSelectedDraft(draft) {
        setAddDraft(null);
        if (selectedDraft?.id === draft.id) {
            setSelectedDraft(null);
        } else {
            setSelectedDraft(draft);
            setDraftText(draft.text);
        }
        setApplyDraftError(false);
    }

    function showDraft(itemId) {
        if (selectedItem?.id === itemId && showAllDraft) {
            return true;
        }

        return false;
    }

    function showDraftsList(item) {
        setSelectedItem(item);
        setShowAllDraft(true);
    }

    function renderDraftActionButtons(item, draft) {
        return (
            <Flex direction='row' justifyContent='end'>
                <TooltipTrigger>
                    <ActionButton
                        margin='size-50'
                        onPress={() => saveDraft(draft)}
                        isDisabled={draftText.length === 0 || draft?.text === draftText || item?.content === draftText}>
                        <CheckmarkCircle/>
                    </ActionButton>
                    <Tooltip>Save this draft</Tooltip>
                </TooltipTrigger>
                <TooltipTrigger>
                    <ActionButton
                        margin='size-50'
                        onPress={() => applyDraft(item, draftText)}
                        isDisabled={draftText.length === 0 || item?.content === draftText}>
                        <Send/>
                    </ActionButton>
                    <Tooltip>Apply this draft to the Content Fragment</Tooltip>
                </TooltipTrigger>
                <TooltipTrigger>
                    <ActionButton
                        margin='size-50'
                        onPress={() => addDraft ? setAddDraft(null) : deleteDraft(draft)}>
                        {addDraft ? <Cancel/> : <Delete/>}
                    </ActionButton>
                    <Tooltip>{addDraft ? 'Cancel' : 'Delete'} this draft</Tooltip>
                </TooltipTrigger>
            </Flex>
        );
    }

    function renderLoadingCircle() {
        return (
            <Flex isHidden={!isLoading} direction='column'
                  alignItems='center'
                  justifyContent='center' height='20%'
                  gap={"size-200"}>
                <ProgressCircle size='s' aria-label='Saving...'
                                isIndeterminate/>
            </Flex>
        );
    }

    function renderDraftTextArea(draft, isNew = false) {
        const validation = selectedDraft === validationState?.draftId ? validationState?.draftText : null;
        const errorMessage = selectedDraft === validationState?.draftId ? validationState?.error : null;

        return (
            <View key={draft?.id ?? 0}
                  width='100%'
                  backgroundColor='static-white'
                  borderColor={applyDraftError ? 'red-500' : 'gray-500'}
                  borderWidth='thin'>

                <TextArea
                    width='100%'
                    onChange={setDraftText}
                    defaultValue={draft?.text}
                    validationState={isNew ? validationState?.draftText : validation}
                    errorMessage={isNew ? validationState?.error : errorMessage}
                    isHidden={isLoading}
                />
                <Text isHidden={!applyDraftError} UNSAFE_style={{color: 'red'}}>
                    There was an error saving the draft
                </Text>
            </View>
        );
    }

    return (
        <Provider theme={defaultTheme} colorScheme='light' height='100vh'>
            <Content height='100%'>
                <View padding='size-200'>
                    <Flex direction='row'>
                        <Heading marginBottom='size-100' level='3'>Content Drafts</Heading>
                        <ContextualHelp variant="help">
                            <Heading>Need help?</Heading>
                            <Content>
                                <Text>
                                    This extension allows you to manage drafts for rich text elements.
                                    <ul>
                                        <li>Start by clicking Create draft from content text or create an empty draft.
                                        </li>
                                        <li>In the draft text make the changes you want and select the option you need
                                            (save draft, apply the draft or cancel the draft).
                                        </li>
                                        <li>For a created draft, you can manage it by clicking in it. Options available
                                            are to edit it, save the edition, apply the draft, or delete the draft.
                                        </li>
                                        <li>By default, you will
                                            see <strong>{DEFAULT_NUM_DRAFTS_TO_SHOW}</strong> drafts. If you have more,
                                            click 'Show all' to see all the rest.
                                        </li>
                                    </ul>
                                    The drafts are persisted on the browser. If you clear the cache, you will lose them.<br/>
                                    The minimum length of a draft is <strong>{DRAFT_MIN_LENGTH} characters</strong>.
                                </Text>
                            </Content>
                        </ContextualHelp>
                    </Flex>
                    <Divider size='S' marginBottom='size-100'/>
                    <View>
                        {reachTexts?.map((reachTextItem, i) => {
                                return (
                                    <Flex direction='column' gap='size-65' marginBottom='size-100' key={reachTextItem.id}>
                                        <Text>{reachTextItem.label}</Text>
                                        <Flex direction='column'>
                                            <View
                                                borderWidth='thin'
                                                borderColor='black'
                                                borderRadius='medium'
                                                padding='size-250'
                                            >
                                                <Text>
                                                    {reachTextItem.content}
                                                </Text>
                                            </View>
                                            <Flex direction='row'>
                                                <TooltipTrigger>
                                                    <ActionButton aria-label="Icon only" margin='5px'
                                                                  onPress={() => addNewDraft(reachTextItem, reachTextItem.content)}>
                                                        <Copy/>
                                                    </ActionButton>
                                                    <Tooltip>Add new draft from text</Tooltip>
                                                </TooltipTrigger>
                                                <TooltipTrigger>
                                                    <ActionButton aria-label="Icon only" margin='5px'
                                                                  onPress={() => addNewDraft(reachTextItem)}>
                                                        <Add/>
                                                    </ActionButton>
                                                    <Tooltip>Add a new draft</Tooltip>
                                                </TooltipTrigger>
                                            </Flex>
                                        </Flex>
                                        {itemsDraftList.get(reachTextItem.id)?.length > 0 && (
                                            <Heading marginBottom='size-50' marginTop='size-50' level='4'>
                                                Drafts ({itemsDraftList.get(reachTextItem.id)?.length ?? 0})
                                            </Heading>
                                        )}
                                        <Flex direction='column' isHidden={!(addDraft?.itemId === reachTextItem.id)}>
                                            {!isLoading && renderDraftTextArea(addDraft, true)}
                                            {!isLoading && renderDraftActionButtons(reachTextItem, addDraft)}
                                            {isLoading && renderLoadingCircle()}
                                        </Flex>
                                        {(itemsDraftList.has(reachTextItem.id)) && itemsDraftList.get(reachTextItem.id).map((itemDraft, i) => {
                                            return (
                                                <Flex direction='column' key={itemDraft.id}
                                                      isHidden={(i + 1 > DEFAULT_NUM_DRAFTS_TO_SHOW) && !showDraft(reachTextItem.id)}>
                                                    <View key={itemDraft.id}
                                                          backgroundColor='static-white'
                                                          padding='size-100'
                                                          borderColor='gray-500'
                                                          borderWidth="thin"
                                                          isHidden={!(!selectedDraft || selectedDraft?.id !== itemDraft.id)}>
                                                        <ActionButton onPress={() => handleSelectedDraft(itemDraft)}
                                                                      isQuiet width='100%' height='100%'>
                                                            <Text>{itemDraft.text.substr(0, 30)}...</Text>
                                                        </ActionButton>
                                                    </View>
                                                    <Flex direction='column' isHidden={selectedDraft?.id !== itemDraft.id}
                                                          height='100%'
                                                    >
                                                        {!isLoading && renderDraftTextArea(itemDraft)}
                                                        {!isLoading && renderDraftActionButtons(reachTextItem, itemDraft)}
                                                        {isLoading && renderLoadingCircle()}
                                                    </Flex>
                                                </Flex>
                                            );
                                        })}
                                        {itemsDraftList.get(reachTextItem.id)?.length > DEFAULT_NUM_DRAFTS_TO_SHOW && (
                                                <Flex direction='column' justifyContent='center'>
                                                    <ActionButton isQuiet isHidden={showDraft(reachTextItem.id)}
                                                                  onPress={() => showDraftsList(reachTextItem)}>Show
                                                        all</ActionButton>
                                                    <ActionButton isQuiet isHidden={!showDraft(reachTextItem.id)}
                                                                  onPress={() => setShowAllDraft(false)}>Hide all</ActionButton>
                                                </Flex>
                                            )}
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
