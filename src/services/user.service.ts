
import prisma from '../common/helpers/prisma.helper'
import MailHelper from '../common/helpers/mail.helper'
import { Req } from '../common/types/api.type'
import CryptoHelper from '../common/helpers/crypto.helper'
import TokenHelper from '../common/helpers/token.helper'
import { Role } from '@prisma/client'
import { adminSelectDefaultCustomer, selectDefaultCustomer } from './customer.service'
import { selectDedaultDoctor } from './doctor.service'
import ResourceService from './resource.service'
import HttpException from '../common/http/http-exception'
import RegisterMailRepo from '../repository/register-mail.repo'
import RegisterSmsRepo from '../repository/sms-code.repo'
import SMSHelper from '../common/helpers/sms.helper'
import LoginSmsRepo from '../repository/login-sms-code.repo'
import ForgotPasswordRepo from '../repository/forgot-password.repo'
import { CertificateType } from '../routes/params/user/forgot-password.params'
import AddDataRepo from '../repository/add-data.repo'

export const ACCOUNT_TYPE = {
  EMAIL: "EMAIL",
  PHONE: "PHONE"
}

const mailHelper = new MailHelper()
export default class UserService {

  static async init() {
    if (
      !process.env.SUPER_ADMIN ||
      !process.env.SUPER_EMAIL ||
      !process.env.SUPER_PWD
    )
      return false

    const email = process.env.SUPER_EMAIL
    const password = CryptoHelper.generateHash(process.env.SUPER_PWD)

    const user = await prisma.user.findUnique({
      where: {
        email: email.trim().toLowerCase(),
      },
    })
    if (!user) {
      await prisma.user.create({
        data: {
          email: email.trim().toLowerCase(),
          password,
          role: Role.ADMIN,
          accessKey: TokenHelper.genCode6(),
          verified: true,
        },
      })

      return true
    }
    return false
  }

  static async suspend({ redata }: Req) {
    const { id, isSuspend } = redata
    await prisma.user.update({
      where: {
        id
      },
      data: {
        suspended: isSuspend
      }
    })
    return true
  }

  static async deleteCustomer({ redata }: Req) {
    const { id, isDelete } = redata
    await prisma.customer.update({
      where: {
        id
      },
      data: {
        deleted: isDelete
      }
    })
    return true
  }

  static async sendRegisterMail({ redata }: Req) {
    const { email } = redata
    const user = await prisma.user.findFirst({
      where: {
        email
      }
    })
    if (user) return { error: 'This email already register' }
    const code = CryptoHelper.genCode(6)
    await RegisterMailRepo.setMailCode(email, code)
    await mailHelper.sendMailCode(email, code)
    return true
  }

  static async sendRegisterSms({ redata }: Req) {
    const { phoneNumber } = redata
    const user = await prisma.user.findFirst({
      where: {
        phoneNumber
      }
    })
    if (user) return { error: 'This phone number already register' }
    const code = CryptoHelper.genCode(6)
    const globalPhoneNumber = `+84${phoneNumber.slice(1, phoneNumber.length)}`
    console.log(await RegisterSmsRepo.setCode(phoneNumber, code))
    await SMSHelper.sendSMS(globalPhoneNumber, code)
    return true
  }

  static async sendLoginSms({ redata }: Req) {
    const { phoneNumber } = redata
    const user = await prisma.user.findFirst({
      where: {
        phoneNumber
      }
    })
    if (!user) return { error: 'This phone number was not registered' }
    const code = CryptoHelper.genCode(6)
    const globalPhoneNumber = `+84${phoneNumber.slice(1, phoneNumber.length)}`
    await LoginSmsRepo.setCode(phoneNumber, code)
    await SMSHelper.sendSMS(globalPhoneNumber, code)
    return true
  }

  static async login({ redata }: Req) {
    const { username, password } = redata

    const user: any = await prisma.user.findFirst({
      where: {
        OR: [
          {
            email: username
          },
          {
            phoneNumber: username
          }
        ],
        password: CryptoHelper.generateHash(password)
      },
      select: {
        ...selectDefaultUser
      }
    })

    if (!user) return { error: 'Incorrect username or password!' }
    if (user.role === Role.ADMIN) {
      user.customer = undefined;
      user.doctor = undefined
    } else if (user.role === Role.CUSTOMER) {
      user.doctor = undefined;
      ResourceService.includeFileURL(user.customer, 'avatar', 'avatarURL')
    } else {

      user.customer = undefined;
      ResourceService.includeFileURL(user.doctor, 'avatar', 'avatarURL')
    }
    const data: any = user
    data.token = TokenHelper.createSessionToken(user)
    data.accessKey = undefined
    return data
  }

