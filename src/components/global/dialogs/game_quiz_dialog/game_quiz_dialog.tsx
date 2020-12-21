import { Button } from '@material-ui/core'
import { TextInput, Checkbox, PrimaryButton, ButtonState, updateMultipleValidators, partiallyUpdateValueObject } from 'globalid-react-ui'
import React, { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { RootState } from 'RootType'
import { setGameQuizFormState } from '../../../../store/ui_slice'
import { CustomFieldDefinition } from '../../../interfaces'
import { CheckboxOffIcon, CheckboxOnIcon } from '../../icons'
import { FormDialog } from '../form_dialog'
import { useStyles } from './styles'

const quiz: CustomFieldDefinition<{}> = {
  question0: ['is_required'],
  option0_0: [],
  option0_1: [],
  option0_2: [],
  check0_0: [],
  check0_1: [],
  check0_2: [],
}

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

interface QuestionsCounterProps {
  numberOfQuestions: number
  onSelect: (questionNumber: number) => void
  addQuestion: () => void
}

export const QuestionsCounter: React.FC<QuestionsCounterProps> = ({
  numberOfQuestions,
  onSelect,
  addQuestion,
}: QuestionsCounterProps) => {
  const classes = useStyles()

  return <div className={classes.quizQuestionList}>
    {range(numberOfQuestions).map((i: number) => (
      <div className={classes.quizQuestionMarker} onClick={() => onSelect(i)}>{i + 1}</div>
    ))}
    <div onClick={() => addQuestion()} className={classes.quizQuestionAdd}>+</div>
  </div>
}

export const GameQuizDialog: React.FC = () => {
  const formOpen = useSelector((root: RootState) => root.ui.gameQuizFormOpen)
  const dispatch = useDispatch()
  const classes = useStyles()

  const formId: string = 'quiz-form'

  console.log('quiz', quiz)

  const [currentQuestion, setCurrentQuestion] = useState<number>(0)
  const [numberOfQuestions, setNumberOfQuestions] = useState<number>(1)

  const addQuestion = () => {
    const nextQuestionNumber: number = numberOfQuestions

    const validators = range(3).reduce((o: object, answerNumber: number) => {
      const optionKey: string = `option${nextQuestionNumber}_${answerNumber}`
      const checkboxKey: string = `check${nextQuestionNumber}_${answerNumber}`
    
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

    const questionKey: string = `question${nextQuestionNumber}`

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
    setCurrentQuestion(nextQuestionNumber)
  }

  const getQuizFormQuestionSection = (questionNumber: number): JSX.Element => {

    const getAnswers = () => range(3).map((i: number) => {

      console.log('fieldId text', `option${questionNumber}_${i}`)
      console.log('fieldId check', `check${questionNumber}_${i}`)

      return <div style={{display:'flex'}} key={`${questionNumber}_${i}`}>
        <Checkbox
          fieldId={`check${questionNumber}_${i}`}
          checkedIcon={<CheckboxOnIcon/>}
          icon={<CheckboxOffIcon/>}
        />
        <TextInput
          className={classes.option}
          fieldId={`option${questionNumber}_${i}`}
          label={`${i + 1}. Option`}
        />
      </div>
    })

    return <>
      <TextInput
        className={questionNumber !== 0 ? classes.question: ''}
        fieldId={`question${questionNumber}`}
        label={`${questionNumber+1}. Question`}
        fullWidth
      />
      {getAnswers()}
    </>
  }

  return <FormDialog
    className={classes.quiz}
    title={'Quiz Setup'}
    formSubtitle={'Setup your question and answers for the hackathon quiz!'}
    onFormSubmit={async () => {}}
    open={formOpen}
    formId={formId}
    fieldDefinition={quiz}
    onExit={() => dispatch(setGameQuizFormState(false))}
    fullScreenOnMobile={true}
  >
    {getQuizFormQuestionSection(currentQuestion)}
    <QuestionsCounter
      numberOfQuestions={numberOfQuestions}
      onSelect={(questionNumber) => setCurrentQuestion(questionNumber)}
      addQuestion={addQuestion}
    />
    </FormDialog>
}
