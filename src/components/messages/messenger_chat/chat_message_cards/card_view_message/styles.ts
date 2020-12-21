import { makeStyles, Theme } from '@material-ui/core'

interface AuthorProps {
  isAuthor: boolean
}

export const useCardViewStyles = makeStyles((theme: Theme) => ({
  cardViewMessageContainer: {
    display: 'flex',
    justifyContent: 'flex-start',
    alignItems: 'flex-end',
  },
  cardViewMessageContent: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
    width: '232px',
    maxWidth: '232px',
    maxHeight: 'max-content',
    boxSizing: 'border-box',
    borderRadius: theme.spacing(2),
    '& > div': {
      width: '100%',
      display: 'flex',
      marginBottom: theme.spacing(1),
    },
    '& > div:last-child': {
      marginBottom: 0,
    },
  },
  cardViewIconWrapper: {
    width: '100%',
    display: 'flex',
    justifyContent: 'flex-end',
    alignItems: 'flex-end',
  },
  cardViewIcon: {
    width: '40px',
    height: '40px',
    border: `1.5px solid ${theme.palette.customColors.brightGray}`,
    boxSizing: 'border-box',
    borderRadius: '50%',
    display: 'flex',
    justifyContent: 'center',
    alignContent: 'center',
    '& img': {
      filter: (props: AuthorProps) => props.isAuthor ? 'brightness(0) invert(1)': undefined,
    },
  },
  primaryButton: {
    width: '100%',
    borderRadius: '22px',
    fontFamily: 'Averta-Semibold',
    justifyContent: 'space-between',
    fontSize: '12px',
    backgroundColor: (props: AuthorProps) => props.isAuthor ? `${theme.palette.customColors.turquoiseBlue}`: undefined,
    '&.MuiButton-contained:hover': {
      backgroundColor: (props: AuthorProps) => props.isAuthor ? `${theme.palette.customColors.turquoiseBlue}`: undefined,
    },
  },
  primaryButtonInProgress: {
    width: '100%',
  },
  secondaryButton: {
    backgroundColor: `${theme.palette.customColors.washedGrey}!important`,
    borderRadius: '22px',
    color: (props: AuthorProps) => props.isAuthor ? undefined : `${theme.palette.customColors.black}`,
    width: '100%',
    fontFamily: 'Averta-Semibold !important',
    fontSize: '12px',
  },
  titleAndSecondaryText: {
    fontFamily: 'Averta-Semibold !important',
    fontSize: '12px',
    lineHeight: '14px',
    color: (props: AuthorProps) => props.isAuthor ? undefined : theme.palette.customColors.washedBlack,
    mixBlendMode: 'normal',
    opacity: 0.75,
    wordBreak: 'break-all',
  },
  primaryText: {
    fontFamily: 'Averta-Bold',
    fontSize: '22px',
    lineHeight: '26px',
    color: (props: AuthorProps) => props.isAuthor ? undefined : theme.palette.customColors.almostBlack,
    wordBreak: 'break-word',
  },
}))

