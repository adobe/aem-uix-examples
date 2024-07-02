/*
Copyright 2024 Adobe
All Rights Reserved.
NOTICE: Adobe permits you to use, modify, and distribute this file in
accordance with the terms of the Adobe license agreement accompanying
it.
*/

import 'core-js/stable'

window.React = require('react')
import ReactDOM from 'react-dom'

import App from './components/App'
import './index.css'

ReactDOM.render(
    <App />,
    document.getElementById('root')
)
