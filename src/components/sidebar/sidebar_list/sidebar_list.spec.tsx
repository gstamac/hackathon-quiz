import React from 'react'
import { render, RenderResult, cleanup } from '../../../../tests/test_utils'
import { act } from 'react-dom/test-utils'
import { SidebarList } from './sidebar_list'
import { mainTheme } from '../../../assets/themes'
import { MuiThemeProvider } from '@material-ui/core/styles'
import { ListOption } from '../interfaces'
import userEvent from '@testing-library/user-event'
import { store } from '../../../store'
import { publicIdentityMock } from '../../../../tests/mocks/identity_mock'
import { setIdentity } from '../../../store/identity_slice'

describe('List', () => {
  const handleOpenState: jest.Mock = jest.fn()

  const moreOptions: ListOption[] = [
    {
      locked: false,
      key: 'subText',
      text: 'Sub text',
      name: 'subText',
      href: 'https://example.com',
    },
  ]

  const listOptions: ListOption[] = [
    {
      key: 'text1',
      text: 'Text1',
      name: 'text1',
      locked: false,
    },
    {
      key: 'more',
      text: 'Text2',
      name: 'more',
      locked: false,
      subOptions: moreOptions,
    },
  ]

  describe('Desktop menu', () => {
    const openState = {
      openMoreOptions: true,
      openSideBar: true,
      openGetAppModal: false,
    }
    let renderResult: RenderResult

    const listComponent = (
      <MuiThemeProvider theme={mainTheme}>
        <SidebarList
          options={listOptions}
          openState={openState}
          handleOpenState={handleOpenState}
          isMobileOrTablet={false}
          isLoggedIn
        />
      </MuiThemeProvider>
    )

    beforeAll(() => {
      store.dispatch(setIdentity(publicIdentityMock))
    })

    beforeEach(() => {
      act(() => {
        renderResult = render(listComponent)
      })
    })

    afterEach(() => {
      jest.resetAllMocks()
      cleanup()
    })

    it('Should render the list', () => {
      const { container } = renderResult
      const currentList: Element = container.children[0]
      const childrenCount: number = currentList.childElementCount

      expect(childrenCount).toEqual(3)
    })

    it('Should call handleOpenState function when list item is clicked', () => {
      const listItems: Element[] = renderResult.getAllByRole('button')

      act(() => {
        userEvent.click(listItems[0])
      })
      expect(handleOpenState).toHaveBeenCalled()
    })

    it('Should render quick menu options', () => {
      const moreOptionsList: Element = renderResult.getByText('Text2')

      act(() => {
        userEvent.click(moreOptionsList)
      })

      const quickMenuItem: Element | null = renderResult.queryByText('Sub text')

      expect(quickMenuItem).not.toBeNull()
    })
  })

  describe('Mobile menu', () => {
    const openState = {
      openMoreOptions: true,
      openSideBar: true,
      openGetAppModal: false,
    }
    let renderResult: RenderResult

    const listComponent = (
      <MuiThemeProvider theme={mainTheme}>
        <SidebarList
          options={listOptions}
          openState={openState}
          handleOpenState={handleOpenState}
          isMobileOrTablet={true}
          isLoggedIn
        />
      </MuiThemeProvider>
    )

    beforeAll(() => {
      store.dispatch(setIdentity(publicIdentityMock))
    })

    beforeEach(() => {
      act(() => {
        renderResult = render(listComponent)
      })
    })

    afterEach(() => {
      jest.resetAllMocks()
      cleanup()
    })

    it('Should render the list', () => {
      const { container } = renderResult
      const currentList: Element = container.children[0]
      const childrenCount: number = currentList.childElementCount

      expect(childrenCount).toEqual(3)
    })

    it('Should call handleOpenState function when list item is clicked', () => {
      const listItems: Element[] = renderResult.getAllByRole('button')

      act(() => {
        userEvent.click(listItems[0])
      })
      expect(handleOpenState).toHaveBeenCalled()
    })

    it('Should not render the more option list items', () => {
      const moreOptionsList: Element = renderResult.getByText('Text2')

      act(() => {
        userEvent.click(moreOptionsList)
      })

      const quickMenuItem: Element | null = renderResult.queryByText('subText')

      expect(quickMenuItem).toBeNull()
    })
  })
})
