import React from 'react'
import { act, render, RenderResult, fireEvent } from '../../../../../tests/test_utils'
import { TimestampTooltip, TimestampTooltipProps } from '.'

jest.useFakeTimers()
describe('Timestamp tooltip tests', () => {
  let renderResult: RenderResult

  const defaultProps: Omit<TimestampTooltipProps, 'children'> = {
    timestamp: 'timestamp',
    messageIsMine: true,
    showAvatar: false,
  }

  const renderComponent = (props?: Partial<TimestampTooltipProps>): void => {
    act(() => {
      renderResult = render(
        <TimestampTooltip {...{
          ...defaultProps,
          ...props,
        }}>
          <div>test</div>
        </TimestampTooltip>
      )
    })
  }

  it('should render timestamp on hover', () => {
    renderComponent()

    const hoverElement: Element = renderResult.getByText('test')

    act(() => {
      fireEvent.mouseEnter(hoverElement)
      jest.runAllTimers()
    })

    const timestamp: Element | null = renderResult.queryByText(defaultProps.timestamp)

    expect(timestamp).not.toBeNull()
  })
})
