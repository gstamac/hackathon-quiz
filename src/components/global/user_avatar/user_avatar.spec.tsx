import React from 'react'
import { UserAvatar } from './user_avatar'
import { UserAvatarProps } from './interfaces'
import { act, render, RenderResult } from '../../../../tests/test_utils'

describe('UserAvatar', () => {
  let renderResult: RenderResult

  const renderPage = (props: UserAvatarProps): void => {
    act(() => {
      renderResult = render(<UserAvatar {...props}/>)
    })
  }

  it('should render the UserAvatar component when img url is available', () => {
    renderPage({ gidUuid: 'test', imageUrl: 'src' })

    const userAvatar: Element | null = renderResult.queryByAltText('avatar')

    expect(userAvatar).not.toBeNull()
  })
})
