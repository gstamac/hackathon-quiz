import { makeStyles, Theme } from '@material-ui/core'

export const useStyles = makeStyles((theme: Theme) => ({
  itemWrapper: {
    marginRight: theme.spacing(1.5),
    textAlign: 'center',
    position: 'relative',
  },
  labelText: {
    fontFamily: 'Averta-Semibold',
    fontSize: '12px',
    color: theme.palette.customColors.black,
    width: '68px',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
  },
  removeIcon: {
    cursor: 'pointer',
    position: 'absolute',
    backgroundColor: theme.palette.customColors.white,
    borderRadius: '12px',
    width: '24px',
    height: '24px',
    left: '32px',
    top: '-5px',
    boxShadow: `0px 11px 18px ${theme.palette.customColors.shadowDarkGrey}`,
  },
}))
