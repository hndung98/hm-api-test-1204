/* eslint-disable prefer-const */
import { Req } from '../common/types/api.type'
import moment from 'moment'
import prisma from '../common/helpers/prisma.helper'
import { AppointmentStatus } from '.prisma/client'

const VNP_TMN_CODE = process.env.VNP_TMN_CODE
const VNP_HASH_SECRET = process.env.VNP_HASH_SECRET
const VNP_URL = process.env.VNP_URL
const VNP_RETURN_URL = process.env.VNP_RETURN_URL
const VNP_AMOUNT = process.env.VNP_AMOUNT

export default class PaymentService {

  static async createPaymentUrl(orderInfo: string, ipAddress: string, appointmentId: number, amount?: number) {


    const currCode = 'VND';
    const createDate = moment().format('YYYYMMDDHHmmss');
    const orderId = `${moment().format('HHmmss')}${appointmentId}`
    let vnpUrl = VNP_URL
    let vnp_Params: any = {}
    vnp_Params['vnp_Version'] = '2.0.1';
    vnp_Params['vnp_Command'] = 'pay';
    vnp_Params['vnp_TmnCode'] = VNP_TMN_CODE;
    vnp_Params['vnp_Locale'] = 'vn';
    vnp_Params['vnp_CurrCode'] = currCode;
    vnp_Params['vnp_TxnRef'] = orderId;
    vnp_Params['vnp_OrderInfo'] = orderInfo;
    vnp_Params['vnp_OrderType'] = '270001';
    vnp_Params['vnp_Amount'] = amount ? (amount * 100) : VNP_AMOUNT ? +VNP_AMOUNT * 100 : 2000000;
    // vnp_Params['vnp_ReturnUrl'] = VNP_RETURN_URL;
    vnp_Params['vnp_ReturnUrl'] = VNP_RETURN_URL;
    vnp_Params['vnp_IpAddr'] = ipAddress;
    vnp_Params['vnp_CreateDate'] = createDate;

    const sortObj = require('sort-object');


    vnp_Params = sortObj(vnp_Params);
    const querystring = require('qs');
    const signData = querystring.stringify(vnp_Params, { encode: false });
    console.log(signData);

    const crypto = require("crypto");
    const hmac = crypto.createHmac("sha512", VNP_HASH_SECRET);
    const signed = hmac.update(Buffer.from(signData, 'utf-8')).digest("hex");
    vnp_Params['vnp_SecureHash'] = signed;
    vnpUrl += '?' + querystring.stringify(vnp_Params, { encode: false });
    return vnpUrl

  }
  static async confirmPayment({ redata }: Req) {
    const {
      vnp_Amount,
      vnp_BankCode,
      vnp_BankTranNo,
      vnp_CardType,
      vnp_OrderInfo,
      vnp_PayDate,
      vnp_ResponseCode,
      vnp_TmnCode,
      vnp_TransactionNo,
      vnp_TransactionStatus,
      vnp_TxnRef,
      vnp_SecureHash
    } = redata

    let vnp_Params: any = {}
    vnp_Params['vnp_Amount'] = vnp_Amount
    vnp_Params['vnp_BankCode'] = vnp_BankCode
    vnp_Params['vnp_BankTranNo'] = vnp_BankTranNo
    vnp_Params['vnp_CardType'] = vnp_CardType
    vnp_Params['vnp_OrderInfo'] = vnp_OrderInfo
    vnp_Params['vnp_PayDate'] = vnp_PayDate
    vnp_Params['vnp_ResponseCode'] = vnp_ResponseCode
    vnp_Params['vnp_TmnCode'] = vnp_TmnCode
    vnp_Params['vnp_TransactionNo'] = vnp_TransactionNo
    vnp_Params['vnp_TransactionStatus'] = vnp_TransactionStatus
    vnp_Params['vnp_TxnRef'] = vnp_TxnRef



    const sortObj = require('sort-object');


    vnp_Params = sortObj(vnp_Params);
    console.log(vnp_Params);


    const querystring = require('qs');
    const signData = querystring.stringify(vnp_Params, { encode: false }).replace(/ /g, '+');
    const crypto = require("crypto");
    const hmac = crypto.createHmac("sha512", VNP_HASH_SECRET);
    const signed = hmac.update(Buffer.from(signData, 'utf-8')).digest("hex");

    if (vnp_SecureHash === signed) {
      const id = vnp_TxnRef.slice(6, vnp_TxnRef.length)
      const appointment = await prisma.appointment.findFirst({
        where: {
          id: +id
        }
      })
      if (!appointment) return { error: "Incorrect appointment" }
      if (appointment.status === AppointmentStatus.WAITING_PAYMENT) {
        await prisma.appointment.update({
          data: {
            status: AppointmentStatus.PENDING,
            isPayment: true,
            paymentDate: new Date()
          },
          where: {
            id: +id
          }
        })
      }
      return true

    } else {
      return { error: "Invalid request" }
    }
  }


  // http://localhost:8080/?
  // vnp_Amount=21312300&
  // vnp_BankCode=NCB&
  // vnp_BankTranNo=20211120004302&
  // vnp_CardType=ATM&
  // vnp_OrderInfo=hello&
  // vnp_PayDate=20211120004256&
  // vnp_ResponseCode=00&
  // vnp_TmnCode=TUEMRN6A&
  // vnp_TransactionNo=13633575&
  // vnp_TransactionStatus=00&
  // vnp_TxnRef=004216&
  // vnp_SecureHash=30b4e619e63758febc6c689bd7f22bafdeb82d8f465f285de34992024607dce95ec921d950d8a04c3585e673eea87d6e3b9e364726b7b58f96b8388512325f97
}

