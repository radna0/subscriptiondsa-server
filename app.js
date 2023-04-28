import express from 'express'
import cors from 'cors'
import { findEmail } from './firebase.js'
import { handleEmail, delEmail, handleGivingProblems } from './utility.js'
import { HandleCourierSend } from './resouces.js'

import dotenv from 'dotenv'

dotenv.config()

export const app = express()
app.use(cors())
app.use(express.json())

app.get('/get', (req, res) => {
  res.json('ok')
})
app.delete(`${process.env.EXPRESS_DELETE_ENDPOINT_ENV}`, async (req, res) => {
  try {
    const { id } = req.body
    const deleted = await delEmail(id)
    res.status(200).json(deleted)
  } catch (e) {
    res.status(409).json(e)
  }
})
app.post(`${process.env.EXPRESS_POST_ENDPOINT_ENV}`, async (req, res) => {
  try {
    const { email, timeZone } = req.body
    const found = await findEmail(email)
    if (found) throw new Error('Duplicate Entry')
    const problems = await handleGivingProblems()
    await handleEmail({ email, timeZone, problems })
    const id = await findEmail(email)
    const reqID = await HandleCourierSend(
      '51EPCE0S9AMG7GQTDR7SJHX8QVBF',
      email,
      {
        id: id,
      }
    )
    res.status(200).json('Success')
  } catch (e) {
    res.status(409).json(e)
  }
})

export default app
