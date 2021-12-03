import { RouteContainer } from '../common/classes/router.class'
import AnswerService from '../services/answer.service'
import ApplicationService from '../services/application.service'
import Automate from '../services/automate.service'
import CustomerService from '../services/customer.service'
import DoctorService from '../services/doctor.service'
import JobPositionService from '../services/jobPosition.service'
import PaymentService from '../services/payment.service'
import ProvinceService from '../services/province.service'
import QuestionService from '../services/question.service'
import SpecializedService from '../services/specialized.service'
import UserService from '../services/user.service'
import { IdInPath } from './params/.general/query.params'
import { GetAnswer } from './params/answer/get.params'
import { AutoDeployWebHook } from './params/automate/deploy-webhook.params'
import { RegisterCustomer } from './params/customer/register-customer.params'
import { CommonGetListDoctor } from './params/doctor/common-get-list.params'
import { RegisterDoctor } from './params/doctor/register-doctor.params'
import { UploadImages } from './params/file/upload-images.params'
import { ConfirmPayment } from './params/payment/confirm-payment.params'
import { GetDistricts } from './params/province/get-districts.params'
import { GetWards } from './params/province/get-wards.params'
import { GetQuestionAnswered } from './params/question/get-list-answered.params'
import { ForgotPasswordEmail } from './params/user/forgot-password-email.params'
import { ForgotPasswordSms } from './params/user/forgot-password-sms.params'
import { ForgotPassword } from './params/user/forgot-password.params'
import { LoginSms } from './params/user/login-sms.params'
import { Login } from './params/user/login.params'
import { SendRegisterMail } from './params/user/send-register-mail.params'
import { SendRegisterSms } from './params/user/send-register-sms.params copy'

const container = new RouteContainer()

container
  .route('/deploy')
  .get('/', Automate.index, AutoDeployWebHook)
  .put('/init', Automate.initStaging)
  .post('/pgsql-earthdistance', Automate.initPgSqlEarthDistance)
  .post('/register-customer', CustomerService.create, RegisterCustomer)

container
  .route('/asset')
  .post('/images', UserService.uploatImages, UploadImages)

container
  .route('/user')
  .post('/customer', CustomerService.create, RegisterCustomer)
  .post('/send-register-sms', UserService.sendRegisterSms, SendRegisterSms)
  .post('/send-register-mail', UserService.sendRegisterMail, SendRegisterMail)
  .post('/doctor', ApplicationService.create, RegisterDoctor)
  .post('/login', UserService.login, Login)
  .post('/send-login-sms', UserService.sendLoginSms, SendRegisterSms)
  .post('/login-by-sms', UserService.loginSms, LoginSms)
  .post('/forgot-password/sms', UserService.sendForgotPasswordSms, ForgotPasswordSms)
  .post('/forgot-password/mail', UserService.sendForgotPasswordMail, ForgotPasswordEmail)
  .put('/forgot-password', UserService.forgotPassword, ForgotPassword)

container
  .route('/province')
  .get('/', ProvinceService.getProvinces)
  .get('/district/:provinceId', ProvinceService.getDistricts, GetDistricts)
  .get('/ward/:districtId', ProvinceService.getWards, GetWards)

container.route('/doctor')
  .get('/list', DoctorService.getListCommon, CommonGetListDoctor)

container
  .route('/question')
  .get('/', QuestionService.getListPublic, GetQuestionAnswered)
  .get('/:id', QuestionService.getByIdPublic, IdInPath)
  .get('/answer/:id', AnswerService.getAnswer, { ...IdInPath, ...GetAnswer })


container
  .route('/specialized')
  .get('/', SpecializedService.get)

container
  .route('/job-position')
  .get('/', JobPositionService.getList)

container
  .route('payment')
  // .post('/create_payment_url', PaymentService.createPaymentUrl, CreatePaymentUrl)
  .get('/confirm_payment', PaymentService.confirmPayment, ConfirmPayment)

export default container.return()
