import { Button } from '@material-ui/core'
import { TextInput, Checkbox, PrimaryButton, ButtonState, removeField, updateMultipleValidators, partiallyUpdateValueObject } from 'globalid-react-ui'
import { isEmpty } from 'lodash'
import React, { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { RootState } from 'RootType'
import styled from 'styled-components'
import { CreateAnswerDto, createGame, CreateGameDto, CreateQuestionDto } from '../../../../services/api/game_api'
import { closeGameForm } from '../../../../store/ui_slice'
import { CustomFieldDefinition } from '../../../interfaces'
import { CheckboxOffIcon, CheckboxOnIcon } from '../../icons'
import { FormDialog } from '../form_dialog'
import { submitGameForm } from './helper'
import { useStyles } from './styles'

const quiz: CustomFieldDefinition<{}> = {
  question_0: ['is_required'],
  option_0_0: [],
  option_0_1: [],
  option_0_2: [],
  check_0_0: [],
  check_0_1: [],
  check_0_2: [],
}

const Option = styled.div`
  margin-left: 16px;
  margin-top: 24px;
  display: flex;

  .MuiFormControl-root {
    width: 100%;
  }
`

interface QuizFormQuestionSectionProps {
  questionNumber: number
}

interface QuizFormAnswersSectionProps {
  questionNumber: number
  answerNumber: number
  numberOfAnswers: number
}

const range = (length: number): number[] => Array.from({ length }, (_, i: number) => i)

interface QuestionState {
  numberOfAnswers: number
}

interface QuestionsState {
  [key: number]: QuestionState | undefined
}

export const GameQuizDialog: React.FC = () => {
  const formOpen = useSelector((root: RootState) => root.ui.gameFormOpen)
  const dispatch = useDispatch()
  const classes = useStyles()
  const entries = Object.entries(formOpen)
  const isFormOpen = !isEmpty(entries)

  const formId: string = 'quiz-form'
  const channelId: string = isFormOpen ? entries[0][0]: ''
  const channel = useSelector((root: RootState) => root.channels.channels[channelId]?.channel)

  const [numberOfQuestions, setNumberOfQuestions] = useState<number>(1)

  const addQuestion = () => {
    const nextQuestionNumber: number = numberOfQuestions

    const validators = range(3).reduce((o: object, answerNumber: number) => {
      const optionKey: string = `option_${nextQuestionNumber}_${answerNumber}`
      const checkboxKey: string = `check_${nextQuestionNumber}_${answerNumber}`

      partiallyUpdateValueObject(formId, optionKey, {
        failed_validators: [],
        has_changed: false,
        messages: [],
        value: '',
      })
      partiallyUpdateValueObject(formId, checkboxKey, {
        failed_validators: [],
        has_changed: false,
        messages: [],
        value: false,
      })

      return {
        ...o,
        [optionKey]: [],
        [checkboxKey]: [],
      }
    }, {})

    const questionKey: string = `question_${nextQuestionNumber}`

    updateMultipleValidators(formId, {
      ...validators,
      [questionKey]: ['is_required'],
    })

    partiallyUpdateValueObject(formId, questionKey, {
      failed_validators: [],
      has_changed: false,
      messages: [],
      value: '',
    })

    setNumberOfQuestions((prev: number) => prev + 1)
  }

  const removeQuestion = () => {
    const lastQuestionNumber: number = numberOfQuestions - 1

    range(3).forEach((answerNumber: number) => {
      const optionKey: string = `option_${lastQuestionNumber}_${answerNumber}`
      const checkboxKey: string = `check_${lastQuestionNumber}_${answerNumber}`

      removeField(formId, optionKey)
      removeField(formId, checkboxKey)
    }, {})

    const questionKey: string = `question_${lastQuestionNumber}`
    removeField(formId, questionKey)

    setNumberOfQuestions((prev: number) => prev - 1)
  }

  const getQuizFormQuestionSection = ({
    questionNumber,
  }: QuizFormQuestionSectionProps): JSX.Element => {

    const getAnswers = () => range(3).map((i: number) => <Option key={`${questionNumber}_${i}`}>
      <Checkbox
        fieldId={`check_${questionNumber}_${i}`}
        checkedIcon={<CheckboxOnIcon/>}
        icon={<CheckboxOffIcon/>}
      />
      <TextInput
        fieldId={`option_${questionNumber}_${i}`}
        label={`${i + 1}. Option`}
      />
    </Option>)

    return <>
      <TextInput
        className={questionNumber !== 0 ? classes.question: ''}
        fieldId={`question_${questionNumber}`}
        label={`${questionNumber+1}. Question`}
        fullWidth
      />
      {getAnswers()}
    </>
  }

  const onExit = () => {
    dispatch(closeGameForm())
    setNumberOfQuestions(1)
  }

  return <FormDialog
    className={classes.quiz}
    title={'Quiz Setup'}
    formSubtitle={'Setup your question and answers for the hackathon quiz!'}
    formId={formId}
    open={isFormOpen}
    onFormSubmit={submitGameForm(channel, dispatch)}
    fieldDefinition={quiz}
    onExit={onExit}
    fullScreenOnMobile={true}
  >
    {range(numberOfQuestions).map((questionNumber: number) => getQuizFormQuestionSection({ questionNumber }))}
    <div className={classes.manageButtons}>
      <Button onClick={() => removeQuestion()} variant='outlined' color='secondary' disabled={numberOfQuestions <= 1}>Remove question</Button>
      <Button onClick={() => addQuestion()} variant='outlined' color='primary'>Add question</Button>
    </div>
  </FormDialog>
}
