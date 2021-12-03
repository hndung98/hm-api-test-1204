import { Role } from '@prisma/client'
import methods from '../http/http-methods'
import permit from '../middlewares/role.middleware'
import { Params } from '../types/params.type'

export class RouteContainer {
  routes: any[] = []
  prefix: string = ''
  roles: Role[] = []

  constructor(prefix?: string, roles?: Role[]) {
    this.prefix = (prefix ?? this.prefix).replace('/', '')
    this.roles = roles ?? []
  }

  route(pathPrefix: string, roles: Role[] = []) {
    const routeRoles = [...roles, ...this.roles]
    return {
      get: (
        path: string,
        callback: any,
        params?: Params,
        apiRoles?: Role[],
        middleware?: any,
      ) => {
        return this._returnRoute(
          methods.GET,
          pathPrefix,
          path,
          callback,
          params,
          routeRoles,
          apiRoles,
          middleware,
        )
      },
      post: (
        path: string,
        callback: any,
        params?: Params,
        apiRoles?: Role[],
        middleware?: any,
      ) => {
        return this._returnRoute(
          methods.POST,
          pathPrefix,
          path,
          callback,
          params,
          routeRoles,
          apiRoles,
          middleware,
        )
      },
      put: (
        path: string,
        callback: any,
        params?: Params,
        apiRoles?: Role[],
        middleware?: any,
      ) => {
        return this._returnRoute(
          methods.PUT,
          pathPrefix,
          path,
          callback,
          params,
          routeRoles,
          apiRoles,
          middleware,
        )
      },
      patch: (
        path: string,
        callback: any,
        params?: Params,
        apiRoles?: Role[],
        middleware?: any,
      ) => {
        return this._returnRoute(
          methods.PATCH,
          pathPrefix,
          path,
          callback,
          params,
          routeRoles,
          apiRoles,
          middleware,
        )
      },
      delete: (
        path: string,
        callback: any,
        params?: Params,
        apiRoles?: Role[],
        middleware?: any,
      ) => {
        return this._returnRoute(
          methods.DELETE,
          pathPrefix,
          path,
          callback,
          params,
          routeRoles,
          apiRoles,
          middleware,
        )
      },
    }
  }

  private _returnRoute(
    method: string,
    pathPrefix: string,
    path: string,
    callback: any,
    params: Params | undefined,
    routeRoles: Role[] = [],
    apiRoles: Role[],
    middleware?: any,
  ) {
    const ignoreRole = apiRoles && apiRoles.length == 0;
    const roles = apiRoles ?? [];
    const isRoleRestricted = ignoreRole ? false : [...routeRoles, ...roles].length > 0
    if (isRoleRestricted) {
      params = { ...params, jwt: true }
    }
    const data = [method, pathPrefix + path, callback, params]
    if (isRoleRestricted) data.push(permit(...routeRoles, ...roles))
    data.push(middleware)
    this.routes.push(data)

    return this.route(pathPrefix, routeRoles)
  }

  private _mapWithApiPrefix(routes: any[]) {
    routes.sort((a: any, b: any) => {
      const [amethod, apath] = a
      const [bmethod, bpath] = b

      if (amethod == bmethod) {
        const apathParam = apath.includes(':')
        const bpathParam = bpath.includes(':')

        if (!apathParam && !bpathParam) {
          return apath.localeCompare(bpath)
        } else if (apathParam && bpathParam) {
          const apaths = apath.split('/')
          const bpaths = bpath.split('/')
          if (apaths.length == bpaths.length) {
            return apath.localeCompare(bpath)
          } else {
            return bpaths.length - apaths.length
          }
        } else if (apathParam) {
          return 1
        } else if (bpathParam) {
          return -1
        }
      } else {
        return amethod.localeCompare(bmethod)
      }
    })

    return routes.map((api: any) => {
      const pathPrefix = process.env.API_PREFIX || ''
      const paths = [pathPrefix, this.prefix]
      const prefix = paths.filter((p) => p).join('/')
      const [, path] = api
      path
        .toString()
        .split('/')
        .map((p: any) => paths.push(p))
      api[1] = '/' + paths.filter((p) => p).join('/')
      api.unshift(prefix)
      return api
    })
  }

  return() {
    return this._mapWithApiPrefix(this.routes)
  }
}

// const _getAPIPriority = (value: any) => {
//   switch (value) {
//     case methods.POST:
//       return 1
//     case methods.PUT:
//       return 2
//     case methods.PATCH:
//       return 3
//     case methods.DELETE:
//       return 4
//     default:
//     case methods.GET:
//       return 0
//   }
// }
