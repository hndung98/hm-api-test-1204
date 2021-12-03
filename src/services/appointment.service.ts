import { Req } from '../common/types/api.type'
import prisma from '../common/helpers/prisma.helper'
import ResourceService from './resource.service';
import { AppointmentStatus, GuardianStatus, MedicalRecordStatus, OperationStatus, ReferenceType, WorkPlaceStatus } from '.prisma/client';
import { PrismaUtils } from '../common/utils/prisma.util';
import { Period } from '../routes/params/appointment/get-customer-appointment.params';
import PaymentService from './payment.service';

export const weekday = [
  'SUNDAY',
  'MONDAY',
  'TUESDAY',
  'WEDNESDAY',
  'THURSDAY',
  'FRIDAY',
  'SATURDAY',
]

const VNP_AMOUNT = process.env.VNP_AMOUNT

export default class AppointmentService {
  //2021-09-03T23:16:32+07:00
  static async create({ redata, files, user }: Req) {
    const { guardianId, doctorId, dayTime, description, customerIp } = redata;
    const operationHours = await prisma.operationHour.findMany({
      where: {
        operation: {
          doctor: {
            id: doctorId
          }
        }
      },
      include: {
        operation: {
          include: {
            workplace: true
          }
        }
      }
    })
    let onWorkTime = false
    const pickTime = new Date(dayTime)
    let workPlace = null
    let amount = null
    if (isNaN(pickTime.getDate())) return { error: 'Invalid' }
    for (const item of operationHours) {
      if (
        weekday[pickTime.getDay()] === item.day
        && (
          item.startTime.getHours() < pickTime.getHours()
          ||
          (
            item.startTime.getHours() === pickTime.getHours()
            && item.startTime.getMinutes() < pickTime.getMinutes()
          )
        )
        && (
          item.endTime.getHours() > pickTime.getHours()
          ||
          (
            item.endTime.getHours() === pickTime.getHours()
            && item.endTime.getMinutes() > pickTime.getMinutes()
          )
        )
        && item.operation.status === OperationStatus.ACTIVE
        && item.operation.workplace.status === WorkPlaceStatus.ACTIVE
      ) {
        onWorkTime = true
        workPlace = item.operation.workplace
        amount = item.operation.medicalExpense
      }
    }

    if (!onWorkTime || !workPlace) return { error: "Invalid Time" }

    if (guardianId) {
      const guardian = await prisma.customer.findFirst({
        where: {
          id: guardianId,
          guardianTwo: {
            some: {
              userOne: {
                userId: user.id
              },
              status: GuardianStatus.ACCEPTED
            }
          }
        }
      })
      if (!guardian) return { error: "Unauthorize" }
    }

    let images = []
    if (files?.images) {
      if (!Array.isArray(files.images)) {
        images.push({
          ...ResourceService.upload(files.images),
          referenceType: ReferenceType.APPOINTMENT_IMG,
        })
      } else {
        images = files.images.map((image: any) => {
          return {
            ...ResourceService.upload(image),
            referenceType: ReferenceType.APPOINTMENT_IMG,
          }
        })
      }
    }
    const doctor = await prisma.doctor.findFirst({
      where: {
        id: doctorId
      },
    })

    if (!doctor) return { error: "Incorrect" }
    const customer = await prisma.customer.findFirst({
      where: {
        userId: user.id
      }
    });
    if (!customer) return { error: 'Incorrect' }

    const medicalRecord = await prisma.medicalRecord.create({
      data: {
        customerId: guardianId && !isNaN(guardianId) ? guardianId : customer.id,
        symptom: description,
        status: MedicalRecordStatus.PUBLIC,
        appointment: {
          create: {
            day: pickTime,
            doctor: {
              connect: {
                id: doctor.id
              }
            },
            workplace: {
              connect: {
                id: workPlace.id
              }
            },
            status: AppointmentStatus.WAITING_PAYMENT,
            paymentCost: amount ? amount : VNP_AMOUNT ? +VNP_AMOUNT : 20000
          }
        },
        images: {
          createMany: {
            data: images
          }
        }
      },
      include: {
        appointment: true
      }
    })

    let appointmentLastest = { ...medicalRecord.appointment[0] }

    for (const a of medicalRecord.appointment) {
      if (a.id !== appointmentLastest.id && a.createdAt > appointmentLastest.createdAt) {
        appointmentLastest = { ...a }
      }
    }

    const paymentUrl = await PaymentService.createPaymentUrl('DatLichKham', customerIp, appointmentLastest.id, amount ?? undefined)

    return paymentUrl

  }

