/*
Copyright 2024 Adobe. All rights reserved.
This file is licensed to you under the Apache License, Version 2.0 (the "License")
you may not use this file except in compliance with the License. You may obtain a copy
of the License at http://www.apache.org/licenses/LICENSE-2.0
Unless required by applicable law or agreed to in writing, software distributed under
the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
OF ANY KIND, either express or implied. See the License for the specific language
governing permissions and limitations under the License.
*/

const inquirer = require('inquirer');
const autocompletePrompt = require('inquirer-autocomplete-prompt');
const slugify = require('slugify');
const chalk = require('chalk');

inquirer.registerPrompt('autocomplete', autocompletePrompt);

var exitMenu = false;

const briefOverviews = {
    templateInfo: `\nOverview of the AEM Content Hub Asset Details extension template:\n
  * You have the option to generate boilerplate code for your extensible side panel.
  * You can get help regarding documentation at any time from the menu.
  * An App Builder project will be created with Node.js packages pre-configured.\n`
};

const promptDocs = {
    mainDoc: 'https://developer.adobe.com/uix/docs/'
};

// Top Level prompts
const promptTopLevelFields = (manifest) => {
    return inquirer.prompt([
        {
            type: 'input',
            name: 'name',
            message: 'What do you want to name your extension?',
            validate(answer) {
                if (!answer.length) {
                    return 'Required.';
                }

                return true;
            }
        },
        {
            type: 'input',
            name: 'description',
            message: 'Please provide a short description of your extension:',
            validate(answer) {
                if (!answer.length) {
                    return 'Required.';
                }

                return true;
            }
        },
        {
            type: 'input',
            name: 'version',
            message: 'What version would you like to start with?',
            default: '0.0.1',
            validate(answer) {
                if (!new RegExp("^\\bv?(?:0|[1-9][0-9]*)(?:\\.(?:0|[1-9][0-9]*)){2}(?:-[\\da-z\\-]+(?:\\.[\\da-z\\-]+)*)?(?:\\+[\\da-z\\-]+(?:\\.[\\da-z\\-]+)*)?\\b$").test(answer)) {
                    return 'Required. Must match semantic versioning rules.';
                }

                return true;
            }
        }
    ])
        .then((answers) => {
            if (answers.name) {
                manifest.name = answers.name;
                manifest.id = slugify(answers.name, {
                    replacement: '-',  // replace spaces with replacement character, defaults to `-`
                    remove: undefined, // remove characters that match regex, defaults to `undefined`
                    lower: true,       // convert to lower case, defaults to `false`
                    strict: true,      // strip special characters except replacement, defaults to `false`
                    locale: 'vi',      // language code of the locale to use
                    trim: true         // trim leading and trailing replacement chars, defaults to `true`
                });
            }

            if (answers.description) {
                manifest.description = answers.description;
            }

            if (answers.version) {
                manifest.version = answers.version;
            }
        })
};

// Main Menu prompts
const promptMainMenu = (manifest) => {
    const choices = [];

    choices.push(
        new inquirer.Separator(),
        {
            name: 'Add a side panel to the AEM Content Hub Asset Details Dialog',
            value: nestedPanelsPrompts.bind(this, manifest, 'assetDetailsTabPanels'),
        },
        {
            name: 'Add server-side handler',
            value: nestedActionPrompts.bind(this, manifest, 'runtimeActions')
        },
        new inquirer.Separator(),
        {
            name: 'I\'m done',
            value: () => {
                return Promise.resolve(true)
            }
        },
        {
            name: 'I don\'t know',
            value: promptGuideMenu.bind(this, manifest)
        }
    );

    return inquirer
        .prompt({
            type: 'list',
            name: 'execute',
            message: 'What would you like to do next?',
            choices,
        })
        .then((answers) => answers.execute())
        .then((endMainMenu) => {
            if (!endMainMenu && !exitMenu) {
                return promptMainMenu(manifest);
            }
        })
        .catch((error) => {
            console.log(error);
        });
};

