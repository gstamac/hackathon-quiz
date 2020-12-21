import React, { useRef, useState, useCallback, ChangeEvent, useEffect } from 'react'
import { Input, InputAdornment } from '@material-ui/core'
import { SearchProps } from './interfaces'
import { useStyles } from './styles'
import SearchIcon from '../../../assets/icons/search_icon.svg'
import RemoveIcon from '../../../assets/icons/remove_icon.svg'
import { DEBOUNCE_DELAY } from '../../../constants'
import { debounce } from 'lodash'

export const SearchInput: React.FC<SearchProps> = ({
  onDebounceCallback,
  disabled,
  setSearchVisible,
  autoFocus,
}: SearchProps) => {
  const classes = useStyles()
  const inputElementRef: React.MutableRefObject<HTMLInputElement | null> = useRef<HTMLInputElement>(null)

  const [value, setValue] = useState<string>('')

  const handleOnClickDeleteIcon = (): void => {
    if (inputElementRef.current) {
      inputElementRef.current.value = ''
    }

    if (setSearchVisible) {
      setSearchVisible(false)
    }

    setValue('')
    debouncedCallback('')
  }

  const handleOnClickSearchIcon = (): void => {
    if (inputElementRef.current) {
      inputElementRef.current.focus()
    }
  }

  useEffect(() => {
    if (autoFocus) {
      handleOnClickSearchIcon()
    }
  }, [autoFocus])

  const debouncedCallback = useCallback(debounce(onDebounceCallback, DEBOUNCE_DELAY), [])

  const onInputChange = (event: ChangeEvent<HTMLInputElement>): void => {
    const changedValue: string = event.target.value

    if (setSearchVisible) {
      setSearchVisible(changedValue.length > 0)
    }

    setValue(changedValue)
    debouncedCallback(changedValue)
  }

  return (
    <div className={classes.searchWrapper}>
      <div className={classes.searchItems}>
        <Input
          inputProps={{ 'data-testid': 'search-input' }}
          inputRef={inputElementRef}
          type='text'
          disabled={disabled}
          className={classes.searchInput}
          placeholder='Search...'
          onChange={onInputChange}
          startAdornment={(
            <InputAdornment position='start' key='search-icon'>
              <img src={SearchIcon} className={classes.searchIcon} alt='search' onClick={handleOnClickSearchIcon}/>
            </InputAdornment>
          )}
          endAdornment={value ? (
            <InputAdornment position='start' key='delete-icon'>
              <img onClick={handleOnClickDeleteIcon} className={classes.removeIcon} src={RemoveIcon} alt='reset search'/>
            </InputAdornment>) : undefined
          }
          fullWidth
          disableUnderline
        />
      </div>
    </div>
  )
}
