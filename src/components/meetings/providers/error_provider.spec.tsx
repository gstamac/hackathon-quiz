import React from 'react'
import { cleanup, RenderResult } from '@testing-library/react'
import { act } from 'react-dom/test-utils'
import { render, userEvent } from '../../../../tests/test_utils'
import { ErrorProvider, getErrorContext } from './error_provider'

describe('ErrorProvider tests', () => {
  let renderResult: RenderResult

  const renderComponent = (): void => {
    act(() => {
      renderResult = render(<ErrorProvider>
        <div data-testid='ChildComponent'></div>
      </ErrorProvider>
      )
    })
  }

  afterEach(() => {
    cleanup()
  })

  it('should render child component', async () => {
    renderComponent()

    const component: Element = renderResult.getByTestId('ChildComponent')

    expect(component).toBeDefined()
  })

  it('should set error message', async () => {
    const TestComponent = (): JSX.Element => {
      const { errorMessage, updateErrorMessage } = React.useContext(getErrorContext())

      return (
        <>
          <div>{errorMessage}</div>
          <button onClick={() => updateErrorMessage('newErrorMessage')}>SetError</button>
        </>
      )
    }

    const wrapper = render(<ErrorProvider>
      <TestComponent />
    </ErrorProvider>
    )

    userEvent.click(wrapper.getByText('SetError'))

    expect(wrapper.getByText('newErrorMessage')).toBeDefined()
  })
})
