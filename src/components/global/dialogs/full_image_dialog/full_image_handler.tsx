import React from 'react'
import { Dispatch } from '@reduxjs/toolkit'
import { useDispatch, useSelector } from 'react-redux'
import { RootState } from 'RootType'
import { ImageSlice } from '../../../../store/interfaces'
import { setFullImageView } from '../../../../store/image_slice'
import { FullImageDialog } from './full_image_dialog'

export const FullImageHandler: React.FC = () => {
  const imageState: ImageSlice = useSelector((root: RootState) => root.image)
  const dispatcher: Dispatch = useDispatch()

  if (imageState.image !== undefined) {
    return (
      <FullImageDialog open
        title={imageState.image.title}
        thumbnail={imageState.image.thumbnail}
        original={imageState.image.original}
        onExit={() => dispatcher(setFullImageView(undefined))}/>
    )
  }

  return null
}
