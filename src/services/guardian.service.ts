import { Req } from '../common/types/api.type'
import prisma from '../common/helpers/prisma.helper'
import ResourceService from './resource.service';
import { GuardianStatus } from '.prisma/client';
import { VERIFY_TYPE } from '../routes/params/customer/delete-guardian-verify.params';
import MailHelper from '../common/helpers/mail.helper';
import SMSHelper from '../common/helpers/sms.helper';
import CryptoHelper from '../common/helpers/crypto.helper';
import DeleteGuardianRepo from '../repository/delete-guardian.repo';
import GuardianCreateAccountRepo from '../repository/guardian-create-account.repo';
import { ACCOUNT_TYPE } from './user.service';

// // 2021-09-13T20:50:40+07:00
const mailHelper = new MailHelper()
export default class GuardianService {

  static async create({ redata, user, files }: Req) {
    const {
      guardianName,
      firstName,
      lastName,
      birthday,
      gender,
      provinceId,
      phoneNumber,
      address
    } = redata

    const customer = await prisma.customer.findFirst({
      where: {
        userId: user.id
      }
    });

    if (!customer) return { error: "Unauthorize" }

    let userTwoInfo: any = {
      firstName,
      lastName,
      birthday: new Date(birthday),
      gender,
      contactPhoneNumber: phoneNumber,
      address
    }

    const { avatar } = files
    if (avatar) {
      const { uuid, extension } = ResourceService.upload(avatar)
      userTwoInfo = {
        ...userTwoInfo,
        avatar: {
          create: {
            uuid,
            extension
          }
        },
      }
    }
    if (provinceId) {
      userTwoInfo = {
        ...userTwoInfo,
        province: {
          connect: {
            id: provinceId
          }
        }
      }
    }

    const guardian = await prisma.guardian.create({
      data: {
        userOne: {
          connect: {
            id: customer.id
          }
        },
        userTwo: {
          create: {
            ...userTwoInfo
          }
        },
        name: guardianName,
        status: GuardianStatus.ACCEPTED
      },
      include: {
        userTwo: {
          include: {
            avatar: true,
            province: true
          }
        }
      }
    })
    ResourceService.includeFileURL(guardian.userTwo, 'avatar', 'avatarURL')
    return guardian
  }

  static async update({ redata, user, files }: Req) {
    const {
      id,
      guardianName,
      firstName,
      lastName,
      birthday,
      gender,
      provinceId,
      contactPhoneNumber: phoneNumber,
      address
    } = redata

    const customer = await prisma.customer.findFirst({
      where: {
        userId: user.id,
        guardianOne: {
          some: {
            id
          }
        }
      }
    });

    if (!customer) return { error: "Unauthorize" }

    let userTwoInfo: any = {
      firstName,
      lastName,
      birthday: new Date(birthday),
      gender,
      phoneNumber,
      address
    }

    const { avatar } = files
    if (avatar) {
      const { uuid, extension } = ResourceService.upload(avatar)
      userTwoInfo = {
        ...userTwoInfo,
        avatar: {
          create: {
            uuid,
            extension
          }
        },
      }
    }
    if (provinceId) {
      userTwoInfo = {
        ...userTwoInfo,
        province: {
          connect: {
            id: provinceId
          }
        }
      }
    }

    const guardian = await prisma.guardian.update({
      where: {
        id,
      },
      data: {
        userTwo: {
          update: {
            ...userTwoInfo
          }
        },
        name: guardianName,
        status: GuardianStatus.ACCEPTED
      },
      include: {
        userTwo: {
          include: {
            avatar: true,
            province: true
          }
        }
      }
    })
    ResourceService.includeFileURL(guardian.userTwo, 'avatar', 'avatarURL')
    return guardian
  }

  static async getList({ user }: Req) {
    const guadians = await prisma.guardian.findMany({
      where: {
        userOne: {
          userId: user.id
        },
        status: GuardianStatus.ACCEPTED,
        userTwo: {
          deleted: false
        }
      },
      include: {
        userTwo: {
          include: {
            avatar: true,
            province: true
          }
        }
      }
    })
    guadians.map(guadian => ResourceService.includeFileURL(guadian.userTwo, 'avatar', 'avatarURL'))
    return guadians
  }

  static async delete({ redata, user }: Req) {
    const { id, code } = redata
    const [guardian, guardianCustomer] = await prisma.$transaction([
      prisma.guardian.findFirst({
        where: {
          userTwoId: id,
          userOne: {
            userId: user.id
          }
        }
      }),
      prisma.customer.findFirst({
        where: {
          id,
        }
      })
    ])
    if (!guardianCustomer) return { error: "Not found this guardian" }
    if (!guardian || guardianCustomer.userId) return { error: "You can not delete this guardian" }

    const verifyCode: any = await DeleteGuardianRepo.getCode(id)
    if (verifyCode?.code !== code) return { error: "Code invalid" }

    await prisma.customer.update({
      where: {
        id
      },
      data: {
        deleted: true
      }
    })
    await DeleteGuardianRepo.deleteCode(id)
    return true
  }