// Prompts for panel metadata
const nestedPanelsPrompts = (manifest, manifestNodeName) => {
    const questions = [tooltipPrompt(), titlePrompt(), iconPrompt()];

    return inquirer
        .prompt(questions)
        .then((answers) => {
            answers.id = slugify(answers.tooltip, {
                replacement: '-',  // replace spaces with replacement character, defaults to `-`
                remove: undefined, // remove characters that match regex, defaults to `undefined`
                lower: true,       // convert to lower case, defaults to `false`
                strict: true,      // strip special characters except replacement, defaults to `false`
                locale: 'vi',      // language code of the locale to use
                trim: true         // trim leading and trailing replacement chars, defaults to `true`
            });
            answers.componentName = 'Panel' + answers.id.split('-')
                .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
                .join('');
            manifest[manifestNodeName] = manifest[manifestNodeName] || [];
            manifest[manifestNodeName].push(answers);
        })
        .catch((error) => {
            console.error(error);
        })
}

// Helper prompts for panel metadata
const tooltipPrompt = () => {
    return {
        type: 'input',
        name: 'tooltip',
        message: 'Please provide tooltip for the side panel icon:',
        validate(answer) {
            if (!answer.length) {
                return 'Required.';
            }

            return true;
        },
    };
}

const titlePrompt = () => {
    return {
        type: 'input',
        name: 'title',
        message: 'Please provide title for the side panel:',
        validate(answer) {
            if (!answer.length) {
                return 'Required.';
            }

            return true;
        },
    };
}

