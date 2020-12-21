import { MessageTemplateCardView } from '@globalid/messaging-service-sdk'
import { storeMessage } from './../../utils/messages_utils'
import { ChannelWithParticipantsAndParsedMessage, MessageData } from './../../store/interfaces'
import { v4 } from 'uuid'

interface Question {
  question: string
  options: string[]
  answer?: number
}

interface Quiz {
  questions: Question[]
}

enum Command {
  Finish = 'finish',
  Question = 'question',
  Answer = 'answer',
  Option = 'option'
}

const isValidCommand = (command: string):command is Command => Object.values(Command).includes(<Command>command)

const isCommand = (x: string): boolean => x.startsWith('/')

interface QuizRespones {
  finish: boolean
}

// eslint-disable-next-line no-restricted-syntax
export class GameManager implements Quiz {
  private uuid = v4()
  private quizIdentity = v4()
  private MAX_OPTIONS = 3
  private channel: ChannelWithParticipantsAndParsedMessage
  questions: Question[]
  private activeQuestion?: Question = undefined
  private cardContent?: MessageTemplateCardView = undefined

  private log = (message?: string, content?: string): void => {
    const startMessage: MessageData = {
      parsedContent: message,
      errored: false,
      author: this.quizIdentity,
      created_at: (new Date()).toISOString(),
      uuid: content ? this.uuid : v4(),
      channel_id: this.channel.id,
      delivered: true,
      deleted: false,
      type: content ? 'CARD_VIEW': 'TEXT',
      content: content ?? '',
    }

    storeMessage(this.channel.id, startMessage)
  }

  private enterQuestion = (question: string): void => {
    if (this.activeQuestion){
      if (this.activeQuestion.answer === undefined || this.activeQuestion.options.length === 0){
        throw new Error('Finish your first quiz question first!')
      }

      this.questions.push(this.activeQuestion)
      this.uuid = v4()
    }
    this.activeQuestion = {
      question,
      options: [],
    }
    this.cardContent = {
      text: question,
      payload: {},
      elements: {
        title_text: 'Hackaton Quiz',
        primary_text: `${this.questions.length+1}. ${question}`,
      },
    }

    this.log(undefined, JSON.stringify(this.cardContent))
  }

  private enterOption = (option: string): void => {
    if (this.activeQuestion && this.cardContent){
      if (this.activeQuestion.answer){
        throw new Error('Answer for this question was already entered.\n Cant enter options for and answered question anymore.')
      }
      if (this.activeQuestion.options.length + 1 > this.MAX_OPTIONS){
        throw new Error(`Max number of options (${this.MAX_OPTIONS}) for this qui question was already reached.`)
      }

      this.activeQuestion.options.push(option)
      this.cardContent = {
        ...this.cardContent,
        elements: {
          ...this.cardContent.elements,
          buttons: this.activeQuestion.options.map(x => ({
            type: 'OUTLINED',
            title: x,
            cta_type: 'DEEPLINK',
            cta_link: '',
            mode: 'SECONDARY',
          })),
        },
      }
      this.log(undefined, JSON.stringify(this.cardContent))
    } else {
      throw new Error('Question was not yet entered!')
    }
  }

  private enterAnswer = (answerString: string): void => {
    if (this.activeQuestion && this.cardContent){
      if (this.activeQuestion.answer){
        throw new Error('Answer for this question was already entered.')
      }
      if (this.activeQuestion.options.length === 0){
        throw new Error('No options entered yet')
      }
      const answer: number | null = Number.parseInt(answerString, 10)

      if (answer === null || answer > this.activeQuestion.options.length - 1 || answer < 0) {
        throw new Error('Enter number of the option as that is answer is not correct')
      }
      this.activeQuestion.answer = answer

      this.cardContent = {
        ...this.cardContent,
        elements: {
          ...this.cardContent.elements,
          buttons: this.activeQuestion.options.map((x, i) => ({
            type: 'OUTLINED',
            title: x,
            cta_type: 'DEEPLINK',
            cta_link: '',
            mode: i === answer ? 'PRIMARY': 'SECONDARY',
          })),
        },
      }
      this.log(undefined, JSON.stringify(this.cardContent))
    } else {
      throw new Error('Question not entered yet.')
    }
  }

  constructor (channel: ChannelWithParticipantsAndParsedMessage){
    this.channel = channel
    this.log(
      'Quiz manager started!\n'+
      '****************************\n\n'+
      'By entering command bellow setup your quiz\n\n'+
      'Commands:\n'+
      '/question - enter question for the quiz\n'+
      '/option - enter option for the entered question\n'+
      '/answer - enter which option is the right answer\n'+
      '/finish - finish quiz setup and start the game\n'
      , undefined)

    this.questions = []
  }

  parseCommand = (data: string): QuizRespones => {
    if (isCommand(data)){
      const index = data.indexOf(' ')
      const command = data.slice(0, index).replace('/', '')
      const payload = data.slice(index, data.length)

      try {
        if (isValidCommand(command))
        {
          switch (command){
          case Command.Answer:
            this.enterAnswer(payload)
            break
          case Command.Option:
            this.enterOption(payload)
            break
          case Command.Question:
            this.enterQuestion(payload)
            break
          case Command.Finish:
            return { finish: true}
          default:
            throw new Error('Wrong command entered!')
          }
        } else {
          throw new Error('Wrong command entered!')
        }
      } catch (error){
        this.log(error.message)
      }

    }

    return { finish: false}
  }
}
