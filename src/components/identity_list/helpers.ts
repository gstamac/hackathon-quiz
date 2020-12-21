import { MutualContact } from '@globalid/identity-namespace-service-sdk'
import { IdentityAlias, TextType } from './interfaces'
import Fuse from 'fuse.js'

const isMutualContactType = (value: IdentityAlias): value is MutualContact => Object.getOwnPropertyNames(value).includes('mutual')

export const isMutualContact = (value: IdentityAlias): boolean => (
  isMutualContactType(value) && value.mutual
)

export const getSubstringIndices = (matches: Fuse.FuseResultMatch[] | undefined, type: TextType): number[] => {
  if (matches === undefined) {
    return []
  }

  const indices: number[] =
      matches.reduce<number[]>((array: number[], currentMatch: Fuse.FuseResultMatch) => {
        if (currentMatch.key === type) {
          return [...array, currentMatch.indices[0][0], currentMatch.indices[0][1]]
        }

        return array
      }, [])

  return indices
}
