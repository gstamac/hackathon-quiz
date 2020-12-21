import { makeStyles, Theme } from '@material-ui/core'

export const useStyles = makeStyles((theme: Theme) => ({
  channelsWrapper: {
    height: '100vh',
    width: '375px',
    borderRadius: 0.5,
    [theme.breakpoints.down('sm')]: {
      width: '100%',
    },
    borderRight: `1px solid ${theme.palette.customColors.backgroundGrey}`,
    position: 'relative',
  },

  landingPages: {
    paddingTop: theme.spacing(9),
  },

  messagesPage: {
    display: 'flex',
  },

  fullWidth: {
    display: 'flex',
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'flex-start',
  },

  messageContentLayout: {
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
  },

  headerWrapper: {
    display: 'flex',
    flexDirection: 'row',
    position: 'relative',
  },

  actionButtonWrapper: {
    height: '44px',
    width: '44px',
    zIndex: 1101,
    position: 'absolute',
    right: '25px',
    top: '20px',
  },

  actionButton: {
    height: '44px',
    width: '44px',
    zIndex: 1101,
    color: theme.palette.customColors.white,
    backgroundColor: theme.palette.customColors.electricBlue,
    '&:hover': {
      backgroundColor: theme.palette.customColors.hoveredElectricBlue,
    },
    '&:disabled': {
      backgroundColor: theme.palette.customColors.electricBlue,
      opacity:'0.5',
      color: theme.palette.customColors.white,
    },
    '& .MuiIconButton-label': {
      height: '20px',
    },
  },

  tooltipStyle: {
    backgroundColor: theme.palette.customColors.lightBlueBackground,
    zIndex: 9000,
    fontFamily: 'Averta-Regular',
    fontSize: '12px',
    lineHeight: '14px',
    textAlign: 'center',
    color: theme.palette.common.black,
    padding: theme.spacing(1.5, 2),
    maxWidth: '175px',

    '& span.MuiTooltip-arrow': {
      color: theme.palette.customColors.lightBlueBackground,
      height: '1.5em',
      width: '2em',
    },

    '&.MuiTooltip-popperArrow span.MuiTooltip-arrow': {
      marginTop: '-1.2em',
    },
  },

  tooltipPopperArrow: {
    '&[x-placement*="bottom"] span.MuiTooltip-arrow': {
      marginTop: '-1.2em',
    },
  },

  removeButton: {
    height: '44px',
    width: '44px',
    zIndex: 1101,
    position: 'absolute',
    right: '25px',
    top: '20px',
    color: theme.palette.customColors.midGray,
    backgroundColor: theme.palette.customColors.brightGray,
    '&:hover': {
      backgroundColor: theme.palette.customColors.washedGrey,
    },
    '& .MuiIconButton-label': {
      height: '20px',
    },
  },

  doneButton: {
    width: '240px',
    position: 'absolute',
    bottom: '30px',
    right: '67px',
  },

  messageComponentWrapper: {
    paddingTop: theme.spacing(1),
    paddingRight: theme.spacing(3),
    paddingBottom: theme.spacing(1),
    paddingLeft: theme.spacing(3),
    borderRadius: 0.5,
    borderTop: `1px solid ${theme.palette.customColors.backgroundGrey}`,
    marginTop: theme.spacing(1),
  },

  messageInput: {
    border: 0,
    fontFamily: 'Averta-Regular',
    fontSize: '15px',
    lineHeight: '18px',
    flexGrow: 1,
    caretColor: theme.palette.customColors.electricBlue,
  },

  messageInputPlaceholder: {
    '&::placeholder': {
      color: theme.palette.customColors.black,
    },
  },

  messageSendIcon: {
    marginLeft: theme.spacing(1.25),
    alignSelf: 'flex-end',
    cursor: 'pointer',
  },

  messageInputContainer: {
    borderRadius: '25px',
    background: theme.palette.customColors.brightGray,
    display: 'flex',
    flexDirection: 'row',
    paddingTop: theme.spacing(0.75),
    paddingRight: theme.spacing(0.5),
    paddingBottom: theme.spacing(0),
    paddingLeft: theme.spacing(2),
  },

  backToGroupsWrapper: {
    margin: theme.spacing(2, 1, 1),
    display: 'flex',
    flexDirection: 'row',
    cursor: 'pointer',
  },

  backToGroupsButton: {
    marginRight: theme.spacing(1),
  },

  backToGroupsText: {
    fontFamily: 'Averta-Semibold',
    fontSize: '16px',
    lineHeight: '30px',
  },

  backToGroupsDivider: {
    width: '95%',
    paddingLeft: theme.spacing(2),
    opacity: 0.1,
  },
})
)
