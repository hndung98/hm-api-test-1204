import moment from 'moment'
import prisma from '../common/helpers/prisma.helper'
import { Req } from '../common/types/api.type'
import { NumberUtils } from '../common/utils/number.util'
import ErrorHelper from '../common/helpers/error.helper'

export default class LogService {
  static async write(
    userId: number | undefined,
    method: string,
    url: string,
    error: any,
    content: any,
  ) {
    if (!error) return
    await prisma.log.create({
      data: {
        userId,
        method,
        url,
        errorMessage: JSON.stringify(ErrorHelper.error(error)),
        content,
      },
    })

    return true
  }

  static async index({ query }: Req) {
    const { cursorId, skip, take, search, orderBy, orderDesc } = query as any

    let options: any = {}

    if (
      skip &&
      take &&
      NumberUtils.isNonNegativeInteger(+skip) &&
      NumberUtils.isNonNegativeInteger(+take)
    ) {
      options = {
        skip: skip ? Math.abs(+skip) : 0,
        take: take ? Math.abs(+take) : 0,
      }
    }

    if (search)
      options.where = {
        OR: [
          {
            url: { contains: search, mode: 'insensitive' },
          },
          {
            method: { contains: search, mode: 'insensitive' },
          },
          {
            errorMessage: { contains: search, mode: 'insensitive' },
          },
        ],
      }

    if (cursorId) {
      options = {
        ...options,
        cursor: {
          id: +cursorId,
        },
      }
    }

    if (typeof orderBy === 'string' && ['id'].includes(orderBy)) {
      options.orderBy = {
        [orderBy]: orderDesc === 'true' ? 'desc' : 'asc',
      }
    } else {
      options.orderBy = { id: 'desc' }
    }

    return await prisma.log.findMany({ ...options })
  }

  static async delete({ params }: Req) {
    const { id } = params
    const log = await prisma.log.findUnique({ where: { id: +id } })
    if (!log) return { error: 'Log not found' }
    await prisma.log.delete({ where: { id: +id } })

    return true
  }

  static async deleteMany({ query }: Req) {
    const ids = query.ids as Array<string>
    const uids =
      ids && Array.isArray(ids)
        ? ids.map((uid: string) => parseInt(uid))
        : ids
          ? [parseInt(ids)]
          : []

    try {
      await prisma.log.deleteMany({
        where: {
          id: { in: uids },
        },
      })
      return true
    } catch (error) {
      return false
    }
  }

  static async totalCountInMonth(date: Date) {
    const startDate = moment(date).format('YYYY-MM-DD');
    const endDate = moment(date).add(1, 'month').format('YYYY-MM-DD');

    return await prisma.log.count({
      where: {
        createdAt: {
          gte: new Date(startDate),
          lt: new Date(endDate),
        }
      }
    });
  }

  static async deleteAll() {
    await prisma.log.deleteMany()
    return true
  }
}
