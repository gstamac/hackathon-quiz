import { makeStyles, Theme } from '@material-ui/core/styles'

export const useGlobalStyles = makeStyles((theme: Theme) => ({
  iconWrapper: {
    width: '44px',
    height: '44px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    '&:hover': {
      backgroundColor: theme.palette.customColors.brightGray,
    },
  },
  disabled: {
    opacity: 0.5,
  },
  backdrop: {
    zIndex: theme.zIndex.drawer + 1,
    color: theme.palette.customColors.white,
  },
  backdropSpinner: {
    filter: 'brightness(0) invert(1)',
  },
  backdropText: {
    paddingRight: theme.spacing(1),
  },
}))
