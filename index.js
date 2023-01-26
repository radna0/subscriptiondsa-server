const app = require('./app')
const { handleSchedule } = require('./utility')
require('dotenv').config()

async function getDataTZ() {
  let response = await fetch(`${process.env.EXPRESS_ALL_TIMEZONES}`)
  let data = await response.json()
  return data
}
app.listen(process.env.EXPRESS_PORT, async () => {
  console.log(
    `💵 Server running and listening on http://localhost:${process.env.EXPRESS_PORT}/ …`
  )
  const allTimeZones = await getDataTZ()
  for (let data in allTimeZones) {
    handleSchedule(data)
  }
})
