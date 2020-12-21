import React from 'react'
import { render, RenderResult } from '../../../../tests/test_utils'
import { AppStoreLinks } from './app_store_links'

describe('AppStoreLinks', () => {
  it('should render links to app store', () => {
    const renderResult: RenderResult = render(<AppStoreLinks />)

    expect(renderResult.container).toMatchSnapshot()
  })
})