  static async loginSms({ redata }: Req) {
    const { phoneNumber, code } = redata

    const smsCode: any = await LoginSmsRepo.getCode(phoneNumber)
    if (!smsCode || !smsCode.code) return { error: "This phone number has not sent login request yet" }
    if (smsCode?.code !== code) return { error: "Code invalid" }
    if (!phoneNumber.trim()) return { error: "Missing phone number" }

    const user: any = await prisma.user.findFirst({
      where: {
        phoneNumber
      },
      select: {
        ...selectDefaultUser
      }
    })
    if (!user) return { error: 'Incorrect username or password!' }
    if (user.role === Role.ADMIN) {
      user.customer = undefined;
      user.doctor = undefined
    } else if (user.role === Role.CUSTOMER) {
      user.doctor = undefined;
      ResourceService.includeFileURL(user.customer, 'avatar', 'avatarURL')
    } else {

      user.customer = undefined;
      ResourceService.includeFileURL(user.doctor, 'avatar', 'avatarURL')
    }
    const data: any = user
    data.token = TokenHelper.createSessionToken(user)
    data.accessKey = undefined
    await LoginSmsRepo.deleteCode(phoneNumber)
    return data
  }

  static async checkToken({ redata }: Req) {
    const { token } = redata
    const data = TokenHelper.verifyToken(token)
    if (!data || data.error) {
      throw new HttpException(403, data.error)
    }
    const user = await prisma.user.findUnique({
      select: { ...selectDefaultUser, accessKey: true },
      where: { id: data.id },
    })

    if (!user) {
      return { error: 'User not found' }
    }

    if (data.accessKey != user.accessKey) {
      return { error: 'Expired access token' }
    }
    const result: any = user
    if (result.role === Role.ADMIN) {
      result.customer = undefined;
      result.doctor = undefined
    } else if (user.role === Role.CUSTOMER) {
      result.doctor = undefined;
      ResourceService.includeFileURL(user.customer, 'avatar', 'avatarURL')
    } else {

      result.customer = undefined;
      ResourceService.includeFileURL(user.doctor, 'avatar', 'avatarURL')
    }
    result.token = TokenHelper.createSessionToken(user)
    result.accessKey = undefined
    return result
  }

  static async getUsers({ redata }: Req) {
    const { role } = redata
    const users = await prisma.user.findMany({
      where: {
        role
      },
      select: {
        ...adminSelectDefaultUser
      }
    })
    let results: any = []
    if (role === Role.ADMIN) {
      results = users.map(user => ({ ...user, customer: undefined, doctor: undefined, accessKey: undefined }))
    } else if (role === Role.CUSTOMER) {
      results = users.map(user => {
        ResourceService.includeFileURL(user.customer, 'avatar', 'avatarURL')
        return { ...user, doctor: undefined, accessKey: undefined }
      })
    } else if (role === Role.DOCTOR) {
      results = users.map(user => {
        ResourceService.includeFileURL(user.doctor, 'avatar', 'avatarURL')
        return { ...user, customer: undefined, accessKey: undefined }
      })
    }
    return results
  }

  static async uploatImages({ files }: Req) {
    let images: any = []
    console.log(files);

    if (files?.images) {
      if (!Array.isArray(files.images)) {
        images.push(ResourceService.getPath(ResourceService.upload(files.images) as any))
      } else {
        images = files.images.map((image: any) => {
          return ResourceService.getPath(ResourceService.upload(image) as any)
        })
      }
    }
    return images
  }

  static async getGuardians() {
    const guardians = await prisma.customer.findMany({
      where: {
        userId: null
      },
      include: {
        avatar: true,
        guardianTwo: {
          include: {
            userOne: {
              include: {
                avatar: true,
                user: true
              }
            }
          }
        }
      }
    })
    guardians.map((e: any) => {
      ResourceService.includeFileURL(e, 'avatar', 'avatarURL')
      e.guardianTwo.map((x: any) => ResourceService.includeFileURL(x.userOne, 'avatar, avatarURL'))
    })
    return guardians
  }

  static async sendForgotPasswordMail({ redata }: Req) {

    const { email } = redata
    const user = await prisma.user.findFirst({
      where: {
        email
      }
    })
    if (!user) return { error: 'This email never been  regiestered for an account' }
    if (!user.password) return { error: "You don't have a password!" }
    if (!user.email) return { error: "You don't register a mail!" }

    const code = CryptoHelper.genCode(6)
    await ForgotPasswordRepo.setCode(user.id, code)
    await mailHelper.sendMailChangePassword(user.email, code)
    return true
  }



