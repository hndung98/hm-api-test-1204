import { NumberUtils } from './number.util'

export class PrismaUtils {
  static getPaginationOptions(
    query: {
      skip?: any
      take?: any
      cursorId?: any
      searchBy?: any
      searchText?: any
      orderBy?: any
      orderDesc?: any
    },
    options: any = {},
  ) {
    const {
      skip,
      take,
      cursorId,
      searchBy,
      searchText,
      orderBy,
      orderDesc,
    } = query
    if (
      skip &&
      NumberUtils.isNonNegativeInteger(+skip)
    ) {
      options = {
        ...options,
        skip: skip ? Math.abs(+skip) : 0,
      }
    }
    if (
      take &&
      NumberUtils.isNonNegativeInteger(+take)
    ) {
      options = {
        ...options,
        take: take ? Math.abs(+take) : 0,
      }
    }

    if (cursorId) {
      options = {
        ...options,
        cursor: {
          id: +cursorId,
        },
      }
    }

    if (!!searchBy && !!searchText) {
      options.where = {
        ...options.where,
        [searchBy]: {
          contains: searchText,
        },
      }
    }

    if (typeof orderBy === 'string') {
      options.orderBy = {
        ...options.orderBy,
        [orderBy]: orderDesc ? 'desc' : 'asc',
      }
    }
    return options
  }
}
