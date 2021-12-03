import { ReferenceType, WorkPlaceStatus, WorkPlaceType } from '.prisma/client';
import CryptoHelper from '../common/helpers/crypto.helper';
import prisma from '../common/helpers/prisma.helper';
import SMSHelper from '../common/helpers/sms.helper';
import { Req } from '../common/types/api.type'
import { PrismaUtils } from '../common/utils/prisma.util';
import WorkplaceContactPhoneRepo from '../repository/workplace-contact-phone.repo';
import ResourceService from './resource.service';
import fetch from "node-fetch";

export default class WorkPlaceService {
    static async getList({ redata }: Req) {
        const { skip, take, keyword, status } = redata
        const options = PrismaUtils.getPaginationOptions({
            skip,
            take,
        })
        let where: any = {}
        if (keyword) {
            where = {
                OR: [
                    {
                        name: {
                            contains: keyword.trim()
                        }
                    },
                    {
                        address: {
                            contains: keyword.trim()
                        }
                    },
                ]
            }
        }

        if (status) {
            where = {
                ...where,
                status
            }
        }

        const workPlaces = await prisma.workplace.findMany({
            ...options,
            where: {
                ...where
            },
            include: {
                images: true,
                manager: {
                    include: {
                        doctor: true
                    }
                }
            }
        })
        workPlaces.map(e => {
            ResourceService.includeFileURL(e, 'images')

        })
        return workPlaces
    }


    static async adminGetList({ redata }: Req) {
        const { skip, take, keyword, type, status } = redata

        const options = PrismaUtils.getPaginationOptions({
            skip,
            take,
        })
        let where: any = {}
        if (keyword) {
            where = {
                OR: [
                    {
                        name: {
                            contains: keyword.trim()
                        }
                    },
                    {
                        address: {
                            contains: keyword.trim()
                        }
                    },
                ]
            }
        }
        if (status) {
            where = {
                ...where,
                status
            }
        }
        if (type) {
            where = {
                ...where,
                type
            }
        }

        const workPlaces = await prisma.workplace.findMany({
            ...options,
            where: {
                ...where
            },
            include: {
                manager: {
                    select: {
                        id: true,
                        email: true,
                        phoneNumber: true,
                        role: true,
                        suspended: true,
                        deleted: true,
                        verified: true,
                        createdAt: true,
                        updatedAt: true,
                        doctor: {
                            include: {
                                avatar: true,
                            }
                        }
                    }
                },
                images: true,
            }
        })
        workPlaces.map((e: any) => {
            ResourceService.includeFileURL(e, 'images')
            ResourceService.includeFileURL(e.manager?.doctor, 'avatar', 'avatarURL')

        })
        return workPlaces
    }

    static async doctorCreate({ redata, files, user }: Req) {
        const { name, address, wardId, latitude, longitude } = redata
        let images = []
        if (files?.images) {
            if (!Array.isArray(files.images)) {
                images.push({
                    ...ResourceService.upload(files.images),
                    referenceType: ReferenceType.WORK_PLACE_IMG,
                })
            } else {
                images = files.images.map((image: any) => {
                    return {
                        ...ResourceService.upload(image),
                        referenceType: ReferenceType.WORK_PLACE_IMG,
                    }
                })
            }
        }
        await prisma.workplace.create({
            data: {
                name,
                address,
                images: {
                    createMany: {
                        data: [
                            ...images
                        ]
                    }
                },
                managerId: user.id,
                status: WorkPlaceStatus.PENDING,
                type: WorkPlaceType.CLINIC,
                wardId,
                latitude: latitude ?? null,
                longitude: longitude ?? null
            }
        })
        return true
    }

