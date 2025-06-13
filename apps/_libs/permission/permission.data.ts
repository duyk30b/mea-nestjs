import { permissionAppointment } from './data/permission-appointment.data'
import { permissionCustomer } from './data/permission-customer.data'
import { permissionDistributor } from './data/permission-distributor.data'
import { permissionFile } from './data/permission-file.data'
import { permissionLaboratory } from './data/permission-laboratory.data'
import { permissionMasterData } from './data/permission-master-data.data'
import { permissionOrganization } from './data/permission-organization.data'
import { permissionPayment } from './data/permission-payment.data'
import { permissionPosition } from './data/permission-position.data'
import { permissionProcedure } from './data/permission-procedure.data'
import { permissionProduct } from './data/permission-product.data'
import { permissionRadiology } from './data/permission-radiology.data'
import { permissionReceipt } from './data/permission-receipt.data'
import { permissionReception } from './data/permission-reception.data'
import { permissionStatistic } from './data/permission-statistic.data'
import { permissionStockCheck } from './data/permission-stock-check.data'
import { permissionTicketClinic } from './data/permission-ticket-clinic.data'
import { permissionTicketOrder } from './data/permission-ticket-order.data'
import { permissionUser } from './data/permission-user.data'

export const permissionDataAll = [
  ...permissionOrganization,
  ...permissionUser,
  ...permissionPosition,

  ...permissionStatistic,
  ...permissionMasterData,

  ...permissionProduct,
  ...permissionDistributor,
  ...permissionCustomer,
  ...permissionReceipt,

  ...permissionAppointment,
  ...permissionStockCheck,
  ...permissionPayment,

  ...permissionProcedure,
  ...permissionLaboratory,
  ...permissionRadiology,

  ...permissionFile,

  ...permissionReception,
  ...permissionTicketOrder,
  ...permissionTicketClinic,
]
