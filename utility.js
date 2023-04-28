import cron from 'node-cron'
import { doc, setDoc, updateDoc, deleteDoc } from 'firebase/firestore'
import { emailRef, getEmailsByTimeZone } from './firebase.js'
import { LeetCode } from 'leetcode-query'
import { probAlgo, HandleCourierSend } from './resouces.js'
import dotenv from 'dotenv'

dotenv.config()

export const handleEmail = async ({ email, timeZone, problems }) => {
  await setDoc(doc(emailRef), {
    Email: email,
    TimeZone: timeZone,
    Problems: problems,
    Day: 1,
  })
}
export async function updateEmail(data) {
  const dbRef = doc(emailRef, data.id)
  await updateDoc(dbRef, {
    Problems: data.Problems,
    Day: data.Day,
  })
}
export async function endEmail(data) {
  const dbRef = doc(emailRef, data.id)
  await updateDoc(dbRef, {
    TimeZone: '',
  })
}
export async function delEmail(id) {
  const res = await deleteDoc(doc(emailRef, id))
  return res
}

export const totalQuestions = async (difficulty) => {
  const leetcode = new LeetCode()
  const problems = await leetcode.problems({
    limit: 1,
    filters: {
      difficulty: difficulty,
    },
  })
  return problems.total
}
export const handleProblems = async (offset, limit, difficulty) => {
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
export const randomProblem = async (total, limit, difficulty) => {
  const randomOffSet = Math.floor(Math.random() * total)
  const allProb = await handleProblems(
    Math.max(0, randomOffSet - limit),
    limit,
    difficulty
  )
  return allProb
}
export const handleGivingProblems = async () => {
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
export const handleSchedule = (TimeZone) => {
  // const saved = '0 7 */1 */1 *'

  const ScheduleExe = () => {
    const task = cron.schedule(
      '*/10 * * * *',
      async () => {
        const allEmails = await getEmailsByTimeZone(TimeZone)

        for (let user of allEmails) {
          if (user.Problems.length) {
            const random = Math.floor(Math.random() * user.Problems.length)
            const probTitle = user.Problems[random]
            const leetcode = new LeetCode()
            const problem = await leetcode.problem(probTitle)
            const reqID = await HandleCourierSend(
              'WDW1E6Z0FZMDTDKJS1NSWDD1DYH3',
              user.Email,
              {
                day: user.Day,
                problem: problem.title,
                link: problem.titleSlug,
                id: user.id,
              }
            )
            user.Day += 1
            user.Problems.splice(random, 1)
            await updateEmail(user)
          } else {
            const reqID = await HandleCourierSend(
              'EDTF0R80MRMFVRN390X8VDVG3BWC',
              user.Email
            )
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
