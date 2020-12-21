import React from 'react'
import { GoToGroups } from '.'
import { RenderResult, act, render, userEvent, cleanup } from '../../../tests/test_utils'
import { getString } from '../../utils'
import { history } from '../../store'

describe('Go to Groups landing page', () => {
  let renderResult: RenderResult

  beforeEach(() => {
    act(() => {
      renderResult = render(<GoToGroups />)
    })
  })

  afterEach(() => {
    cleanup()
    jest.resetAllMocks()
  })

  it('Should render Go to Groups component', async () => {
    const background_pic: Element | null = renderResult.getByAltText('Go to Groups background icon')
    const go_to_groups_title: Element | null = renderResult.getByText(getString('messages-group-none'))
    const go_to_groups_text: Element | null = renderResult.getByText(getString('groups-create'))

    expect(background_pic).not.toBeNull()
    expect(go_to_groups_title).not.toBeNull()
    expect(go_to_groups_text).not.toBeNull()
  })

  it('Should redirect user to the groups tab', async () => {
    const go_to_groups_button: Element | null = renderResult.getByRole('button')

    act(() => {
      userEvent.click(go_to_groups_button)
    })

    expect(history.location.pathname).toEqual('/app/groups')
  })})
