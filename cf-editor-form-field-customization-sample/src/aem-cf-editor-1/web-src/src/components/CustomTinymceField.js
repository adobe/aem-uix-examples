/*
Copyright 2023 Adobe. All rights reserved.
This file is licensed to you under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License. You may obtain a copy
of the License at http://www.apache.org/licenses/LICENSE-2.0
Unless required by applicable law or agreed to in writing, software distributed under
the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
OF ANY KIND, either express or implied. See the License for the specific language
governing permissions and limitations under the License.
*/

/*
It is intended to replace "text/html" RTE (tinyMCE) form fields.
*/

import React, { useEffect, useState, useRef } from "react";
import { attach } from "@adobe/uix-guest";
import { extensionId } from "./Constants";
import {
  Provider, View, Button, lightTheme
} from "@adobe/react-spectrum";
import { Label } from "@react-spectrum/label";
import { Editor } from "@tinymce/tinymce-react";

// see https://www.tiny.cloud/docs/tinymce/6/react-pm-bundle/
import tinymce from "tinymce/tinymce";
// DOM model
import "tinymce/models/dom/model";
// Theme
import "tinymce/themes/silver";
// Toolbar icons
import "tinymce/icons/default";
// Editor styles
import "tinymce/skins/ui/oxide/skin.min.css";
// importing plugins
// if you use a plugin that is not listed here the editor will fail to load
import "tinymce/plugins/advlist";
import "tinymce/plugins/anchor";
import "tinymce/plugins/autolink";
import "tinymce/plugins/autoresize";
import "tinymce/plugins/autosave";
import "tinymce/plugins/charmap";
import "tinymce/plugins/code";
import "tinymce/plugins/codesample";
import "tinymce/plugins/directionality";
import "tinymce/plugins/emoticons";
import "tinymce/plugins/fullscreen";
import "tinymce/plugins/help";
import "tinymce/plugins/image";
import "tinymce/plugins/importcss";
import "tinymce/plugins/insertdatetime";
// replace the original ./node_modules/tinymce/plugins/link/plugin.js plugin with our modified version
// import "tinymce/plugins/link";
import "../../../../../patches/tinymce/plugins/link";
import "tinymce/plugins/lists";
import "tinymce/plugins/media";
import "tinymce/plugins/nonbreaking";
import "tinymce/plugins/pagebreak";
import "tinymce/plugins/preview";
import "tinymce/plugins/quickbars";
import "tinymce/plugins/save";
import "tinymce/plugins/searchreplace";
import "tinymce/plugins/table";
import "tinymce/plugins/template";
import "tinymce/plugins/visualblocks";
import "tinymce/plugins/visualchars";
import "tinymce/plugins/wordcount";
// importing plugin resources
import "tinymce/plugins/emoticons/js/emojis";
// Content styles, including inline UI like fake cursors
import contentCss from "tinymce/skins/content/default/content.min.css";
import contentUiCss from "tinymce/skins/ui/oxide/content.min.css";

const plugins = [
  "advlist autolink lists link image charmap preview anchor",
  "searchreplace visualblocks code",
  "insertdatetime media table fullscreen",
].join(" ");

const toolbar = [
  "undo redo pastetext copy",
  "blocks table",
  "bold italic underline backcolor subscript superscript",
  "alignleft aligncenter alignright alignjustify",
  "bullist numlist outdent indent",
  "removeformat",
  "link unlink",
  "charmap",
  "fullscreen",
].join(" | ");

const EDITOR_HEIGHT = 500;

const defaultConfig = {
  height: EDITOR_HEIGHT,
  menubar: false,
  statusbar: false,
  plugins,
  remove_trailing_brs: false,
  toolbar1: toolbar,
  browser_spellcheck: true,
  contextmenu: false,
  convert_urls: false,
  advlist_number_styles: "default lower-alpha upper-alpha lower-roman upper-roman",
  advlist_bullet_styles: "disc circle square",
  lists_indent_on_tab: false,
};

const CustomTinymceField = () => {
  const [guestConnection, setGuestConnection] = useState(null);
  const [fieldData, setFieldData] = useState({
    ready: false,
  });
  const [validationState, setValidationState] = useState("invalid");
  const editorRef = useRef(null);

  const logEditorContent = () => {
    if (editorRef.current) {
      console.log(editorRef.current.getContent());
    }
  };

  useEffect(() => {
    const init = async () => {
      const connection = await attach({ id: extensionId });
      setGuestConnection(connection);

      // configure a validation state subscriber
      await connection.host.field.onValidationStateChange(
        (state) => setValidationState(state)
      );

      const value = (await connection.host.field.getDefaultValue()).value;
      const fieldModel = await connection.host.field.getModel();
      const required = fieldModel.required ?? false;
      const fieldLabel = fieldModel.fieldLabel ?? "";
      const name = fieldModel.name;
      setFieldData({
        value,
        required,
        fieldLabel,
        name,
        ready: true,
      });
    };

    init().catch(console.error);
  }, []);

  const onEditorChangeHandler = (newValue, editor) => {
    guestConnection.host.field.onChange(newValue);
  };

  // note that skin and content_css is disabled to avoid the normal
  // loading process and is instead loaded as a string via content_style
  return (
    <Provider theme={lightTheme} colorScheme="light">
      {fieldData.ready &&
        <View>
          <Label isRequired={fieldData.required}>
            {fieldData.fieldLabel}
          </Label>
          <Editor
            init={{
              ...defaultConfig,
              skin: false,
              content_css: false,
              content_style: [contentCss, contentUiCss].join("\n"),
            }}
            initialValue={fieldData.value}
            onInit={(evt, editor) => editorRef.current = editor}
            onEditorChange={onEditorChangeHandler}
          />
          <Button
            variant="accent"
            onPress={logEditorContent}
            marginTop="size-150"
          >
            Log Editor Content
          </Button>
        </View>
      }
    </Provider>
  );
}

export default CustomTinymceField;