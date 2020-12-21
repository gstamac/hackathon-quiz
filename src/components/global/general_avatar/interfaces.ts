export enum AvatarVariant {
  'Circle' = 'circle',
  'Rounded' = 'rounded',
  'Square' = 'square',
}

export interface GeneralAvatarProps {
  image_url?: string | null
  title?: string | null
  uuid?: string
  variant?: AvatarVariant
  className?: string
}
