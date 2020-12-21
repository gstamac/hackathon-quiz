import React from 'react'
import ReactDOM from 'react-dom'

import * as serviceWorker from './serviceWorker'

import { init as initGROUP } from '@globalid/group-service-sdk'
import { init as initINS } from '@globalid/identity-namespace-service-sdk'
import { init as initKEY } from '@globalid/keystore-service-sdk'
import { init as initMSG } from '@globalid/messaging-service-sdk'
import { App } from './app'
import { API_BASE_URL } from './constants'
import { initUnauthorizedResponseInterceptor } from './utils/auth_utils'

initUnauthorizedResponseInterceptor()

initINS(API_BASE_URL)
initMSG(API_BASE_URL)
initKEY(API_BASE_URL)
initGROUP(API_BASE_URL)

ReactDOM.render(<App />, document.querySelector('#root'))

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister()
