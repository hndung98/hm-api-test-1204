import { Role } from '.prisma/client'
import { RouteContainer } from '../common/classes/router.class'
import AnswerService from '../services/answer.service'
import AppointmentService from '../services/appointment.service'
import DoctorService from '../services/doctor.service'
import MedicalRecordService from '../services/medicalRecord.service'
import OperationService from '../services/operation.service'
import QuestionService from '../services/question.service'
import UserService from '../services/user.service'
import WorkPlaceService from '../services/workPlace.service'
import { IdInPath } from './params/.general/query.params'
import { CreateAnswer } from './params/answer/create.params'
import { GetAnswer } from './params/answer/get.params'
import { DoctorUpdateAppointment } from './params/appointment/doctor-update.params'
import { GetListAppointment } from './params/appointment/get-list.params'
import { UpdateDoctorProfile } from './params/doctor/update.params'
import { DoctorGetMedicalRecordList } from './params/medicalRecord/doctor-get-list.params'
import { DoctorUpdateMedicalRecord } from './params/medicalRecord/doctor-update-data.params'
import { GetOperation } from './params/operation/get.params'
import { UpdateMedicalExpense } from './params/operation/medical-expense.params'
import { UpdateOperationHour } from './params/operation/update-operation-hour.params'
import { UpdatePatientPerHour } from './params/operation/update-patient-per-hour.params'
import { GetQuestionAnswered } from './params/question/get-list-answered.params'
import { GetQuestion } from './params/question/get-list.params'
import { AddData } from './params/user/add-data.params'
import { AddEmail } from './params/user/add-email.params'
import { AddPhoneNumber } from './params/user/add-phone-number.params'
import { ChangePassword } from './params/user/update-password.params'
import { CheckSessionToken } from './params/user/verify.session.token.params'
import { AddRateWorkPlace } from './params/work-place/add-rate.params'
import { AddContactPhoneNumberVerify } from './params/work-place/contact-phone-number-verify.params'
import { AddContactPhoneNumber } from './params/work-place/contact-phone-number.params'
import { DoctorApplication } from './params/work-place/doctor-application.params'
import { DoctorCreateWorkPlace } from './params/work-place/doctor-create.params'
import { GetAppliedList } from './params/work-place/get-applied-list.params'
import { GetWorkPlace } from './params/work-place/get-list.params'
import { GetRateWorkPlace } from './params/work-place/get-rate.params'
import { UpdateApply } from './params/work-place/update-apply.params'
import { UpdateWorkplace } from './params/work-place/update.params'
const container = new RouteContainer('/doctor', [Role.DOCTOR])

container
  .route('/users')
  .get('/profile', DoctorService.getSelf)
  .put('/profile', DoctorService.updateProfile, UpdateDoctorProfile)
  .put('/password', UserService.updatePassword, ChangePassword)
  .post('/check-token', UserService.checkToken, CheckSessionToken)
  .put('/phoneNumber', UserService.addPhoneNumber, AddPhoneNumber)
  .put('/email', UserService.addEmail, AddEmail)
  .put('/add', UserService.addData, AddData)

container
  .route('/operation')
  .get('/:id', OperationService.get, GetOperation)
  .get('/', OperationService.getList)
  .put('/', OperationService.update, UpdateOperationHour)
  .put('/patient-per-half-hour', OperationService.setPatientPerHour, UpdatePatientPerHour)
  .put('/medical-expense', OperationService.setMedicalExpense, UpdateMedicalExpense)

container
  .route('/work-place')
  .get('/', WorkPlaceService.getList, GetWorkPlace)
  .get('/my', WorkPlaceService.getMy)
  .get('/manage', WorkPlaceService.getManage, GetWorkPlace)
  .get('/applied', WorkPlaceService.getAppliedList, GetAppliedList)
  .post('/', WorkPlaceService.doctorCreate, DoctorCreateWorkPlace)
  .put('/', WorkPlaceService.update, UpdateWorkplace)
  .put('/application', WorkPlaceService.updateApply, UpdateApply)
  .post('/application/:workPlaceId', WorkPlaceService.doctorApply, DoctorApplication)
  .post('/rate', WorkPlaceService.addRate, AddRateWorkPlace)
  .get('/rate', WorkPlaceService.getRate, GetRateWorkPlace)
  .get('/contact-phone-number/verify', WorkPlaceService.addContactPhoneNumberVerify, AddContactPhoneNumberVerify)
  .get('/contact-phone-number', WorkPlaceService.addContactPhoneNumber, AddContactPhoneNumber)

container
  .route('/appointment')
  .get('/', AppointmentService.getList, GetListAppointment)
  .get('/:id', AppointmentService.get, IdInPath)
  .put('/:id', AppointmentService.doctorUpdate, DoctorUpdateAppointment)
  .delete('/:id', AppointmentService.doctorCancel, IdInPath)

container
  .route('/medical-record')
  .get('/', MedicalRecordService.doctorGetCustomerList, DoctorGetMedicalRecordList)
  .get('/:id', MedicalRecordService.doctorGetById, IdInPath)
  .put('/:id', MedicalRecordService.doctorUpdate, { ...IdInPath, ...DoctorUpdateMedicalRecord })

container
  .route('question')
  .get('/', QuestionService.getList, GetQuestion)
  .get('/answered', QuestionService.getList, GetQuestionAnswered)
  .put('/:id/like', QuestionService.likeQuestion, IdInPath)
  .put('/:id/unlike', QuestionService.unlikeQuestion, IdInPath)

container
  .route('/answer')
  .get('/:id', AnswerService.getAnswer, { ...IdInPath, ...GetAnswer })
  .post('/', AnswerService.postAnswer, CreateAnswer)
  .put('/:id/like', AnswerService.likeAnswer, IdInPath)
  .put('/:id/unlike', AnswerService.unlikeAnswer, IdInPath)


export default container.return()
