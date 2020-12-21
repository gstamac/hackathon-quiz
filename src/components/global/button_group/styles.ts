import { makeStyles, Theme } from '@material-ui/core'

export const useStyles = makeStyles((theme: Theme) => ({
  buttonGroupWrapper: {
    backgroundColor: theme.palette.customColors.backgroundGrey,
    display: 'flex',
    padding: theme.spacing(0.5),
    margin: theme.spacing(2),
    marginTop: theme.spacing(1),
    justifyContent: 'space-between',
    flexDirection: 'row',
    borderRadius: '4px',
  },

  buttonText: {
    fontFamily: 'Averta-Semibold',
    fontSize: '12px',
    lineHeight: '16px',
  },

  counterText: {
    color: theme.palette.customColors.electricBlue,
    marginLeft: theme.spacing(0.3),
  },

  buttonWrapperNonActive: {
    '&.MuiButton-root': {
      backgroundColor: theme.palette.customColors.backgroundGrey,
      borderRadius: '3px',
      flexGrow: 1,
      maxWidth: 'unset',
    },
  },

  buttonWrapperActive: {
    '&.MuiButton-root': {
      backgroundColor: theme.palette.customColors.white,
      borderRadius: '3px',
      flexGrow: 1,
      maxWidth: 'unset',

      '&:hover': {
        backgroundColor: theme.palette.customColors.white,
      },
    },
  },
})
)