const workflowIcons = [
    '_123', '_3DMaterials', 'ABC', 'AEMScreens', 'Actions', 'AdDisplay', 'AdPrint', 'Add', 'AddCircle', 'AddTo',
    'AddToSelection', 'Airplane', 'Alert', 'AlertAdd', 'AlertCheck', 'AlertCircle', 'AlertCircleFilled', 'Algorithm',
    'Alias', 'AlignBottom', 'AlignCenter', 'AlignLeft', 'AlignMiddle', 'AlignRight', 'AlignTop', 'Amusementpark', 'Anchor',
    'AnchorSelect', 'Annotate', 'AnnotatePen', 'Answer', 'AnswerFavorite', 'App', 'AppRefresh', 'AppleFiles',
    'ApplicationDelivery', 'ApproveReject', 'Apps', 'Archive', 'ArchiveRemove', 'ArrowDown', 'ArrowLeft', 'ArrowRight',
    'ArrowUp', 'ArrowUpRight', 'Artboard', 'Article', 'Asset', 'AssetCheck', 'AssetsAdded', 'AssetsDownloaded',
    'AssetsExpired', 'AssetsLinkedPublished', 'AssetsModified', 'AssetsPublished', 'Asterisk', 'At', 'Attach',
    'AttachmentExclude', 'Attributes', 'Audio', 'AutomatedSegment', 'Back', 'Back30Seconds', 'BackAndroid', 'Beaker',
    'BeakerCheck', 'BeakerShare', 'Bell', 'BidRule', 'BidRuleAdd', 'Blower', 'Blur', 'Book', 'Bookmark', 'BookmarkSingle',
    'BookmarkSingleOutline', 'BookmarkSmall', 'BookmarkSmallOutline', 'Boolean', 'Border', 'Box', 'BoxAdd', 'BoxExport',
    'BoxImport', 'Brackets', 'BracketsSquare', 'Branch1', 'Branch2', 'Branch3', 'BranchCircle', 'BreadcrumbNavigation',
    'Breakdown', 'BreakdownAdd', 'Briefcase', 'Browse', 'Brush', 'Bug', 'Building', 'BulkEditUsers', 'Button', 'CCLibrary',
    'Calculator', 'Calendar', 'CalendarAdd', 'CalendarLocked', 'CalendarUnlocked', 'CallCenter', 'Camera', 'CameraFlip',
    'CameraRefresh', 'Campaign', 'CampaignAdd', 'CampaignClose', 'CampaignDelete', 'CampaignEdit', 'Cancel', 'Capitals',
    'Captcha', 'Car', 'Card', 'Channel', 'Chat', 'ChatAdd', 'CheckPause', 'Checkmark', 'CheckmarkCircle',
    'CheckmarkCircleOutline', 'ChevronDoubleLeft', 'ChevronDoubleRight', 'ChevronDown', 'ChevronLeft', 'ChevronRight',
    'ChevronUp', 'ChevronUpDown', 'Circle', 'CircleFilled', 'ClassicGridView', 'Clock', 'ClockCheck', 'CloneStamp', 'Close',
    'CloseCaptions', 'CloseCircle', 'Cloud', 'CloudDisconnected', 'CloudError', 'CloudOutline', 'Code', 'Collection',
    'CollectionAdd', 'CollectionAddTo', 'CollectionCheck', 'CollectionEdit', 'CollectionExclude', 'CollectionLink',
    'ColorFill', 'ColorPalette', 'ColorWheel', 'ColumnSettings', 'ColumnTwoA', 'ColumnTwoB', 'ColumnTwoC', 'Comment',
    'Compare', 'Compass', 'Condition', 'ConfidenceFour', 'ConfidenceOne', 'ConfidenceThree', 'ConfidenceTwo', 'Contrast',
    'ConversionFunnel', 'Copy', 'CoverImage', 'CreditCard', 'Crop', 'CropLightning', 'CropRotate', 'Crosshairs', 'Curate',
    'Cut', 'Dashboard', 'Data', 'DataAdd', 'DataBook', 'DataCheck', 'DataCorrelated', 'DataDownload', 'DataEdit',
    'DataMapping', 'DataRefresh', 'DataRemove', 'DataSettings', 'DataUnavailable', 'DataUpload', 'DataUser', 'Date',
    'DateInput', 'Deduplication', 'Delegate', 'Delete', 'DeleteOutline', 'Demographic', 'Deselect', 'DeselectCircular',
    'DesktopAndMobile', 'DeviceDesktop', 'DeviceLaptop', 'DevicePhone', 'DevicePhoneRefresh', 'DevicePreview',
    'DeviceRotateLandscape', 'DeviceRotatePortrait', 'DeviceTV', 'DeviceTablet', 'Devices', 'DistributeBottomEdge',
    'DistributeHorizontalCenter', 'DistributeHorizontally', 'DistributeLeftEdge', 'DistributeRightEdge',
    'DistributeSpaceHoriz', 'DistributeSpaceVert', 'DistributeTopEdge', 'DistributeVerticalCenter', 'DistributeVertically',
    'Divide', 'DividePath', 'Document', 'DocumentFragment', 'DocumentFragmentGroup', 'DocumentOutline', 'DocumentRefresh',
    'Dolly', 'Download', 'DownloadFromCloud', 'DownloadFromCloudOutline', 'Draft', 'DragHandle', 'Draw', 'Dropdown',
    'Duplicate', 'Edit', 'EditCircle', 'EditExclude', 'EditIn', 'EditInLight', 'Education', 'Effects', 'Efficient',
    'Ellipse', 'Email', 'EmailCancel', 'EmailCheck', 'EmailExclude', 'EmailExcludeOutline', 'EmailGear', 'EmailGearOutline',
    'EmailKey', 'EmailKeyOutline', 'EmailLightning', 'EmailNotification', 'EmailOutline', 'EmailRefresh', 'EmailSchedule',
    'Engagement', 'Erase', 'Event', 'EventExclude', 'EventShare', 'Events', 'ExcludeOverlap', 'Experience', 'ExperienceAdd',
    'ExperienceAddTo', 'ExperienceExport', 'ExperienceImport', 'Export', 'ExportOriginal', 'Exposure', 'Extension',
    'FacebookCoverImage', 'Fast', 'FastForward', 'FastForwardCircle', 'Feature', 'Feed', 'FeedAdd', 'FeedManagement',
    'Feedback', 'FileAdd', 'FileCSV', 'FileCampaign', 'FileChart', 'FileCheckedOut', 'FileCode', 'FileData', 'FileEmail',
    'FileExcel', 'FileFolder', 'FileGear', 'FileGlobe', 'FileHTML', 'FileImportant', 'FileJson', 'FileKey', 'FileMobile',
    'FilePDF', 'FileShare', 'FileSingleWebPage', 'FileSpace', 'FileTemplate', 'FileTxt', 'FileUser', 'FileWord',
    'FileWorkflow', 'FileXML', 'FileZip', 'FilingCabinet', 'Filmroll', 'FilmrollAutoAdd', 'Filter', 'FilterAdd',
    'FilterCheck', 'FilterDelete', 'FilterEdit', 'FilterHeart', 'FilterRemove', 'FilterStar', 'FindAndReplace', 'Flag',
    'FlagExclude', 'FlashAuto', 'FlashOff', 'FlashOn', 'Flashlight', 'FlashlightOff', 'FlashlightOn', 'FlipHorizontal',
    'FlipVertical', 'Folder', 'Folder2Color', 'FolderAdd', 'FolderAddTo', 'FolderArchive', 'FolderDelete', 'FolderGear',
    'FolderLocked', 'FolderOpen', 'FolderOpenOutline', 'FolderOutline', 'FolderRemove', 'FolderSearch', 'FolderUser',
    'Follow', 'FollowOff', 'ForPlacementOnly', 'Forecast', 'Form', 'Forward', 'FullScreen', 'FullScreenExit', 'Function',
    'Game', 'Gauge1', 'Gauge2', 'Gauge3', 'Gauge4', 'Gauge5', 'Gears', 'GearsAdd', 'GearsDelete', 'GearsEdit',
    'GenderFemale', 'GenderMale', 'Gift', 'Globe', 'GlobeCheck', 'GlobeClock', 'GlobeEnter', 'GlobeExit', 'GlobeGrid',
    'GlobeOutline', 'GlobeRemove', 'GlobeSearch', 'GlobeStrike', 'GlobeStrikeClock', 'Gradient', 'GraphArea',
    'GraphAreaStacked', 'GraphBarHorizontal', 'GraphBarHorizontalAdd', 'GraphBarHorizontalStacked', 'GraphBarVertical',
    'GraphBarVerticalAdd', 'GraphBarVerticalStacked', 'GraphBubble', 'GraphBullet', 'GraphConfidenceBands', 'GraphDonut',
    'GraphDonutAdd', 'GraphGantt', 'GraphHistogram', 'GraphPathing', 'GraphPie', 'GraphProfitCurve', 'GraphScatter',
    'GraphStream', 'GraphStreamRanked', 'GraphStreamRankedAdd', 'GraphSunburst', 'GraphTree', 'GraphTrend', 'GraphTrendAdd',
    'GraphTrendAlert', 'Graphic', 'Group', 'Hammer', 'Hand', 'Hand0', 'Hand1', 'Hand2', 'Hand3', 'Hand4', 'Heal', 'Heart',
    'Help', 'HelpOutline', 'Histogram', 'History', 'Home', 'Homepage', 'HotFixes', 'HotelBed', 'IdentityService', 'Image',
    'ImageAdd', 'ImageAlbum', 'ImageAutoMode', 'ImageCarousel', 'ImageCheck', 'ImageCheckedOut', 'ImageMapCircle',
    'ImageMapPolygon', 'ImageMapRectangle', 'ImageNext', 'ImageProfile', 'ImageSearch', 'ImageText', 'Images', 'Import',
    'Inbox', 'Individual', 'Info', 'InfoOutline', 'IntersectOverlap', 'InvertAdj', 'Invite', 'Journey', 'JourneyAction',
    'JourneyData', 'JourneyEvent', 'JourneyEvent2', 'JourneyReports', 'JourneyVoyager', 'JumpToTop', 'Key', 'KeyClock',
    'KeyExclude', 'Keyboard', 'Label', 'LabelExclude', 'Labels', 'Landscape', 'Launch', 'Layers', 'LayersBackward',
    'LayersBringToFront', 'LayersForward', 'LayersSendToBack', 'Light', 'Line', 'LineHeight', 'LinearGradient', 'Link',
    'LinkCheck', 'LinkGlobe', 'LinkNav', 'LinkOff', 'LinkOut', 'LinkOutLight', 'LinkPage', 'LinkUser', 'Location',
    'LocationBasedDate', 'LocationBasedEvent', 'LocationContribution', 'LockClosed', 'LockOpen', 'LogOut', 'Login', 'Looks',
    'LoupeView', 'MBox', 'MagicWand', 'Magnify', 'Mailbox', 'MapView', 'MarginBottom', 'MarginLeft', 'MarginRight',
    'MarginTop', 'MarketingActivities', 'Maximize', 'Measure', 'Menu', 'Merge', 'MergeLayers', 'Messenger', 'Minimize',
    'MobileServices', 'ModernGridView', 'Money', 'Monitoring', 'Moon', 'More', 'MoreCircle', 'MoreSmall', 'MoreSmallList',
    'MoreSmallListVert', 'MoreVertical', 'Move', 'MoveLeftRight', 'MoveTo', 'MoveUpDown', 'MovieCamera', 'Multiple',
    'MultipleAdd', 'MultipleCheck', 'MultipleExclude', 'NamingOrder', 'NewItem', 'News', 'NewsAdd', 'NoEdit', 'Note',
    'NoteAdd', 'OS', 'Offer', 'OfferDelete', 'OnAir', 'OpenIn', 'OpenInLight', 'OpenRecent', 'OpenRecentOutline', 'Orbit',
    'Organisations', 'Organize', 'OutlinePath', 'PaddingBottom', 'PaddingLeft', 'PaddingRight', 'PaddingTop', 'PageBreak',
    'PageExclude', 'PageGear', 'PageRule', 'PageShare', 'PageTag', 'PagesExclude', 'Pan', 'Panel', 'Paste', 'PasteHTML',
    'PasteList', 'PasteText', 'Pattern', 'Pause', 'PauseCircle', 'Pawn', 'Pending', 'PeopleGroup', 'PersonalizationField',
    'Perspective', 'PinOff', 'PinOn', 'Pivot', 'PlatformDataMapping', 'Play', 'PlayCircle', 'Plug', 'Polygon',
    'PolygonSelect', 'PopIn', 'Portrait', 'Preset', 'Preview', 'Print', 'PrintPreview', 'Project', 'ProjectAdd',
    'ProjectEdit', 'ProjectNameEdit', 'Promote', 'Properties', 'PropertiesCopy', 'PublishCheck', 'PublishPending',
    'PublishReject', 'PublishRemove', 'PublishSchedule', 'PushNotification', 'Question', 'QuickSelect', 'RSS',
    'RadialGradient', 'Rail', 'RailBottom', 'RailLeft', 'RailRight', 'RailRightClose', 'RailRightOpen', 'RailTop',
    'RangeMask', 'RealTimeCustomerProfile', 'RectSelect', 'Rectangle', 'Redo', 'Refresh', 'RegionSelect', 'Relevance',
    'Remove', 'RemoveCircle', 'Rename', 'Reorder', 'Replay', 'Replies', 'Reply', 'ReplyAll', 'Report', 'ReportAdd',
    'Resize', 'Retweet', 'Reuse', 'Revenue', 'Revert', 'Rewind', 'RewindCircle', 'Ribbon', 'RotateCCW', 'RotateCCWBold',
    'RotateCW', 'RotateCWBold', 'RotateLeft', 'RotateLeftOutline', 'RotateRight', 'RotateRightOutline', 'SMS', 'SMSKey',
    'SMSLightning', 'SMSRefresh', 'SQLQuery', 'Sampler', 'Sandbox', 'SaveAsFloppy', 'SaveFloppy', 'SaveTo', 'SaveToLight',
    'Scribble', 'Search', 'Seat', 'SeatAdd', 'Segmentation', 'Segments', 'Select', 'SelectAdd', 'SelectBox', 'SelectBoxAll',
    'SelectCircular', 'SelectContainer', 'SelectGear', 'SelectIntersect', 'SelectSubtract', 'Selection', 'SelectionChecked',
    'SelectionMove', 'Send', 'SentimentNegative', 'SentimentNeutral', 'SentimentPositive', 'Separator', 'Servers',
    'Settings', 'Shapes', 'Share', 'ShareAndroid', 'ShareCheck', 'ShareLight', 'ShareWindows', 'Sharpen', 'Shield', 'Ship',
    'Shop', 'ShoppingCart', 'ShowAllLayers', 'ShowMenu', 'ShowOneLayer', 'Shuffle', 'Slice', 'Slow', 'SmallCaps',
    'Snapshot', 'SocialNetwork', 'SortOrderDown', 'SortOrderUp', 'Spam', 'Spellcheck', 'Spin', 'SplitView', 'SpotHeal',
    'Stadium', 'Stage', 'Stamp', 'Star', 'StarOutline', 'Starburst', 'StepBackward', 'StepBackwardCircle', 'StepForward',
    'StepForwardCircle', 'Stop', 'StopCircle', 'Stopwatch', 'Straighten', 'StraightenOutline', 'StrokeWidth', 'Subscribe',
    'SubtractBackPath', 'SubtractFromSelection', 'SubtractFrontPath', 'SuccessMetric', 'Summarize', 'Survey', 'Switch',
    'Sync', 'SyncRemove', 'Table', 'TableAdd', 'TableAndChart', 'TableColumnAddLeft', 'TableColumnAddRight',
    'TableColumnMerge', 'TableColumnRemoveCenter', 'TableColumnSplit', 'TableEdit', 'TableHistogram', 'TableMergeCells',
    'TableRowAddBottom', 'TableRowAddTop', 'TableRowMerge', 'TableRowRemoveCenter', 'TableRowSplit', 'TableSelectColumn',
    'TableSelectRow', 'TagBold', 'TagItalic', 'TagUnderline', 'Target', 'Targeted', 'TaskList', 'Teapot', 'Temperature',
    'TestAB', 'TestABEdit', 'TestABGear', 'TestABRemove', 'TestProfile', 'Text', 'TextAdd', 'TextAlignCenter',
    'TextAlignJustify', 'TextAlignLeft', 'TextAlignRight', 'TextBaselineShift', 'TextBold', 'TextBulleted',
    'TextBulletedAttach', 'TextBulletedHierarchy', 'TextBulletedHierarchyExclude', 'TextColor', 'TextDecrease', 'TextEdit',
    'TextExclude', 'TextIncrease', 'TextIndentDecrease', 'TextIndentIncrease', 'TextItalic', 'TextKerning',
    'TextLetteredLowerCase', 'TextLetteredUpperCase', 'TextNumbered', 'TextParagraph', 'TextRomanLowercase',
    'TextRomanUppercase', 'TextSize', 'TextSizeAdd', 'TextSpaceAfter', 'TextSpaceBefore', 'TextStrikethrough', 'TextStroke',
    'TextStyle', 'TextSubscript', 'TextSuperscript', 'TextTracking', 'TextUnderline', 'ThumbDown', 'ThumbDownOutline',
    'ThumbUp', 'ThumbUpOutline', 'Tips', 'Train', 'TransferToPlatform', 'Transparency', 'Trap', 'TreeCollapse',
    'TreeCollapseAll', 'TreeExpand', 'TreeExpandAll', 'TrendInspect', 'TrimPath', 'Trophy', 'Type', 'USA', 'Underline',
    'Undo', 'Ungroup', 'Unlink', 'Unmerge', 'UploadToCloud', 'UploadToCloudOutline', 'User', 'UserActivity', 'UserAdd',
    'UserAdmin', 'UserArrow', 'UserCheckedOut', 'UserDeveloper', 'UserEdit', 'UserExclude', 'UserGroup', 'UserLock',
    'UserShare', 'UsersAdd', 'UsersExclude', 'UsersLock', 'UsersShare', 'Variable', 'VectorDraw', 'VideoCheckedOut',
    'VideoFilled', 'VideoOutline', 'ViewAllTags', 'ViewBiWeek', 'ViewCard', 'ViewColumn', 'ViewDay', 'ViewDetail',
    'ViewGrid', 'ViewList', 'ViewRow', 'ViewSingle', 'ViewStack', 'ViewWeek', 'ViewedMarkAs', 'Vignette', 'Visibility',
    'VisibilityOff', 'Visit', 'VisitShare', 'VoiceOver', 'VolumeMute', 'VolumeOne', 'VolumeThree', 'VolumeTwo', 'Watch',
    'WebPage', 'WebPages', 'Workflow', 'WorkflowAdd', 'Wrench', 'ZoomIn', 'ZoomOut'
];

