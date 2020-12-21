import React from 'react'
import { act } from 'react-dom/test-utils'
import { SidebarListItem } from './sidebar_list_item'
import { mainTheme } from '../../../../assets/themes'
import { MuiThemeProvider } from '@material-ui/core/styles'
import { ListOption } from '../../interfaces'
import { render, RenderResult, cleanup, userEvent } from '../../../../../tests/test_utils'
import { store } from '../../../../store'
import { setIdentity } from '../../../../store/identity_slice'
import { publicIdentityMock } from '../../../../../tests/mocks/identity_mock'

describe('Sidebar list item', () => {
  let renderResult: RenderResult

  const defaultOption: ListOption = {
    key: '1',
    locked: false,
    text: 'Some Text',
    name: 'text',
    onClick: jest.fn(),
  }

  beforeAll(() => {
    store.dispatch(setIdentity(publicIdentityMock))
  })

  const listItemComponent = (option: ListOption): JSX.Element => (
    <MuiThemeProvider theme={mainTheme}>
      <SidebarListItem openSideBar option={option} inset/>
    </MuiThemeProvider>
  )

  afterEach(() => {
    jest.resetAllMocks()
    cleanup()
  })

  beforeEach(() => {
    act(() => {
      renderResult = render(listItemComponent(defaultOption))
    })
  })

  it('Should render the list item', () => {
    const listItem: Element = renderResult.getByRole('button')

    expect(listItem).not.toBeUndefined()
    expect(listItem.children).toHaveLength(2)
    expect(listItem.children[0].getAttribute('href')).toBeNull()
  })

  it('should call onClick method when clicking on menu item', () => {
    const textItem = renderResult.getByText(defaultOption.text)

    act(() => {
      userEvent.click(textItem)
    })

    expect(defaultOption.onClick).toHaveBeenCalledTimes(1)
  })
})
