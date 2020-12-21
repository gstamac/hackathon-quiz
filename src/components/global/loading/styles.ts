import { makeStyles } from '@material-ui/core/styles'

export interface SpinnerProps {
  width?: string
  height?: string
}

export const useStyles = makeStyles({
  container: {
    display: 'flex',
    justifyContent: 'flex-start',
    flexDirection: 'column',
    alignItems: 'center',
    paddingTop: '41px',
  },
  loadingContainer: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: '40px',
  },
  spinner: {
    height: (props: SpinnerProps) => props.height ?? '48px',
    width: (props: SpinnerProps) => props.width ?? '48px',
  },
})
