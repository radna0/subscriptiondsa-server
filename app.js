const express = require('express')
const cors = require('cors')
const { findEmail } = require('./firebase')
const { handleEmail, delEmail, handleGivingProblems } = require('./utility')
require('dotenv').config()

const app = express()
app.use(cors())
app.use(express.json())
// async function getDataTZ() {
//   let response = await fetch(`${process.env.EXPRESS_ALL_TIMEZONES}`)
//   let data = await response.json()
//   return data
// }
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

    res.status(200).json('Success')
  } catch (e) {
    res.status(409).json(e)
  }
})
module.exports = app
