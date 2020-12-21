import { combineCallbacks, getHasNextPage, getLoadNextPage, getInfiniteLoadingProps, getItemsFromMeta } from './helpers'
import { InfiniteLoaderMeta, InfiniteLoadingProps, InfiniteScrollCoupledListItemProps } from './interfaces'
import { GlobalidLoader } from '../loading'

describe('Infinite scroll helpers tests', () => {

  afterEach(() => {
    jest.resetAllMocks()
  })

  describe('combineCallbacks', () => {
    it('should combine callbacks so both get called', () => {
      const callback1: jest.Mock = jest.fn()
      const callback2: jest.Mock = jest.fn()

      const combinedCallback: () => void = combineCallbacks(callback1, callback2)

      combinedCallback()

      expect(callback1).toHaveBeenCalledTimes(1)
      expect(callback2).toHaveBeenCalledTimes(1)
    })
  })

  describe('getHasNextPage', () => {
    const topHasNextPage: boolean = true
    const bottomHasNextPage: boolean = false

    it('should return topHasNextPage when top scroll is visible, but bottom one isnt', () => {
      expect(getHasNextPage(
        topHasNextPage,
        bottomHasNextPage,
        true,
        false
      )).toEqual(topHasNextPage)
    })

    it('should return bottomHasNextPage when bottom scroll is visible, but top one isnt', () => {
      expect(getHasNextPage(
        topHasNextPage,
        bottomHasNextPage,
        false,
        true
      )).toEqual(bottomHasNextPage)
    })

    it('should return true if both scrolls are visible and one of them has next page', () => {
      expect(getHasNextPage(
        topHasNextPage,
        bottomHasNextPage,
        false,
        false
      )).toEqual(true)
    })

    it('should return false if both scrolls are visible and none of them have next page', () => {
      expect(getHasNextPage(
        false,
        false,
        false,
        false
      )).toEqual(false)
    })
  })

  describe('getLoadNextPage', () => {
    const topOnNextPageLoad: jest.Mock = jest.fn()
    const bottomOnNextPageLoad: jest.Mock = jest.fn()

    it('should return topOnNextPageLoad callback when top scroll is visible, but bottom one isnt', () => {
      expect(getLoadNextPage(
        topOnNextPageLoad,
        bottomOnNextPageLoad,
        true,
        false
      )).toEqual(topOnNextPageLoad)
    })

    it('should return bottomOnNextPageLoad callback when bottom scroll is visible, but top one isnt', () => {
      expect(getLoadNextPage(
        topOnNextPageLoad,
        bottomOnNextPageLoad,
        false,
        true
      )).toEqual(bottomOnNextPageLoad)
    })

    it('should return combined callback if both scrolls are visible', () => {
      const combinedCallback = getLoadNextPage(
        topOnNextPageLoad,
        bottomOnNextPageLoad,
        true,
        true
      )

      combinedCallback()

      expect(topOnNextPageLoad).toHaveBeenCalledTimes(1)
      expect(bottomOnNextPageLoad).toHaveBeenCalledTimes(1)
    })

    it('should return combined callback if both scrolls are hidden', () => {
      const combinedCallback = getLoadNextPage(
        topOnNextPageLoad,
        bottomOnNextPageLoad,
        false,
        false
      )

      combinedCallback()

      expect(topOnNextPageLoad).toHaveBeenCalledTimes(1)
      expect(bottomOnNextPageLoad).toHaveBeenCalledTimes(1)
    })
  })

  describe('getInfiniteLoadingProps', () => {
    const topOnNextPageLoad: jest.Mock = jest.fn()
    const bottomOnNextPageLoad: jest.Mock = jest.fn()

    const topListMeta: InfiniteLoaderMeta = {
      title: 'test',
      noItemsMessage: 'test',
      items: ['top_item'],
      loading: false,
      hasNextPage: true,
      onNextPageLoad: topOnNextPageLoad,
    }
    const bottomListMeta: InfiniteLoaderMeta = {
      title: 'test',
      noItemsMessage: 'test',
      items: ['bottom_item'],
      loading: true,
      hasNextPage: false,
      onNextPageLoad: bottomOnNextPageLoad,
    }

    it('should return default loading meta when one of the lists is undefined', () => {
      const loadingProps: InfiniteLoadingProps = getInfiniteLoadingProps(
        {
          ...topListMeta,
          items: undefined,
        },
        bottomListMeta,
        true,
        true,
      )

      expect(loadingProps.hasNextPage).toEqual(false)
      expect(loadingProps.isLoading).toEqual(true)

      loadingProps.loadNextPage()

      expect(topOnNextPageLoad).toHaveBeenCalledTimes(1)
      expect(bottomOnNextPageLoad).toHaveBeenCalledTimes(1)
    })

    it('should return combined loading meta for top list when only top list is visible', () => {
      const loadingProps: InfiniteLoadingProps = getInfiniteLoadingProps(
        topListMeta,
        bottomListMeta,
        true,
        false,
      )

      expect(loadingProps.hasNextPage).toEqual(true)
      expect(loadingProps.isLoading).toEqual(true)

      loadingProps.loadNextPage()

      expect(topOnNextPageLoad).toHaveBeenCalledTimes(1)
      expect(bottomOnNextPageLoad).toHaveBeenCalledTimes(0)
    })

    it('should return combined loading meta for bottom list when only bottom list is visible', () => {
      const loadingProps: InfiniteLoadingProps = getInfiniteLoadingProps(
        topListMeta,
        bottomListMeta,
        false,
        true,
      )

      expect(loadingProps.hasNextPage).toEqual(false)
      expect(loadingProps.isLoading).toEqual(true)

      loadingProps.loadNextPage()

      expect(topOnNextPageLoad).toHaveBeenCalledTimes(0)
      expect(bottomOnNextPageLoad).toHaveBeenCalledTimes(1)
    })

    it('should return combined loading meta for both lists when both are visible', () => {
      const loadingProps: InfiniteLoadingProps = getInfiniteLoadingProps(
        topListMeta,
        bottomListMeta,
        true,
        true,
      )

      expect(loadingProps.hasNextPage).toEqual(true)
      expect(loadingProps.isLoading).toEqual(true)

      loadingProps.loadNextPage()

      expect(topOnNextPageLoad).toHaveBeenCalledTimes(1)
      expect(bottomOnNextPageLoad).toHaveBeenCalledTimes(1)
    })
  })

  describe('getItemsFromMeta', () => {
    const listMeta: InfiniteLoaderMeta = {
      title: 'title',
      noItemsMessage: 'noItemsMessage',
      items: ['top_item'],
      loading: false,
      hasNextPage: true,
      onNextPageLoad: jest.fn(),
    }

    const titleRef: jest.Mock = jest.fn()

    it('should return an array of CoupledListItemProps with title element', () => {
      const listItems: InfiniteScrollCoupledListItemProps[] = getItemsFromMeta(
        listMeta,
        titleRef,
        GlobalidLoader,
      )

      expect(listItems).toHaveLength(2)
      expect(listItems[0]).toEqual({
        ItemComponent: GlobalidLoader,
        title: listMeta.title,
        ref: titleRef,
      })

      expect(listItems[1]).toEqual({
        ItemComponent: GlobalidLoader,
        itemProps: { item: 'top_item' },
        ref: titleRef,
      })
    })
    it('should return an array of CoupledListItemProps with title and no matches elements', () => {
      const listItems: InfiniteScrollCoupledListItemProps[] = getItemsFromMeta(
        {
          ...listMeta,
          items: [],
        },
        titleRef,
        GlobalidLoader,
      )

      expect(listItems).toHaveLength(2)
      expect(listItems[0]).toEqual({
        ItemComponent: GlobalidLoader,
        title: listMeta.title,
        ref: titleRef,
      })

      expect(listItems[1]).toEqual({
        ItemComponent: GlobalidLoader,
        noMatchesText: listMeta.noItemsMessage,
        ref: titleRef,
      })
    })
  })
})
