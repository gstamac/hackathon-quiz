import { FormValues, FormValue, FormValueType, partiallyUpdateValueObject } from 'globalid-react-ui'

export const formValuesToValues = <T extends Record<string, unknown>>(formValues: FormValues<T>): T => {
  const values: {
    [key: string]: FormValueType
  } = {}

  Object.entries<FormValue>(formValues).map(([name, formValue]: [string, FormValue]) => {
    if (formValue.has_changed) {
      values[name] = formValue.value
    }
  })

  return <T>values
}

export const formSelectedValuesToStrings = <T extends Record<string, unknown>>(formValues: FormValues<T>): string[] =>
  Object.entries(formValues).reduce<string[]>((array: string[], [name, formValue]: [string, FormValue]) => {
    if (formValue.value === true) {
      return [...array, name]
    }

    return array
  }, [])

export const setInitialFormValues = <T extends object, M = string | number>(
  formId: string,
  values: T,
  fieldDefinition: object,
  selectInputKeys?: (keyof T)[],
  selectInputMap?: (value: M) => FormValueType,
): void => {
  Object.keys(fieldDefinition).forEach((key: string) => {
    const keyInGroups: keyof T = <keyof T> key

    const value: FormValueType = <FormValueType><unknown> (
      selectInputKeys !== undefined && selectInputMap !== undefined && selectInputKeys.includes(keyInGroups)
        ? selectInputMap(<M><unknown> values[keyInGroups])
        : values[keyInGroups]
    )

    partiallyUpdateValueObject(
      formId,
      key,
      {
        value,
        has_changed: true,
      }
    )
  })
}
