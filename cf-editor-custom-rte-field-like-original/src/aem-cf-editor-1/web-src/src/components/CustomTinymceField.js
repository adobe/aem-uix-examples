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
import { useSearchParams } from "react-router-dom";
import { attach } from "@adobe/uix-guest";
import { extensionId } from "./Constants";
import {
  Provider, View, Button, lightTheme
} from "@adobe/react-spectrum";
import { Label } from "@react-spectrum/label";
import { Editor } from "@tinymce/tinymce-react";
import "./rte.css";

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
  "bold italic underline strikethrough backcolor subscript superscript",
  "alignleft aligncenter alignright alignjustify",
  "bullist numlist outdent indent",
  "removeformat",
  "link unlink",
  "charmap",
  // "fullscreen",
].join(" | ");

export const RTE_URL =
  "https://exc-unifiedcontent.experience.adobe.net/solutions/CQ-aem-headless-rte/assets/tinymce-592/js/tinymce/tinymce.min.js";


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
  valid_elements: "*[*]",
};

const CustomTinymceField = () => {
  const [guestConnection, setGuestConnection] = useState(null);
  const [searchParams, setSearchParams] = useSearchParams();
  const [currentValue, setCurrentValue] = useState("");
  const [fieldData, setFieldData] = useState({
    ready: false,
  });
  const [validationState, setValidationState] = useState("invalid");
  const editorRef = useRef(null);
  const characterLimit = parseInt(searchParams.get("characterLimit"));
  const characterLimitEnforcement = searchParams.get("characterLimitEnforcement");

  const onInit = (evt, editor) => {
    editorRef.current = editor
  }

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
      setCurrentValue(value);
      setFieldData({ required, fieldLabel, name, ready: true });
    };

    init().catch(console.error);
  }, []);

  const setToLimit = (value, limit, charactersQty) => {
    const body = (new DOMParser()).parseFromString(value, "text/html").body;
    const r = (node, toRemoveLimit) => {
      for (let i = node.childNodes.length-1; i >= 0; i--) {
        if (toRemoveLimit <= 0) {
          return { node, toRemoveLimit }
        }

        if (node.childNodes[i].nodeType === Node.TEXT_NODE) {
          const contentLength = node.childNodes[i].textContent.length;
          if (contentLength > toRemoveLimit) {
            node.childNodes[i].textContent = node.childNodes[i].textContent.substring(0, contentLength-toRemoveLimit);
            return { node, toRemoveLimit: 0 }
          }
          node.childNodes[i].remove();
          toRemoveLimit -= contentLength;
        } else {
          const childNodeResult = r(node.childNodes[i], toRemoveLimit);
          node.childNodes[i] = childNodeResult.node
          toRemoveLimit = childNodeResult.toRemoveLimit
        }
      }
      if (!node.childNodes.length) {
        node.remove()
      }
      return { node, toRemoveLimit }
    }
    r(body, charactersQty - limit );
    return body.innerHTML;
  }

  const onEditorChangeHandler = (newValue, editor) => {
    let currentLength = editor.getContent({ format: "text" }).length;
    let value = newValue;
    if (characterLimitEnforcement && characterLimit && currentLength > characterLimit) {
      value = setToLimit(newValue, characterLimit, currentLength);
      currentLength = characterLimit;
    }
    guestConnection.host.field.onChange(value);
    setCurrentValue(value);
  };

  const labelStyle = {
    color: 'var(--spectrum-gray-800)',
  };


  // note that skin and content_css is disabled to avoid the normal
  // loading process and is instead loaded as a string via content_style
  return (
    <Provider theme={lightTheme} colorScheme="light">
      {fieldData.ready &&
        <View height={EDITOR_HEIGHT + 100}>
          <div className={'rte-top-block'}>
            <Label
              isRequired={fieldData.required}
              UNSAFE_style={labelStyle}
            >
              {fieldData.fieldLabel}
            </Label>
          </div>
          <Editor
            tinymceScriptSrc={RTE_URL}
            init={{
              ...defaultConfig,
              skin: false,
              content_css: false,
              content_style: [contentCss, contentUiCss].join("\n"),
            }}
            value={currentValue}
            onInit={onInit}
            onEditorChange={onEditorChangeHandler}
          />
        </View>
      }
    </Provider>
  );
}

export default CustomTinymceField;
