export interface SearchProps {
  onDebounceCallback: (value: string) => void
  setSearchVisible?: (visible: boolean) => void
  disabled?: boolean
  autoFocus?: boolean
}
