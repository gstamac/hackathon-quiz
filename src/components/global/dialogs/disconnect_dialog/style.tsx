import { makeStyles, Theme } from '@material-ui/core/styles'

export const useStyles = makeStyles((theme: Theme) => ({
  disconnectQuestion: {
    fontFamily: 'Averta-Bold',
    fontSize: '20px',
    lineHeight: '23px',
    textAlign: 'center',
    padding: '16px 24px',
  },
  disconnectInfo: {
    fontFamily: 'Averta-Regular',
    fontSize: '15px',
    lineHeight: '18px',
    textAlign: 'center',
    padding: '8px 48px 32px 48px',
    color: theme.palette.customColors.lightGrey,
  },
  disconnectButtonWrapper: {
    marginBottom: '24px',
    textAlign: 'center',
  },
  buttonText: {
    fontSize: '16px',
    fontFamily: 'Averta-Bold',
  },
}))