    static async adminCreate({ redata, files, user }: Req) {
        const { name, address, type, wardId, } = redata
        let { latitude, longitude } = redata
        if (!latitude || !longitude) {
            const ward = await prisma.ward.findFirst({
                where: {
                    id: +wardId
                },
                include: {
                    district: {
                        include: {
                            province: true
                        }
                    }
                }
            })
            if (ward) {
                const currentAddress = [address, ward.district?.name, ward.district?.province?.name].join(', ')
                const accessKey = 'd73a5b652ca99d00d5e178380a4d9a2f'
                const response = await fetch(`http://api.positionstack.com/v1/forward?access_key=${accessKey}&query=${currentAddress}`, {
                    method: 'get',
                    headers: { 'Content-Type': 'application/json' }
                });
                const data = await response.json();
                console.log(data.data);
                if (data.data) {
                    latitude = data.data.latitude
                    longitude = data.data.longitude
                }
            }
        }
        let images = []
        if (files?.images) {
            if (!Array.isArray(files.images)) {
                images.push({
                    ...ResourceService.upload(files.images),
                    referenceType: ReferenceType.WORK_PLACE_IMG,
                })
            } else {
                images = files.images.map((image: any) => {
                    return {
                        ...ResourceService.upload(image),
                        referenceType: ReferenceType.WORK_PLACE_IMG,
                    }
                })
            }
        }
        await prisma.workplace.create({
            data: {
                name,
                address,
                images: {
                    createMany: {
                        data: [
                            ...images
                        ]
                    }
                },
                managerId: user.id,
                status: WorkPlaceStatus.ACTIVE,
                type,
                wardId,
                latitude: latitude ?? null,
                longitude: longitude ?? null
            }
        })
        return true
    }

    static async doctorApply({ user, redata }: Req) {
        const { workPlaceId, jobPositionId } = redata

        const [operation, workPlace, jobPosition] = await prisma.$transaction([
            prisma.operation.findFirst({
                where: {
                    workplaceId: +workPlaceId,
                    doctor: {
                        userId: user.id
                    }
                }
            }),
            prisma.workplace.findFirst({
                where: {
                    id: +workPlaceId
                }
            }),
            prisma.jobPosition.findFirst({
                where: {
                    id: +jobPositionId
                }
            })
        ])
        if (!workPlace) return { error: "Not found this work place!" }
        if (workPlace.status !== WorkPlaceStatus.ACTIVE) return { error: "Can not apply this work place" }
        if (operation) return { error: "You arealdy applied!" }
        if (!jobPosition) return { error: "Invalid Job Position" }
        await prisma.operation.create({
            data: {
                doctor: {
                    connect: {
                        userId: user.id
                    }
                },
                workplace: {
                    connect: {
                        id: +workPlaceId
                    }
                },
                jobPosition: {
                    connect: {
                        id: +jobPositionId
                    }
                }
            }
        })
        return true
    }

    static async getMy({ user }: Req) {
        const workPlaces = await prisma.workplace.findMany({
            where: {
                operation: {
                    some: {
                        doctor: {
                            userId: user.id
                        }
                    }
                }
            },
            include: {
                images: true
            }
        })
        workPlaces.map(workPlace => {
            ResourceService.includeFileURL(workPlace, 'image')

        })
        return workPlaces
    }

    static async getManage({ redata, user }: Req) {
        const { skip, take, keyword, status } = redata

        const options = PrismaUtils.getPaginationOptions({
            skip,
            take,
        })
        let where: any = {}
        if (keyword) {
            where = {
                OR: [
                    {
                        name: {
                            contains: keyword.trim()
                        }
                    },
                    {
                        address: {
                            contains: keyword.trim()
                        }
                    },
                ]
            }
        }

        if (status) {
            where = {
                ...where,
                status
            }
        }

        const workPlaces = await prisma.workplace.findMany({
            ...options,
            where: {
                ...where,
                manager: {
                    id: user.id
                },
            },
            include: {
                images: true
            }
        })
        workPlaces.map(e => {
            ResourceService.includeFileURL(e, 'images')

        })
        return workPlaces
    }

    static async getAppliedList({ redata, user }: Req) {
        const { skip, take, workPlaceId, status } = redata

        const workPlace = await prisma.workplace.findFirst({
            where: {
                id: +workPlaceId
            }
        })
        if (!workPlace) return { error: "Work place invalid" }
        if (workPlace.managerId !== user.id) return { error: "Unauthorize!" }

        const options = PrismaUtils.getPaginationOptions({
            skip,
            take,
        })
        let where: any = {
            workplaceId: workPlaceId
        }
        if (status) {
            where = {
                ...where,
                status
            }
        }

        const appliedList = await prisma.operation.findMany({
            where: {
                ...where
            },
            ...options,
            include: {
                operationHour: true,
                doctor: {
                    include: {
                        avatar: true
                    }
                }
            }
        })
        appliedList.map((item: any) => {
            ResourceService.includeFileURL(item?.doctor, 'avatar', 'avatarURL')
        })
        return appliedList
    }
    static async updateApply({ redata, user }: Req) {
        const { operationId, status } = redata

        const apply: any = await prisma.operation.findFirst({
            where: {
                id: +operationId,
                workplace: {
                    managerId: user.id
                }
            },
            include: {
                workplace: true
            }
        })
        if (!apply) return { error: "Not fount apply" }
        await prisma.operation.update({
            where: {
                id: +operationId
            },
            data: {
                status
            }
        })
        return true
    }

