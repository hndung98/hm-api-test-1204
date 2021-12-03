import { Role } from '.prisma/client'
import { RouteContainer } from '../common/classes/router.class'
import CustomerService from '../services/customer.service'
import DoctorService from '../services/doctor.service'
import { GetListDoctor } from './params/doctor/get-list.params'
import { IdInPath } from './params/.general/query.params'
import AppointmentService from '../services/appointment.service'
import { CreateAppointment } from './params/appointment/create.params'
import { GetCustomerAppointment } from './params/appointment/get-customer-appointment.params'
import MedicalRecordService from '../services/medicalRecord.service'
import { GetMedicalRecordList } from './params/medicalRecord/get-list.params'
import { UpdateMedicalRecord } from './params/medicalRecord/update.params'
import UserService from '../services/user.service'
import { CheckSessionToken } from './params/user/verify.session.token.params'
import { UpdateProfileCustomer } from './params/customer/update-profile.params'
import { CreateGuardian } from './params/customer/add-guardian.params'
import GuardianService from '../services/guardian.service'
import QuestionService from '../services/question.service'
import { CreateQuestion } from './params/question/create.params'
import { UpdateQuestion } from './params/question/update.params'
import AnswerService from '../services/answer.service'
import { GetAnswer } from './params/answer/get.params'
import { GetQuestion } from './params/question/get-list.params'
import { SkipTakePagination } from './params/.general/find.params'
import OperationService from '../services/operation.service'
import { GetDoctorAppointment } from './params/doctor/get-doctor-appointment.params'
import { DeleteGuardian } from './params/customer/delete-guardian.params'
import { DeleteGuardianVerify } from './params/customer/delete-guardian-verify.params'
import { ChangePassword } from './params/user/update-password.params'
import { AddPhoneNumber } from './params/user/add-phone-number.params'
import { AddData } from './params/user/add-data.params'
import { AddEmail } from './params/user/add-email.params'
import { UpdateEmergency } from './params/customer/emergency.params'
import { CreateUserGuardianVerify } from './params/customer/create-user-guardian-verify.params'
import { CreateUserGuardian } from './params/customer/create-user-guardian.params'
import { CreatePaymentUrl } from './params/payment/create-payment-url.params'
const container = new RouteContainer('/customer', [Role.CUSTOMER])

container
  .route('/users')
  .get('/profile', CustomerService.getProfile)
  .put('/profile', CustomerService.updateProfile, UpdateProfileCustomer)
  .put('/password', UserService.updatePassword, ChangePassword)
  .post('/check-token', UserService.checkToken, CheckSessionToken)
  .put('/phoneNumber', UserService.addPhoneNumber, AddPhoneNumber)
  .put('/email', UserService.addEmail, AddEmail)
  .put('/add', UserService.addData, AddData)
  .get('/emergency-sms', CustomerService.getEmergencySms)
  .put('/emergency-sms', CustomerService.setEmergencySms, UpdateEmergency)
  .put('/send-emergency-sms', CustomerService.sendEmergencySms)

container
  .route('/guardian')
  .get('/', GuardianService.getList)
  .post('/', GuardianService.create, CreateGuardian)
  .put('/:id', GuardianService.update, { ...CreateGuardian, ...IdInPath })
  .put('/delete/:id', GuardianService.delete, DeleteGuardian)
  .post('/delete/verify', GuardianService.verifyDelete, DeleteGuardianVerify)
  .post('/user/verify', GuardianService.createUserVerify, CreateUserGuardianVerify)
  .post('/user', GuardianService.createUser, CreateUserGuardian)

container
  .route('/doctor')
  .get('/list', DoctorService.getList, GetListDoctor)
  .get('/:id', DoctorService.getProfile, IdInPath)
  .get('/operation', OperationService.getDoctorAppointment, GetDoctorAppointment)

container
  .route('/appointment')
  .get('', AppointmentService.getByCustomer, GetCustomerAppointment)
  .get('/:id', AppointmentService.customerGetById, IdInPath)
  .post('', AppointmentService.create, CreateAppointment)
  .delete('/:id', AppointmentService.customerCancel, IdInPath)
  .post('/create_payment_url', AppointmentService.recreatePaymentUrl, CreatePaymentUrl)

container
  .route('/medical-record')
  .get('', MedicalRecordService.getList, GetMedicalRecordList)
  .get('/:id', MedicalRecordService.getById, IdInPath)
  .put('/:id', MedicalRecordService.update, UpdateMedicalRecord)

container
  .route('question')
  .get('/', QuestionService.getList, GetQuestion)
  .get('/my', QuestionService.getMyQuestion)
  .post('', QuestionService.addQuestion, CreateQuestion)
  .put('/:id', QuestionService.updateQuestion, { ...IdInPath, ...UpdateQuestion })
  .delete('/:id', QuestionService.deleteQuestion, IdInPath)
  .put('/:id/like', QuestionService.likeQuestion, IdInPath)
  .put('/:id/unlike', QuestionService.unlikeQuestion, IdInPath)
  .get('/saved', QuestionService.getSavedQuestion, SkipTakePagination)
  .put('/:id/save', QuestionService.saveQuestion, IdInPath)
  .delete('/:id/unsave', QuestionService.unsaveQuestion, IdInPath)

container
  .route('answer')
  .get('/:id', AnswerService.getAnswer, { ...IdInPath, ...GetAnswer })
  .put('/:id/like', AnswerService.likeAnswer, IdInPath)
  .put('/:id/unlike', AnswerService.unlikeAnswer, IdInPath)

export default container.return()
