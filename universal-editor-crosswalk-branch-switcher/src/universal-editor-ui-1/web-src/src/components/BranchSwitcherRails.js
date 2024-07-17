/*
Copyright 2024 Adobe
All Rights Reserved.
NOTICE: Adobe permits you to use, modify, and distribute this file in
accordance with the terms of the Adobe license agreement accompanying
it.
*/

import {
    ActionButton,
    ComboBox,
    Content,
    defaultTheme,
    Flex,
    Heading,
    InlineAlert,
    Item,
    Provider,
    View,
    TextField
} from "@adobe/react-spectrum";
import {attach} from "@adobe/uix-guest";
import {useEffect, useState} from "react";
import {
    extensionId
} from "./Constants";
import config from '../config.json';


function isStoredBranches(storedBranches) {
    return Object.prototype.toString.call(storedBranches) === '[object Array]'
        && storedBranches.every(obj => obj['name'])
}

export default function BranchSwitcherRail() {
    const [owner, setOwner] = useState();
    const [repository, setRepository] = useState();
    const [error, setError] = useState(null);
    const [headers, setHeaders] = useState();
    const [path, setPath] = useState();
    const [connection, setConnection] = useState();
    const [editorState, setEditorState] = useState();
    const [fetchedFromStorage, setFetchedFromStorage] = useState(false);
    const [ currentBranch, setCurrentBranch ] = useState('main');
    const [ branches, setBranches ] = useState([
        { name: 'main'}
    ]);


    useEffect(() => {
        try {
            const storedBranches = JSON.parse(localStorage.getItem('branches'));

            if (isStoredBranches(storedBranches)) {
                setFetchedFromStorage(true);
                setBranches(storedBranches);
            }
        } catch (e) {
            console.error('Failed to parse branches from localStorage');
        }

        (async () => {
            console.log('Fetching token and orgId headers');
            const guestConnection = await attach({id: extensionId});
            const token = await guestConnection.sharedContext.get('token');
            const org = await guestConnection.sharedContext.get('orgId');
            const state = await guestConnection.host.editorState.get();
            const location = new URL(state.location);
            const queryParams = new URLSearchParams(location.search);
            const builtHeaders = {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`,
                'x-aem-host': location.protocol + '//' + location.host,
                'x-gw-ims-org-id': org,
            };

            if (queryParams.has('ref')) {
                setCurrentBranch(queryParams.get('ref'));
            }
            setConnection(guestConnection);
            setHeaders(builtHeaders);
            setPath(location.pathname);
            setEditorState(state);
        })()
    }, []);

    useEffect(() => {
        if (!headers) return;
        if (!path) return;

        fetchRepoDetail(headers, path);
    }, [headers, path]);

    useEffect(() => {
        if (!owner) return;
        if (!repository) return;
        if (fetchedFromStorage) return;

        fetchBranches();
    }, [owner, repository]);

    async function fetchBranches() {
        fetch(`https://api.github.com/repos/${owner}/${repository}/branches`)
            .then(response => response.json())
            .then(data => {
                if (data.message && data.message.startsWith('API rate limit exceeded')) {
                    setError('API-rate-limit-exceeded');
                    return;
                }
                const cleanBranches = data.map((e) => { return {name: e.name }});
                setBranches(cleanBranches);
                localStorage.setItem('branches', JSON.stringify(cleanBranches));
            })
    }

    async function fetchRepoDetail(headers, path) {
        console.log('Fetching repo details headers', headers);
        fetch(
            config['list-branches'],
            {
                method: 'POST',
                headers,
                body: JSON.stringify({url: path})
            }
        )
            .then(response => response.json())
            .then(data => {
                setOwner(data.owner);
                setRepository(data.repo);
            })
    }
 
    async function changeBranch(branch) {
        console.log('Changing branch to', branch);
        setCurrentBranch(branch);
        const urlObject = new URL(editorState.location);
        var queryParams = new URLSearchParams(urlObject.search);
        queryParams.set('ref', branch);

        const newPath = `${urlObject.protocol}//${urlObject.host}${urlObject.pathname}?${queryParams.toString()}`

        console.log('Navigating to', newPath)
        await connection.host.remoteApp.triggerEvent("extension:reloadPage", "main", newPath);
    }

    function openInGitHub() {
        if (!owner || !repository) return;
        window.open(`https://github.com/${owner}/${repository}/tree/${currentBranch}`);
    }

    return (
        <Provider theme={defaultTheme} colorScheme='light' height='100vh'>
            <Content height='100%'>
                <View padding='size-200'>
                <InlineAlert variant="negative" isHidden={error === null}>
                    <Heading>API Rate limit exceeded</Heading>
                    <Content>
                        This extension is currently using unauthenticated calls to GitHub API. The primary rate limit for unauthenticated requests is 60 requests per hour.
                    </Content>
                </InlineAlert>
                    <Flex direction='column'>
                        <Heading marginBottom='size-100' level='3'>Branch Switcher</Heading>
                        <TextField isReadOnly={true} isDisabled={owner === undefined} value={owner} label="Owner"/>
                        <TextField isReadOnly={true} isDisabled={repository === undefined} value={repository} label="Repository" marginBottom="size-100" />
                        <ActionButton onPress={openInGitHub}>Open in GitHub</ActionButton>
                        <ComboBox label="Current Branch"
                            defaultItems={branches}
                            selectedKey={currentBranch}
                            onSelectionChange={changeBranch}
                            marginBottom='size-100'>
                            {item => <Item key={item.name}>{item.name}</Item>}
                        </ComboBox>
                        <ActionButton onPress={fetchBranches}>Fetch Branches from GitHub</ActionButton>
                    </Flex>
                </View>
            </Content>
        </Provider>
    );
}
