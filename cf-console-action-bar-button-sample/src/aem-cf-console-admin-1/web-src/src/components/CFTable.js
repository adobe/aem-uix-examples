import React, { useState, useEffect } from 'react'
import { Cell, Column, Row, TableBody, TableHeader, TableView } from '@react-spectrum/table';
import { View } from '@adobe/react-spectrum';

let columns = [
  {name: 'Title', uid: 'title'},
  {name: 'Id', uid: 'id'},
  {name: 'Versions', uid: 'versions'}
];

const CFTable = (props) => {
  const { fragments } = props;
  console.log(fragments);
  return (
    <View></View>
  )
}

export default CFTable;
