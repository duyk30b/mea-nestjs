|              |     | Schedule (1) | Draft (2)            | Approved (3)         | Executing (4)    | Debt (5)   | Complete (6) | Cancel (7) |
| ------------ | --- | ------------ | -------------------- | -------------------- | ---------------- | ---------- | ------------ | ---------- |
| Payment      | 1   | Unpaid       | Unpaid               | Unpaid               | Unpaid           |            |              |            |
|              | 2   |              |                      | Prepaid              | Prepaid          |            |              |            |
|              | 3   |              |                      |                      |                  | Debt       |              |            |
|              | 4   |              |                      |                      |                  |            | Complete     |            |
|              | 5   |              |                      |                      |                  |            |              | Refunded   |
| -----------  | --- | ------------ | --------------       | --------------       | ---------------- | ---------- | ------------ | ---------- |
| Delivery     | 1   | NoStock      | NoStock              | NoStock              | NoStock          | NoStock    | NoStock      | NoStock    |
|              | 2   |              | Pending              | Pending              | Pending          |            |              |            |
|              | 3   |              |                      |                      | Delivered        | Delivered  | Delivered    |            |
|              | 4   |              |                      |                      | Returned         | Returned   | Returned     | Returned   |
| -----------  | --- | ------------ | --------------       | --------------       | ---------------- | ---------- | ------------ | ---------- |
| TicketOrder  | --- |              | Nháp                 | Đã tạm ứng           | Đang thực hiện   | Nợ         | Hoàn thành   | Hủy        |
|              | --- |              | `Edit`               | `Edit`               |                  |            |              |            |
|              | --- |              | `Tạm ứng`            | `Tạm ứng`            | `Tạm ứng`        |            |              |            |
|              | --- |              | `GH & TT & Complete` | `GH & TT & Complete` |                  |            |              |            |
|              | --- |              | `GH & TT & Debt`     | `GH & TT & Debt`     |                  |            |              |            |
|              | --- |              |                      | `GH & Complete`      |                  |            |              |            |
|              | --- |              |                      | `GH ` -> Executing   |                  |            |              |            |
|              | --- |              |                      |                      |                  |            |              |            |
|              | --- |              | `TT & Complete`      | `TT & Complete`      | `TT & Complete`  |            |              |            |
|              | --- |              | `TT & Debt`          | `TT & Debt`          | `TT & Debt`      |            |              |            |
|              | --- |              |                      | `Complete`           |                  |            |              |            |
|              | --- |              |                      | `Hoàn tiền`          | `Hoàn tiền`      |            |              |            |
|              | --- |              |                      | `Hoàn tiền & OK`     | `Hoàn tiền & OK` |            |              |            |
|              | --- |              |                      |                      |                  | `Trả nợ`   |              |            |
|              | --- |              |                      |                      |                  | `Trả hàng` | `Trả hàng`   |            |
|              | --- |              | `Delete`             | `Cancel`             | `Cancel`         | `Cancel`   | `Cancel`     |            |
| -----------  | --- | ------------ | --------------       | --------------       | ---------------- | ---------- | ------------ | ---------- |
| TicketClinic | --- | Hẹn khám     | Đợi khám             | Đợi khám (TƯ)        | Đang khám        | Nợ         | Hoàn thành   |            |
| -----------  | --- | ------------ | --------------       | --------------       | ---------------- | ---------- | ------------ | ---------- |

- Close: DeliveryStatus: NoStock, Delivered
