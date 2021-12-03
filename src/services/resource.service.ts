import { Asset } from '@prisma/client'
import fs from 'fs'
import crypto from 'crypto'
import { Req, Res } from '../common/types/api.type'
import prisma from '../common/helpers/prisma.helper'

export default class ResourceService {
  static async index(req: Req, res: Res) {
    const { path } = req
    const id = path.split('/')[1]

    if (id) {
      try {
        const s = fs.createReadStream(path)
        s.on('open', () => {
          res.set('Content-Type', 'image/png')
          s.pipe(res)
        })
      } catch (e) {
        console.log(e)
      }
    }
    return false
  }

  static async redirect(req: Req, res: Res) {
    const pathPrefix = '/' + (process.env.API_PREFIX || '')
    const url = req.originalUrl.replace(pathPrefix, '')
    res.redirect(url)
  }

  static upload(file: any) {
    if (!file) return {}
    const uuid = crypto.randomBytes(16).toString('hex')
    let extension = file.name.split('.').reverse()[0]
    if (!extension) {
      extension = file.mimetype.split('/').reverse()[0]
    }

    const dir = './uploads/'
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir)
    }
    fs.rename(file.tempFilePath, dir + uuid + '.' + extension, () => { })
    return { uuid, extension }
  }

  static getPath(file: Asset) {
    return process.env.BASE_URL + '/uploads/' + file.uuid + '.' + file.extension
  }

  static async removeFile(file: Asset) {
    if (!file) return false
    const currentFile = await prisma.asset.findUnique({
      where: {
        uuid: file.uuid,
      },
      include: {
        doctor: true,
        customer: true
      }
    })
    if (!currentFile) {
      try {
        fs.unlinkSync(`./uploads/${file.uuid}.${file.extension}`)
      } catch (err) {
        console.error(err)
        return false
      }
    } else if (
      currentFile.applicationId === null &&
      currentFile.medicalRecordId === null &&
      currentFile.customer === null &&
      currentFile.doctor === null
    ) {
      try {
        fs.unlinkSync(`./uploads/${file.uuid}.${file.extension}`)
      } catch (err) {
        console.error(err)
        return false
      }
      await prisma.asset.delete({
        where: {
          uuid: file.uuid,
        },
      })
    }
    return true
  }

  static includeFileURL(obj: any, path: string, newPath?: string) {
    if (obj) {
      if (obj[path])
        if (Array.isArray(obj[path])) {
          obj[path] = obj[path].map((item: any) =>
            ResourceService.getPath(item),
          )
        } else {
          obj[path] = ResourceService.getPath(obj[path])
        }
      // delete obj.avatarId;
    }
    if (obj && newPath && newPath !== path) {
      obj[newPath] = obj[path]
      obj[path] = undefined
    }
  }
}
