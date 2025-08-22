import { permissionAppointment } from './data/permission-appointment.data'
import { permissionCustomer } from './data/permission-customer.data'
import { permissionDistributor } from './data/permission-distributor.data'
import { permissionFile } from './data/permission-file.data'
import { permissionLaboratory } from './data/permission-laboratory.data'
import { permissionMasterData } from './data/permission-master-data.data'
import { permissionOrganization } from './data/permission-organization.data'
import { permissionPayment } from './data/permission-payment.data'
import { permissionProcedure } from './data/permission-procedure.data'
import { permissionProduct } from './data/permission-product.data'
import { permissionPurchaseOrder } from './data/permission-purchase-order.data'
import { permissionRadiology } from './data/permission-radiology.data'
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
  ...permissionProcedure,
  ...permissionLaboratory,
  ...permissionRadiology,

  ...permissionStockCheck,
  ...permissionPayment,

  ...permissionFile,

  ...permissionAppointment,
  ...permissionTicket,
]
