import { Req } from '../common/types/api.type'
import prisma from '../common/helpers/prisma.helper'
import ResourceService from './resource.service'
import { ReferenceType } from '.prisma/client'
import { PrismaUtils } from '../common/utils/prisma.util'
import { SortQuestion } from '../routes/params/question/get-list.params'
import { selectDefaultCustomer } from './customer.service'

export default class QuestionService {
  static async getList({ redata, user }: Req) {
    const { skip, take, keyword, sortBy, specializedId } = redata
    const options = PrismaUtils.getPaginationOptions({ skip, take })

    let where: any = {}
    let orderBy: any = {
      createdAt: 'desc'
    }

    if (keyword && keyword !== '') {
      where = {
        ...where,
        OR: [
          {
            title: {
              contains: keyword
            }
          },
          {
            content: {
              contains: keyword
            }
          }
        ],
      }
    }

    if (specializedId && !isNaN(specializedId)) {
      where = {
        ...where,
        answer: {
          some: {
            specializedId
          }
        }
      }
    }

    if (sortBy && sortBy !== '') {
      if (sortBy === SortQuestion.NEWEST) {
        orderBy = {
          createdAt: 'desc'
        }
      } else if (sortBy === SortQuestion.OLDEST) {
        orderBy = {
          createdAt: 'asc'
        }
      } else if (sortBy === SortQuestion.MOST_FAVORITE) {
        orderBy = {
          questionLike: {
            _count: 'desc'
          },
        }
      } else if (sortBy === SortQuestion.MOST_COMMENTED) {
        orderBy = {
          answer: {
            _count: 'desc'
          },
        }
      }
    }

    const questions = await prisma.question.findMany({
      where: {
        ...where,
      },
      orderBy: {
        ...orderBy
      },
      include: {
        customer: {
          select: {
            ...selectDefaultCustomer
          }
        },
        images: true,
        _count: {
          select: {
            questionLike: true,
            answer: true
          }
        }
      },
      ...options
    })
    const questionIds = questions.map(question => question.id)
    const [questionLikes, questionSaveds] = await prisma.$transaction([
      prisma.questionLike.findMany({
        where: {
          questionId: {
            in: questionIds
          },
          userId: user.id
        }
      }),
      prisma.questionSaved.findMany({
        where: {
          questionId: {
            in: questionIds
          },
          customer: {
            userId: user.id
          }
        }
      })
    ])
    const questionLikeIds = new Set(questionLikes.map(questionLike => questionLike.questionId))
    const questionSavedIds = new Set(questionSaveds.map(questionSaved => questionSaved.questionId))
    questions.map((question: any) => {
      ResourceService.includeFileURL(question, 'images')
      ResourceService.includeFileURL(question.customer, 'avatar', 'avatarURL')
      question.liked = questionLikeIds.has(question.id) ? true : false
      question.saved = questionSavedIds.has(question.id) ? true : false
    })
    return questions
  }

  static async getListPublic({ redata }: Req) {
    const { skip, take, keyword, sortBy, specializedId } = redata
    const options = PrismaUtils.getPaginationOptions({ skip, take })

    let where: any = {}
    let orderBy: any = {
      createdAt: 'desc'
    }

    if (keyword && keyword !== '') {
      where = {
        ...where,
        OR: [
          {
            title: {
              contains: keyword
            }
          },
          {
            content: {
              contains: keyword
            }
          }
        ],
      }
    }

    if (specializedId && !isNaN(specializedId)) {
      where = {
        ...where,
        answer: {
          some: {
            specializedId
          }
        }
      }
    }

    if (sortBy && sortBy !== '') {
      if (sortBy === SortQuestion.NEWEST) {
        orderBy = {
          createdAt: 'desc'
        }
      } else if (sortBy === SortQuestion.OLDEST) {
        orderBy = {
          createdAt: 'asc'
        }
      } else if (sortBy === SortQuestion.MOST_FAVORITE) {
        orderBy = {
          questionLike: {
            _count: 'desc'
          },
        }
      } else if (sortBy === SortQuestion.MOST_COMMENTED) {
        orderBy = {
          answer: {
            _count: 'desc'
          },
        }
      }
    }

    const questions = await prisma.question.findMany({
      where: {
        ...where,
      },
      orderBy: {
        ...orderBy
      },
      include: {
        customer: {
          select: {
            ...selectDefaultCustomer
          }
        },
        images: true,
        _count: {
          select: {
            questionLike: true,
            answer: true
          }
        }
      },
      ...options
    })

    questions.map((question: any) => {
      ResourceService.includeFileURL(question, 'images')
      ResourceService.includeFileURL(question.customer, 'avatar', 'avatarURL')
    })
    return questions
  }

  static async getByIdPublic({ redata }: Req) {
    const { id } = redata

    const question = await prisma.question.findFirst({
      where: {
        id: +id,
      },
      include: {
        customer: {
          select: {
            ...selectDefaultCustomer
          }
        },
        images: true,
        _count: {
          select: {
            questionLike: true,
            answer: true
          }
        }
      },
    })
    if (!question) return { error: "Not found this quetion" }

    ResourceService.includeFileURL(question, 'images')
    ResourceService.includeFileURL(question.customer, 'avatar', 'avatarURL')
    return question
  }

