import { initializeApp } from 'firebase/app'
import {
  getFirestore,
  collection,
  query,
  getDocs,
  where,
} from 'firebase/firestore'
import dotenv from 'dotenv'

dotenv.config()

const config = {
  apiKey: `${process.env.EXPRESS_APIKEY}`,
  authDomain: `${process.env.EXPRESS_AUTHDOMAIN}`,
  projectId: `${process.env.EXPRESS_PROJECTID}`,
  storageBucket: `${process.env.EXPRESS_STORAGEBUCKET}`,
  messagingSenderId: `${process.env.EXPRESS_MESSAGINGSENDERID}`,
  appId: `${process.env.EXPRESS_APPID}`,
  measurementId: `${process.env.EXPRESS_MEASUREMENTID}`,
}

export const appfB = initializeApp(config)
export const db = getFirestore(appfB)
export const emailRef = collection(db, 'emails')

export async function getEmails() {
  const docSnap = await getDocs(emailRef)
  const emails = []
  docSnap.forEach((doc) => {
    emails.push({ ...doc.data() })
  })
  return emails
}
export async function findEmail(email) {
  const q = query(emailRef, where('Email', '==', email))
  const docSnap = await getDocs(q)
  let found
  docSnap.forEach((doc) => {
    if (found) return
    found = doc.id
  })
  return found
}
export async function getEmailsByTimeZone(TimeZone) {
  const q = query(emailRef, where('TimeZone', '==', TimeZone))
  const docSnap = await getDocs(q)
  const emails = []
  docSnap.forEach((doc) => {
    emails.push({ ...doc.data(), id: doc.id })
  })
  return emails
}
