import { makeStyles, Theme } from '@material-ui/core'

interface TransformProps {
  reversed?: boolean
}

export const useStyles = makeStyles({
  loaderWrapper: {
    paddingTop: 20,
    display: 'flex',
    justifyContent: 'center',
    transform: (props: TransformProps) => props.reversed ?
      'scaleY(-1)' : undefined,
  },
  itemContainer: {
    transform: (props: TransformProps) => props.reversed ?
      'scaleY(-1)' : undefined,
  },
  scrollContainer: {
    flexGrow: 1,
    overflowY: 'auto',
    transform: (props: TransformProps) => props.reversed ?
      'scaleY(-1)' : undefined,

    '& > div > div': {
      position: 'absolute',
      width: 'calc(100% - 48px)',
    },
  },
  topPosition: {
    '& > div > div': {
      position: 'absolute',
      bottom: 0,
      width: 'calc(100% - 48px)',
    },
  },
  message: {
    height: 50,
    overflowY: 'hidden',
  },
})

interface HorizontalStylesProps {
  rightScrollable?: boolean
  leftScrollable?: boolean
}

export const useHorizontalStyles = makeStyles((theme: Theme) => ({
  wrapperContainer: {
    display: 'flex',
    justifyContent: 'center',
    position: 'relative',

    '&:hover > .scrollRightButton > img': {
      visibility: (props: HorizontalStylesProps) => props.rightScrollable
        ? 'visible' : 'hidden',
      opacity: (props: HorizontalStylesProps) => props.rightScrollable
        ? 1 : 0,
      transition: 'visibility 0s, opacity 0.5s linear',
    },

    '&:hover > .scrollLeftButton > img': {
      visibility: (props: HorizontalStylesProps) => props.leftScrollable
        ? 'visible' : 'hidden',
      opacity: (props: HorizontalStylesProps) => props.leftScrollable
        ? 1 : 0,
      transition: 'visibility 0s, opacity 0.5s linear',
    },
  },

  scrollContainer: {
    display: 'inline-flex',
    flexDirection: 'row',
    flexGrow: 1,
    overflowX: 'scroll',
    overflowY: 'hidden',

    scrollbarWidth: 'none',

    '&::-webkit-scrollbar': {
      display: 'none',
    },

    '&> div.loader:first-child': {
      margin: 'auto',
    },

    '&> div.next-page-loader:last-child': {
      marginLeft: theme.spacing(1),
      transition: 'unset',

      '&> div': {
        height: '48px',
        width: '48px',
      },
    },

    '&> div': {
      marginLeft: theme.spacing(1),

      transition: 'transform 0.5s',

      '&:first-child': {
        marginLeft: 0,
      },
    },
  },

  emptyListMessage: {
    fontFamily: 'Averta-Semibold',
    fontSize: '12px',
    lineHeight: '14px',
    textAlign: 'center',
    margin: 'auto',

    color: theme.palette.customColors.midGray,

    '&:first-child': {
      margin: 'auto',
    },
  },

  scrollContent: {
    display: 'inline-flex',
    flexDirection: 'row',
    scrollSnapType: 'x mandatory',

    '&> div.center': {
      margin: 'auto',
    },

    '&> div': {
      paddingLeft: theme.spacing(1),

      scrollSnapAlign: 'start',
      transition: 'transform 0.5s',

      '&:first-child': {
        paddingLeft: 0,
      },
    },
  },

  hiddenScrollbar: {
    display: 'none',
  },

  scrollRightButton: {
    background: 'linear-gradient(to right, transparent, white 30%)',
    height: '100%',
    width: '70px',
    paddingRight: '25px',
    position: 'absolute',
    right: theme.spacing(-6),
    zIndex: 10,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-end',
    transition: 'visibility 1s, opacity 1s',
    visibility: 'hidden',
    opacity: 0,
    paddingBottom: '28px',

    '&.scrollRightButton': {
      visibility: (props: HorizontalStylesProps) => props.rightScrollable
        ? 'visible' : 'hidden',
      opacity: (props: HorizontalStylesProps) => props.rightScrollable
        ? 1 : 0,
      transition: 'visibility 0s, opacity 1s linear',

      '&:hover': {
        cursor: 'pointer',
      },
    },

    [theme.breakpoints.down('xs')]: {
      right: theme.spacing(-5),
    },

    '&> img': {
      visibility: 'hidden',
      opacity: 0,
      transition: 'visibility 0.5s, opacity 0.5s',
    },
  },

  scrollLeftButton: {
    background: 'linear-gradient(to left, transparent, white 30%)',
    height: '100%',
    width: '70px',
    paddingLeft: '25px',
    position: 'absolute',
    left: theme.spacing(-6),
    zIndex: 10,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-start',
    transition: 'visibility 1s, opacity 1s',
    visibility: 'hidden',
    opacity: 0,
    paddingBottom: '28px',

    '&.scrollLeftButton': {
      visibility: (props: HorizontalStylesProps) => props.leftScrollable
        ? 'visible' : 'hidden',
      opacity: (props: HorizontalStylesProps) => props.leftScrollable
        ? 1 : 0,
      transition: 'visibility 0s, opacity 1s linear',

      '&:hover': {
        cursor: 'pointer',
      },
    },

    [theme.breakpoints.down('xs')]: {
      left: theme.spacing(-5),
    },

    '&> img': {
      transform: 'rotate(180deg)',
      visibility: 'hidden',
      opacity: 0,
      transition: 'visibility 0.5s, opacity 0.5s',
    },
  },
}))

interface CoupledScrollStyleProps {
  height: number
}

export const useCoupledScrollStyles = makeStyles((theme: Theme) => ({
  scrollContainer: {
    [theme.breakpoints.up('md')]: {
      height: (props: CoupledScrollStyleProps) => props.height,
    },

    [theme.breakpoints.down('sm')]: {
      height: 'calc(100vh - 250px)',
    },
  },

  listElement: {
    border: 'none',
    outline: 'none',
    position: 'initial',
  },

  centerLoader: {
    paddingTop: theme.spacing(3),
    margin: 'auto',
  },
}))

export const useCoupledScrollItemStyles = makeStyles((theme: Theme) => ({
  listHeader: {
    fontSize: '16px',
    lineHeight: '19px',
    fontFamily: 'Averta-Bold',
    color: theme.palette.customColors.grey,
    padding: theme.spacing(3, 2),
  },
}))
