import { CourierClient } from '@trycourier/courier'

import dotenv from 'dotenv'

dotenv.config()

export const probAlgo = {
  total: 30,
  difficulty: 'EASY',
}

export const HandleCourierSend = async (template, email, data = {}) => {
  const courier = CourierClient({
    authorizationToken: `${process.env.EXPRESS_AUTH_EMAIL_TOKEN}`,
  })
  const { requestId } = await courier.send({
    message: {
      to: {
        email: email,
      },
      template: template,
      data: data,
      routing: {
        method: 'single',
        channels: ['email'],
      },
    },
  })
  return requestId
}
