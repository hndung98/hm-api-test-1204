import { Req } from '../common/types/api.type'
import prisma from '../common/helpers/prisma.helper'
import CryptoHelper from '../common/helpers/crypto.helper'
import ResourceService from './resource.service';
import { ApplicationStatus, ReferenceType, Role } from '.prisma/client';
import RegisterMailRepo from '../repository/register-mail.repo';
import RegisterSmsRepo from '../repository/sms-code.repo';
import { ACCOUNT_TYPE } from './user.service';
import TokenHelper from '../common/helpers/token.helper';

export default class ApplicationService {
  //2021-09-03T23:16:32+07:00
  static async create({ redata, files }: Req) {
    const {
      email,
      firstName,
      lastName,
      birthday,
      gender,
      password,
      phoneNumber,
      address,
      specializedId,
      identityCardNumber,
      code,
      registerType
    } = redata;

    if (registerType === ACCOUNT_TYPE.EMAIL) {
      const mailCode: any = await RegisterMailRepo.getMail(email)
      if (!mailCode || !mailCode.code) return { error: "This mail has not be registor" }
      if (mailCode?.code !== code) return { error: "Code invalid" }
      if (!email.trim() || !password.trim()) return { error: "Missing email or password" }
    }
    else {
      const smsCode: any = await RegisterSmsRepo.getCode(phoneNumber)
      if (!smsCode || !smsCode.code) return { error: "This phone number has not sent registration request yet" }
      if (smsCode?.code !== code) return { error: "Code invalid" }
      if (!phoneNumber.trim() || !password.trim()) return { error: "Missing phone number or password" }
    }
    const specialized = await prisma.specialized.findUnique({
      where: {
        id: specializedId
      }
    })
    if (!specialized) return { error: 'Invalid specialized' }

    const avatar = {
      ...ResourceService.upload(files.avatar),
      referenceType: ReferenceType.AVATAR_IMG
    }
    let identityCard = []
    let practicingCertificate = []
    let otherImages = []

    if (files?.identityCard) {
      if (!Array.isArray(files.identityCard)) {
        identityCard.push({
          ...ResourceService.upload(files.identityCard),
          referenceType: ReferenceType.IDENTITY_CARD,
        })
      } else {
        identityCard = files.identityCard.map((image: any) => {
          return {
            ...ResourceService.upload(image),
            referenceType: ReferenceType.IDENTITY_CARD,
          }
        })
      }
    }

    if (files?.practicingCertificate) {
      if (!Array.isArray(files.practicingCertificate)) {
        practicingCertificate.push({
          ...ResourceService.upload(files.practicingCertificate),
          referenceType: ReferenceType.SPECIALIZED_CERTIFICATE,
        })
      } else {
        practicingCertificate = files.practicingCertificate.map((image: any) => {
          return {
            ...ResourceService.upload(image),
            referenceType: ReferenceType.SPECIALIZED_CERTIFICATE,
          }
        })
      }
    }

    if (files?.otherImages) {
      if (!Array.isArray(files.otherImages)) {
        otherImages.push({
          ...ResourceService.upload(files.otherImages),
          referenceType: ReferenceType.OTHER,
        })
      } else {
        otherImages = files.otherImages.map((image: any) => {
          return {
            ...ResourceService.upload(image),
            referenceType: ReferenceType.OTHER,
          }
        })
      }
    }
    if (registerType === ACCOUNT_TYPE.EMAIL) {
      await prisma.application.create({
        data: {
          email,
          firstName,
          lastName,
          birthday: new Date(birthday),
          gender,
          password: CryptoHelper.generateHash(password),
          address,
          identityCardNumber,
          specializedId,
          images: {
            createMany: {
              data: [
                avatar,
                ...identityCard,
                ...practicingCertificate,
                ...otherImages
              ]
            }
          }
        }
      })
      await RegisterMailRepo.deleteMailCode(email)
    }
    else {

      await prisma.application.create({
        data: {
          firstName,
          lastName,
          birthday: new Date(birthday),
          gender,
          password: CryptoHelper.generateHash(password),
          phoneNumber,
          address,
          identityCardNumber,
          specializedId,
          images: {
            createMany: {
              data: [
                avatar,
                ...identityCard,
                ...practicingCertificate,
                ...otherImages
              ]
            }
          }
        }
      })
      await RegisterSmsRepo.deleteCode(phoneNumber)
    }
    return true
  }

  static async get({ redata }: Req) {
    const { status } = redata

    let query = {}
    if (status) query = { status }
    const applications = await prisma.application.findMany({
      where: {
        ...query
      },
      select: {
        id: true,
        createdAt: true,
        updatedAt: true,
        status: true,
        email: true,
        firstName: true,
        lastName: true,
        birthday: true,
        gender: true,
        phoneNumber: true,
        address: true,
        identityCardNumber: true,
        specialized: true,
        images: true
      }
    })
    applications.map((application: any) => {
      application.avatar = application.images.filter((image: any) => image.referenceType === ReferenceType.AVATAR_IMG)
      application.identityCard = application.images.filter((image: any) => image.referenceType === ReferenceType.IDENTITY_CARD)
      application.practicingCertificate = application.images.filter((image: any) => image.referenceType === ReferenceType.SPECIALIZED_CERTIFICATE)
      application.other = application.images.filter((image: any) => image.referenceType === ReferenceType.OTHER)
      application.images = undefined
      ResourceService.includeFileURL(application, 'avatar', 'avatarURL')
      ResourceService.includeFileURL(application, 'identityCard', 'identityCardURLs')
      ResourceService.includeFileURL(application, 'practicingCertificate', 'practicingCertificateURLS')
      ResourceService.includeFileURL(application, 'other', 'otherURLS')
    })
    return applications
  }


  static async process({ redata }: Req) {
    const { id, isAccept } = redata
    const application = await prisma.application.findUnique({
      where: {
        id
      },
      include: {
        images: true,
      }
    })


    if (!application) return { error: 'Invalid application' }
    if (application.status !== ApplicationStatus.PENDING) return { error: "Unauthorize" }
    if (!isAccept) {
      await prisma.application.update({
        where: {
          id
        },
        data: {
          status: ApplicationStatus.DENIED
        }
      })
      return true
    }
    else {
      const avatar = application.images.find(e => e.referenceType === ReferenceType.AVATAR_IMG)
      await prisma.$transaction([
        prisma.application.update({
          where: {
            id
          },
          data: {
            status: ApplicationStatus.ACCEPTED,
          }
        }),
        prisma.user.create({
          data: {
            email: application.email,
            password: application.password,
            role: Role.DOCTOR,
            phoneNumber: application.phoneNumber,
            accessKey: TokenHelper.genCode6(),
            doctor: {
              create: {
                firstName: application.firstName,
                lastName: application.lastName,
                birthday: application.birthday,
                gender: application.gender,
                identityCardNumber: application.identityCardNumber,
                application: {
                  connect: {
                    id: application.id
                  }
                },
                specialized: {
                  connect: {
                    id: application.specializedId
                  }
                },
                avatar: {
                  connect: {
                    uuid: avatar?.uuid
                  }
                },
              }
            }
          }
        })
      ])
      return true
    }
  }
}

