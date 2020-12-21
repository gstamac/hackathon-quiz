import { createMuiTheme, Theme } from '@material-ui/core/styles'
import { globaliDTheme } from 'globalid-react-ui'

export const whiteColor: string = '#FFFFFF'
export const primaryColorFocus: string = '#0D51FF'
export const primaryColorDisabled: string = '#86a8ff'
export const secondaryColor: string = '#B21B2E'

const internalTheme = createMuiTheme({
  breakpoints: {
    values: {
      xs: 0,
      sm: 600,
      md: 960,
      lg: 1280,
      xl: 1920,
    },
  },

  palette: {
    customColors: {
      backgroundBlue: '#0D2460',
      electricBlue: '#0D51FF',
      disabledElectricBlue: '#86a8ff',
      hoveredElectricBlue: '#0241E0',
      turquoiseBlue: '#17C3C1',
      skyBlue: '#e7eeff',
      grey: '#2d2e30',
      darkerGrey: '#3C3E47',
      darkGrey: '#303031',
      washedGrey: '#E5E5E5',
      lightGray: '#E2E2E2',
      brightGray: '#EFEFEF',
      midGray: '#7E7E80',
      lightBlueBackground: '#EEF3FF',
      lightSteelBlue: '#CCE5FF',
      backgroundLightGrey: '#F9F9F9',
      backgroundGrey: '#f2f2f2',
      transparentLightBlue: 'rgba(113, 81, 255, 0.5)',
      transparentLightGray: 'rgba(255, 255, 255, 0.08)',
      shadowGrey: 'rgba(0, 0, 0, 0.05)',
      shadowDarkGrey: 'rgba(0, 0, 0, 0.15)',
      transparentBlack: 'rgb(0, 0, 0, 0.2)',
      transparentWhite: 'rgb(255, 255, 255, 0.2)',
      skeletonLightGray: '#F5F5F5',
      mischkaGrey: '#AFB0B2',
      skeletonDarkGray: '#E3E3E3',
      white: '#FFFFFF',
      black: '#000000',
      red: '#FF2741',
      darkRed: '#B21B2E',
      almostBlack: '#1C1C1C',
      gainsboro: '#DDDDDD',
      washedBlack: '#2D2E30',
      lightBlack: '#3E4042',
      almostCometGrey: '#646466',
      transparentAlmostCometGrey:  '#64646680',
      whiteSmoke: '#F7F7F7',
    },
  },

  overrides: {
    MuiButton: {
      root: {
        fontSize: '18px',
        fontWeight: 500,
        borderRadius: '22px',
        padding: '7px 25px',
        height: '43px',
        textTransform: 'none',
        maxWidth: '240px',

        '&$disabled': {
          backgroundColor: primaryColorDisabled,
          color: whiteColor,
          opacity: 1,
        },
      },

      contained: {
        backgroundColor: primaryColorFocus,
        '&:hover': {
          backgroundColor: primaryColorFocus,
        },
        '&.MuiButton-containedSecondary': {
          backgroundColor: secondaryColor,

          '&:hover': {
            backgroundColor: secondaryColor,
          },
        },
        '&.MuiButton-containedSecondary.Mui-disabled': {
          backgroundColor: `${secondaryColor} !important`,
          '&:hover': {
            backgroundColor: secondaryColor,
          },
        },
        '@media (hover: none)': {
          '&:hover': {
            backgroundColor: `${primaryColorFocus} !important`,
          },
        },
        color: whiteColor,
        '&$disabled': {
          backgroundColor: primaryColorDisabled,
          opacity: 1,
          color: whiteColor,
        },
      },
    },
  },
})

export const mainTheme: Theme = {
  ...globaliDTheme,
  palette: {
    ...globaliDTheme.palette,
    ...internalTheme.palette,
  },
  breakpoints: {
    ...globaliDTheme.breakpoints,
    ...internalTheme.breakpoints,
  },
  overrides: {
    ...globaliDTheme.overrides,
    ...internalTheme.overrides,
  },
}
