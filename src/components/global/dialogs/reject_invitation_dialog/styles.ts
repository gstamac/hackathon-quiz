import { makeStyles, Theme } from '@material-ui/core'

export const useStyles = makeStyles((theme: Theme) => ({
  rejectInvitationDialogTitle: {
    fontFamily: 'Averta-Bold',
    fontSize: '20px',
    lineHeight: '23px',
    textAlign: 'center',
    alignSelf: 'center',
  },

  rejectInvitationDialogDescription: {
    width: '95%',
    fontSize: '15px',
    lineHeight: '18px',
    textAlign: 'center',
    color: theme.palette.customColors.midGray,
    marginTop: theme.spacing(3),
  },
}))
