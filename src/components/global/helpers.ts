import { useMediaQuery, Theme } from '@material-ui/core'

export const useIsMobileView = (): boolean => useMediaQuery((theme: Theme) => theme.breakpoints.down('xs'), { noSsr: true })

export const useIsMobileOrTabletView = (): boolean => useMediaQuery((theme: Theme) => theme.breakpoints.down('sm'), { noSsr: true })

export const getObjectValues
  = <T, K>(items: T): K[] =>
    Object.values(items).reduce<K[]>((array: K[], currentValue: K) => {
      if (currentValue) {
        return [...array, currentValue]
      }

      return array
    }, [])
