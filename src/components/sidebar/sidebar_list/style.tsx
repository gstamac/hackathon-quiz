import { makeStyles, Theme } from '@material-ui/core/styles'

export const useStyles = makeStyles((theme: Theme) => ({
  list: {
    padding: '',
    display: 'flex',
    flexDirection: 'column',
    [theme.breakpoints.up('md')]: {
      alignItems: 'center',
    },
    height: '100%',
    '& > div': {
      borderBottom: '',
      paddingTop: '4px',
      [theme.breakpoints.down('sm')]: {
        borderBottom: `1px solid ${theme.palette.customColors.backgroundGrey}`,
      },
      '&:last-of-type ': {
        borderBottom: 'none',
      },
    },
  },
  bottomOptionsWrapper: {
    marginTop: 'auto',
  },
  listItem: {
    width: '64px',
    height: '64px',
    display: 'flex',
    position: 'static',
    paddingBottom: '0px',
    alignItems: 'center',
    fontFamily: 'Averta-Semibold',
    borderRadius: '8px',
    fontSize: '18px',
    lineHeight: '21px',
    color: theme.palette.customColors.almostCometGrey,
    [theme.breakpoints.down('sm')]: {
      fontFamily: 'Averta-Bold',
      fontSize: '16px',
      lineHeight: '20px',
      padding: '13px 16px 13px 6px',
      color: theme.palette.customColors.darkGrey,
      width: '100%',
      height: '100%',
    },
    '& a': {
      width: '100%',
      alignItems: 'center',
      display: 'inherit',
      textDecoration: 'none',
      color: theme.palette.customColors.almostCometGrey,
      [theme.breakpoints.down('sm')]: {
        color: theme.palette.customColors.darkGrey,
      },
    },
    [theme.breakpoints.up('md')]: {
      '&:hover': {
        background: theme.palette.customColors.washedGrey,
        cursor: 'pointer',
        color: theme.palette.customColors.almostBlack,
        '& svg': {
          '& path': {
            fill: theme.palette.customColors.almostBlack,
          },
        },
      },
    },
    '&:focus': {
      outlineWidth: theme.spacing(0),
    },
  },
  activeItem: {
    background: theme.palette.customColors.washedGrey,
    cursor: 'pointer',
    color: theme.palette.customColors.almostBlack,
    '& svg': {
      '& path': {
        fill: theme.palette.customColors.almostBlack,
      },
    },
  },
  getAppActive: {
    background: theme.palette.customColors.transparentLightGray,
    outline: 0,
  },

  quickMenu: {
    marginTop: '-80px !important',
  },
}))