  static async verifyDelete({ redata, user }: Req) {
    const { id, type } = redata
    const [guardian, guardianCustomer] = await prisma.$transaction([
      prisma.guardian.findFirst({
        where: {
          userTwoId: id,
          userOne: {
            userId: user.id
          }
        }
      }),
      prisma.customer.findFirst({
        where: {
          id,
        }
      })
    ])
    if (!guardianCustomer) return { error: "Not found this guardian" }
    if (!guardian || guardianCustomer.userId) return { error: "You can not delete this guardian" }
    if (type === VERIFY_TYPE.PHONE) {
      if (!user.phoneNumber) return { error: "You don't have phone number!" }
      const code = CryptoHelper.genCode(6)
      const globalPhoneNumber = `+84${user.phoneNumber.slice(1, user.phoneNumber.length)}`
      await DeleteGuardianRepo.setCode(id, code)
      await SMSHelper.sendSMS(globalPhoneNumber, code)
      return true
    }
    else {
      if (!user.email) return { error: "You don't have email!" }
      const code = CryptoHelper.genCode(6)
      await DeleteGuardianRepo.setCode(id, code)
      await mailHelper.sendMailDeleteGuardian(user.email, code)
      return true
    }
  }

  static async createUser({ redata, user }: Req) {
    const {
      password,
      type,
      email,
      phoneNumber,
      guardiantId,
      code,
      guardiantPassword
    } = redata

    if (user.password !== CryptoHelper.generateHash(password)) return { error: "Unauthorize" }

    const guardiant = await prisma.guardian.findFirst({
      where: {
        userOne: {
          userId: user.id
        },
        userTwoId: guardiantId
      },
      include: {
        userTwo: true
      }
    })
    if (!guardiant) return { error: 'Not found guardiant' }
    if (guardiant.userTwo.userId) return { error: "This guardiant already init a user" }

    if (type === ACCOUNT_TYPE.EMAIL) {
      if (!email) return { error: "Missing email" }
      if (!guardiantPassword) return { error: "Missing password" }
      const data: any = await GuardianCreateAccountRepo.getCode(`${guardiantId}`)
      if (!data) return { error: "Incorrect" }
      if (data?.code !== code) return { error: "Code invalid" }
      if (data?.email !== email) return { error: "Email incorrect" }
      const [newCustomer] = await prisma.$transaction([
        prisma.customer.update({
          where: {
            id: guardiantId
          },
          data: {
            user: {
              create: {
                email,
                password: CryptoHelper.generateHash(guardiantPassword)
              }
            }
          }
        }),
        prisma.guardian.delete({
          where: {
            id: guardiant.id
          }
        })
      ])
      await GuardianCreateAccountRepo.deleteCode(`${guardiantId}`)
      return { success: true, userId: newCustomer?.userId }
    }
    else if (type === ACCOUNT_TYPE.PHONE) {
      if (!phoneNumber) return { error: "Missing phone number" }
      if (!guardiantPassword) return { error: "Missing password" }
      const data: any = await GuardianCreateAccountRepo.getCode(`${guardiantId}`)
      if (!data) return { error: "Incorrect" }
      if (data?.code !== code) return { error: "Code invalid" }
      if (data?.phoneNumber !== phoneNumber) return { error: "Phone number incorrect" }
      const [newCustomer] = await prisma.$transaction([
        prisma.customer.update({
          where: {
            id: guardiantId
          },
          data: {
            user: {
              create: {
                phoneNumber,
                password: CryptoHelper.generateHash(guardiantPassword)
              }
            }
          },
        }),
        prisma.guardian.delete({
          where: {
            id: guardiant.id
          }
        })
      ])
      await GuardianCreateAccountRepo.deleteCode(`${guardiantId}`)
      return { success: true, userId: newCustomer?.userId }
    }

  }


  static async createUserVerify({ redata, user }: Req) {
    const { password, type, email, phoneNumber, guardiantId } = redata

    if (user.password !== CryptoHelper.generateHash(password)) return { error: "Unauthorize" }

    const guardiant = await prisma.guardian.findFirst({
      where: {
        userOne: {
          userId: user.id
        },
        userTwoId: guardiantId
      },
      include: {
        userTwo: true
      }
    })
    if (!guardiant) return { error: 'Not found guardiant' }
    if (guardiant.userTwo.userId) return { error: "This guardiant already init a user" }

    const code = CryptoHelper.genCode(6)

    if (type === VERIFY_TYPE.EMAIL) {
      if (!email) return { error: "Missing email" }
      await GuardianCreateAccountRepo.setCodewithEmail(`${guardiantId}`, code, email)
      await mailHelper.sendMailInitUserGuardian(email, code)
    }
    else if (type === VERIFY_TYPE.PHONE) {
      if (!phoneNumber) return { error: "Missing phone number" }
      const globalPhoneNumber = `+84${phoneNumber.slice(1, phoneNumber.length)}`
      await GuardianCreateAccountRepo.setCodewithPhoneNumber(`${guardiantId}`, code, phoneNumber)
      await SMSHelper.sendSMS(globalPhoneNumber, code)
    }

    return true
  }

}
