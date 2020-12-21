import React from 'react'
import { store } from '../../store'
import { setFetchingContacts } from '../../store/contacts_slice'
import { render, RenderResult } from '../../../tests/test_utils'
import { PeopleContent } from './people_content'
import { getString } from '../../utils'

describe('PeopleContent', () => {
  let renderResult: RenderResult

  const renderComponent = (): void => {
    renderResult = render(<PeopleContent />)
  }

  it('should show globalid loader when get contacts request is in progress', () => {
    store.dispatch(setFetchingContacts(true))
    renderComponent()

    const contactsInfoText: Element | null = renderResult.queryByText(getString('no-contacts-found-heading'))
    const contactsDescriptionText: Element | null = renderResult.queryByText(getString('no-contacts-found-description'))
    const globalidLoader: Element | null = renderResult.queryByRole('spinner')

    expect(contactsInfoText).toBeNull()
    expect(contactsDescriptionText).toBeNull()
    expect(globalidLoader).not.toBeNull()
  })
})
