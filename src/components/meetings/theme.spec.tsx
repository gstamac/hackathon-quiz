import React from 'react'
import { RenderResult } from '@testing-library/react'
import { act } from 'react-dom/test-utils'
import { Theme } from './theme'
import { render } from '../../../tests/test_utils'

jest.mock('./providers/app_state_provider', () => ({
  useAppState: jest.fn().mockReturnValue({}),
}))

describe('Theme tests', () => {
  let renderResult: RenderResult

  const renderComponent = (): void => {
    act(() => {
      renderResult = render(
        <Theme>
          <div>test-child</div>
        </Theme>)
    })
  }

  it('should render theme component with child component', async () => {
    renderComponent()

    const childComponent: Element = renderResult.getByText('test-child')

    expect(childComponent).toBeDefined()
  })
})
