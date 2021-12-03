import { Params } from '../../../common/types/params.type'

export const IdInBody: Params = {
  id: {
    in: 'body',
    type: 'number',
    required: true,
  },
}

export const TokenInPath: Params = {
  token: {
    in: 'path',
    type: 'string',
    required: true,
  },
}

export const UserIdInBody: Params = {
  userId: {
    in: 'body',
    type: 'integer',
    required: true,
  },
}

export const UserIdInPath: Params = {
  userId: {
    in: 'path',
    type: 'integer',
    required: true,
  },
}

export const IdInPath: Params = {
  id: {
    in: 'path',
    type: 'integer',
    required: true,
  },
}

export const IdTypeStringInPath: Params = {
  id: {
    in: 'path',
    required: true,
  },
}

export const EmailInQuery: Params = {
  email: {
    in: 'query',
    type: 'string',
    required: true,
  },
}

export const IdInQuery: Params = {
  id: {
    in: 'query',
    type: 'integer',
    required: true,
  },
}

export const IdsInQuery: Params = {
  ids: {
    in: 'query',
    type: 'array',
    items: {
      type: 'integer',
    },
    collectionFormat: 'multi',
    required: true,
  },
}

export const IdsInBody: Params = {
  ids: {
    in: 'body',
    type: 'array',
    items: {
      type: 'integer',
    },
    collectionFormat: 'multi',
    required: true,
  },
}

export const UuidInQuery: Params = {
  uuid: {
    in: 'query',
    type: 'string',
    required: true,
  },
}

export const UuidInQuerys: Params = {
  uuids: {
    in: 'query',
    type: 'array',
    collectionFormat: 'multi',
    required: true,
    items: {
      type: 'string',
    },
  },
}
