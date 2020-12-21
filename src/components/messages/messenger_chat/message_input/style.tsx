import { makeStyles, Theme } from '@material-ui/core'

interface StyleProps {
  inputLength: number
  disabled: boolean
}

export const useStyles =
  makeStyles((theme: Theme) => ({
    messageInput: {
      border: 0,
      flexGrow: 1,
      textAlign: 'center',
      caretColor: theme.palette.customColors.electricBlue,
      '& .MuiInputBase-root':{
        fontFamily: 'Averta-Regular',
        fontSize: '15px',
        lineHeight: '18px',
      },
      alignSelf: 'center',
      '& .MuiInputBase-multiline': {
        paddingTop: theme.spacing(1),
      },
    },

    messageInputPlaceholder: {
      '&::placeholder': {
        color: theme.palette.customColors.black,
      },
    },

    messageSendIcon: {
      marginLeft: theme.spacing(1.25),
      alignSelf: 'flex-end',
      cursor: (props: StyleProps) => props.disabled ? 'inherit' : 'pointer',
      height: '36px',
      marginBottom: theme.spacing(0.5),
      marginTop: theme.spacing(0.5),
    },

    messageInputContainer: {
      borderRadius: theme.spacing(3),
      background: theme.palette.customColors.brightGray,
      display: 'flex',
      flexDirection: 'row',
      paddingRight: theme.spacing(0.5),
      paddingBottom: theme.spacing(0),
      paddingLeft: theme.spacing(2),
      transition: 'width 0.5s',
      maxWidth: (props: StyleProps) => props.inputLength > 0 ? '100%' : 'calc(100% - 50px)',
      flexGrow: 1,
      '& ::-webkit-scrollbar-thumb': {
        background: theme.palette.customColors.white,
      },
    },

    pickImageWrapper: {
      background: (props: StyleProps) => props.disabled ? theme.palette.customColors.white : theme.palette.customColors.brightGray,
      width: '44px',
      height: '44px',
      padding: theme.spacing(1.2),
      borderRadius: theme.spacing(3),
      '&:hover': {
        cursor: (props: StyleProps) => props.disabled ? 'inherit' : 'pointer',
      },
      position: 'absolute',
      right: '20px',
    },

    messageInputWrapper: {
      display: 'flex',
      flexDirection: 'row',
    },

    imagePlaceholder: {
      background: theme.palette.customColors.white,
      borderRadius: theme.spacing(3),
      height: theme.spacing(3.5),
      paddingRight: theme.spacing(1),
      paddingLeft: theme.spacing(1),
      marginLeft: theme.spacing(-1),
      maxWidth: '28vw',
    },

    imageText: {
      fontFamily: 'Averta-Regular',
      fontSize: '15px',
      color: 'black',
      '&:hover': {
        cursor: 'text',
      },
      maxWidth: '100%',
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      whiteSpace: 'nowrap',
    },

    removeIcon: {
      width: '20px',
      height: '20px',
      marginRight: theme.spacing(1),
      '&:hover': {
        cursor: 'pointer',
      },
    },

    displayNone: {
      display: 'none',
    },
  })
  )
