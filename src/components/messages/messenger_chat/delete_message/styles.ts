import { makeStyles, Theme } from '@material-ui/core'

export const useStyles = makeStyles((theme: Theme) => ({
  dialogWrapper: {
    width: '327px',
    height: '160px',
    display: 'flex',
    flexDirection: 'column',
    textAlign: 'center',
    justifyContent: 'space-between',
  },

  deleteMessageTitle: {
    fontFamily: 'Averta-Bold',
    fontSize: '20px',
  },

  deleteMessageDescription: {
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
