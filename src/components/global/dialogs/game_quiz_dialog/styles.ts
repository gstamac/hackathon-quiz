import { createStyles, makeStyles, Theme } from '@material-ui/core/styles'

interface Props {
  selected?: boolean
}

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
    quizQuestionList: {
      display: 'flex',
      flexDirection: 'row',
      overflow: 'auto'

    },
    quizQuestionMarker: {
      margin: theme.spacing(2),
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      height: '24px',
      width: '24px',
      borderRadius: '50%',
      backgroundColor: theme.palette.customColors.electricBlue,
      color: ({selected}: Props) => selected ? theme.palette.customColors.electricBlue : theme.palette.common.white,
      border: `1px solid ${theme.palette.customColors.electricBlue}`,
    },
    quizQuestionAdd: {
      margin: theme.spacing(2),
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      height: '24px',
      width: '24px',
      borderRadius: '50%',
      border: `1px solid ${theme.palette.customColors.electricBlue}`,
    },
  }),
)
