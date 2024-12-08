import React, { useState } from 'react';
import { db } from '../connect/firebaseConfig';
import { collection, addDoc, updateDoc, doc } from 'firebase/firestore';
import Header from '../components/Header';
import { FiArrowLeft } from 'react-icons/fi';
import { useNavigation } from '@react-navigation/native';

const AddVoucherScreen = ({ route }) => {
  const navigation = useNavigation();
  const [message, setMessage] = useState({ text: '', type: '' });
  const editingVoucher = route.params?.voucher;

  const [formData, setFormData] = useState({
    code: editingVoucher?.code || '',
    discount: editingVoucher ? (editingVoucher.discount * 100).toString() : '',
    startDate: editingVoucher ? new Date(editingVoucher.startDate).toISOString().slice(0, 16) : '',
    endDate: editingVoucher ? new Date(editingVoucher.endDate).toISOString().slice(0, 16) : '',
    minimumAmount: editingVoucher ? editingVoucher.minimumAmount.toString() : '',
    isActive: editingVoucher ? editingVoucher.isActive : true,
    usedBy: editingVoucher ? editingVoucher.usedBy : []
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingVoucher) {
        await updateDoc(doc(db, 'Vouchers', editingVoucher.id), {
          ...formData,
          discount: parseFloat(formData.discount) / 100,
          minimumAmount: parseFloat(formData.minimumAmount),
          startDate: new Date(formData.startDate).getTime(),
          endDate: new Date(formData.endDate).getTime(),
        });
        setMessage({ text: 'Cập nhật voucher thành công!', type: 'success' });
      } else {
        await addDoc(collection(db, 'Vouchers'), {
          ...formData,
          discount: parseFloat(formData.discount) / 100,
          minimumAmount: parseFloat(formData.minimumAmount),
          startDate: new Date(formData.startDate).getTime(),
          endDate: new Date(formData.endDate).getTime(),
        });
        setMessage({ text: 'Thêm voucher thành công!', type: 'success' });
      }
      
      setTimeout(() => {
        setMessage({ text: '', type: '' });
        navigation.goBack();
      }, 2000);
    } catch (error) {
      console.error('Error:', error);
      setMessage({ text: 'Có lỗi xảy ra!', type: 'error' });
      setTimeout(() => setMessage({ text: '', type: '' }), 3000);
    }
  };

  return (
    <div style={styles.wrapper}>
      <Header />
      {message.text && (
        <div style={{
          ...styles.messagePopup,
          backgroundColor: message.type === 'success' ? '#d4edda' : '#f8d7da',
          color: message.type === 'success' ? '#155724' : '#721c24'
        }}>
          {message.text}
        </div>
      )}
      <div style={styles.container}>
        <div style={styles.backButtonContainer}>
          <button 
            onClick={() => navigation.goBack()}
            style={styles.backButton}
          >
            <FiArrowLeft style={styles.backIcon} />
            Quay lại
          </button>
        </div>
        
        <div style={styles.formCard}>
          <h2 style={styles.title}>{editingVoucher ? 'Sửa Voucher' : 'Thêm Voucher Mới'}</h2>
          <form onSubmit={handleSubmit} style={styles.form}>
            <div style={styles.formGroup}>
              <label style={styles.label}>Mã giảm giá:</label>
              <input
                style={styles.input}
                type="text"
                value={formData.code}
                onChange={(e) => setFormData({...formData, code: e.target.value})}
                placeholder="Nhập mã voucher"
                required
              />
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Giảm giá (%):</label>
              <input
                style={styles.input}
                type="number"
                value={formData.discount}
                onChange={(e) => setFormData({...formData, discount: e.target.value})}
                placeholder="Nhập phần trăm giảm giá"
                required
              />
            </div>

            <div style={styles.formRow}>
              <div style={styles.formGroupHalf}>
                <label style={styles.label}>Ngày bắt đầu:</label>
                <input
                  style={styles.input}
                  type="datetime-local"
                  value={formData.startDate}
                  onChange={(e) => setFormData({...formData, startDate: e.target.value})}
                  required
                />
              </div>

              <div style={styles.formGroupHalf}>
                <label style={styles.label}>Ngày kết thúc:</label>
                <input
                  style={styles.input}
                  type="datetime-local"
                  value={formData.endDate}
                  onChange={(e) => setFormData({...formData, endDate: e.target.value})}
                  required
                />
              </div>
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Đơn tối thiểu:</label>
              <input
                style={styles.input}
                type="number"
                value={formData.minimumAmount}
                onChange={(e) => setFormData({...formData, minimumAmount: e.target.value})}
                placeholder="Nhập số tiền tối thiểu"
                required
              />
            </div>

            <div style={styles.buttonGroup}>
              <button type="submit" style={styles.submitButton}>
                {editingVoucher ? 'Cập Nhật' : 'Thêm Voucher'}
              </button>
              <button 
                type="button"
                onClick={() => navigation.goBack()}
                style={styles.cancelButton}
              >
                Hủy
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

const styles = {
  wrapper: {
    minHeight: '100vh',
    backgroundColor: '#f5f5f5',
  },
  container: {
    padding: '40px 20px',
    maxWidth: '800px',
    margin: '0 auto',
  },
  formCard: {
    backgroundColor: 'white',
    borderRadius: '8px',
    padding: '30px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
  },
  form: {
    width: '100%',
  },
  formGroup: {
    marginBottom: '20px',
  },
  formRow: {
    display: 'flex',
    gap: '60px',
    marginBottom: '20px',
  },
  formGroupHalf: {
    flex: 1,
  },
  label: {
    display: 'block',
    marginBottom: '8px',
    color: '#555',
    fontSize: '14px',
    fontWeight: '500',
  },
  input: {
    width: '100%',
    padding: '10px 12px',
    border: '1px solid #ddd',
    borderRadius: '4px',
    fontSize: '14px',
    transition: 'border-color 0.3s ease',
    outline: 'none',
    '&:focus': {
      borderColor: '#4CAF50',
    }
  },
  buttonGroup: {
    display: 'flex',
    justifyContent: 'center',
    gap: '15px',
    marginTop: '30px',
  },
  submitButton: {
    padding: '12px 24px',
    backgroundColor: '#4CAF50',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '500',
    transition: 'background-color 0.3s ease',
    '&:hover': {
      backgroundColor: '#45a049',
    }
  },
  cancelButton: {
    padding: '12px 24px',
    backgroundColor: '#f44336',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '500',
    transition: 'background-color 0.3s ease',
    '&:hover': {
      backgroundColor: '#da190b',
    }
  },
  backButtonContainer: {
    marginBottom: '20px',
    padding: '0 20px',
  },
  backButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '8px 16px',
    backgroundColor: '#6c757d',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '500',
    transition: 'background-color 0.3s ease',
    '&:hover': {
      backgroundColor: '#5a6268',
    }
  },
  backIcon: {
    fontSize: '18px',
  },
  title: {
    fontSize: '20px',
    fontWeight: '500',
    marginBottom: '20px',
  },
  messagePopup: {
    position: 'fixed',
    top: '80px',
    left: '50%',
    transform: 'translateX(-50%)',
    padding: '12px 24px',
    borderRadius: '4px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
    zIndex: 1000,
    transition: 'opacity 0.3s ease-in-out',
    minWidth: '250px',
    textAlign: 'center',
    fontWeight: '500',
    fontSize: '14px'
  },
};

export default AddVoucherScreen;