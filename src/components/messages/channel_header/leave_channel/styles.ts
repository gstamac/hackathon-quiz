import { makeStyles, Theme } from '@material-ui/core'

export const useStyles = makeStyles((theme: Theme) => ({
  dialogWrapper: {
    width: '327px',
    height: '182px',
    display: 'flex',
    flexDirection: 'column',
    textAlign: 'center',
    justifyContent: 'space-between',
  },

  leaveChannelTitle: {
    fontFamily: 'Averta-Bold',
    fontSize: '20px',
  },

  leaveChannelDescription: {
    fontFamily: 'Averta-Regular',
    fontSize: '15px',
    color: theme.palette.customColors.midGray,
    width: '280px',
    placeSelf: 'center',
  },

  buttonText: {
    fontFamily: 'Averta-Bold',
    fontSize: '16px',
  },
})
)
