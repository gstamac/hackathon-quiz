import React from 'react'
import { RenderResult, render, cleanup, matchMedia, act } from '../../../tests/test_utils'
import { People } from './people'
import { getString } from '../../utils'
import { store } from '../../store'
import { setContacts, setFetchingContacts } from '../../store/contacts_slice'
import { contactsServiceResponseMock } from '../../../tests/mocks/contacts_mock'

describe('People', () => {
  let renderResult: RenderResult
  const mobileMaxWidth: number = 420
  const isMobileView = (width: number): boolean => width <= mobileMaxWidth

  const renderPage = (): void => {
    act(() => {
      renderResult = render(<People/>)
    })
  }

  beforeEach(() => {
    store.dispatch(setContacts(contactsServiceResponseMock.data))
    store.dispatch(setFetchingContacts(false))
  })

  afterEach(() => {
    cleanup()
    jest.clearAllMocks()
  })

  it('should render the people identities search component', () => {
    renderPage()

    const identitiesSearch: Element = renderResult.getByTestId('identities-search')

    expect(identitiesSearch).toBeDefined()
  })

  it('should render the people component with contacts info bar', () => {
    renderPage()

    const contactsInfoText: Element | null = renderResult.queryByText(getString('contacts-found-heading'))
    const contactsDescriptionText: Element | null = renderResult.queryByText(getString('contacts-found-description'))

    expect(contactsInfoText).not.toBeNull()
    expect(contactsDescriptionText).not.toBeNull()
  })

  it('should render the people component with contacts info bar when there are not contacts available', () => {
    renderPage()
    store.dispatch(setContacts(undefined))

    const contactsInfoText: Element | null = renderResult.queryByText(getString('no-contacts-found-heading'))
    const contactsDescriptionText: Element | null = renderResult.queryByText(getString('no-contacts-found-description'))

    expect(contactsInfoText).not.toBeNull()
    expect(contactsDescriptionText).not.toBeNull()
  })

  it('should not render the people contacts info bar when a user opens the page with mobile', () => {
    const isMobile: boolean = isMobileView(350)

    matchMedia(isMobile)
    renderPage()
    const contactsInfoText: Element | null = renderResult.queryByText(getString('contacts-found-heading'))
    const contactsDescriptionText: Element | null = renderResult.queryByText(getString('contacts-found-description'))

    expect(contactsInfoText).toBeNull()
    expect(contactsDescriptionText).toBeNull()
  })
})