    static async update({ redata, user }: Req) {
        const { name, address, status, id } = redata
        const workPlace = await prisma.workplace.findFirst({
            where: {
                id,
            }
        })
        if (!workPlace) return { error: "Not found work place" }
        if (workPlace.managerId !== user.id
            || (workPlace.status === WorkPlaceStatus.PENDING ||
                workPlace.status === WorkPlaceStatus.BANNED)
        ) return { error: "You are not allowed" }
        await prisma.workplace.update({
            where: {
                id
            },
            data: {
                name,
                address,
                status
            }
        })
        return true
    }

    static async adminUpdateInfomation({ redata }: Req) {
        const { name, address, id, status, type, contactPhoneNumber } = redata
        const workPlace = await prisma.workplace.findFirst({
            where: {
                id,
            }
        })
        if (!workPlace) return { error: "Not found work place" }
        await prisma.workplace.update({
            where: {
                id
            },
            data: {
                name,
                address,
                status,
                type,
                contactPhoneNumber
            }
        })
        return true
    }

    static async adminUpdateStatus({ redata }: Req) {
        const { id, status } = redata
        const workPlace = await prisma.workplace.findFirst({
            where: {
                id,
            }
        })
        if (!workPlace) return { error: "Not found work place" }
        await prisma.workplace.update({
            where: {
                id
            },
            data: {
                status
            }
        })
        return true
    }

    static async addRate({ redata, user }: Req) {
        const { starRate, id, comment } = redata
        const oldRate = await prisma.workplaceRate.findFirst({
            where: {
                workplaceId: id,
                userId: user.id
            }
        })
        if (oldRate) return { error: "You rated" }
        return await prisma.workplaceRate.create({
            data: {
                starRate: +starRate,
                comment,
                workplaceId: id,
                userId: user.id
            }
        })
    }

    static async getRate({ redata, user }: Req) {
        const { skip, take, starRate, isMy, id } = redata

        const options = PrismaUtils.getPaginationOptions({
            skip,
            take,
        })

        let where: any = { id }
        if ((typeof (isMy) === "string" && isMy === 'true') || (typeof (isMy) === "boolean" && isMy)) {
            where = {
                ...where,
                userId: user.id
            }
        }

        if (starRate) {
            where = {
                ...where,
                starRate: +starRate
            }
        }
        return await prisma.workplaceRate.findMany({
            where: {
                ...where
            },
            ...options
        })
    }

    static async addContactPhoneNumberVerify({ redata, user }: Req) {
        const { id, password, phoneNumber } = redata

        if (user.password !== CryptoHelper.generateHash(password)) return { error: "Unauthorize" }

        const workPlace = await prisma.workplace.findFirst({
            where: {
                managerId: user.id,
                id: +id
            }
        })

        if (!workPlace) return { error: "Not found workplace" }

        const globalPhoneNumber = `+84${phoneNumber.slice(1, phoneNumber.length)}`
        const code = CryptoHelper.genCode(6)
        await SMSHelper.sendSMS(globalPhoneNumber, code)

        await WorkplaceContactPhoneRepo.setCode(`${id}`, code, phoneNumber)

        return true
    }

    static async addContactPhoneNumber({ redata, user }: Req) {
        const { id, password, phoneNumber, code } = redata

        if (user.password !== CryptoHelper.generateHash(password)) return { error: "Unauthorize" }

        const workPlace = await prisma.workplace.findFirst({
            where: {
                managerId: user.id,
                id: +id
            }
        })

        if (!workPlace) return { error: "Not found workplace" }
        const data: any = await WorkplaceContactPhoneRepo.getCode(`${id}`)

        if (!data) return { error: "Unauthorize" }

        if (code !== data?.code) return { error: "Incorrect code" }
        if (phoneNumber !== data?.phoneNumber) return { error: "Incorrect phone number" }

        await prisma.workplace.update({
            where: {
                id: workPlace.id
            },
            data: {
                contactPhoneNumber: phoneNumber
            }
        })

        await WorkplaceContactPhoneRepo.deleteCode(`${id}`)

        return true
    }
}

