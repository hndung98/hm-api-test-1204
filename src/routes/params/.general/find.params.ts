import { Params } from '../../../common/types/params.type'

export const SkipTakePagination: Params = {
  skip: {
    type: 'integer',
    in: 'query',
  },
  take: {
    type: 'integer',
    in: 'query',
  },
}

export const CursorPagination: Params = {
  ...SkipTakePagination,
  cursorId: {
    type: 'integer',
    in: 'query',
  },
}

export const SearchOption: Params = {
  searchText: { in: 'query' },
}

export const OrderOption: Params = {
  // orderBy: { in: 'query' },
  orderDesc: { in: 'query', type: 'boolean' },
}

export const LimitPagination: Params = {
  limit: {
    type: 'integer',
    in: 'query',
  },
}

export const FullOptionPagination: Params = {
  ...CursorPagination,
  ...OrderOption,
  ...SearchOption,
}
