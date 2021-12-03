import { Req } from '../common/types/api.type'
import prisma from '../common/helpers/prisma.helper'

export default class SpecializedService {
  static async get() {
    const specializedList = await prisma.specialized.findMany({
    })
    return specializedList
  }

  static async adminGet() {
    return await prisma.specialized.findMany({
      include: {
        _count: {
          select: {
            doctor: true,
            application: true
          }
        }
      }
    })
  }

  static async create({ redata }: Req) {
    const { name } = redata
    const specialized = await prisma.specialized.create({
      data: {
        name
      }
    })
    return specialized
  }

  static async update({ redata }: Req) {
    const { id, name } = redata
    const specialized = await prisma.specialized.update({
      data: {
        name
      },
      where: {
        id
      }
    })
    return specialized
  }

  static async delete({ redata }: Req) {
    const { id } = redata
    await prisma.specialized.delete({
      where: {
        id
      }
    })
    return true
  }



  static async deleteList({ redata }: Req) {
    const { ids } = redata
    await prisma.specialized.deleteMany({
      where: {
        id: {
          in: ids
        }
      }
    })
    return true
  }
}

