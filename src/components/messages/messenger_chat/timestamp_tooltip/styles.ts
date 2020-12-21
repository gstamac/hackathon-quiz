import { makeStyles, Theme } from '@material-ui/core'

interface Props {
  showAvatar?: boolean
}

export const useStyles = makeStyles((theme: Theme) => ({

  tooltipStyle: {
    backgroundColor: theme.palette.customColors.lightBlueBackground,
    zIndex: 9000,
    fontFamily: 'Averta-Regular',
    fontSize: '12px',
    lineHeight: '14px',
    textAlign: 'center',
    color: theme.palette.common.black,
    padding: theme.spacing(1.5, 2),
    maxWidth: 'none',

    '&.MuiTooltip-tooltipPlacementTop': {
      marginBottom: '10px',
    },

    '&.MuiTooltip-tooltipPlacementLeft': {
      marginRight: '10px',
      marginLeft: '20px',
      marginTop: ({ showAvatar }: Props) => showAvatar ? '10px' : undefined,
    },

    '& span.MuiTooltip-arrow': {
      color: theme.palette.customColors.lightBlueBackground,
      height: '1.5em',
      width: '2em',
    },

    '&.MuiTooltip-popperArrow span.MuiTooltip-arrow': {
      marginTop: '-1.2em',
    },
  },

  tooltipPopper: {
    zIndex: 3,
  },

  tooltipPopperLeft: {
    left: '0px !important',
  },

  tooltipPopperArrow: {
    '&[x-placement*="top"] span.MuiTooltip-arrow': {
      marginBottom: '-1.15em',
    },
    '&[x-placement*="left"] span.MuiTooltip-arrow': {
      marginTop: '-5px',
      marginRight: '-14px',
      top: 'unset !important',
      height: '2em',
      width: '1.5em',
    },
  },

  arrow: {
    left: 'unset !important',
    right: '4px',
  },
}))
