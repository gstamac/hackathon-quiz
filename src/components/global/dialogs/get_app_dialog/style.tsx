import { makeStyles, Theme } from '@material-ui/core/styles'

export const useStyles = makeStyles((theme: Theme) => ({
  getAppHeader: {
    fontFamily: 'Averta-Bold',
    fontSize: '30px',
    lineHeight: '34px',
    textAlign: !theme.breakpoints ? 'center' : 'left',
    letterSpacing: '0.654135px',
    color: theme.palette.customColors.grey,
    paddingTop: '28px',
    paddingLeft: '25px',
    paddingRight: '25px',

    [theme.breakpoints.down('xs')]: {
      paddingTop: '16px',
      textAlign: 'left',
    },
  },
  getAppSubHeader: {
    fontFamily: 'Averta-Regular',
    fontSize: '15px',
    lineHeight: '18px',
    textAlign: 'center',
    padding: '8px 27px 13px 27px',

    [theme.breakpoints.down('xs')]: {
      padding: '10px 0 47px 0',
      textAlign: 'left',
    },
  },
  appQrcode: {
    display: 'flex',
    justifyContent: 'center',
  },
  getAppInstruction: {
    fontFamily: 'Averta-Light',
    fontSize: '14px',
    lineHeight: '18px',
    padding: '16px 73px',
    textAlign: 'center',
    letterSpacing: '0.1px',
    color: theme.palette.customColors.darkGrey,
    '& :first-child': {
      paddingBottom: '49px',
    },
  },
  header: {
    fontFamily: 'Averta-Bold',
    fontSize: '16px',
    lineGeight: '18px',
    letterSpacing: '0.348872px',
    color: theme.palette.customColors.grey,
    paddingTop: '30px',
  },
  infoItem: {
    display: 'flex',
    alignItems: 'center',
    fontFamily: 'Averta-Semibold',
    fontSize: '20px',
    lineHeight: '24px',
    letterSpacing: '0.1px',
    color: theme.palette.customColors.darkGrey,
    '& img': {
      marginRight: theme.spacing(3),
    },
    '& span': {
      marginRight: theme.spacing(7),
    },
  },
  verticalLine: {
    height: '32px',
    marginLeft: '15px',
    borderLeft: `2px solid ${theme.palette.customColors.lightGray}`,
  },
  phoneIcon: {
    margin: '8px 0 22px 0',
    textAlign: 'center',
  },
}))
