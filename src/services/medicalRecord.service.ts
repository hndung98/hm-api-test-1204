import { Req } from '../common/types/api.type'
import prisma from '../common/helpers/prisma.helper'
import ResourceService from './resource.service';
import { PrismaUtils } from '../common/utils/prisma.util';
import { AppointmentStatus, GuardianStatus, MedicalRecordStatus, ReferenceType } from '.prisma/client';
import { ObjectUtils } from '../common/utils/object.util'

export default class MedicalRecordService {
  //2021-09-03T23:16:32+07:00
  static async getList({ redata, user }: Req) {
    const { skip, take, medicalRecordStatus, appointmentStatus, customerId } = redata

    if (customerId) {
      const customer = await prisma.customer.findFirst({
        where: {
          id: customerId,
          OR: [
            {
              userId: user.id
            },
            {
              guardianTwo: {
                some: {
                  userOne: {
                    userId: user.id
                  },
                  status: GuardianStatus.ACCEPTED
                }
              }
            }
          ]
        }
      })
      if (!customer) return { error: "Unauthorize" }
    }

    const options = PrismaUtils.getPaginationOptions({
      skip,
      take,
    })
    let query = {}
    if (medicalRecordStatus) {
      query = {
        ...query,
        status: medicalRecordStatus
      }
    }
    if (appointmentStatus) {
      query = {
        ...query,
        appointment: {
          some: {
            status: appointmentStatus
          }
        }
      }
    }
    let whereCustomer: any = {}
    if (customerId) {
      whereCustomer = {
        id: customerId,
        OR: [
          {
            userId: user.id
          },
          {
            guardianTwo: {
              some: {
                userOne: {
                  userId: user.id
                },
                status: GuardianStatus.ACCEPTED
              }
            }
          }
        ]
      }
    } else {

      whereCustomer = {
        OR: [
          {
            userId: user.id
          },
          {
            guardianTwo: {
              some: {
                userOne: {
                  userId: user.id
                },
                status: GuardianStatus.ACCEPTED
              }
            }
          }
        ]
      }
    }

    const medicalRecords = await prisma.medicalRecord.findMany({
      ...options,
      where: {
        customer: {
          ...whereCustomer
        },
        ...query
      },
      select: {
        id: true,
        symptom: true,
        diagnostic: true,
        medicalExpense: true,
        note: true,
        status: true,
        createdAt: true,
        updatedAt: true,
        images: true,
        bloodGroup: true,
        bloodPressure: true,
        bodyTemperature: true,
        heartBeat: true,
        height: true,
        weight: true,
        customer: {
          include: {
            province: true,
            avatar: true,

          }
        },
        files: true,
        appointment: {
          include: {
            doctor: {
              include: {
                avatar: true,
                specialized: true
              }
            }
          }
        },
      }
    })

    medicalRecords.map((e: any) => {
      ResourceService.includeFileURL(e, 'images');
      ResourceService.includeFileURL(e.customer, 'avatar', 'avatarURL');
      e.appointment.map((a: any) => ResourceService.includeFileURL(a.doctor, 'avatar', 'avatarURL'))
      ResourceService.includeFileURL(e, 'files')
    })
    return medicalRecords
  }

  static async getById({ redata, user }: Req) {
    const { id } = redata
    const medicalRecord: any = await prisma.medicalRecord.findFirst({
      where: {
        id: id,
        OR: [
          {
            customer: {
              userId: user.id,
            },
          },
          {
            customer: {
              guardianTwo: {
                some: {
                  userOne: {
                    userId: user.id
                  },
                  status: GuardianStatus.ACCEPTED
                }
              }
            }
          }
        ]
      },
      select: {
        id: true,
        symptom: true,
        diagnostic: true,
        medicalExpense: true,
        note: true,
        status: true,
        createdAt: true,
        updatedAt: true,
        images: true,
        bloodGroup: true,
        bloodPressure: true,
        heartBeat: true,
        bodyTemperature: true,
        height: true,
        weight: true,
        files: true,
        appointment: {
          include: {
            doctor: {
              include: {
                avatar: true,
                specialized: true
              }
            }
          }
        },
      }
    })

    console.log(medicalRecord.appointment)
    ResourceService.includeFileURL(medicalRecord, 'images');
    medicalRecord.appointment?.map((a: any) => ResourceService.includeFileURL(a.doctor, 'avatar', 'avatarURL'))
    ResourceService.includeFileURL(medicalRecord, 'files')
    return medicalRecord
  }