  static async sendForgotPasswordSms({ redata }: Req) {
    const { phoneNumber } = redata
    const user = await prisma.user.findFirst({
      where: {
        phoneNumber
      }
    })
    if (!user) return { error: 'This email never been  regiestered for an account' }
    if (!user.password) return { error: "You don't have a password!" }
    if (!user.email) return { error: "You don't register a mail!" }
    if (!user.phoneNumber) return { error: "You don't register a phone number!" }

    const code = CryptoHelper.genCode(6)
    const globalPhoneNumber = `+84${user.phoneNumber.slice(1, user.phoneNumber.length)}`
    console.log(await ForgotPasswordRepo.setCode(user.id, code))
    await SMSHelper.sendSMS(globalPhoneNumber, code)
    return true
  }

  static async forgotPassword({ redata }: Req) {
    const { newPassword, code, type, email, phoneNumber } = redata

    let user: any

    if (type === CertificateType.EMAIL) {
      user = await prisma.user.findFirst({
        where: {
          email
        }
      })
    }
    if (type === CertificateType.PHONE) {

      user = await prisma.user.findFirst({
        where: {
          phoneNumber
        }
      })
    }

    if (!user) return { error: "Invalid account" }

    if (!user.password) return { error: "You don't have a password" }
    const checkCode: any = await ForgotPasswordRepo.getCode(user.id)
    if (!checkCode || code !== checkCode.code) return { error: "Invalid certification" }
    await prisma.user.update({
      where: {
        id: user.id,
      },
      data: {
        password: CryptoHelper.generateHash(newPassword),
        accessKey: TokenHelper.genCode6()
      }
    })
    await ForgotPasswordRepo.deleteCode(user.id)
    return true
  }

  static async updatePassword({ redata, user }: Req) {

    const { password, newPassword } = redata
    const hashPassword = CryptoHelper.generateHash(password)
    const checkUser = await prisma.user.findFirst({
      where: {
        id: user.id,
      }
    })
    if (!checkUser) return { error: 'Invalid user' }
    if (checkUser.password !== hashPassword) return { error: "Password incorrect!" }

    await prisma.user.update({
      data: {
        password: CryptoHelper.generateHash(newPassword),
        accessKey: TokenHelper.genCode6()
      },
      where: {
        id: user.id
      }
    })

    return true

  }

  static async addPhoneNumber({ redata, user }: Req) {
    const { password, phoneNumber } = redata
    if (CryptoHelper.generateHash(password) !== user.password) return { error: "Incorrect password" }

    if (user.phoneNumber) return { error: "This account already have an phone number" }

    const checkPhone = await prisma.user.findFirst({
      where: {
        phoneNumber
      }
    })

    if (checkPhone) return { error: "This phone number already registered" }

    const code = CryptoHelper.genCode(6)
    await AddDataRepo.setCode(user.id, { code, phoneNumber })
    const globalPhoneNumber = `+84${phoneNumber.slice(1, phoneNumber.length)}`
    await SMSHelper.sendSMS(globalPhoneNumber, code)
    return true
  }

  static async addData({ user, redata }: Req) {
    const { code } = redata

    const data: any = await AddDataRepo.getCode(user.id)

    if (!data || !code || code !== data?.code) return { error: "Unauthorize" }
    if (data.phoneNumber) {
      if (user.phoneNumber) return { error: "This account already have an phone number" }
      await prisma.user.update({
        data: {
          phoneNumber: data.phoneNumber
        },
        where: {
          id: user.id
        }
      })
      await AddDataRepo.deleteCode(user.id)
      return true
    }
    if (data.email) {
      if (user.email) return { error: "This account already have an email" }
      await prisma.user.update({
        data: {
          email: data.email,
        },
        where: {
          id: user.id
        }
      })
      await AddDataRepo.deleteCode(user.id)
      return true
    }
    return { error: "Incorrect" }
  }

  static async addEmail({ redata, user }: Req) {
    const { password, email } = redata
    if (CryptoHelper.generateHash(password) !== user.password) return { error: "Incorrect password" }

    if (user.email) return { error: "This account already have an email" }



    const checkPhone = await prisma.user.findFirst({
      where: {
        email
      }
    })

    if (checkPhone) return { error: "This email already registered" }


    const code = CryptoHelper.genCode(6)
    await AddDataRepo.setCode(user.id, { code: code, email, password })
    await mailHelper.sendMailAddEmail(email, code)
    return true
  }

}


export const selectDefaultUser = {
  id: true,
  email: true,
  role: true,
  verified: true,
  createdAt: true,
  updatedAt: true,
  customer: {
    select: {
      ...selectDefaultCustomer
    }
  },
  doctor: {
    select: {
      ...selectDedaultDoctor
    }
  },
  accessKey: true
}

export const adminSelectDefaultUser = {
  id: true,
  email: true,
  phoneNumber: true,
  role: true,
  verified: true,
  createdAt: true,
  updatedAt: true,
  customer: {
    select: {
      ...adminSelectDefaultCustomer
    }
  },
  doctor: {
    select: {
      ...selectDedaultDoctor
    }
  },
  accessKey: true
}
