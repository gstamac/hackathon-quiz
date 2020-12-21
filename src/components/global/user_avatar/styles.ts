import { makeStyles, Theme } from '@material-ui/core/styles'

export const useStyles = makeStyles((theme: Theme) => ({
  userAvatar: {
    width: 54,
    height: 54,
    position: 'relative',
    '& span': {
      fontFamily: 'Averta-Bold',
      fontSize: '16px',
      lineHeight: '18px',
      textAlign: 'center',
      letterSpacing: '0.348872px',
      color: theme.palette.customColors.white,
      zIndex: 1,
    },
  },
  userAvatarBackground: {
    position: 'absolute',
  },
  userAvatarImage: {
    overflow: 'visible',
    width: '54px',
    height: '54px',
  },
}))
