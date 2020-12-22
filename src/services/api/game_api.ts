import { getValidToken } from './../../components/auth/helpers'
import axios, { AxiosResponse } from 'axios'
export interface CreateParticipantAnswerDto {
  question_id: string
  answer_id: string
  participant: string
}
export interface CreateAnswerDto {
  answer: string
  is_correct?: boolean
}
export interface CreateQuestionDto {
  question: string
  answers: CreateAnswerDto[]
}
export interface CreateGameDto {
  name: string
  channel_id:string
  access_token: string
  questions: CreateQuestionDto[]
}

const BASE_GAME_API_URL = 'https://hackathon-quiz-be.herokuapp.com'

export const createGame = async (data: CreateGameDto): Promise<CreateGameDto> => {
  const access_token = await getValidToken()

  console.log(access_token)
  const payload: CreateGameDto = {
    ...data,
    access_token,
  }
  const response: AxiosResponse<CreateGameDto> = await axios.post<CreateGameDto>(
    `${BASE_GAME_API_URL}/games`,
    payload,
  )

  return response.data
}
