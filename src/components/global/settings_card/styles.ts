import { makeStyles, Theme } from '@material-ui/core'

export const useStyles = makeStyles((theme: Theme) => ({
  settingsCard: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderBottom: `1px solid ${theme.palette.customColors.lightGray}`,
    minHeight: '70px',
    padding: theme.spacing(2, 0),
  },

  settingsCardInfo: {
    display: 'flex',
    flexDirection: 'column',
    alignSelf: 'center',
    width: '80%',
  },

  settingsCardName: {
    fontFamily: 'Averta-Bold',
    fontSize: 16,
    color: theme.palette.customColors.grey,
    paddingBottom: '4px',
    textOverflow: 'ellipsis',
    overflow: 'hidden',
    whiteSpace: 'nowrap',
  },

  settingsCardIcon: {
    alignSelf: 'center',
    paddingRight: theme.spacing(1),
    cursor: 'pointer',
    height: '20px',
  },

  settingsCardDescription: {
    textOverflow: 'ellipsis',
    overflow: 'hidden',
    whiteSpace: 'nowrap',
    fontSize: '11px',
    lineHeight: '13px',
    paddingTop: '4px',
  },
}))
