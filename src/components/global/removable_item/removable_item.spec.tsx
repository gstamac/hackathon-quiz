import React from 'react'
import { RemovableItem } from './removable_item'
import { RemovableItemProps } from './interfaces'
import { act, cleanup, render, RenderResult, userEvent } from '../../../../tests/test_utils'

describe('RemovableItem', () => {
  let renderResult: RenderResult

  afterEach(() => {
    cleanup()
  })

  const renderComponent = (itemProperties: RemovableItemProps): void => {
    renderResult = render(<RemovableItem { ...itemProperties }/>)
  }

  it('should call onRemove function when user clicks on the remove button', () => {
    const onRemoveMock: jest.Mock = jest.fn()

    renderComponent({
      label: 'Test',
      image: <img />,
      onRemove: onRemoveMock,
    })

    const removeButton: Element = renderResult.getByAltText('remove item')

    act(() => {
      userEvent.click(removeButton)
    })

    expect(onRemoveMock).toHaveBeenCalled()
  })
})
