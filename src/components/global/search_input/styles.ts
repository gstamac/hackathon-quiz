import { makeStyles, Theme } from '@material-ui/core/styles'

export const useStyles = makeStyles((theme: Theme) => ({
  searchWrapper: {
    width: '100%',
  },
  searchItems: {
    width: '100%',
    height: theme.spacing(5.5),
    position: 'relative',
    paddingLeft: theme.spacing(2),
    paddingRight: theme.spacing(2),
  },
  searchInput: {
    background: theme.palette.customColors.brightGray,
    mixBlendMode: 'normal',
    borderRadius: theme.spacing(3),
    width: '100%',
    height: '44px',
    paddingTop: theme.spacing(1),
    paddingBottom: theme.spacing(1),
    paddingLeft: theme.spacing(1),
    paddingRight: theme.spacing(1),
    '& .MuiInputBase-input': {
      padding: '13px 8px 12px 0px',
      fontFamily: 'Averta-Regular',
      fontSize: '15px',
      lineHeight: '18px',
    },
  },
  searchIcon: {
    paddingLeft: theme.spacing(1),
    paddingRight: '4px',
    cursor: 'pointer',
  },
  removeIcon: {
    width: 22,
    height: 22,
    cursor: 'pointer',
  },
}))
