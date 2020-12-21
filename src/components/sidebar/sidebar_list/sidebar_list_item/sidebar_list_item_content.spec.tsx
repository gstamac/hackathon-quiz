import React from 'react'
import { render, RenderResult, cleanup } from '@testing-library/react'
import { act } from 'react-dom/test-utils'
import { SidebarListItemContent } from './sidebar_list_item_content'
import { mainTheme } from '../../../../assets/themes'
import { MuiThemeProvider } from '@material-ui/core/styles'
import { ListOption } from '../../interfaces'
import { moreIcon } from '../../../global/icons'

describe('List item content', () => {
  let renderResult: RenderResult
  const itemOption: ListOption = {
    text: 'Some text',
    name: 'text',
    icon: () => moreIcon({ color: 'white' }),
    key: 'key',
    locked: false,
  }

  const listItemContentComponent = (option: ListOption, expand: boolean): JSX.Element => (
    <MuiThemeProvider theme={mainTheme}>
      <SidebarListItemContent expand={expand} option={option} inset />
    </MuiThemeProvider>
  )

  const renderComponent = (option: ListOption = itemOption): void => {
    act(() => {
      renderResult = render(listItemContentComponent(option, true))
    })
  }

  describe('List item content when sidebar is open', () => {
    afterEach(() => {
      jest.resetAllMocks()
      cleanup()
    })

    it('Should render the list item content text', () => {
      renderComponent()

      const listItemText = renderResult.getByText('Some text')

      expect(listItemText).not.toBeUndefined()
      expect(renderResult.container.children).toHaveLength(2)
    })

    it('Should render the icon in list item content', () => {
      renderComponent()

      const listItemIcon = renderResult.container.querySelector('svg')

      expect(listItemIcon).not.toBeUndefined()
    })

    it('Should render notification mark when user has unread messages', () => {
      renderComponent({ ...itemOption, notificationMark: true })

      const notificationMark: HTMLElement = renderResult.getByTestId('notification mark')

      expect(notificationMark).toBeDefined()
    })

    it('Should not render notification mark when user has none unread messages', () => {
      renderComponent()

      const notificationMark: HTMLElement | null = renderResult.queryByTestId('notification mark')

      expect(notificationMark).toBeNull()
    })
  })
})
