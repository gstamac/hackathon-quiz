import { getSubstringIndices, isMutualContact } from './helpers'
import { contactMock } from '../../../tests/mocks/contacts_mock'
import { identityMatchesMock, identityMock } from '../../../tests/mocks/identity_mock'
import { TextType } from './interfaces'

describe('Identity list helpers', () => {

  describe('isMutualContact', () => {

    it('should return true when contact is mutual', () => {
      expect(isMutualContact({
        ...contactMock,
        mutual: true,
      })).toEqual(true)
    })

    it('should return false when contact not mutual', () => {
      expect(isMutualContact({
        ...contactMock,
        mutual: false,
      })).toEqual(false)
    })

    it('should return false when identity is not a contact', () => {
      expect(isMutualContact(identityMock)).toEqual(false)
    })
  })

  describe('getSubstringIndices', () => {
    it('should return indices of substring match', () => {
      expect(getSubstringIndices([identityMatchesMock], TextType.GID_NAME)).toEqual([0,1])
    })

    it('should return empty array when there are no matches', () => {
      expect(getSubstringIndices(undefined, TextType.GID_NAME)).toEqual([])
    })
  })
})
