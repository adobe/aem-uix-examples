/*
Copyright 2024 Adobe
All Rights Reserved.
NOTICE: Adobe permits you to use, modify, and distribute this file in
accordance with the terms of the Adobe license agreement accompanying
it.
*/
import React from "react";
import {
  Flex,
  ProgressCircle,
} from "@adobe/react-spectrum";

export default function Spinner(props) {
  return (
    <Flex alignItems="center" justifyContent="center" height="50vh">
      <ProgressCircle size="L" aria-label="Loading…" isIndeterminate />
      {props.children}
    </Flex>
  );
}