  static async doctorGetCustomerList({ redata, user }: Req) {
    const { skip, take, id } = redata

    const options = PrismaUtils.getPaginationOptions({
      skip,
      take,
    })

    const appointments = await prisma.appointment.findMany({
      where: {
        doctor: {
          userId: user.id
        },
        medicalRecord: {
          customerId: id
        }
      }
    })

    let isAllowView = false

    for (const appointment of appointments) {
      if (appointment.status == AppointmentStatus.PENDING || appointment.status == AppointmentStatus.DOING) isAllowView = true
    }

    if (!isAllowView) return { error: 'Unauthorize' }

    const medicalRecords = await prisma.medicalRecord.findMany({
      ...options,
      where: {
        customer: {
          userId: +id,
        },
      },
      select: {
        id: true,
        symptom: true,
        diagnostic: true,
        medicalExpense: true,
        note: true,
        status: true,
        createdAt: true,
        updatedAt: true,
        images: true,
        bloodGroup: true,
        bloodPressure: true,
        heartBeat: true,
        bodyTemperature: true,
        height: true,
        weight: true,
        appointment: {
          include: {
            doctor: {
              include: {
                avatar: true,
                specialized: true
              }
            }
          }
        },
      }
    })

    let res = medicalRecords.filter((medicalRecord: any) => {
      if (medicalRecord.status === MedicalRecordStatus.PUBLIC
        || (medicalRecord.status === MedicalRecordStatus.ONLY_DOCTOR_EXAMINATION
          && medicalRecord?.appointment?.doctor?.userId === user.id)) return true
      return false
    })

    if (skip) res = res.slice(skip)
    if (take) res = res.slice(0, take)

    res.map((e: any) => {
      ResourceService.includeFileURL(e, 'images');
      ResourceService.includeFileURL(e.appointment.doctor, 'avatar', 'avatarURL');
    })
    return res
  }

  static async doctorUpdate({ redata, files, user }: Req) {
    const {
      id,
      diagnostic,
      medicalExpense,
      note,
      height,
      weight,
      bodyTemperature,
      bloodPressure,
      heartBeat,
      bloodGroup
    } = redata

    const medicalRecord = await prisma.medicalRecord.findFirst({
      where: {
        id: id,
        appointment: {
          some: {
            doctor: {
              userId: user.id
            },
            status: AppointmentStatus.DOING
          }
        }
      }
    })

    if (!medicalRecord) return { error: "Unauthorize" }

    let uploadFiles = []

    if (files?.files) {
      if (!Array.isArray(files.files)) {
        uploadFiles.push({
          ...ResourceService.upload(files.files),
          referenceType: ReferenceType.MEDICAL_RECORD_FILE,
        })
      } else {
        uploadFiles = files.files.map((image: any) => {
          return {
            ...ResourceService.upload(image),
            referenceType: ReferenceType.MEDICAL_RECORD_FILE,
          }
        })
      }
    }

    const data = ObjectUtils.removeEmpty({

      diagnostic,
      medicalExpense,
      note,
      height,
      weight,
      bodyTemperature,
      bloodPressure,
      heartBeat,
      bloodGroup
    })

    await prisma.medicalRecord.update({
      data: {
        ...data,
        files: {
          createMany: {
            data: uploadFiles
          }
        }
      },
      where: {
        id: medicalRecord.id,
      }
    })
    return true
  }

  static async doctorGetById({ redata, user }: Req) {
    const { id } = redata

    const medicalRecord = await prisma.medicalRecord.findFirst({
      where: {
        id: id,
        customer: {
          patient: {
            some: {
              appointment: {
                some: {
                  doctor: {
                    userId: user.id
                  },
                  OR: [
                    {
                      status: AppointmentStatus.PENDING
                    },
                    {
                      status: AppointmentStatus.DOING
                    },
                    {
                      status: AppointmentStatus.DONE
                    },
                  ]
                }
              }
            }
          }
        }
      }
    })
    return medicalRecord
  }

  static async update({ redata, user }: Req) {
    const { id, status } = redata
    const medicalRecord = await prisma.medicalRecord.findFirst({
      where: {
        id: id,
        OR: [
          {
            customer: {
              userId: user.id,
            },
          },
          {
            customer: {
              guardianTwo: {
                some: {
                  userOne: {
                    userId: user.id
                  },
                  status: GuardianStatus.ACCEPTED
                }
              }
            }
          }
        ]
      }
    })
    if (!medicalRecord) return { error: "Unauthorize" }
    await prisma.medicalRecord.update({
      data: {
        status
      },
      where: {
        id
      }
    })
    return true
  }
}

