import React from 'react'
import { Router } from 'react-router-dom'
import { FullImageHandler } from './components/global/dialogs/full_image_dialog'
import { Routes } from './routes'
import { mainTheme } from './assets/themes'
import { MuiThemeProvider, StylesProvider } from '@material-ui/core/styles'
import { Provider } from 'react-redux'
import { history, store } from './store'
import { CssBaseline } from '@material-ui/core'
import { ToastHandler } from 'globalid-react-ui'
import './index.scss'
import { Initialize } from './components/initialize/initialize'
import { GameQuizDialog } from './components/global/dialogs/game_quiz_dialog/game_quiz_dialog'

export const App: React.FC = () => (
  <Provider store={store}>
    <MuiThemeProvider theme={mainTheme}>
      <StylesProvider injectFirst>
        <Router history={history}>
          <CssBaseline />
          <ToastHandler />
          <FullImageHandler />
          <Routes />
          <Initialize />
          <GameQuizDialog />
        </Router>
      </StylesProvider>
    </MuiThemeProvider>
  </Provider>
)
