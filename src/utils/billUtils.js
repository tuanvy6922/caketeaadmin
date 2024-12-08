import * as XLSX from 'xlsx';

// Format date từ timestamp thành chuỗi ngày tháng
export const formatDate = (timestamp) => {
  if (!timestamp) return '';
  const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
  return date.toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

// Tính toán doanh thu từ danh sách hóa đơn
export const calculateRevenue = (billsList) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const lastWeek = new Date(today);
  lastWeek.setDate(lastWeek.getDate() - 7);
  
  const lastMonth = new Date(today);
  lastMonth.setMonth(lastMonth.getMonth() - 1);

  const revenue = {
    today: 0,
    week: 0,
    month: 0,
    total: 0
  };

  billsList.forEach(bill => {
    // Chỉ tính các đơn hàng đã hoàn thành
    if (bill.status === 'completed') {
      const billDate = bill.date?.toDate() || new Date(bill.date);
      // Đảm bảo totalAmount là số
      const billTotal = typeof bill.totalAmount === 'number' 
        ? bill.totalAmount 
        : Number(bill.totalAmount.replace(/[đ,]/g, ''));

      // Tổng doanh thu
      revenue.total += billTotal;

      // Reset thời gian về đầu ngày để so sánh chính xác
      const billDateTime = new Date(billDate);
      billDateTime.setHours(0, 0, 0, 0);

      // Doanh thu hôm nay
      if (billDateTime.getTime() === today.getTime()) {
        revenue.today += billTotal;
      }

      // Doanh thu 7 ngày
      if (billDateTime >= lastWeek) {
        revenue.week += billTotal;
      }

      // Doanh thu 30 ngày
      if (billDateTime >= lastMonth) {
        revenue.month += billTotal;
      }
    }
  });

  return revenue;
};

// Xuất dữ liệu ra file Excel
export const exportToExcel = (filteredBills, totalRevenue) => {
  const workbook = XLSX.utils.book_new();

  // Tạo tên file với ngày giờ hiện tại
  const now = new Date();
  const dateStr = now.toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  }).split('/').join('-');
  
  const timeStr = now.toLocaleTimeString('vi-VN', {
    hour: '2-digit',
    minute: '2-digit'
  }).split(':').join('-');

  const fileName = `thong-ke-hoa-don-${dateStr}_${timeStr}.xlsx`;

  // Sheet 1: Danh sách hóa đơn
  const billListData = filteredBills.map((bill, index) => ({
    'STT': index + 1,
    'Mã đơn hàng': bill.id,
    'Khách hàng': bill.fullName,
    'Email': bill.user,
    'Địa chỉ': bill.address,
    'Ngày đặt': formatDate(bill.date),
    'Phương thức': bill.paymentMethod,
    'Trạng thái': bill.status,
    'Mã giảm giá': bill.voucherCode || 'Không có',
    'Giảm giá': bill.voucherDiscount || 0,
    'Tổng tiền': bill.totalAmount
  }));

  const billListSheet = XLSX.utils.json_to_sheet(billListData);
  XLSX.utils.book_append_sheet(workbook, billListSheet, 'Danh sách hóa đơn');

  // Sheet 2: Chi tiết sản phẩm
  const orderDetailsData = [];
  filteredBills.forEach(bill => {
    // Thông tin đơn hàng
    orderDetailsData.push({
      'Mã đơn hàng': bill.id,
      'Khách hàng': bill.fullName,
      'Email': bill.user,
      'Ngày đặt': formatDate(bill.date)
    });

    let subTotal = 0; // Biến tạm để tính tổng cho mỗi đơn hàng

    // Chi tiết từng sản phẩm
    bill.items.forEach((item, idx) => {
      const itemTotal = item.price * item.quantity;
      subTotal += itemTotal;
      
      orderDetailsData.push({
        'STT': idx + 1,
        'Tên sản phẩm': item.name,
        'Size': item.size,
        'Đơn giá': item.price,
        'Số lượng': item.quantity,
        'Thành tiền': itemTotal
      });
    });

    // Tổng cộng cho mỗi đơn hàng
    orderDetailsData.push({
      'Tên sản phẩm': 'Tổng cộng',
      'Thành tiền': subTotal
    });

    // Thêm dòng trống giữa các đơn hàng
    orderDetailsData.push({});
  });

  const orderDetailsSheet = XLSX.utils.json_to_sheet(orderDetailsData);
  XLSX.utils.book_append_sheet(workbook, orderDetailsSheet, 'Chi tiết sản phẩm');

  // Sheet 3: Thống kê doanh thu
  const revenueData = [
    ['Doanh thu'],
    ['Hôm nay:', `${totalRevenue.today}đ`],
    ['7 ngày qua:', `${totalRevenue.week}đ`],
    ['30 ngày qua:', `${totalRevenue.month}đ`],
    ['Tổng doanh thu:', `${totalRevenue.total}đ`]
  ];

  const revenueSheet = XLSX.utils.aoa_to_sheet(revenueData);
  XLSX.utils.book_append_sheet(workbook, revenueSheet, 'Thống kê doanh thu');

  // Xuất file với tên mới
  XLSX.writeFile(workbook, fileName);
}; 