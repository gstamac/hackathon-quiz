import { makeStyles, Theme } from '@material-ui/core/styles'

export const useStyles = makeStyles((theme: Theme) => ({
  tooltip: {
    padding: theme.spacing(1),
    borderRadius: '6px',
    color: theme.palette.customColors.black,
    background: theme.palette.customColors.lightBlueBackground,
    textAlign: 'center',
    width: '174px',
  },
  tooltipArrow: {
    color: theme.palette.customColors.lightBlueBackground,
  },
  tooltipHeading: {
    paddingBottom: '3px',
    fontFamily: 'Averta-Bold',
    fontSize: '14px',
    lineHeight: '16px',
    color: theme.palette.customColors.black,
    background: theme.palette.customColors.lightBlueBackground,
  },
  tooltipDescription: {
    paddingBottom: '9px',
    fontFamily: 'Averta-Regular',
    fontSize: '12px',
    lineHeight: '13px',
  },
}))
