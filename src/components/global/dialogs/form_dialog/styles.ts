import { makeStyles, Theme } from '@material-ui/core/styles'

export const useStyles = makeStyles((theme: Theme) => ({
  formSubtitle: {
    padding: theme.spacing(2, 0),
    fontSize: '16px',
    lineHeight: '18px',
    fontFamily: 'Averta-Semibold',
  },

  formTitle: {
    paddingBottom: theme.spacing(4),
    fontSize: '30px',
    lineHeight: '34px',
    fontFamily: 'Averta-Semibold',
  },

  formDescription: {
    padding: '16px 0 24px',
    fontSize: '11px',
    lineHeight: '13px',
    color: theme.palette.customColors.lightGrey,
    textAlign: 'center',
  },

  formContainer: {
    display: 'flex',
    flexDirection: 'column',
    flex: 1,
    height: '100%',
    justifyContent: 'space-between',
  },

  formContent: {
    display: 'flex',
    flexDirection: 'column',
  },

  submitButton: {
    alignSelf: 'center',
  },

  dialogActions: {
    display: 'flex',
    justifyContent: 'center',
    flexDirection: 'column',
    paddingBottom: '0',
    paddingTop: theme.spacing(4),

    '& .MuiButton-contained': {
      width: '240px',

      '& .MuiButton-label': {
        fontFamily: 'Averta-Bold',
        fontSize: '16px',
      },

      '&.Mui-disabled': {
        opacity: 0.5,
      },

      '& + .MuiButton-contained': {
        marginTop: '14px',
        border: 'none',
        color: theme.palette.customColors.lightBlack,
        backgroundColor: theme.palette.customColors.washedGrey,

        '&.Mui-disabled': {
          color: theme.palette.customColors.lightBlack,
          backgroundColor: theme.palette.customColors.washedGrey,
        },

        '&:hover': {
          color: theme.palette.customColors.lightBlack,
          backgroundColor: `${theme.palette.customColors.washedGrey} !important`,
        },
      },
    },
  },

  formDialogDrawer: {
    top: 'unset !important',

    '& .MuiDialog-paper': {
      borderRadius: '12px 12px 0 0',
      top: 'unset !important',

      '& .MuiDialogContent-root': {
        paddingTop: 'unset',
      },
    },
  },
}))
