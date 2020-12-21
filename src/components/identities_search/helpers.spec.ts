import * as helpers from './helpers'
import { ListHeightResult, ListHeightParameters, ShowHideSectionsParameters, ShowHideSectionsResult } from './interfaces'

describe('Identities search helpers', () => {

  describe('getListHeight', () => {
    const listHeightParameters: ListHeightParameters = {
      listItemSize: 20,
      myContactsCount: 3,
      searchTextExists: true,
    }

    it('should return list height result when search text exists', () => {
      const listHeightResult: ListHeightResult = helpers.getListHeight(listHeightParameters)

      expect(listHeightResult).toEqual({'globalidDirectoryHeight': 384, 'myContactsHeight': 60})
    })

    it('should return list height result when search text doesn\'t exist', () => {
      const listHeightResult: ListHeightResult = helpers.getListHeight({...listHeightParameters, searchTextExists: false})

      expect(listHeightResult).toEqual({'globalidDirectoryHeight': 384, 'myContactsHeight': 768})
    })

    it('should return list height result with half of window size', () => {
      const listHeightResult: ListHeightResult = helpers.getListHeight({...listHeightParameters, myContactsCount: 100})

      expect(listHeightResult).toEqual({'globalidDirectoryHeight': 384, 'myContactsHeight': 384})
    })
  })

  describe('getShowOrHideSections', () => {
    const showHideSectionsParameters: ShowHideSectionsParameters = {
      isSelectionMode: false,
      globalidDirectoryExists: false,
      globalidDirectoryIsSearching: false,
      myContactsExists: false,
      myContactsIsLoading: false,
      searchTextExists: false,
    }

    it('should return showFindYourFriendsMessage as true', () => {
      const showHideSectionsResult: ShowHideSectionsResult = helpers.getShowOrHideSections(showHideSectionsParameters)

      expect(showHideSectionsResult).toEqual({
        'showFindYourFriendsMessage': true,
        'showGlobalidDirectoryList': false,
        'showLoader': false,
        'showMyContactsList': false,
      })
    })

    it('should return showMyContactsList as true', () => {
      const showHideSectionsResult: ShowHideSectionsResult = helpers.getShowOrHideSections({
        ...showHideSectionsParameters,
        isSelectionMode: true,
      })

      expect(showHideSectionsResult).toEqual({
        'showFindYourFriendsMessage': false,
        'showGlobalidDirectoryList': false,
        'showLoader': false,
        'showMyContactsList': true,
      })
    })

    it('should return showGlobalidDirectoryList and showMyContactsList as true', () => {
      const showHideSectionsResult: ShowHideSectionsResult = helpers.getShowOrHideSections({
        ...showHideSectionsParameters,
        searchTextExists: true,
        globalidDirectoryExists: true,
      })

      expect(showHideSectionsResult).toEqual({
        'showFindYourFriendsMessage': false,
        'showGlobalidDirectoryList': true,
        'showLoader': false,
        'showMyContactsList': true,
      })
    })

    it('should return showLoader as true when contacts are loading', () => {
      const showHideSectionsResult: ShowHideSectionsResult = helpers.getShowOrHideSections({
        ...showHideSectionsParameters,
        myContactsIsLoading: true,
      })

      expect(showHideSectionsResult).toEqual({
        'showFindYourFriendsMessage': false,
        'showGlobalidDirectoryList': false,
        'showLoader': true,
        'showMyContactsList': false,
      })
    })

    it('should return showLoader as true when global directory is searching', () => {
      const showHideSectionsResult: ShowHideSectionsResult = helpers.getShowOrHideSections({
        ...showHideSectionsParameters,
        globalidDirectoryIsSearching: true,
      })

      expect(showHideSectionsResult).toEqual({
        'showFindYourFriendsMessage': false,
        'showGlobalidDirectoryList': false,
        'showLoader': true,
        'showMyContactsList': false,
      })
    })
  })
})
