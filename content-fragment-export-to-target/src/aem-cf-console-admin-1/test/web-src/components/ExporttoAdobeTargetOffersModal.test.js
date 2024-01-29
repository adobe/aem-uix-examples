import React from 'react'
import { render, screen, waitFor, fireEvent } from '@testing-library/react'
import { act } from 'react-dom/test-utils'
import ExporttoAdobeTargetOffersModal from '../../../web-src/src/components/ExporttoAdobeTargetOffersModal'
import { attach } from '@adobe/uix-guest'
import { triggerExportToAdobeTarget, triggerPublish } from '../../../web-src/src/utils'
import '@testing-library/jest-dom'

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useParams: jest.fn(() => ({ batchId: 'someBatchId' }))
}))

const repoMock = 'someRepo'
const authMock = {
  imsToken: 'someToken',
  imsOrg: 'someOrg'
}
const sharedContextMock = (key) => {
  if (key === 'auth') {
    return Promise.resolve(authMock)
  }
  if (key === 'aemHost') {
    return Promise.resolve(repoMock)
  }
  return Promise.resolve()
}

const mockGuestConnection = {
  host: {
    modal: {
      close: jest.fn()
    },
    toaster: {
      display: jest.fn()
    },
    navigation: {
      openEditor: jest.fn()
    }
  },
  sharedContext: {
    get: jest.fn((key) => sharedContextMock(key))
  }
}
jest.mock('@adobe/uix-guest', () => ({
  ...jest.requireActual('@adobe/uix-guest'),
  attach: jest.fn()
}))
jest.mock('../../../web-src/src/utils', () => ({
  ...jest.requireActual('../../../web-src/src/utils'),
  triggerExportToAdobeTarget: jest.fn(),
  triggerPublish: jest.fn()
}))

let batchData = [
  {
    id: '/content/dam/cf1',
    title: 'cf1',
    status: 'published'
  },
  {
    id: '/content/dam/cf2',
    title: 'cf2',
    status: 'unpublished'
  }
]

let mockSessionStorage = {
  someBatchId: JSON.stringify(batchData)
}

beforeEach(() => {
  jest.clearAllMocks()
  jest.spyOn(window.sessionStorage.__proto__, 'getItem').mockImplementation(key => {
    return mockSessionStorage[key]
  })
  attach.mockResolvedValue(mockGuestConnection)
})

test('renders export prompt message', () => {
  batchData = [
    {
      id: '/content/dam/cf1',
      title: 'cf1',
      status: 'published'
    }
  ]
  mockSessionStorage = {
    someBatchId: JSON.stringify(batchData)
  }
  jest.spyOn(window.sessionStorage.__proto__, 'getItem').mockImplementation(key => {
    return mockSessionStorage[key]
  })
  render(<ExporttoAdobeTargetOffersModal/>)
  const exportPromptMessage = screen.getByText(/The Adobe Target offer may not be displayed correctly if the Content Fragment is not published./i)
  expect(exportPromptMessage).toBeInTheDocument()
})

test('calls attach on component mount', async () => {
  render(<ExporttoAdobeTargetOffersModal />)
  await waitFor(() => expect(attach).toHaveBeenCalledTimes(1))
})

test('closes modal on Cancel button click', async () => {
  render(<ExporttoAdobeTargetOffersModal />)
  await waitFor(() => expect(attach).toHaveBeenCalledTimes(1))
  const cancelButton = screen.getByText(/Cancel/i)
  fireEvent.click(cancelButton)
  await waitFor(() => expect(mockGuestConnection.host.modal.close).toHaveBeenCalledTimes(1))
})

test('triggers export without publishing on Export without publishing button click', async () => {
  render(<ExporttoAdobeTargetOffersModal />)
  await waitFor(() => expect(attach).toHaveBeenCalledTimes(1))
  const exportWithoutPublishingButton = screen.getByText(/Export without publishing/i)

  act(() => {
    fireEvent.click(exportWithoutPublishingButton)
  })

  await waitFor(() => expect(mockGuestConnection.host.modal.close).toHaveBeenCalledTimes(1))
  await waitFor(() => expect(triggerExportToAdobeTarget).toHaveBeenNthCalledWith(1, authMock.imsToken, repoMock, authMock.imsOrg, batchData.map(el => el.id)))
  await waitFor(() => expect(mockGuestConnection.host.toaster.display).toHaveBeenNthCalledWith(1, {
    variant: 'positive',
    message: 'Selected content fragment(s) are successfully scheduled to sync with Adobe Target.'
  }))
})

test('triggers publish and export on Publish and Export button click', async () => {
  render(<ExporttoAdobeTargetOffersModal />)
  await waitFor(() => expect(attach).toHaveBeenCalledTimes(1))
  const publishAndExportButton = screen.getByText(/Publish and Export/i)

  act(() => {
    fireEvent.click(publishAndExportButton)
  })

  await waitFor(() => expect(mockGuestConnection.host.modal.close).toHaveBeenCalledTimes(1))
  await waitFor(() => expect(triggerPublish).toHaveBeenNthCalledWith(1, authMock.imsToken, repoMock, authMock.imsOrg, batchData.map(el => el.id)))
  await waitFor(() => expect(triggerExportToAdobeTarget).toHaveBeenNthCalledWith(1, authMock.imsToken, repoMock, authMock.imsOrg, batchData.map(el => el.id)))
  await waitFor(() => expect(mockGuestConnection.host.toaster.display).toHaveBeenNthCalledWith(1, {
    variant: 'positive',
    message: 'Selected content fragment(s) are successfully scheduled to be published and synced with Adobe Target.'
  }))
})