  static async recreatePaymentUrl({ redata, user }: Req) {
    const { id, customerIp } = redata

    const appointment = await prisma.appointment.findFirst({
      where: {
        id: +id,
        medicalRecord: {
          customer: {
            userId: user.id
          }
        }
      },
    })
    if (!appointment) return { error: "Invalid appointment" }
    if (appointment.status === AppointmentStatus.DOCTOR_CANCEL
      || appointment.status === AppointmentStatus.CUSTOMER_CANCEL) return { error: "This appointment has been cancelled" }
    if (appointment.status === AppointmentStatus.DONE) return { error: "This appointment is done" }
    if (appointment.isPayment) return { error: "This appointment has been paid" }

    const operation = await prisma.operation.findFirst({
      where: {
        doctor: {
          appointment: {
            some: {
              id: +id
            }
          }
        },
        workplace: {
          appointment: {
            some: {
              id: +id
            }
          }
        }
      }
    })

    const paymentUrl = await PaymentService.createPaymentUrl('DatLichKham', customerIp, +id, operation?.medicalExpense ?? undefined)
    return paymentUrl
  }

  static async customerCancel({ redata, user }: Req) {
    const { id } = redata
    const appointment = await prisma.appointment.findFirst({
      where: {
        id: id,
        medicalRecord: {
          customer: {
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
      },
    })
    if (!appointment) return { error: 'Invalid' }
    await prisma.appointment.update({
      data: {
        status: AppointmentStatus.CUSTOMER_CANCEL
      },
      where: {
        id: id
      }
    })
    return true
  }

  static async doctorCancel({ redata, user }: Req) {
    const { id } = redata
    const appoiment = await prisma.appointment.findFirst({
      where: {
        id,
        doctor: {
          userId: user.id
        }
      }
    })
    if (!appoiment) return { error: "Invalid" }
    await prisma.appointment.update({
      where: {
        id
      },
      data: {
        status: AppointmentStatus.DOCTOR_CANCEL
      }
    })

  }

  static async getList({ redata, user }: Req) {
    const { skip, take } = redata

    const options = PrismaUtils.getPaginationOptions({
      skip,
      take,
    })
    const appointments = await prisma.appointment.findMany({
      ...options,
      where: {
        doctor: {
          userId: user.id
        }
      },
      include: {
        medicalRecord: {
          include: {
            customer: {
              include: {
                avatar: true,
                guardianTwo: {
                  include: {
                    userOne: {
                      include: {
                        user: true
                      }
                    }
                  }
                }
              }
            },
            images: true
          },
        },
        workplace: true
      }
    })
    appointments.map((a: any) => {
      ResourceService.includeFileURL(a.medicalRecord, 'images')
      ResourceService.includeFileURL(a.medicalRecord?.customer, 'avatar', 'avatarURL')
    })
    return appointments
  }


  static async get({ redata, user }: Req) {
    const { id } = redata
    const appointment = await prisma.appointment.findFirst({
      where: {
        id: id,
        doctor: {
          userId: user.id
        }
      },
      include: {
        medicalRecord: {
          include: {
            images: true,
            customer: {
              include: {
                avatar: true,
                guardianTwo: {
                  include: {
                    userOne: {
                      include: {
                        user: true
                      }
                    }
                  }
                }
              }
            }
          }
        },
        workplace: true
      }
    })
    if (!appointment) return { error: 'Unauthrize' }
    ResourceService.includeFileURL(appointment.medicalRecord, 'images')
    ResourceService.includeFileURL(appointment.medicalRecord.customer, 'avatar', 'avatarURL')
    return appointment
  }

  static async getByCustomer({ redata, user }: Req) {
    const { status, period, day, month, year, customerId } = redata

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

    if ((period === Period.DAY && (!day || !month || !year)) ||
      (period === Period.MONTH && (!month || !year)) ||
      (period === Period.YEAR && (!year))
    ) return { error: 'Invalid' }

    let where: any = {}
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



    if (status) where = { ...where, status: status }
    const appointment = await prisma.appointment.findMany({
      where: {
        ...where,
        medicalRecord: {
          customer: {
            ...whereCustomer
          }
        }
      },
      include: {
        doctor: {
          include: {
            avatar: true,
          }
        },
        medicalRecord: {
          include: {
            customer: {
              include: {
                avatar: true,
                province: true
              }
            },
            images: true,
          }
        },
      }
    })
    let resAppointment: any = []
    if (period === Period.DAY) {
      resAppointment = appointment.filter(e => e.day.getFullYear === year && e.day.getMonth === month && e.day.getDate === day)
    }
    else if (period === Period.MONTH) {
      resAppointment = appointment.filter(e => e.day.getFullYear === year && e.day.getMonth === month)
    }
    else if (period === Period.YEAR) {
      resAppointment = appointment.filter(e => e.day.getFullYear === year)
    }
    else {
      resAppointment = appointment
    }
    resAppointment.map((e: any) => {
      ResourceService.includeFileURL(e.doctor, 'avatar', 'avatarURL')
      ResourceService.includeFileURL(e.medicalRecord, 'images')
      ResourceService.includeFileURL(e.medicalRecord.customer, 'avatar', 'avatarURL')
    })
    return resAppointment
  }

  static async customerGetById({ redata, user }: Req) {
    const { id } = redata

    const appoiment = await prisma.appointment.findFirst({
      where: {
        id: +id,
        medicalRecord: {
          customer: {
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
      },
      include: {
        doctor: {
          include: {
            avatar: true,
            specialized: true,
            operation: {
              include: {
                operationHour: true
              }
            },
          }
        },
        medicalRecord: {
          include: {
            images: true,
          }
        }
      }
    })
    if (!appoiment) return { error: 'Unauthorize' }
    ResourceService.includeFileURL(appoiment?.doctor, 'avatar', 'avatarURL')
    ResourceService.includeFileURL(appoiment?.medicalRecord, 'images')
    return appoiment

  }

  static async doctorUpdate({ redata, user }: Req) {
    const { id, status } = redata
    const endStatus = [AppointmentStatus.DONE, AppointmentStatus.CUSTOMER_CANCEL, AppointmentStatus.DOCTOR_CANCEL]
    const appoiment = await prisma.appointment.findFirst({
      where: {
        id: id,
        doctor: {
          userId: user.id
        }
      }
    })
    if (!appoiment) return { error: "Unauthorize" }
    if (endStatus.includes(appoiment.status as any) || (appoiment.status === AppointmentStatus.PENDING && status === AppointmentStatus.DONE)) {
      return { error: 'Invalid' }
    }

    await prisma.appointment.update({
      where: {
        id
      },
      data: {
        status
      }
    })
    return true
  }

}

// https://sandbox.vnpayment.vn/paymentv2/vpcpay.html?
// vnp_Amount=2000000&
// vnp_Command=pay&
// vnp_CreateDate=20211122221119&
// vnp_CurrCode=VND&
// vnp_IpAddr=192.168.1.7&
// vnp_Locale=vn&
// vnp_OrderInfo=dat&
// fbclid=IwAR24VerDSaMWRKskyG1WRqG3dwVx_ikn6EOePSC4m80g3BJeJRLAIjHNZzs