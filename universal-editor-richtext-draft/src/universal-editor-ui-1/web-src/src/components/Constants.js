/*
Copyright 2022 Adobe
All Rights Reserved.
NOTICE: Adobe permits you to use, modify, and distribute this file in
accordance with the terms of the Adobe license agreement accompanying
it.
*/

const extensionId = 'universal-editor-richtext-draft'
module.exports = {
  extensionId,
  saveDraftAction: 'save-draft',
  DRAFT_MIN_LENGTH: 50,
  TYPE_REACH_TEXT: 'richtext',
  STORAGE_KEY_DRAFT_LIST: `${extensionId}-itemsDraftList`
}
