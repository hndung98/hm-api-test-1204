import { Req } from '../common/types/api.type'
import prisma from '../common/helpers/prisma.helper'
import { PrismaUtils } from '../common/utils/prisma.util'
import { GetAnswerType } from '../routes/params/answer/get.params'
import ResourceService from './resource.service'

export default class AnswerService {
  static async postAnswer({ redata, user }: Req) {
    const { questionId, content, specializedId } = redata
    const doctor = await prisma.doctor.findFirst({
      where: {
        userId: user.id
      }
    })

    if (!doctor) return { error: "Unauthorize" }

    let query: any = {
      question: {
        connect: {
          id: questionId
        }
      },
      content,
      doctor: {
        connect: {
          id: doctor.id
        }
      }
    }

    if (specializedId && !isNaN(specializedId)) {
      query = {
        ...query,
        specialized: {
          connect: {
            id: specializedId
          }
        }
      }
    }

    const answer = await prisma.answer.create({
      data: {
        ...query
      }
    })
    return answer
  }

  static async getAnswer({ redata }: Req) {
    const { id, skip, take, sortBy } = redata

    const options = PrismaUtils.getPaginationOptions({
      skip,
      take,
    })

    let orderBy: any = {}

    if (sortBy === GetAnswerType.NEWEST) {
      orderBy = {
        ...orderBy,
        createdAt: 'desc'
      }
    }

    if (sortBy === GetAnswerType.MOST_RELEVANT) {
      orderBy = {
        ...orderBy,
        answerLike: {
          _count: 'desc'
        }
      }
    }

    const answers = await prisma.answer.findMany({
      where: {
        question: {
          id
        }
      },
      ...options,
      include: {
        _count: {
          select: {
            answerLike: true
          }
        },
        doctor: {
          include: {
            avatar: true
          }
        },
        specialized: true
      },
      orderBy: {
        ...orderBy
      }
    })
    const answerIds = answers.map(answer => answer.id)
    const answerLikes = await prisma.answerLike.findMany({
      where: {
        id: {
          in: answerIds
        }
      }
    })
    const answerLikeIds = new Set(answerLikes.map(answerLike => answerLike.id))

    answers.map((answer: any) => {
      ResourceService.includeFileURL(answer.doctor, 'avatar', 'avatarURL')
      answer.liked = answerLikeIds.has(answer.id) ? true : false
    })
    return answers
  }

  static async likeAnswer({ user, redata }: Req) {
    const { id } = redata
    const like = await prisma.answerLike.findFirst({
      where: {
        answerId: id,
        userId: user.id
      }
    })
    if (like) return true
    await prisma.answerLike.create({
      data: {
        answer: {
          connect: {
            id
          }
        },
        user: {
          connect: {
            id: user.id
          }
        }
      }
    })
    return true
  }

  static async unlikeAnswer({ user, redata }: Req) {
    const { id } = redata
    const like = await prisma.answerLike.findFirst({
      where: {
        answerId: id,
        userId: user.id
      }
    })
    if (!like) return true
    await prisma.answerLike.delete({
      where: {
        id: like.id
      }
    })
    return true
  }
}


