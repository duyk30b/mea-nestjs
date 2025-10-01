# Liệu trình với thanh toán theo tổng

1. Tạo mới
- totalMoneyAdd = 0
- procedureMoneyAdd = 0
- ticketRegimenItem: (quantityExpected: 0, quantityFinish: 0), quantityPayment = 0
- ticketProcedureInRegimen: status = Pending, paymentMoneyStatus = NoEffect
- Khi nhấn thanh toán không hiện gợi ý số tiền (đang hướng có thể xử lý bằng cách ticket: moneyExpected)

2. Xóa
- ticket: totalMoney không thay đổi

# Liệu trình với thanh toán lẻ
1. Tạo mới
- totalMoneyAdd = 0
- procedureMoneyAdd = 0
- ticketRegimenItem: (quantityExpected: 0, quantityFinish: 0), quantityPayment = 0
- ticketProcedureInRegimen: status = Pending, paymentMoneyStatus = NoEffect

2. Xóa
- ticket: totalMoney không thay đổi


# Khi thanh toán

# Chốt 1 vài logic
- Lưu thanh toán ở regimenItem: quantityPayment chỉ sử dụng cho trường hợp thanh toán lẻ, 
  ==> trường hợp ticketPaid luôn = 0
- ticketProcedure: paymentMoneyStatus luôn là NoEffect
- Xóa: - được quyền xóa tất cả TicketProcedure 
       - nếu muốn xóa hết thì phải hoàn trả thanh toán (chỉ trong trường hợp thanh toán lẻ)
- Thực hiện: - chỉ thực hiện thay đổi status
- PaymentMoneyStatus của TicketProduct chỉ được gen ở front-end, đếm theo số thứ tự

- Logic của paymentMoney
  + paymentMoney thể hiện liệu trình này đã sử dụng hết bao nhiêu tiền
  + Luôn đếm theo TicketProcedureStatus !== NoEffect
  + cộng thêm khi thực hiện: từ Temp sang (Complete hoặc Pending)
  + Hủy thực hiện không làm giảm (từ Complete về Pending)
  + trừ đi khi xóa (Pending)

- Logic của TicketRegiment
  + RemainingMoney chỉ sử dụng khi dùng thanh toán lẻ (cộng tiền trực tiếp vào đây khi thanh toán)
  + Muốn thanh toán thêm tiền thì ở bảng thanh toán 
   => có thể hiển thị thêm số tiền còn thiếu của TicketRegimen (bằng lấy actualMoney - spentMoney)

# Migration:
- Do trước đã tính toán cộng tiền hết rồi
==> TicketProcedure InRegiment chuyển hết status sang Pending (trừ thằng đã thực hiện) (hình như không phải làm)
- TicketRegimentItem cho hết quantityPayment = quantityExpect (vì đã cộng hết tiền vào totalMoney)

************ Đã sử dụng bao nhiêu tiền ở TicketRegimen (phải tính lại) ********

- Có 1 conflict hiện tại đó là: các liệu trình đã sử dụng full tiền ( chưa có cách giải quyết )