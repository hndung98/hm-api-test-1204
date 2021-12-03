import { Req } from '../common/types/api.type'
import prisma from '../common/helpers/prisma.helper'
import ResourceService from './resource.service'
import { ReferenceType, Role } from '.prisma/client';
import MailHelper from '../common/helpers/mail.helper';

const mailHelper = new MailHelper()

export default class DoctorService {
    static async getSelf({ user }: Req) {
        console.log(user);
        if (!user) return { error: 'Incorrect' }
        const doctor = await prisma.user.findUnique({
            where: {
                id: user.id
            },
            select: {
                ...selectDefaultUserDoctor
            }
        })
        ResourceService.includeFileURL(doctor, 'avatar', 'avatarURL')
        return doctor
    }

    static async getList({ redata, user }: Req) {

        const {
            specializedId,
            booked,
            skip,
            take,
            wardId,
            districtId,
            provinceId
        } = redata
        let query: any = {
        }
        let where = {}
        if (specializedId) {
            where = {
                ...where,
                specializedId,

            }
        }
        if (booked) {
            where = {
                ...where,
                appointment: {
                    some: {
                        medicalRecord: {
                            customerId: user.id
                        }
                    }
                }
            }
        }
        if (skip && skip !== 0) {
            query = {
                ...query,
                skip
            }
        }
        if (take && take !== 0) {
            query = {
                ...query,
                take
            }
        }

        if (wardId) {
            where = {
                ...where,
                doctor: {
                    operation: {
                        some: {
                            workplace: {
                                wardId
                            }
                        }
                    }
                }
            }
        } else if (districtId) {
            console.log(districtId);

            where = {
                ...where,
                doctor: {
                    operation: {
                        some: {
                            workplace: {
                                ward: {
                                    districtId
                                }
                            }
                        }
                    }
                }
            }
        } else if (provinceId) {
            where = {
                ...where,
                doctor: {
                    operation: {
                        some: {
                            workplace: {
                                ward: {
                                    district: {
                                        provinceId
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }

        const doctors = await prisma.user.findMany({
            ...query,
            where: {
                ...where,
                role: Role.DOCTOR,
            },
            select: {
                ...selectDefaultUserDoctor
            }
        })
        doctors.map((doctor: any) => ResourceService.includeFileURL(doctor.doctor, 'avatar', 'avatarURL'))
        return doctors

    }

    static async getListCommon({ redata }: Req) {

        const {
            specializedId,
            skip,
            take,
            wardId,
            districtId,
            provinceId
        } = redata
        let query: any = {
        }
        let where = {}
        if (specializedId) {
            where = {
                ...where,
                specializedId
            }
        }

        if (skip && skip !== 0) {
            query = {
                ...query,
                skip
            }
        }
        if (take && take !== 0) {
            query = {
                ...query,
                take
            }
        }
        if (wardId) {
            where = {
                ...where,
                doctor: {
                    operation: {
                        some: {
                            workplace: {
                                wardId
                            }
                        }
                    }
                }
            }
        } else if (districtId) {
            console.log(districtId);

            where = {
                ...where,
                doctor: {
                    operation: {
                        some: {
                            workplace: {
                                ward: {
                                    districtId
                                }
                            }
                        }
                    }
                }
            }
        } else if (provinceId) {
            where = {
                ...where,
                doctor: {
                    operation: {
                        some: {
                            workplace: {
                                ward: {
                                    district: {
                                        provinceId
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }

        const doctors = await prisma.user.findMany({
            ...query,
            where: {
                ...where,
                role: Role.DOCTOR
            },
            select: {
                ...selectDefaultUserDoctor
            }
        })
        doctors.map((doctor: any) => ResourceService.includeFileURL(doctor.doctor, 'avatar', 'avatarURL'))
        return doctors

    }

    static async getProfile({ redata }: Req) {
        const { id } = redata
        const doctor = await prisma.user.findFirst({
            where: {
                doctor: {
                    id
                }
            },
            select: {
                ...selectDefaultUserDoctor
            }
        })
        if (!doctor) return { error: "Invalid" }
        ResourceService.includeFileURL(doctor.doctor, 'avatar', 'avatarURL')
        return doctor
    }

    static async updateProfile({ redata, user, files }: Req) {
        const { firstName, lastName, birthday, gender, introduce, provinceId, medicalExamination } = redata
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
            province: {
                connect: {
                    id: provinceId
                }
            },
        }
        if (introduce && Array.isArray(introduce)) {
            data = {
                ...data,
                introduce
            }
        }
        if (medicalExamination && Array.isArray(medicalExamination)) {
            data = {
                ...data,
                medicalExamination
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

        const doctor = await prisma.user.update({
            where: {
                id: user.id
            },
            data: {
                doctor: {
                    update: {
                        ...data,
                    }
                }
            },
            select: selectDefaultUserDoctor

        })
        ResourceService.includeFileURL(doctor.doctor, 'avatar', 'avatarURL')

        return doctor
    }
}

export const selectDedaultDoctor = {
    id: true,
    firstName: true,
    lastName: true,
    birthday: true,
    gender: true,
    avatar: true,
    specializedId: true,
    specialized: true,
    province: true,
    introduce: true,
    medicalExamination: true,
    workHistory: {
        include: {
            workplace: true,
            jobPosition: true,
        }
    },
    operation: {
        select: {
            id: true,
            createdAt: true,
            updatedAt: true,
            workplace: {
                include: {
                    ward: {
                        include: {
                            district: {
                                include: {
                                    province: true
                                }
                            }
                        }
                    }
                }
            },
            address: true,
            patientPerHalfHour: true,
            operationHour: true,
            jobPosition: true
        }
    }
}

export const selectDefaultUserDoctor = {
    id: true,
    email: true,
    role: true,
    phoneNumber: true,
    verified: true,
    createdAt: true,
    updatedAt: true,
    doctor: {
        select: {
            ...selectDedaultDoctor
        }
    }
}