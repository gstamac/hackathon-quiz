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
  }),
)