const iconPrompt = () => {
    return {
        type: 'autocomplete',
        name: 'icon',
        message: 'Please select React Spectrum icon for the side panel:',
        source: (answersSoFar, input) => {
            if (input) {
                return Promise.resolve(workflowIcons.filter(icon => icon.toLowerCase().includes(input.toLowerCase())));
            } else {
                return Promise.resolve(workflowIcons);
            }
        },
    };
}

// Prompts for action metadata
const nestedActionPrompts = (manifest, manifestNodeName) => {
    let actionName = 'generic';

    return inquirer.prompt({
        type: 'input',
        name: 'actionName',
        message: "Adobe I/O Runtime lets you invoke serverless code on demand. How would you like to name this action?",
        default: actionName,
        validate(input) {
            // Must be a valid openwhisk action name, this is a simplified set see:
            // https://github.com/apache/openwhisk/blob/master/docs/reference.md#entity-names
            const valid = /^[a-zA-Z0-9][a-zA-Z0-9-]{2,31}$/;
            if (valid.test(input)) {
                return true;
            }
            return `'${input}' is not a valid action name, please make sure that:
              The name has at least 3 characters or less than 33 characters.
              The first character is an alphanumeric character.
              The subsequent characters are alphanumeric.
              The last character isn't a space.
              Note: characters can only be split by '-'.`;
        }
    })
        .then((answer) => {
            manifest[manifestNodeName] = manifest[manifestNodeName] || [];
            // manifest[manifestNodeName].push(answer.actionName)
            manifest[manifestNodeName].push({
                'name': answer.actionName
            });
        })
        .catch((error) => {
            console.error(error);
        })
}

// Guide Menu Prompts
const promptGuideMenu = (manifest) => {
    const choices = [];

    choices.push(
        new inquirer.Separator(),
        {
            name: "Find some help",
            value: helpPrompts.bind(this)
        },
        new inquirer.Separator(),
        {
            name: "Go back",
            value: () => {
                return Promise.resolve(true)
            }
        }
    );

    return inquirer
        .prompt({
            type: 'list',
            name: 'execute',
            message: "What about this then?",
            choices,
        })
        .then((answers) => answers.execute())
        .then((endGuideMenu) => {
            if (!endGuideMenu) {
                return promptGuideMenu(manifest);
            }
        })
        .catch((error) => {
            console.log(error);
        });
}

// Helper prompts for Guide Menu
const helpPrompts = () => {
    console.log('  Please refer to:');
    console.log(chalk.blue(chalk.bold(`  -> ${promptDocs['mainDoc']}`)) + '\n');
};

module.exports = {
    briefOverviews,
    promptTopLevelFields,
    promptMainMenu,
    promptDocs
};
