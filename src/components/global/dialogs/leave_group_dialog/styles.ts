import { makeStyles, Theme } from '@material-ui/core'

export const useStyles = makeStyles((theme: Theme) => ({
  leaveGroupDialogDescription: {
    color: theme.palette.customColors.almostBlack,
    fontFamily: 'Averta-Bold',
    fontSize: '20px',
    textAlign: 'center',
    maxWidth: '280px',
    margin: 'auto',
  },
}))
