import * as createPalette from '@material-ui/core/styles/createPalette'

declare module '@material-ui/core/styles/createPalette' {
  interface CustomColorsOptions {
    backgroundBlue?: string
    electricBlue?: string
    disabledElectricBlue?: string
    hoveredElectricBlue?: string
    turquoiseBlue?: string
    skyBlue?: string
    washedGrey?: string
    grey?: string
    lightGray?: string
    darkGrey?: string
    darkerGrey?: string
    lightGrey?: string
    lightSteelBlue?: string
    brightGray?: string
    midGray: string
    lightBlueBackground?: string
    backgroundGrey?: string
    backgroundLightGrey?: string
    transparentLightBlue?: string
    transparentLightGray?: string
    transparentBlack?: string
    transparentWhite?: string
    skeletonLightGray?: string
    skeletonDarkGray?: string
    white?: string
    shadowDarkGrey?: string
    black?: string
    almostBlack?: string
    shadowGrey?: string
    red?: string
    darkRed?: string
    gainsboro?: string
    washedBlack?: string
    lightBlack?: string
    almostCometGrey?: string
    transparentAlmostCometGrey?: string
    whiteSmoke?: string
    mischkaGrey?: string
  }
  interface CustomColors {
    backgroundBlue: string
    electricBlue: string
    disabledElectricBlue: string
    hoveredElectricBlue: string
    turquoiseBlue: string
    skyBlue: string
    grey: string
    darkGrey: string
    lightGray: string
    darkerGrey: string
    washedGrey: string
    lightGrey: string
    lightSteelBlue: string
    brightGray: string
    midGray: string
    lightBlueBackground: string
    backgroundGrey: string
    backgroundLightGrey: string
    transparentLightBlue: string
    transparentLightGray: string
    transparentBlack: string
    transparentWhite: string
    skeletonLightGray: string
    skeletonDarkGray: string
    white: string
    black: string
    almostBlack: string
    shadowDarkGrey: string
    shadowGrey: string
    red: string
    darkRed: string
    gainsboro: string
    washedBlack: string
    lightBlack: string
    almostCometGrey: string
    transparentAlmostCometGrey: string
    whiteSmoke?: string
    mischkaGrey: string
  }
  interface PaletteOptions {
    customColors?: createPalette.CustomColorsOptions
  }
  interface Palette {
    customColors: createPalette.CustomColors
  }
}

export { mainTheme } from './main_theme'
