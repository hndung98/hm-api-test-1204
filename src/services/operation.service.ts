import { AppointmentStatus, OperationStatus, Weekday, WorkPlaceStatus } from '.prisma/client';
import prisma from '../common/helpers/prisma.helper';
import { Req } from '../common/types/api.type'

export default class OperationService {
    static async get({ redata, user }: Req) {
        const { id } = redata

        const operation = await prisma.operation.findFirst({
            where: {
                doctor: {
                    userId: user.id
                },
                id
            },
            include: {
                workplace: true,
                operationHour: true
            }
        })
        if (!operation) return { error: "Not found operation" }
        return operation
    }

    static async getList({ user }: Req) {
        const operations = await prisma.operation.findMany({
            where: {
                doctor: {
                    userId: user.id
                },
            },
            include: {
                workplace: true,
                operationHour: true
            }
        })
        return operations
    }

    static async update({ redata, user }: Req) {
        const { updateList, deleteList, id } = redata
        let addList = JSON.parse(redata?.addList)

        console.log('addList');
        console.log(addList);
        console.log('deleteList');
        console.log(deleteList);
        console.log('updateList');
        console.log(updateList);


        const operation = await prisma.operation.findFirst({
            where: {
                id,
                doctor: {
                    userId: user.id
                }
            }
        })

        if (!operation) return { error: "Invalid operation" }
        if (operation.status !== OperationStatus.ACTIVE) return { error: "You can not update this operation" }

        // { 
        //     "startTime":"2021-09-03T10:00:00+07:00",
        //     "endTime":"2021-09-03T23:00:00+07:00",
        //     "day":"MONDAY",
        //   },
        const changeList = new Set();
        const updateMap = new Map();
        const updateIds = new Set();

        if (addList && Array.isArray(addList)) {
            for (const item of addList) {

                if (!Object.keys(item).includes('startTime')
                    || !Object.keys(item).includes('endTime')
                    || !Object.keys(item).includes('day')
                    || !Object.values(Weekday).includes(item.day)
                    || isNaN(new Date(item.startTime).getDate())
                    || isNaN(new Date(item.endTime).getDate())
                ) return { error: 'Invalid format' }
            }
        }
        else {
            addList = []
        }

        const deleteListNumber = []
        if (deleteList && Array.isArray(deleteList)) {
            for (const item of deleteList) {
                if (typeof (+item) !== 'number') return { error: 'Invalid format' }
                changeList.add(+item)
                deleteListNumber.push(+item)
            }
        }

        if (updateList && Array.isArray(updateList)) {
            for (const item of updateList) {
                const itemParser = JSON.parse(item)
                if (!Object.keys(itemParser).includes('id')
                    || typeof (itemParser.id) !== 'number'
                    || !Object.keys(itemParser).includes('startTime')
                    || !Object.keys(itemParser).includes('endTime')
                    || !Object.keys(itemParser).includes('day')
                    || !Object.values(Weekday).includes(itemParser.day)
                    || isNaN(new Date(itemParser.startTime).getDate())
                    || isNaN(new Date(itemParser.endTime).getDate())
                ) return { error: 'Invalid format' }
                if (changeList.has(itemParser.id)) return { error: 'Invalid' }
                changeList.add(itemParser.id)
                updateMap.set(itemParser.id, {
                    startTime: itemParser.startTime,
                    endTime: itemParser.endTime,
                    day: itemParser.day,
                })
                updateIds.add(itemParser.id)
            }
        }

        await prisma.$transaction([
            prisma.operationHour.deleteMany({
                where: {
                    id: {
                        in: deleteListNumber ?? []
                    },
                    operationId: id
                }
            }),
            prisma.operationHour.createMany({
                data: addList.map((item: any) => { return { ...item, operationId: id } })
            }),
            ...[...updateIds].map((item: any) => prisma.operationHour.updateMany({
                where: {
                    id: item,
                    operationId: id
                },
                data: {
                    ...updateMap.get(item)
                }
            }))
        ])
        return true
    }

    static async setPatientPerHour({ redata, user }: Req) {
        const { patients, id } = redata

        const operation = await prisma.operation.findFirst({
            where: {
                doctor: {
                    userId: user.id
                },
                id
            },
            include: {
                workplace: true
            }
        })

        if (!operation) return { error: "Unauthorize" }
        if (operation.status === OperationStatus.PENDING
            || operation.status === OperationStatus.BANNED
            || operation.workplace.status === WorkPlaceStatus.PENDING
            || operation.workplace.status === WorkPlaceStatus.BANNED) return { error: "You are not allowed to update this infomation" }
        await prisma.operation.update({
            where: {
                id
            },
            data: {
                patientPerHalfHour: patients
            }
        })
        return true
    }

    static async setMedicalExpense({ redata, user }: Req) {
        const { medicalExpense, id } = redata

        const operation = await prisma.operation.findFirst({
            where: {
                doctor: {
                    userId: user.id
                },
                id
            },
            include: {
                workplace: true
            }
        })

        if (!operation) return { error: "Unauthorize" }
        if (operation.status === OperationStatus.PENDING
            || operation.status === OperationStatus.BANNED
            || operation.workplace.status === WorkPlaceStatus.PENDING
            || operation.workplace.status === WorkPlaceStatus.BANNED) return { error: "You are not allowed to update this infomation" }
        await prisma.operation.update({
            where: {
                id
            },
            data: {
                medicalExpense
            }
        })
        return true
    }

    static async getDoctorAppointment({ redata, user }: Req) {
        const { date, doctorId } = redata
        const fromDate = new Date(date)
        const toDate = new Date(date)
        fromDate.setHours(0)
        fromDate.setMinutes(0)
        fromDate.setSeconds(0)
        fromDate.setMilliseconds(0)
        toDate.setDate(toDate.getDate() + 1)
        toDate.setHours(0)
        toDate.setMinutes(0)
        toDate.setSeconds(0)
        toDate.setMilliseconds(0)
        const appointments = await prisma.appointment.findMany({
            where: {
                day: {
                    gte: fromDate,
                    lt: toDate,
                },
                doctorId,
                status: AppointmentStatus.PENDING
            }
        })

        return appointments.map(appointment => appointment.day)
    }
}

