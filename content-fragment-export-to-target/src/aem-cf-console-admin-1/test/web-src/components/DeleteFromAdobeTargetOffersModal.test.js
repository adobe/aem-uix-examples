import React from 'react'
import { render, screen, waitFor, fireEvent } from '@testing-library/react'
import { act } from 'react-dom/test-utils'
import { attach } from '@adobe/uix-guest'
import DeletefromAdobeTargetOffersModal from '../../../web-src/src/components/DeleteFromAdobeTargetOffersModal'
import { triggerDeleteFromAdobeTarget } from '../../../web-src/src/utils'
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
  triggerDeleteFromAdobeTarget: jest.fn()
}))
const batchData = [
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

const mockSessionStorage = {
  someBatchId: JSON.stringify(batchData)
}
// const realUseState = React.useState;
beforeEach(() => {
  jest.clearAllMocks()
  /** mock attach */
  attach.mockResolvedValue(mockGuestConnection)
  /** mock sessionStorage */
  jest.spyOn(window.sessionStorage.__proto__, 'getItem').mockImplementation(key => {
    return mockSessionStorage[key]
  })
})

test('renders delete warning', () => {
  render(<DeletefromAdobeTargetOffersModal/>)
  const deleteWarningElement = screen.getByText(/Do you want to delete JSON Offer\(s\) in Adobe Target\?/i)
  expect(deleteWarningElement).toBeInTheDocument()
})

test('calls attach on component mount', async () => {
  render(<DeletefromAdobeTargetOffersModal/>)

  await waitFor(() => expect(attach).toBeCalled())
})

test('closes modal on Cancel button click', async () => {
  render(<DeletefromAdobeTargetOffersModal/>)

  await waitFor(() => expect(attach).toBeCalled())
  const cancelButton = (screen.getByRole('button', { name: 'Cancel' }))
  fireEvent.click(cancelButton)
  await waitFor(() => expect(mockGuestConnection.host.modal.close).toHaveBeenCalledTimes(1))
})

test('triggers delete on Delete button click', async () => {
  render(<DeletefromAdobeTargetOffersModal/>)
  await waitFor(() => expect(attach).toBeCalled())
  const deleteButton = (screen.getByRole('button', { name: 'Delete' }))

  act(() => {
    fireEvent.click(deleteButton)
  })

  /** run verification after user actions */
  await waitFor(() => expect(mockGuestConnection.sharedContext.get).toHaveBeenCalledTimes(2))
  await waitFor(() => expect(mockGuestConnection.host.modal.close).toHaveBeenCalledTimes(1))
  await waitFor(() => expect(triggerDeleteFromAdobeTarget).toHaveBeenNthCalledWith(1, authMock.imsToken, repoMock, authMock.imsOrg, batchData.map(el => el.id)))
  await waitFor(() => expect(mockGuestConnection.host.toaster.display).toHaveBeenNthCalledWith(1, {
    variant: 'positive',
    message: 'Content fragment(s) deleted successfully'
  }))
})
