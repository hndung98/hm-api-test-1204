
import prisma from '../common/helpers/prisma.helper'

export default class DashbroadService {
  static async get() {
    const [
      customers,
      doctors,
      applications,
      appointments,
      medicalRecords,
      questions,
      answers
    ] = await prisma.$transaction([
      prisma.customer.findMany(),
      prisma.doctor.findMany(),
      prisma.application.findMany(),
      prisma.appointment.findMany(),
      prisma.medicalRecord.findMany(),
      prisma.question.findMany(),
      prisma.answer.findMany(),
    ])
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    let runMonth = currentMonth
    let runYear = currentYear - 1
    const roadMap = new Map();

    while (runYear * 12 + runMonth <= currentYear * 12 + currentMonth) {
      roadMap.set(`${runMonth + 1}-${runYear}`, {
        customer: 0,
        doctor: 0,
        application: 0,
        appointment: 0,
        medicalRecord: 0,
        question: 0,
        answer: 0
      })
      if (runMonth < 11) {
        runMonth++
      } else {
        runMonth = 0;
        runYear++;
      }
      customers.map(e => {
        const key = `${e.createdAt.getMonth() + 1}-${e.createdAt.getFullYear()}`

        if (roadMap.has(key)) {

          const preRoadMap = roadMap.get(key)
          roadMap.set(key, { ...preRoadMap, customer: preRoadMap.customer + 1 })
        }
      })
      questions.map(e => {
        const key = `${e.createdAt.getMonth() + 1}-${e.createdAt.getFullYear()}`
        if (roadMap.has(key)) {
          const preRoadMap = roadMap.get(key)
          roadMap.set(key, { ...preRoadMap, question: preRoadMap.question + 1 })
        }
      })
      answers.map(e => {
        const key = `${e.createdAt.getMonth() + 1}-${e.createdAt.getFullYear()}`
        if (roadMap.has(key)) {
          const preRoadMap = roadMap.get(key)
          roadMap.set(key, { ...preRoadMap, answer: preRoadMap.answer + 1 })
        }
      })
      doctors.map(e => {
        const key = `${e.createdAt.getMonth() + 1}-${e.createdAt.getFullYear()}`
        if (roadMap.has(key)) {
          const preRoadMap = roadMap.get(key)
          roadMap.set(key, { ...preRoadMap, doctor: preRoadMap.doctor + 1 })
        }
      })
      applications.map(e => {
        const key = `${e.createdAt.getMonth() + 1}-${e.createdAt.getFullYear()}`
        if (roadMap.has(key)) {
          const preRoadMap = roadMap.get(key)
          roadMap.set(key, { ...preRoadMap, application: preRoadMap.application + 1 })
        }
      })
      appointments.map(e => {
        const key = `${e.createdAt.getMonth() + 1}-${e.createdAt.getFullYear()}`
        if (roadMap.has(key)) {
          const preRoadMap = roadMap.get(key)
          roadMap.set(key, { ...preRoadMap, appointment: preRoadMap.appointment + 1 })
        }
      })
      medicalRecords.map(e => {
        const key = `${e.createdAt.getMonth() + 1}-${e.createdAt.getFullYear()}`
        if (roadMap.has(key)) {
          const preRoadMap = roadMap.get(key)
          roadMap.set(key, { ...preRoadMap, medicalRecord: preRoadMap.medicalRecord + 1 })
        }
      })
    }
    console.log(roadMap);
    const res: any = {}
    for (const key of roadMap.keys()) {
      res[key] = roadMap.get(key)
    }
    return res
  }
}

