import React, { PropsWithChildren } from 'react'
import { GlobalStyles, lightTheme, darkTheme } from 'amazon-chime-sdk-component-library-react'
import { ThemeProvider } from 'styled-components'
import { useAppState } from './providers/app_state_provider'
import { AppStateValue } from './providers/interfaces'
import * as Enums from './enums'

export const Theme: React.FC<PropsWithChildren<{}>> = ({ children }) => {
  const { theme }: AppStateValue = useAppState()

  return (
    <ThemeProvider theme={theme === Enums.Theme.LIGHT ? lightTheme : darkTheme}>
      <GlobalStyles />
      {children}
    </ThemeProvider>
  )
}
