import { makeStyles, Theme } from '@material-ui/core'

export const useStyles = makeStyles((theme: Theme) => ({
  dialogPaper: {
    borderRadius: 0,
    backgroundColor: 'transparent',
  },
  imageDialog: {
    padding: 0,
    margin: 0,
  },
  imageTitle: {
    fontFamily: 'Averta-Semibold',
    fontSize: '14px',
    lineHeight: '16px',
    textAlign: 'center',
    color: theme.palette.customColors.white,
  },
  imageHeader: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    width: '100%',
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: '30px',
  },
  icon: {
    cursor: 'pointer',
    position: 'absolute',
    right: '30px',
  },
  imageContainer: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    width: '100vw',
    height: '100vh',
  },
  image: {
    opacity: 0.5,
    width: 'auto',
    height: 'auto',
    maxWidth: 'calc(100vw - 156px)',
    maxHeight: 'calc(100vh - 156px)',
  },
  imageBackground: {
    position: 'relative',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.palette.customColors.white,
    maxWidth: '100vw',
    maxHeight: 'calc(100vh - 156px)',
    boxShadow: `0px 5px 10px ${theme.palette.customColors.shadowGrey}`,
  },
  noOpacity: {
    opacity: 1,
    display: 'flex',
  },
  displayNone: {
    display: 'none',
  },
  imageThumbnail: {
    width: 'auto',
    height: 'auto',
    maxWidth: 'calc(100vw - 156px)',
    maxHeight: 'calc(100vh - 156px)',
  },
  imageLoader: {
    position: 'absolute',
    width: '100%',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
})
)
