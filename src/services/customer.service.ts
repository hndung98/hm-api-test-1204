import { Req } from '../common/types/api.type'
import prisma from '../common/helpers/prisma.helper'
import CryptoHelper from '../common/helpers/crypto.helper'
import ResourceService from './resource.service';
import { ReferenceType, Role } from '.prisma/client';
import TokenHelper from '../common/helpers/token.helper';
import RegisterMailRepo from '../repository/register-mail.repo';
import { ACCOUNT_TYPE } from './user.service';
import RegisterSmsRepo from '../repository/sms-code.repo';
import SMSHelper from '../common/helpers/sms.helper'
import EmergencySmsRepo from '../repository/emergency-sms.repo';

const LIMIT_EMERGENCY_SMS = 3
// // 2021-09-13T20:50:40+07:00
export default class CustomerService {
  static async create({ redata }: Req) {
    const {
      email,
      phoneNumber,
      firstName,
      lastName,
      password,
      gender,
      code,
      registerType
    } = redata;
    if (registerType === ACCOUNT_TYPE.EMAIL) {
      const mailCode: any = await RegisterMailRepo.getMail(email)
      if (!mailCode || !mailCode.code) return { error: "This mail has not be registor" }
      if (mailCode?.code !== code) return { error: "Code invalid" }
      if (!email.trim() || !password.trim()) return { error: "Missing email or password" }

      const cus = await prisma.user.findFirst({
        where: {
          email
        }
      })
      if (cus) return { error: 'Invalid' }
      await prisma.user.create({
        data: {
          email,
          accessKey: TokenHelper.genCode6(),
          password: CryptoHelper.generateHash(password),
          customer: {
            create: {
              firstName,
              lastName,
              gender,
            }
          }
        }
      })

      await RegisterMailRepo.deleteMailCode(email)
      return true

    }
    else {
      const smsCode: any = await RegisterSmsRepo.getCode(phoneNumber)
      if (!smsCode || !smsCode.code) return { error: "This phone number has not sent registration request yet" }
      if (smsCode?.code !== code) return { error: "Code invalid" }
      if (!phoneNumber.trim() || !password.trim()) return { error: "Missing phone number or password" }

      const cus = await prisma.user.findFirst({
        where: {
          phoneNumber
        }
      })
      if (cus) return { error: 'Invalid' }
      await prisma.user.create({
        data: {
          phoneNumber,
          accessKey: TokenHelper.genCode6(),
          password: CryptoHelper.generateHash(password),
          customer: {
            create: {
              firstName,
              lastName,
              gender,
            }
          }
        }
      })
      await RegisterSmsRepo.deleteCode(phoneNumber)
      return true
    }
  }

  static async getProfile({ user }: Req) {
    const profile = await prisma.user.findUnique({
      where: {
        id: user.id
      },
      select: {
        ..._selectDefaultUserCustomer,
      }
    })
    ResourceService.includeFileURL(profile?.customer, 'avatar', 'avatarURL')
    return profile
  }

  static async updateProfile({ redata, files, user }: Req) {
    const { firstName, lastName, birthday, gender, phoneNumber, provinceId, address } = redata

    const province = await prisma.province.findUnique({
      where: {
        id: provinceId
      }
    })

    if (!province) return { error: "Invalid province" }

    let data: any = {
      firstName,
      lastName,
      gender,
      birthday: new Date(birthday),
      contactPhoneNumber: phoneNumber,
      address,
      province: {
        connect: {
          id: provinceId
        }
      }
    }
    if (files?.avatar) {
      const { uuid, extension } = ResourceService.upload(files.avatar)
      data = {
        ...data,
        avatar: {
          create: {
            uuid,
            extension,
            referenceType: ReferenceType.AVATAR_IMG
          }
        },
      }
    }
    const customer = await prisma.user.update({
      where: {
        id: user.id
      },
      data: {
        customer: {
          update: {
            ...data,
          }
        }
      },
      select: selectDefaultUserCustomer
    })

    ResourceService.includeFileURL(customer.customer, 'avatar', 'avatarURL')
    return customer
  }

  static async setEmergencySms({ redata, user }: Req) {
    const { phoneNumber, content } = redata
    if (user.role !== Role.CUSTOMER) return { error: "Unauthorize" }

    await prisma.customer.update({
      data: {
        emergencyPhoneNumber: phoneNumber,
        emergencyContent: content
      },
      where: {
        userId: user.id
      }
    })
    return true
  }

  static async getEmergencySms({ user }: Req) {
    return await prisma.customer.findFirst({
      where: {
        userId: user.id
      },
      select: {
        emergencyPhoneNumber: true,
        emergencyContent: true
      }
    })
  }

  static async sendEmergencySms({ user }: Req) {
    const customer = await prisma.customer.findFirst({
      where: {
        userId: user.id
      }
    })

    if (!customer) return { error: "Invalid role" }
    if (!customer.emergencyPhoneNumber || !customer.emergencyContent) return { error: "Missing emergency phone number or emergency content" }
    const globalPhoneNumber = `+84${customer.emergencyPhoneNumber.slice(1, customer.emergencyPhoneNumber.length)}`
    const lastSms: any = await EmergencySmsRepo.getData(`${user.id}`)

    if (lastSms) {
      const currentTime = new Date()
      if (
        lastSms?.time?.getDate() === currentTime.getDate()
        && lastSms?.time?.getMonth() === currentTime.getMonth()
        && lastSms?.time?.getFullYear() === currentTime.getFullYear()
      ) {
        if (lastSms.count >= LIMIT_EMERGENCY_SMS) return { error: "You've run out of messages for the day" }
        await EmergencySmsRepo.setData(`${user.id}`, lastSms.count + 1)
      }
    }
    else {
      await EmergencySmsRepo.setData(`${user.id}`, 1)
    }
    await SMSHelper.sendSMS(globalPhoneNumber, customer.emergencyContent)
    return true
  }
}

export const adminSelectDefaultCustomer = {
  id: true,
  firstName: true,
  lastName: true,
  birthday: true,
  gender: true,
  avatar: true,
  contactPhoneNumber: true,
  healthInsuranceCode: true,
  address: true,
  province: true,
  guardianTwo: {
    include: {
      userOne: {
        include: {
          user: true,
          avatar: true
        }
      }
    }
  }
}

export const selectDefaultCustomer = {
  id: true,
  firstName: true,
  lastName: true,
  birthday: true,
  gender: true,
  avatar: true,
  contactPhoneNumber: true,
  healthInsuranceCode: true,
  address: true,
  province: true
}

export const selectDefaultUserCustomer = {
  id: true,
  email: true,
  role: true,
  phoneNumber: true,
  verified: true,
  createdAt: true,
  updatedAt: true,
  customer: {
    select: {
      ...selectDefaultCustomer
    }
  }
}

const _selectDefaultCustomer = {
  id: true,
  firstName: true,
  lastName: true,
  birthday: true,
  gender: true,
  avatar: true,
  contactPhoneNumber: true,
  healthInsuranceCode: true,
  address: true,
  province: true,
}

const _selectDefaultUserCustomer = {
  id: true,
  email: true,
  role: true,
  phoneNumber: true,
  verified: true,
  createdAt: true,
  updatedAt: true,
  customer: {
    select: {
      ..._selectDefaultCustomer
    }
  }
}

