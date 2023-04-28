import app from './app.js'
import { handleSchedule } from './utility.js'
import fetch from 'node-fetch'
import dotenv from 'dotenv'

dotenv.config()

async function getDataTZ() {
  let response = await fetch(`${process.env.EXPRESS_ALL_TIMEZONES}`)
  let data = await response.json()
  return data
}
app.on('Worker', async () => {
  const allTimeZones = await getDataTZ()
  for (let data in allTimeZones) {
    handleSchedule(data)
  }
})
app.listen(process.env.EXPRESS_PORT, async () => {
  console.log(
    `💵 Server running and listening on http://localhost:${process.env.EXPRESS_PORT}/ …`
  )
  app.emit('Worker')
})
