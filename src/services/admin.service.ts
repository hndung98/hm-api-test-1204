import { Req } from '../common/types/api.type'
import MailHelper from '../common/helpers/mail.helper'

const mailhelper = new MailHelper()
export default class AdminService {

}

export const selectUserInfo = {
  id: true,
  email: true,
  firstName: true,
  lastName: true,
  avatar: true,
  role: true,
  createdAt: true,
  updatedAt: true,
  businessName: true,
  cuisineId: true,
  cuisine: true,
  phoneNumber: true,
  approval: true,
  contactId: true,
  operationId: true,
  verified: true,
  deleted: true,
}
