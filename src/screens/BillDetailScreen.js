import React, { useState, useEffect } from 'react';
import { db } from '../connect/firebaseConfig';
import { doc, onSnapshot } from 'firebase/firestore';
import Header from '../components/Header';
import { FiArrowLeft } from 'react-icons/fi';

const BillDetailScreen = ({ navigation, route }) => {
  const { bill: initialBill } = route.params || {};
  const [bill, setBill] = useState(initialBill);

  useEffect(() => {
    if (!initialBill?.id) return;

    // Lắng nghe thay đổi của đơn hàng
    const unsubscribe = onSnapshot(
      doc(db, 'Bills', initialBill.id),
      (doc) => {
        if (doc.exists()) {
          setBill({ id: doc.id, ...doc.data() });
        } else {
          setMessage({ text: 'Không tìm thấy đơn hàng!', type: 'error' });
          navigation.goBack();
        }
      },
      (error) => {
        console.error('Error listening to bill updates:', error);
        setMessage({ text: 'Lỗi khi theo dõi đơn hàng!', type: 'error' });
      }
    );

    return () => unsubscribe();
  }, [initialBill?.id]);

  const [message, setMessage] = useState({ text: '', type: '' });

  const getStatusLabel = (status) => {
    const statusMap = {
      'pending': 'Đang xử lý',
      'confirmed': 'Đã xác nhận',
      'delivering': 'Đang giao',
      'completed': 'Hoàn thành',
      'cancelled': 'Đã hủy'
    };
    return statusMap[status] || status;
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return 'Không có ngày';
    try {
      // Kiểm tra nếu là Timestamp từ Firebase
      if (timestamp.toDate) {
        return timestamp.toDate().toLocaleDateString('vi-VN');
      }
      // Nếu là Date object
      if (timestamp instanceof Date) {
        return timestamp.toLocaleDateString('vi-VN');
      }
      // Nếu là string hoặc number
      return new Date(timestamp).toLocaleDateString('vi-VN');
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'Không có ngày';
    }
  };

  if (!bill) {
    return <div>Không tìm thấy thông tin đơn hàng</div>;
  }

  return (
    <div style={styles.container}>
      <Header />
      <div style={styles.content}>
        <div style={styles.headerSection}>
          <button onClick={() => navigation.goBack()} style={styles.backButton}>
            <FiArrowLeft style={styles.buttonIcon} />
            Quay lại
          </button>
          <h1 style={styles.title}>Chi tiết đơn hàng #{bill.id}</h1>
        </div>

        <div style={styles.card}>
          <h2 style={styles.sectionTitle}>Thông tin khách hàng</h2>
          <div style={styles.customerInfo}>
            <div style={styles.infoRow}>
              <div style={styles.infoField}>
                <span style={styles.label}>Họ tên:</span>
                <span style={styles.valueClose}>{bill.fullName}</span>
              </div>
              <div style={styles.infoField}>
                <span style={styles.label}>Email:</span>
                <span style={styles.valueClose}>{bill.user}</span>
              </div>
            </div>
            <div style={styles.infoRow}>
              <div style={styles.infoField}>
                <span style={styles.label}>Địa chỉ:</span>
                <span style={styles.valueClose}>{bill.address}</span>
              </div>
              <div style={styles.infoField}>
                <span style={styles.label}>Ngày đặt:</span>
                <span style={styles.valueClose}>{formatDate(bill.date)}</span>
              </div>
            </div>
            <div style={styles.infoRow}>
              <div style={styles.paymentField}>
                <span style={styles.paymentLabel}>Phương thức thanh toán:</span>
                <span style={styles.valueClose}>{bill.paymentMethod}</span>
              </div>
              <div style={styles.infoField}>
                <span style={styles.label}>Trạng thái:</span>
                <span style={styles.valueClose}>{getStatusLabel(bill.status)}</span>
              </div>
            </div>
          </div>

          <h2 style={styles.sectionTitle}>Danh sách sản phẩm</h2>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={{...styles.th, width: '5%', textAlign: 'center'}}>STT</th>
                <th style={{...styles.th, width: '35%', textAlign: 'center'}}>Sản phẩm</th>
                <th style={{...styles.th, width: '10%', textAlign: 'center'}}>Size</th>
                <th style={{...styles.th, width: '15%', textAlign: 'center'}}>Giá</th>
                <th style={{...styles.th, width: '15%', textAlign: 'center'}}>Số lượng</th>
                <th style={{...styles.th, width: '20%', textAlign: 'center'}}>Thành tiền</th>
              </tr>
            </thead>
            <tbody>
              {bill.items.map((item, index) => (
                <tr key={index}>
                  <td style={{...styles.td, textAlign: 'center'}}>{index + 1}</td>
                  <td style={{...styles.td, textAlign: 'center'}}>{item.name}</td>
                  <td style={{...styles.td, textAlign: 'center'}}>{item.size}</td>
                  <td style={{...styles.td, textAlign: 'center'}}>{item.price.toLocaleString('vi-VN')}đ</td>
                  <td style={{...styles.td, textAlign: 'center'}}>{item.quantity}</td>
                  <td style={{...styles.td, textAlign: 'center'}}>
                    {(item.price * item.quantity).toLocaleString('vi-VN')}đ
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div style={styles.totalSection}>
            <div style={styles.totalBreakdown}>
              <div style={styles.subtotalRow}>
                <span>Tạm tính:</span>
                <span>
                  {bill.items.reduce((sum, item) => 
                    sum + (item.price * item.quantity), 0
                  ).toLocaleString('vi-VN')}đ
                </span>
              </div>
              
              {bill.voucherCode && bill.voucherCode !== 'Không có' && (
                <div style={styles.discountRow}>
                  <span>Giảm giá ({bill.voucherCode}):</span>
                  <span>-{bill.voucherDiscount.toLocaleString('vi-VN')}đ</span>
                </div>
              )}
              
              <div style={styles.finalTotalRow}>
                <span>Tổng tiền:</span>
                <span>{bill.totalAmount.toLocaleString('vi-VN')}đ</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const styles = {
  container: {
    minHeight: '100vh',
    backgroundColor: '#f8f9fa',
  },
  content: {
    padding: '16px',
    maxWidth: '1000px',
    margin: '0 auto',
  },
  headerSection: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    marginBottom: '16px',
  },
  title: {
    fontSize: '20px',
    margin: 0,
    color: '#2c3e50',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: '8px',
    padding: '16px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
  },
  sectionTitle: {
    fontSize: '16px',
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: '12px',
    paddingBottom: '8px',
    borderBottom: '1px solid #eee',
  },
  customerInfo: {
    marginBottom: '20px',
  },
  infoRow: {
    display: 'flex',
    marginBottom: '8px',
    gap: '20px',
  },
  infoField: {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
  },
  label: {
    color: '#666',
    fontWeight: '500',
    width: '80px',
    marginRight: '0px',
  },
  value: {
    flex: 1,
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    marginBottom: '20px',
  },
  th: {
    backgroundColor: '#f8f9fa',
    padding: '10px',
    borderBottom: '1px solid #dee2e6',
    fontSize: '14px',
    fontWeight: '500',
  },
  td: {
    padding: '10px',
    borderBottom: '1px solid #dee2e6',
    fontSize: '14px',
    verticalAlign: 'middle',
  },
  totalSection: {
    display: 'flex',
    justifyContent: 'flex-end',
    alignItems: 'center',
    gap: '12px',
    paddingTop: '16px',
    borderTop: '1px solid #dee2e6',
  },
  totalBreakdown: {
    width: '300px',
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  subtotalRow: {
    display: 'flex',
    justifyContent: 'space-between',
    color: '#666',
  },
  discountRow: {
    display: 'flex',
    justifyContent: 'space-between',
    color: '#dc3545',
  },
  finalTotalRow: {
    display: 'flex',
    justifyContent: 'space-between',
    fontWeight: 'bold',
    color: '#e44d26',
    borderTop: '1px solid #dee2e6',
    paddingTop: '8px',
    marginTop: '8px',
  },
  backButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    padding: '6px 12px',
    backgroundColor: '#6c757d',
    color: '#fff',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '14px',
  },
  buttonIcon: {
    fontSize: '14px',
  },
  statusBadge: {
    padding: '4px 12px',
    borderRadius: '4px',
    fontSize: '13px',
    fontWeight: '500',
    display: 'inline-block',
  },
  paymentField: {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
  },
  paymentLabel: {
    color: '#666',
    fontWeight: '500',
    width: '160px',
    marginRight: '0px',
  },
  valueClose: {
    marginLeft: '4px',
  }
};

export default BillDetailScreen;
