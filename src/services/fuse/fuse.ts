import { Identity } from '@globalid/identity-namespace-service-sdk'
import Fuse from 'fuse.js'
import _ from 'lodash'

export const optimizeIdentitiesSearchResults = (
  identities: Identity[] | undefined,
  searchText: string
): Identity[] | undefined => {

  if (!identities || _.isEmpty(searchText)) {
    return identities
  }

  const options = {
    keys: [
      {
        name: 'gid_name',
        weight: 0.6,
      },
      {
        name: 'display_name',
        weight: 0.4,
      },
    ],
    includeMatches: true,
    minMatchCharLength: searchText.length,
  }

  return fuseSearch(identities, options, searchText)
}

const fuseSearch = <T> (list: T[], options: Fuse.IFuseOptions<T>, searchText: string): T[] => {

  const fuse = new Fuse(list, options)

  const results: T[] =
    fuse.search(searchText).map(((result: Fuse.FuseResult<T>) => ({ ...result.item, matches: result.matches })))

  return results
}
