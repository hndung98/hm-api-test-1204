import { Req } from '../common/types/api.type'
import prisma from '../common/helpers/prisma.helper'

export default class JobPositionService {
  //2021-09-03T23:16:32+07:00
  static async getList() {
    return await prisma.jobPosition.findMany()
  }

  static async adminGet() {
    const jobPosition = await prisma.jobPosition.findMany({
      include: {
        _count: {
          select: {
            workHistory: true
          }
        }
      }
    })
    const count = await prisma.workHistory.groupBy({
      by: ['jobPositionId'],
      _count: {
        doctorId: true
      },

    })

    return jobPosition
  }

  static async create({ redata }: Req) {
    const { title, description } = redata
    return await prisma.jobPosition.create({
      data: {
        title,
        description
      }
    })
  }

  static async update({ redata }: Req) {
    const { id, title, description } = redata
    return await prisma.jobPosition.update({
      data: {
        title,
        description
      },
      where: {
        id
      }
    })
  }

  static async delete({ redata }: Req) {
    const { id } = redata
    await prisma.jobPosition.delete({
      where: {
        id
      }
    })
    return true
  }

  static async deleteList({ redata }: Req) {
    const { ids } = redata
    await prisma.jobPosition.deleteMany({
      where: {
        id: {
          in: ids
        }
      }
    })
    return true
  }

}

