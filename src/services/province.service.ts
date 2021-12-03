import { Req } from '../common/types/api.type'
import prisma from '../common/helpers/prisma.helper'
import path from 'path'
import fs from 'fs'

export default class ProvinceService {
  static async getProvinces() {
    const wards = await prisma.province.findMany({
    })

    return wards
  }

  static async getDistricts({ redata }: Req) {
    const { provinceId } = redata
    const districts = await prisma.district.findMany({
      where: {
        provinceId: +provinceId
      }
    })

    return districts
  }

  static async getWards({ redata }: Req) {
    const { districtId } = redata
    const wards = await prisma.ward.findMany({
      where: {
        districtId: +districtId
      }
    })

    return wards
  }

  static async adminGet() {
    const provinces = await prisma.province.findMany({
      include: {
        _count: {
          select: {
            customer: true,
            doctor: true
          }
        }
      }
    })
    return provinces
  }

  static async create({ redata }: Req) {
    const { name } = redata
    return await prisma.province.create({
      data: {
        name
      }
    })
  }
  static async update({ redata }: Req) {
    const { id, name } = redata
    return await prisma.province.update({
      data: {
        name
      },
      where: {
        id
      }
    })
  }
  static async delete({ redata }: Req) {
    const { id } = redata
    await prisma.province.delete({
      where: {
        id
      }
    })

    return true
  }

  static async init() {
    const pathDir = path.join(__dirname, '../views/backup-data/provinces.txt')

    const html = await fs.readFileSync(pathDir).toString()
    const data: any = JSON.parse(html)

    await prisma.$transaction([
      ...data.map((province: any) => prisma.province.create({
        data: {
          name: province?.name,
          code: province?.code,
          codename: province?.codename,
          division_type: province?.division_type,
          phone_code: province?.phone_code,
          districts: {
            createMany: {
              data: province.districts.map((district: any) => ({
                name: district?.name,
                code: district?.code,
                codename: district?.codename,
                division_type: district?.division_type,
                short_codename: district?.short_codename,

              })
              )
            }
          }
        }
      })
      )
    ])

    const wards = data.map((province: any) => {
      return province.districts.map((district: any) => {
        return district.wards.map((ward: any) => {
          return {
            ...ward,
            districtCode: district.code
          }
        })
      })
    })

    const wardList = wards.flat(3)

    await prisma.$transaction([
      ...wardList.map((ward: any) => {
        let wardData: any = {
          name: ward?.name,
          code: ward?.code,
          codename: ward?.codename,
          division_type: ward?.division_type,
          short_codename: ward?.short_codename,
        }

        if (ward.districtCode) {
          wardData = {
            ...wardData,
            district: {
              connect: {
                code: ward.districtCode
              }
            }
          }
        }
        return prisma.ward.create({
          data: {
            ...wardData
          }
        })
      }
      )
    ])

    return true
  }
}

const provinceList = [
  'An Giang',
  'Bà Rịa – Vũng Tàu',
  'Bạc Liêu',
  'Bắc Giang',
  'Bắc Kạn',
  'Bắc Ninh',
  'Bến Tre',
  'Bình Dương',
  'Bình Định',
  'Bình Phước',
  'Bình Thuận',
  'Cà Mau',
  'Cao Bằng',
  'Cần Thơ',
  'Đà Nẵng',
  'Đắk Lắk',
  'Đắk Nông',
  'Điện Biên',
  'Đồng Nai',
  'Đồng Tháp',
  'Gia Lai',
  'Hà Giang',
  'Hà Nam',
  'Hà Nội',
  'Hà Tĩnh',
  'Hải Dương',
  'Hải Phòng',
  'Hậu Giang',
  'Hòa Bình',
  'Thành phố Hồ Chí Minh',
  'Hưng Yên',
  'Khánh Hòa',
  'Kiên Giang',
  'Kon Tum',
  'Lai Châu',
  'Lạng Sơn',
  'Lào Cai',
  'Lâm Đồng',
  'Long An',
  'Nam Định',
  'Nghệ An',
  'Ninh Bình',
  'Ninh Thuận',
  'Phú Thọ',
  'Phú Yên',
  'Quảng Bình',
  'Quảng Nam',
  'Quảng Ngãi',
  'Quảng Ninh',
  'Quảng Trị',
  'Sóc Trăng',
  'Sơn La',
  'Tây Ninh',
  'Thái Bình',
  'Thái Nguyên',
  'Thanh Hóa',
  'Thừa Thiên Huế',
  'Tiền Giang',
  'Trà Vinh',
  'Tuyên Quang',
  'Vĩnh Long',
  'Vĩnh Phúc',
  'Yên Bái'
]

