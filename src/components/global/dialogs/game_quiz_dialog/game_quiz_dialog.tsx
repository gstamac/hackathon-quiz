import { TextInput, Checkbox } from 'globalid-react-ui'
import React from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { RootState } from 'RootType'
import { setGameQuizFormState } from '../../../../store/ui_slice'
import { CustomFieldDefinition } from '../../../interfaces'
import { CheckboxOffIcon, CheckboxOnIcon } from '../../icons'
import { FormDialog } from '../form_dialog'
import { useStyles } from './styles'

const quiz: CustomFieldDefinition<{}> = {
  question0: [],
  option0_1: [],
  option0_2: [],
  option0_3: [],
  check0_1: [],
  check0_2: [],
  check0_3: [],
}

export const GameQuizDialog: React.FC = () => {
  const formOpen = useSelector((root: RootState) => root.ui.gameQuizFormOpen)
  const dispatch = useDispatch()
  const classes = useStyles()

  const getQuizInputs = () => [...new Array(1)].map((_, i) => <>
    <TextInput
      className={i !== 0 ? classes.question: ''}
      fieldId={`question${i}`}
      label={`${i+1}. Question`}
      fullWidth
    />
    <div style={{display:'flex'}}>
      <TextInput
        className={classes.option}
        fieldId={`option${i}_1`}
        label={'1. Option'}
      />

      <Checkbox
        fieldId={`check${i}_1`}
        checkedIcon={<CheckboxOnIcon/>}
        icon={<CheckboxOffIcon/>}
      />
    </div>    <div style={{display:'flex'}}>
      <TextInput
        className={classes.option}
        fieldId={`option${i}_2`}
        label={'2. Option'}
      />
      <Checkbox
        fieldId={`check${i}_2`}
        checkedIcon={<CheckboxOnIcon/>}
        icon={<CheckboxOffIcon/>}
      />
    </div>
    <div style={{display:'flex'}}>
      <TextInput
        className={classes.option}
        fieldId={`option${i}_3`}
        label={'3. Option'}
      />
      <Checkbox
        fieldId={`check${i}_3`}
        checkedIcon={<CheckboxOnIcon/>}
        icon={<CheckboxOffIcon/>}
      />
    </div>
  </>)

  return <FormDialog
    className={classes.quiz}
    title={'Quiz Setup'}
    formSubtitle={'Setup your question and answers for the hackathon quiz!'}
    onFormSubmit={async () => {}}
    open={formOpen}
    formId={'quiz-form'}
    fieldId='description'
    fieldDefinition={quiz}
    onExit={() => dispatch(setGameQuizFormState(false))}
    fullScreenOnMobile={true}
  >
    {getQuizInputs()}
  </FormDialog>
}
