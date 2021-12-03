/* eslint-disable @typescript-eslint/no-unused-vars */
import express, { Request, Response } from 'express'
import HttpException from './common/http/http-exception'
import { readFile } from 'fs'
import SwaggerGen from './common/swagger/swagger.gen'
import methods from './common/http/http-methods'
import routes from './routes'
import fileUpload from 'express-fileupload'
import swaggerUI from 'swagger-ui-express'
import authMiddleware from './common/middlewares/auth.middleware'
import ParamValidate from './common/helpers/param.validator'
import ErrorHelper from './common/helpers/error.helper'
import LogService from "./services/log.service"
import { Req } from './common/types/api.type'

const router = express.Router()
router.use(
  fileUpload({
    useTempFiles: true,
  }),
)

router.get('/', (req, res) => res.sendFile(__dirname + '/views/index.html'))
router.use('/uploads', express.static('uploads'))
router.use(authMiddleware)

routes.map((route) => {
  const [prefix, method, path, callback, params, midwares] = route
  const handler = route[3] as any

  const middlewares: any =
    typeof params == 'function' ||
      (Array.isArray(params) &&
        params.filter((p) => typeof p == 'function').length == params.length)
      ? params
      : midwares || []

  const routeHandler = async (req: Request, res: Response) => {
    try {
      const request = req as Req
      if (request.error) {
        LogService.write((req as Req).user?.id, req.method, req.originalUrl, request.error, req.body)
        return res.status(403).json({ error: request.error })
      }
      const { errors, data } = ParamValidate(req as Req, route)
      if (errors && errors.length != 0) {
        LogService.write((req as Req).user?.id, req.method, req.originalUrl, errors, req.body)
        return res.status(422).json({ error: errors.join('\n') })
      }
      request.redata = data

      handler(req, res)
        .then((result: any) => {
          if (result && result._xmlBody)
            return res.status(200).send(result._xmlBody);
          if (result && result.error)
            LogService.write((req as Req).user?.id, req.method, req.originalUrl, result.error, req.body)
          return res
            .status(200)
            .json(
              result && result.error
                ? { ...result }
                : { success: true, result },
            )
        })
        .catch((e: any) => {
          console.log(e)
          const error = e as HttpException
          LogService.write((req as Req).user?.id, req.method, req.originalUrl, error, req.body)
          return res
            .status(error.statusCode || 500)
            .json(ErrorHelper.error(error))
        })
    } catch (e) {
      const error = e as HttpException
      LogService.write((req as Req).user?.id, req.method, req.originalUrl, error, req.body)
      return res.status(error.statusCode || 500).json(ErrorHelper.error(error))
    }
  }
  switch (method) {
    case methods.POST:
      router.post(path.toString(), middlewares, routeHandler)
      break
    case methods.PUT:
      router.put(path.toString(), middlewares, routeHandler)
      break
    case methods.PATCH:
      router.patch(path.toString(), middlewares, routeHandler)
      break
    case methods.DELETE:
      router.delete(path.toString(), middlewares, routeHandler)
      break
    case methods.GET:
    default:
      router.get(path.toString(), middlewares, routeHandler)
      break
  }
})

SwaggerGen.genSwaggerJson(routes)
readFile('swagger.json', 'utf8', (err, data) => {
  router.use('/swagger', swaggerUI.serve, swaggerUI.setup(JSON.parse(data)))
})
export default router
