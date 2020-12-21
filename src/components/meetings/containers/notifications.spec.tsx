import React from 'react'
import { render, act, RenderResult, cleanup } from '../../../../tests/test_utils'
import { Notifications } from './notifications'

jest.mock('amazon-chime-sdk-component-library-react', () => ({
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
  ...jest.requireActual('amazon-chime-sdk-component-library-react') as {},
  NotificationGroup: jest.fn().mockReturnValue(<div data-testid='NotificationGroup'></div>),
  useNotificationState: jest.fn()
    .mockReturnValueOnce({ notifications: [{}] })
    .mockReturnValue({ notifications: [] }),
}))

describe('Notifications tests', () => {
  let renderResult: RenderResult

  afterEach(() => {
    cleanup()
  })

  const renderNotifications = (): void => {
    act(() => {
      renderResult = render(<Notifications/>)
    })
  }

  it('should render NotificationGroup when provided notifications array is not empty', () => {
    renderNotifications()

    const notificationGroup: Element = renderResult.getByTestId('NotificationGroup')

    expect(notificationGroup).toBeDefined()
  })

  it('should return null when provided notifications array is empty', () => {
    renderNotifications()

    expect(renderResult.container.firstChild).toBeNull()
  })

})
