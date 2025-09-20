import { permissionAppointment } from './data/permission-appointment.data'
import { permissionCustomer } from './data/permission-customer.data'
import { permissionDistributor } from './data/permission-distributor.data'
import { permissionFile } from './data/permission-file.data'
import { permissionMasterData } from './data/permission-master-data.data'
import { permissionOrganization } from './data/permission-organization.data'
import { permissionPayment } from './data/permission-payment.data'
import { permissionProduct } from './data/permission-product.data'
import { permissionPurchaseOrder } from './data/permission-purchase-order.data'
import { permissionStatistic } from './data/permission-statistic.data'
import { permissionStockCheck } from './data/permission-stock-check.data'
import { permissionTicket } from './data/permission-ticket.data'
import { permissionUser } from './data/permission-user.data'

export const permissionDataAll = [
  ...permissionOrganization,
  ...permissionUser,

  ...permissionStatistic,
  ...permissionMasterData,

  ...permissionPurchaseOrder,
  ...permissionCustomer,
  ...permissionDistributor,

  ...permissionProduct,

  ...permissionStockCheck,
  ...permissionPayment,

  ...permissionFile,

  ...permissionAppointment,
  ...permissionTicket,
]
