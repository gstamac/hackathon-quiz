import { ThunkDispatch } from 'RootType'
import { ChannelWithParticipantsAndParsedMessage } from './../../../../store/interfaces'
import { InternalFormData, OnSubmit, setToastError, setToastSuccess } from 'globalid-react-ui'
import { CreateQuestionDto, CreateAnswerDto, CreateGameDto, createGame } from '../../../../services/api/game_api'
// eslint-disable-next-line unicorn/consistent-function-scoping
export const submitGameForm
= (channel: ChannelWithParticipantsAndParsedMessage | undefined, dispatch: ThunkDispatch): OnSubmit =>
  async (formData: InternalFormData) => {
    if (channel){
      try {

        const questionEntries = Object.entries(formData.values).filter(x => x[0].startsWith('question')).map(x => [...x[0].split('_'), x[1].value as string])
        const optionEntries = Object.entries(formData.values).filter(x => x[0].startsWith('option')).map(x => [...x[0].split('_'), x[1].value as string])
        const checkEntries = Object.entries(formData.values).filter(x => x[0].startsWith('check')).map(x => [...x[0].split('_'), x[1].value])

        const questions = questionEntries.map<CreateQuestionDto>(questionEntry => {
          const index = questionEntry[1]
          const options = optionEntries.filter(x => x[1] === index)
          const checks = checkEntries.filter(x => x[1] === index)

          const answers = options.map<CreateAnswerDto>(option => ({
            answer: option[3],
            is_correct: checks.find(check => check[2] === option[2] && (<boolean>check[3])) !== undefined,
          }))

          return {
            question: questionEntry[2],
            answers,
          }

        })

        const game: CreateGameDto = {
          name: channel.title ?? '',
          access_token: '',
          questions,
        }

        await createGame(game)

        dispatch(setToastSuccess({
          title: 'New Game Created!',
        }))
      } catch (error){

        dispatch(setToastError({
          title: 'Game Create Failed!',
          message: error.message,
        }))
        throw new Error(error.message)
      }
    }
  }
