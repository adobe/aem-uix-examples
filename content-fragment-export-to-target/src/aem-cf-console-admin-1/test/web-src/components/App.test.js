import React from 'react'
import { render, screen } from '@testing-library/react'
import App from '../../../web-src/src/components/App'
import '@testing-library/jest-dom'

const fs = require('fs')
const path = require('path')
console.log('Current directory:', __dirname)
const html = fs.readFileSync(path.resolve(__dirname, '../../../web-src/index.html'), 'utf8')
// Mocking dependencies
jest.mock('@adobe/uix-guest')

describe('App Component', () => {
  beforeEach(() => {
    document.body.innerHTML = html.toString()
    jest.clearAllMocks()
  })
  test('renders ExtensionRegistration component not in the experience shell', () => {
    render(<App />)
    expect(screen.getByText('IFrame for integration with Host (AEM)...')).toBeInTheDocument()
  })
})
