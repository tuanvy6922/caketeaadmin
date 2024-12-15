import React from 'react';
import { FiEye } from 'react-icons/fi';

const BillTable = ({ 
  bills, 
  handleStatusChange, 
  handleDeliveryStatusChange,
  onViewBill, 
  formatDate, 
  indexOfFirstBill,
  currentStaff 
}) => {
  return (
    <div style={styles.tableContainer}>
      <table style={styles.table}>
        <thead>
          <tr>
            <th style={{...styles.th, width: '4%', textAlign: 'center'}}>STT</th>
            <th style={{...styles.th, width: '12%', textAlign: 'center'}}>Khách hàng</th>
            <th style={{...styles.th, width: '10%', textAlign: 'center'}}>Ngày đặt</th>
            <th style={{...styles.th, width: '10%', textAlign: 'center'}}>Thanh toán</th>
            <th style={{...styles.th, width: '12%', textAlign: 'center'}}>Quá trình</th>
            <th style={{...styles.th, width: '12%', textAlign: 'center'}}>Trạng thái</th>
            <th style={{...styles.th, width: '12%', textAlign: 'center'}}>Nhân viên duyệt</th>
            <th style={{...styles.th, width: '12%', textAlign: 'center'}}>Thời gian duyệt</th>
            <th style={{...styles.th, width: '10%', textAlign: 'right'}}>Tổng tiền</th>
            <th style={{...styles.th, width: '6%', textAlign: 'center'}}>Thao tác</th>
          </tr>
        </thead>
        <tbody>
          {bills.map((bill, index) => (
            <tr key={bill.id}>
              <td style={{...styles.td, textAlign: 'center'}}>{indexOfFirstBill + index + 1}</td>
              <td style={{...styles.td, textAlign: 'center'}}>{bill.fullName}</td>
              <td style={{...styles.td, textAlign: 'center'}}>{formatDate(bill.date)}</td>
              <td style={{...styles.td, textAlign: 'center'}}>
                {bill.paymentMethod === 'Cash' ? 'Tiền mặt' : bill.paymentMethod}
              </td>
              <td style={{...styles.td, textAlign: 'center'}}>
                <select 
                  value={bill.deliveryStatus || 'pending'} 
                  onChange={(e) => handleDeliveryStatusChange(bill.id, e.target.value)}
                  style={{
                    ...styles.statusSelect,
                    backgroundColor: bill.status === 'cancelled' ? '#f8f9fa' : '#fff',
                    cursor: bill.status === 'cancelled' ? 'not-allowed' : 'pointer',
                  }}
                  disabled={bill.status === 'cancelled'}
                >
                  <option value="pending">Chờ xử lý</option>
                  <option value="delivered">Đã giao hàng</option>
                </select>
              </td>
              <td style={{...styles.td, textAlign: 'center'}}>
                <select 
                  value={bill.status} 
                  onChange={(e) => handleStatusChange(bill.id, e.target.value)} 
                  style={{
                    ...styles.statusSelect,
                    backgroundColor: bill.status === 'completed' || bill.status === 'cancelled' ? '#f8f9fa' : '#fff',
                    cursor: bill.status === 'completed' || bill.status === 'cancelled' ? 'not-allowed' : 'pointer',
                  }}
                  disabled={bill.status === 'completed' || bill.status === 'cancelled'}
                >
                  <option value="confirmed">Đã xác nhận</option>
                  <option value="completed">Hoàn thành</option>
                  <option value="waiting">Chờ duyệt</option>
                  <option value="cancelled">Đã hủy</option>
                </select>
              </td>
              <td style={{...styles.td, textAlign: 'center'}}>{bill.updatedBy || '-'}</td>
              <td style={{...styles.td, textAlign: 'center'}}>{bill.updatedAt ? formatDate(bill.updatedAt) : '-'}</td>
              <td style={{...styles.td, textAlign: 'right'}}>{bill.totalAmount.toLocaleString('vi-VN')}đ</td>
              <td style={{...styles.td, textAlign: 'center'}}>
                <button onClick={() => onViewBill(bill)} style={styles.viewButton}>
                  <FiEye style={styles.buttonIcon} /> Xem
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

const styles = {
  tableContainer: {
    width: '100%',
    overflowX: 'auto',
    backgroundColor: '#fff',
    borderRadius: '8px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    marginBottom: '20px',
    '&::-webkit-scrollbar': {
      width: '0px',
      height: '0px',
      background: 'transparent',
    },
    scrollbarWidth: 'none',
    '-ms-overflow-style': 'none',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    minWidth: '1400px',
  },
  th: {
    padding: '12px 16px',
    backgroundColor: '#f8f9fa',
    borderBottom: '2px solid #dee2e6',
    fontSize: '14px',
    fontWeight: 'bold',
    color: '#495057',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  td: {
    padding: '12px 16px',
    borderBottom: '1px solid #dee2e6',
    fontSize: '14px',
    color: '#212529',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  statusSelect: {
    padding: '6px 10px',
    borderRadius: '4px',
    border: '1px solid #ced4da',
    fontSize: '14px',
    width: '100%',
    margin: '0 auto',
  },
  viewButton: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '5px',
    padding: '6px 12px',
    backgroundColor: '#007bff',
    color: '#fff',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '14px',
    minWidth: '80px',
    transition: 'background-color 0.2s',
    '&:hover': {
      backgroundColor: '#0056b3',
    },
  },
  buttonIcon: {
    fontSize: '16px',
  },
};

export default BillTable; 