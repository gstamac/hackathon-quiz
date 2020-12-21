import { makeStyles, Theme } from '@material-ui/core'

export const useStyles = makeStyles((theme: Theme) => ({
  messagesContainer: {
    flexGrow: 1,

    '&> div > div': {
      padding: theme.spacing(2, 0),
      margin: theme.spacing(0, 3),
    },

    '&> div > div.system': {
      paddingTop: theme.spacing(3),
    },

    '&> div > div.system + div.system': {
      paddingTop: theme.spacing(1),
    },
  },
  scrollContainer: {
    flexGrow: 1,
    overflowY: 'auto',
  },
  chatContainer: {
    display: 'flex',
    flexGrow: 1,
    flexDirection: 'column',
    height: '100vh',
    width: 'min-content',
    position: 'relative',
  },
  centerLoader: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100%',
  },
  messageContentLayout: {
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
  },

  messageComponentWrapper: {
    paddingTop: theme.spacing(1),
    paddingRight: theme.spacing(3),
    paddingBottom: theme.spacing(1),
    paddingLeft: theme.spacing(3),
    borderRadius: 0.5,
    borderTop: `1px solid ${theme.palette.customColors.backgroundGrey}`,
    position: 'relative',
    zIndex: 4,
    backgroundColor: theme.palette.customColors.white,
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

  moveChatText: {
    '&> div.system > div': {
      maxWidth: '525px',
    },
  },

  moveChatDivider: {
    maxWidth: '287px',
    margin: '0 auto',
  },
}))
