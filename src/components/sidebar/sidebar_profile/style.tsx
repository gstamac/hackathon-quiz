import { makeStyles, Theme } from '@material-ui/core/styles'

export const useStyles = makeStyles((theme: Theme) => ({
  qrContainer: {
    marginTop: '15px',
  },
  webProfile: {
    display: 'flex',
    justifyContent: 'center',
    borderRadius: '20px',
    textAlign: 'center',
    '&:hover': {
      background: theme.palette.customColors.transparentLightGray,
      cursor: 'pointer',
    },
  },

  userInfo: {
    paddingBottom: '15px',
    width: '100%',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
  },

  ellipsisOverflow: {
    width: '100%',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
  },
  activeProfilePage: {
    border: `2px solid ${theme.palette.customColors.mischkaGrey}`,
    cursor: 'pointer',
  },
  profilePic: {
    height: '54px',
    width: '54px',
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column',
    marginTop: '14px',
    borderRadius: '50%',
    '&:hover': {
      border: `2px solid ${theme.palette.customColors.mischkaGrey}`,
      cursor: 'pointer',
    },
  },

  ringIcon: {
    height: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    textAlign: 'center',
  },
  mobileProfile: {
    display: 'flex',
    fontFamily: 'Averta-Semibold',
    paddingBottom: '32px',
    marginTop: '25px',
    flexWrap: 'wrap',
  },
  mobileProfilePic: {
    marginRight: '20px',
    width: '90px',
    height: '90px',
    background: theme.palette.customColors.backgroundGrey,
    borderRadius: '50%',
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
    display: 'inline-flex',
  },
  mobileUserInfo: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    marginTop: '25px',
  },
  viewProfile: {
    fontFamily: 'Averta-Semibold',
    fontSize: '12px',
    lineHeight: '14px',
    marginTop: '5px',
    color: theme.palette.customColors.electricBlue,
    cursor: 'pointer',
  },
  gidName: {
    fontFamily: 'Averta-Bold',
    fontSize: '22px',
    lineHeight: '26px',
    letterSpacing: '0.654135px',
    color: theme.palette.customColors.white,
    [theme.breakpoints.down('sm')]: {
      fontSize: '20px',
      lineHeight: '23px',
      letterSpacing: '0.1px',
      color: theme.palette.customColors.darkGrey,
    },
  },
  name: {
    fontFamily: 'Averta-Semibold',
    fontSize: '12px',
    lineHeight: '16px',
    color: theme.palette.customColors.white,
    opacity: 0.5,
    letterSpacing: '0.305263px',
    wordWrap: 'break-word',
    maxWidth: 'calc(100vw - 200px)',
    whiteSpace: 'normal',
    [theme.breakpoints.down('sm')]: {
      fontFamily: 'Averta-Regular',
      fontSize: '11px',
      lineHeight: '13px',
      marginTop: '5px',
      color: theme.palette.customColors.grey,
    },
  },

  profileIconContainer: {
    borderRadius: '50%',
    overflow: 'hidden',
    height: '48px',
    width: '48px',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },

  mobileProfileIcon: {
    height: '80px',
  },

  profileIcon: {
    height: '48px',
  },

  skeletonRect: {
    height: '48px',
    width: '178px',
    margin: 'auto',
    marginBottom: '15px',
  },

  mobileSkeletonRect: {
    height: '48px',
    margin: 'auto',
    marginBottom: '15px',
  },

  profileIconWrapper: {
    height: '100%',
    width: '100%',
  },

  profileAvatar: {
    width: '100%',
    height: '100%',
  },
}))
