
import commonRoute from './base'
import adminRoutes from './admin'
import customerRoutes from './customer'
import doctorRoutes from './doctor'

export default commonRoute
.concat(adminRoutes)
.concat(customerRoutes)
.concat(doctorRoutes)
