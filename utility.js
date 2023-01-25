var cron = require('node-cron')
const { doc, setDoc, updateDoc, deleteDoc } = require('firebase/firestore')
const { emailRef, getEmailsByTimeZone } = require('./firebase')
const { LeetCode } = require('leetcode-query')
const { probAlgo } = require('./resouces')
const { CourierClient } = require('@trycourier/courier')
require('dotenv').config()

const handleEmail = async ({ email, timeZone, problems }) => {
  await setDoc(doc(emailRef), {
    Email: email,
    TimeZone: timeZone,
    Problems: problems,
    Day: 1,
  })
}
async function updateEmail(data) {
  const dbRef = doc(emailRef, data.id)
  await updateDoc(dbRef, {
    Problems: data.Problems,
    Day: data.Day,
  })
}
async function endEmail(data) {
  const dbRef = doc(emailRef, data.id)
  await updateDoc(dbRef, {
    TimeZone: '',
  })
}
async function delEmail(id) {
  const res = await deleteDoc(doc(emailRef, id))
  return res
}

const totalQuestions = async (difficulty) => {
  const leetcode = new LeetCode()
  const problems = await leetcode.problems({
    limit: 1,
    filters: {
      difficulty: difficulty,
    },
  })
  return problems.total
}
const handleProblems = async (offset, limit, difficulty) => {
  const leetcode = new LeetCode()
  const problems = await leetcode.problems({
    offset: offset,
    limit: limit,
    filters: {
      difficulty: difficulty,
    },
  })
  return problems.questions
}
const randomProblem = async (total, limit, difficulty) => {
  const randomOffSet = Math.floor(Math.random() * total)
  const allProb = await handleProblems(
    Math.max(0, randomOffSet - limit),
    limit,
    difficulty
  )
  return allProb
}
const handleGivingProblems = async () => {
  const res = []
  const total = await totalQuestions(probAlgo.difficulty)
  while (res.length != probAlgo.total) {
    const prob = await randomProblem(
      total,
      Math.floor(probAlgo.total / 3),
      probAlgo.difficulty
    )
    for (let data of prob) {
      if (res.length == probAlgo.total) break
      if (!data.isPaidOnly) res.push(data.titleSlug)
    }
  }
  return res
}
const handleSchedule = (TimeZone) => {
  // const saved = '0 7 */1 */1 *'
  const ScheduleExe = () => {
    const task = cron.schedule(
      '0 7 */1 */1 *',
      async () => {
        const allEmails = await getEmailsByTimeZone(TimeZone)

        for (let user of allEmails) {
          const courier = CourierClient({
            authorizationToken: `${process.env.EXPRESS_AUTH_EMAIL_TOKEN}`,
          })
          if (user.Problems.length) {
            const random = Math.floor(Math.random() * user.Problems.length)
            const probTitle = user.Problems[random]
            const leetcode = new LeetCode()
            const problem = await leetcode.problem(probTitle)
            const { requestId } = await courier.send({
              message: {
                to: {
                  email: user.Email,
                },
                template: 'WDW1E6Z0FZMDTDKJS1NSWDD1DYH3',
                data: {
                  day: user.Day,
                  problem: problem.title,
                  link: problem.titleSlug,
                  id: user.id,
                },
                routing: {
                  method: 'single',
                  channels: ['email'],
                },
              },
            })
            user.Day += 1
            user.Problems.splice(random, 1)
            await updateEmail(user)
          } else {
            const { requestId } = await courier.send({
              message: {
                to: {
                  email: user.Email,
                },
                template: 'EDTF0R80MRMFVRN390X8VDVG3BWC',
                routing: {
                  method: 'single',
                  channels: ['email'],
                },
              },
            })
            await endEmail(user)
          }
        }
      },
      {
        scheduled: true,
        timezone: TimeZone,
      }
    )
    return task
  }
  const task = ScheduleExe()
  task.start()
}

module.exports = {
  handleEmail,
  delEmail,
  handleGivingProblems,
  handleSchedule,
}