  static async getListAnswered({ redata, user }: Req) {
    const { skip, take, keyword, specializedId } = redata
    const options = PrismaUtils.getPaginationOptions({ skip, take })

    let where: any = {}

    if (keyword && keyword !== '') {
      where = {
        ...where,
        OR: [
          {
            title: {
              contains: keyword
            }
          },
          {
            content: {
              contains: keyword
            }
          }
        ],
      }
    }

    if (specializedId && !isNaN(specializedId)) {
      where = {
        ...where,
        answer: {
          some: {
            specializedId
          }
        }
      }
    }

    const questions = await prisma.question.findMany({
      where: {
        ...where,
        answer: {
          some: {
            doctor: {
              userId: user.id
            }
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      include: {
        customer: {
          include: {
            avatar: true
          }
        },
        images: true,
        answer: {
          include: {
            doctor: {
              include: {
                avatar: true,
                province: true
              },
            },
            specialized: true,
            _count: {
              select: {
                answerLike: true
              }
            },
          }
        },
        _count: {
          select: {
            questionLike: true
          }
        }
      },
      ...options
    })
    const questionIds = questions.map(question => question.id)
    const [questionLikes, questionSaveds] = await prisma.$transaction([
      prisma.questionLike.findMany({
        where: {
          questionId: {
            in: questionIds
          },
          userId: user.id
        }
      }),
      prisma.questionSaved.findMany({
        where: {
          questionId: {
            in: questionIds
          },
          customer: {
            userId: user.id
          }
        }
      })
    ])
    const questionLikeIds = new Set(questionLikes.map(questionLike => questionLike.questionId))
    const questionSavedIds = new Set(questionSaveds.map(questionSaved => questionSaved.questionId))
    questions.map((question: any) => {
      ResourceService.includeFileURL(question, 'images')
      ResourceService.includeFileURL(question.customer, 'avatar', 'avatarURL')
      question.liked = questionLikeIds.has(question.id) ? true : false
      question.saved = questionSavedIds.has(question.id) ? true : false
    })
    return questions
  }

  static async getMyQuestion({ user }: Req) {
    const questions = await prisma.question.findMany({
      where: {
        customer: {
          userId: user.id
        }
      },
      include: {
        images: true,
        _count: {
          select: {
            questionLike: true,
            answer: true
          }
        }
      }
    })
    const questionIds = questions.map(question => question.id)
    const [questionLikes, questionSaveds] = await prisma.$transaction([
      prisma.questionLike.findMany({
        where: {
          questionId: {
            in: questionIds
          },
          userId: user.id
        }
      }),
      prisma.questionSaved.findMany({
        where: {
          questionId: {
            in: questionIds
          },
          customer: {
            userId: user.id
          }
        }
      })
    ])
    const questionLikeIds = new Set(questionLikes.map(questionLike => questionLike.questionId))
    const questionSavedIds = new Set(questionSaveds.map(questionSaved => questionSaved.questionId))
    questions.map((question: any) => {
      ResourceService.includeFileURL(question, 'images')
      question.liked = questionLikeIds.has(question.id) ? true : false
      question.saved = questionSavedIds.has(question.id) ? true : false
    })
    return questions
  }

  static async addQuestion({ user, redata, files }: Req) {
    const { title, content } = redata

    const customer = await prisma.customer.findFirst({
      where: {
        userId: user.id
      }
    })

    if (!customer) return { error: "Invalid user" }

    let images = []
    if (files?.images) {
      if (!Array.isArray(files.images)) {
        images.push({
          ...ResourceService.upload(files.images),
          referenceType: ReferenceType.QUESTION_IMG,
        })
      } else {
        images = files.images.map((image: any) => {
          return {
            ...ResourceService.upload(image),
            referenceType: ReferenceType.QUESTION_IMG,
          }
        })
      }
    }
    const question = await prisma.question.create({
      data: {
        title,
        content,
        customer: {
          connect: {
            id: customer.id
          }
        },
        images: {
          createMany: {
            data: images
          }
        }
      },
      include: {
        customer: {
          include: {
            avatar: true
          }
        },
        images: true
      }
    })
    ResourceService.includeFileURL(question, 'images')
    ResourceService.includeFileURL(question.customer, 'avatar', 'avatarURL')
    return question
  }
  static async updateQuestion({ user, redata, files }: Req) {
    const { title, id, content, deleteImgs } = redata
    const currentQuestion = await prisma.question.findFirst({
      where: {
        id,
        customer: {
          userId: user.id
        }
      },
      include: {
        _count: {
          select: {
            answer: true
          }
        }
      }
    })
    if (!currentQuestion) return { error: "Unauthorize" }
    if (currentQuestion._count?.answer
      && currentQuestion._count?.answer > 0) return { error: "Can't update question that answered!" }

    if (Array.isArray(deleteImgs) && deleteImgs.length > 0) {
      const imgs = deleteImgs.map(img => img.split('/').pop().split('.')[0])
      const assets = await prisma.asset.findMany({
        where: {
          uuid: {
            in: imgs
          },
          questionId: currentQuestion.id
        }
      })
      await prisma.asset.deleteMany({
        where: {
          uuid: {
            in: assets.map(asset => asset.uuid)
          }
        }
      })
      assets.map(asset => ResourceService.removeFile(asset))
    }

    let images = []
    if (files?.images) {
      if (!Array.isArray(files.images)) {
        images.push({
          ...ResourceService.upload(files.images),
          referenceType: ReferenceType.QUESTION_IMG,
        })
      } else {
        images = files.images.map((image: any) => {
          return {
            ...ResourceService.upload(image),
            referenceType: ReferenceType.QUESTION_IMG,
          }
        })
      }
    }
    const question = await prisma.question.update({
      data: {
        title,
        content,
        images: {
          createMany: {
            data: images
          }
        }
      },
      where: {
        id: currentQuestion.id
      },
      include: {
        customer: {
          include: {
            avatar: true
          }
        },
        images: true
      }
    })
    ResourceService.includeFileURL(question, 'images')
    ResourceService.includeFileURL(question.customer, 'avatar', 'avatarURL')
    return question
  }

  static async deleteQuestion({ redata, user }: Req) {
    const { id } = redata
    const question = await prisma.question.findFirst({
      where: {
        customer: {
          userId: user.id
        },
        id: id
      },
      include: {
        _count: {
          select: {
            answer: true
          }
        }
      }
    })

    if (!question) return { error: "Question invalid" }
    if ((question as any)._count?.answer > 0) return { error: "Can't delete this question" }
    await prisma.$transaction([
      prisma.questionSaved.deleteMany({
        where: {
          questionId: question.id
        }
      }),
      prisma.questionLike.deleteMany({
        where: {
          questionId: question.id
        }
      }),
      prisma.question.delete({
        where: {
          id: question.id
        }
      })
    ])
    return true
  }

  static async likeQuestion({ user, redata }: Req) {
    const { id } = redata
    const like = await prisma.questionLike.findFirst({
      where: {
        questionId: id,
        userId: user.id
      }
    })
    if (like) return true
    await prisma.questionLike.create({
      data: {
        question: {
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


  static async unlikeQuestion({ user, redata }: Req) {
    const { id } = redata
    const like = await prisma.questionLike.findFirst({
      where: {
        questionId: id,
        userId: user.id
      }
    })
    if (!like) return true
    await prisma.questionLike.delete({
      where: {
        id: like.id
      }
    })
    return true
  }

  static async saveQuestion({ user, redata }: Req) {
    const { id } = redata

    const checkSaved = await prisma.questionSaved.findFirst({
      where: {
        questionId: id,
        customer: {
          userId: user.id
        }
      }
    })
    if (checkSaved) {
      return true
    }

    const customer = await prisma.customer.findFirst({
      where: {
        userId: user.id
      }
    })

    if (!customer) return { error: "Unauthorize" }

    await prisma.questionSaved.create({
      data: {
        question: {
          connect: {
            id
          }
        },
        customer: {
          connect: {
            id: customer.id
          }
        }
      }
    })

    return true
  }

  static async unsaveQuestion({ redata, user }: Req) {
    const { id } = redata
    const saved = await prisma.questionSaved.findFirst({
      where: {
        questionId: id,
        customer: {
          userId: user.id
        }
      }
    })
    if (!saved) return true

    await prisma.questionSaved.delete({
      where: {
        id: saved.id
      }
    })
    return true
  }

  static async getSavedQuestion({ redata, user }: Req) {
    const { skip, take } = redata

    const options = PrismaUtils.getPaginationOptions({ skip, take })
    const savedList = await prisma.questionSaved.findMany({
      where: {
        customer: {
          userId: user.id
        }
      },
      include: {
        question: {
          include: {
            images: true,
            customer: true,
            _count: {
              select: {
                questionLike: true
              }
            }
          }
        }
      },
      ...options
    })
    const questionIds = savedList.map(question => question.questionId)

    const [questionLikes, questionSaveds] = await prisma.$transaction([
      prisma.questionLike.findMany({
        where: {
          questionId: {
            in: questionIds
          },
          userId: user.id
        }
      }),
      prisma.questionSaved.findMany({
        where: {
          questionId: {
            in: questionIds
          },
          customer: {
            userId: user.id
          }
        }
      })
    ])
    const questionLikeIds = new Set(questionLikes.map(questionLike => questionLike.questionId))
    const questionSavedIds = new Set(questionSaveds.map(questionSaved => questionSaved.questionId))
    savedList.map((item: any) => {
      ResourceService.includeFileURL(item.question, 'images')
      ResourceService.includeFileURL(item.question.customer, 'avatar', 'avatarURL')
      item.liked = questionLikeIds.has(item.questionId) ? true : false
      item.saved = questionSavedIds.has(item.questionId) ? true : false
    })
    return savedList
  }
}


