import { Identity } from '@globalid/identity-namespace-service-sdk'
import { identitiesArrayMock } from '../../../tests/mocks/identity_mock'
import { optimizeIdentitiesSearchResults } from './fuse'

describe('Fuse function tests', () => {

  describe('optimizeIdentitiesSearchResults', () => {

    it('should return the same sorted identities array when searchText is empty', () => {
      expect(optimizeIdentitiesSearchResults(identitiesArrayMock, '')).toEqual(identitiesArrayMock)
    })

    it('should return filtered identities array when searchText is not empty', () => {
      expect(identitiesArrayMock).toHaveLength(6)

      expect(optimizeIdentitiesSearchResults(identitiesArrayMock, 'age2')).toHaveLength(5)
    })

    it('should return correctly sorted identities array when searchText is not empty', () => {
      expect(identitiesArrayMock[0].gid_name).toEqual('stage2')

      const results: Identity[] | undefined = optimizeIdentitiesSearchResults(identitiesArrayMock, 'age2')

      expect(results).toBeDefined()

      expect(results?.[0].gid_name).toEqual('age2')
    })

    it('should add info about matches to the returned array', () => {
      expect(identitiesArrayMock[0].gid_name).toEqual('stage2')

      const results: Identity[] | undefined = optimizeIdentitiesSearchResults(identitiesArrayMock, 'age2')

      expect(results).toBeDefined()

      expect(results?.[0]).toHaveProperty('matches')
    })

    it('should return undefined when identities are undefined', () => {
      expect(optimizeIdentitiesSearchResults(undefined, 'bla')).toBeUndefined()
    })

  })
})
