import { Role } from '.prisma/client'
import { RouteContainer } from '../common/classes/router.class'
import ApplicationService from '../services/application.service'
import DashbroadService from '../services/dashbroad.service'
import JobPositionService from '../services/jobPosition.service'
import ProvinceService from '../services/province.service'
import SpecializedService from '../services/specialized.service'
import UserService from '../services/user.service'
import WorkPlaceService from '../services/workPlace.service'
import { IdInPath } from './params/.general/query.params'
import { GetApplication } from './params/application/get.params'
import { UpdateApplication } from './params/application/update.params'
import { CreateJobPosition } from './params/jobPosition/create.params'
import { DeleteListJobPosition } from './params/jobPosition/deleteList.params'
import { CreateProvince } from './params/province/create.params'
import { CreateSpecialized } from './params/specialized/create.params'
import { DeleteSpecialized } from './params/specialized/delete.params'
import { DeleteListSpecialized } from './params/specialized/deleteList.params'
import { UpdateSpecialized } from './params/specialized/update.params'
import { DeleteCustomer } from './params/user/delete-customer.params'
import { GetUsers } from './params/user/get-users.params'
import { SuspendUser } from './params/user/suspend.params'
import { CheckSessionToken } from './params/user/verify.session.token.params'
import { AdminCreateWorkPlace } from './params/work-place/admin-create.params'
import { AdminUpdateWorkplaceStatus } from './params/work-place/admin-update-status.params'
import { AdminUpdateWorkplaceInfomation } from './params/work-place/admin-update.params'
import { GetAppliedList } from './params/work-place/get-applied-list.params'
import { GetWorkPlace } from './params/work-place/get-list.params'
import { UpdateApply } from './params/work-place/update-apply.params'

const container = new RouteContainer('/admin', [Role.ADMIN])

container
  .route('/users')
  .get('/', UserService.getUsers, GetUsers)
  .get('/guardian', UserService.getGuardians)
  .post('/check-token', UserService.checkToken, CheckSessionToken)
  .put('/suspend/:id', UserService.suspend, SuspendUser)
  .put('/guardian/delete/:id', UserService.deleteCustomer, DeleteCustomer)

container
  .route('/specialized')
  .get('/', SpecializedService.adminGet)
  .post('/', SpecializedService.create, CreateSpecialized)
  .put('/:id', SpecializedService.update, UpdateSpecialized)
  .delete('/:id', SpecializedService.delete, DeleteSpecialized)
  .delete('', SpecializedService.deleteList, DeleteListSpecialized)

container
  .route('application')
  .get('/', ApplicationService.get, GetApplication)
  .put('/process/:id', ApplicationService.process, UpdateApplication)

container
  .route('/province')
  .get('/', ProvinceService.adminGet)
  .post('/', ProvinceService.create, CreateProvince)
  .put('/:id', ProvinceService.update, { ...IdInPath, ...CreateProvince })
  .delete('/:id', ProvinceService.delete, IdInPath)

container
  .route('/job-position')
  .get('/', JobPositionService.adminGet)
  .post('/', JobPositionService.create, CreateJobPosition)
  .put('/:id', JobPositionService.update, { ...IdInPath, ...CreateJobPosition })
  .delete('/:id', JobPositionService.delete, IdInPath)
  .delete('', JobPositionService.deleteList, DeleteListJobPosition)


container
  .route('/work-place')
  .get('/', WorkPlaceService.getList, GetWorkPlace)
  .post('/', WorkPlaceService.adminCreate, AdminCreateWorkPlace)
  .put('/info', WorkPlaceService.adminUpdateInfomation, AdminUpdateWorkplaceInfomation)
  .put('/status', WorkPlaceService.adminUpdateStatus, AdminUpdateWorkplaceStatus)
  .get('/manage-list', WorkPlaceService.getManage, GetWorkPlace)
  .get('/application/applied', WorkPlaceService.getAppliedList, GetAppliedList)
  .put('/application', WorkPlaceService.updateApply, UpdateApply)

container
  .route('/dashbroad')
  .get('/', DashbroadService.get)
export default container.return()
