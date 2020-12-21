import React from 'react'
import { render, RenderResult } from '../../../../../tests/test_utils'
import { AppStoreButtons } from './app_store_buttons'

describe('AppStoreButtons', () => {
  it('should render app store links', () => {
    const renderResult: RenderResult = render(<AppStoreButtons />)

    expect(renderResult.queryAllByTestId('app-store-links')).not.toBeNull()
    expect(renderResult.container).toMatchSnapshot()
  })
})
