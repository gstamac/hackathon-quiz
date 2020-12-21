import React from 'react'

import { SkeletonProvider, SkeletonWrapperProps } from './skeleton_provider'
import { render, RenderResult } from '../../../../tests/test_utils'
import { Skeleton } from './skeleton'

describe('Skeleton wrapper', () => {
  let renderResult: RenderResult

  const component = (children?: React.ReactNode, wrapperProps?: SkeletonWrapperProps): JSX.Element =>
    <SkeletonProvider
      {...wrapperProps}>
      {children}
    </SkeletonProvider>

  const props: SkeletonWrapperProps = {
    className: 'testClass',
    loading: true,
  }

  it('should render Skelenton Wrapper when it is in loading', () => {
    renderResult = render(component(undefined, props))
    const skeletonWrapperDiv = renderResult.container.querySelector('.makeStyles-skeletonContainer-1')

    expect(skeletonWrapperDiv).not.toBeNull()
  })

  it('should render div with provided class when it is in not loading', () => {
    renderResult = render(component(undefined, {
      ...props,
      loading: false,
    }))
    const skeletonWrapperDiv = renderResult.container.querySelector('.testClass')

    expect(skeletonWrapperDiv).not.toBeNull()
  })

  it('should pass loading prop to containing children when child is skeleton type', () => {
    const skeletonChild = <Skeleton />

    renderResult = render(component(skeletonChild,props))
    const skeletonWrapperDiv = renderResult.container.querySelector('.MuiSkeleton-text')

    expect(skeletonWrapperDiv).not.toBeNull()

  })
})
