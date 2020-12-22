import { createStyles, makeStyles, Theme } from '@material-ui/core/styles'

export const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    option: {
      marginLeft: theme.spacing(2),
      marginTop: theme.spacing(3),
    },
    quiz: {
      width: '100%',
      '& .MuiPaper-root': {
        maxWidth: 500,
        '& .MuiDialogContent-root': {
          padding: '8px 24px',
        },
      },
    },
    question: {
      marginTop: theme.spacing(4),
    },
    manageButtons: {
      marginTop: '16px',
      display: 'flex',
      flexDirection: 'row',
      justifyContent: 'space-evenly',

      '& .MuiButton-outlinedSecondary': {
        color: theme.palette.customColors.darkRed,
        borderColor: theme.palette.customColors.darkRed,
        backgroundColor: theme.palette.customColors.white,

        '&.Mui-disabled': {
          backgroundColor: theme.palette.customColors.white,
          color: '#d35f6e',
          borderColor: '#d35f6e',
        }
      },

      '& .MuiButton-outlinedPrimary': {
        color: theme.palette.customColors.electricBlue,
        borderColor: theme.palette.customColors.electricBlue,
        backgroundColor: theme.palette.customColors.white,
      }
    }
  }),
)
