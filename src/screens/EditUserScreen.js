import React, { useState } from 'react';
import { db } from '../connect/firebaseConfig';
import { doc, updateDoc } from 'firebase/firestore';
import Header from '../components/Header';

const EditUserScreen = ({ navigation, route }) => {
  const { user } = route.params;
  const [userData, setUserData] = useState({
    fullName: user.fullName,
    email: user.email,
    phoneNumber: user.phoneNumber,
    role: user.role,
    address: user.address || '',
  });
  const [message, setMessage] = useState({ text: '', type: '' });

  const handleUpdate = async () => {
    try {
      await updateDoc(doc(db, 'Customer', user.id), userData);
      setMessage({ text: 'Cập nhật thông tin thành công!', type: 'success' });
      setTimeout(() => {
        navigation.goBack();
      }, 2000);
    } catch (error) {
      setMessage({ text: 'Lỗi khi cập nhật thông tin!', type: 'error' });
    }
  };

  return (
    <div style={styles.container}>
      <Header />
      <div style={styles.content}>
        <div style={styles.headerSection}>
          <h1 style={styles.title}>Chỉnh sửa thông tin người dùng</h1>
        </div>

        <div style={styles.formContainer}>
          <div style={styles.form}>
            <div style={styles.formGroup}>
              <label style={styles.label}>Họ tên:</label>
              <input
                type="text"
                value={userData.fullName}
                onChange={(e) => setUserData({...userData, fullName: e.target.value})}
                style={styles.input}
              />
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Email:</label>
              <input
                type="email"
                value={userData.email}
                onChange={(e) => setUserData({...userData, email: e.target.value})}
                style={styles.input}
              />
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Số điện thoại:</label>
              <input
                type="text"
                value={userData.phoneNumber}
                onChange={(e) => setUserData({...userData, phoneNumber: e.target.value})}
                style={styles.input}
              />
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Địa chỉ:</label>
              <input
                type="text"
                value={userData.address}
                onChange={(e) => setUserData({...userData, address: e.target.value})}
                style={styles.input}
              />
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Vai trò:</label>
              <select
                value={userData.role}
                onChange={(e) => setUserData({...userData, role: e.target.value})}
                style={styles.select}
              >
                <option value="user">User</option>
                <option value="admin">Admin</option>
              </select>
            </div>

            <div style={styles.buttonGroup}>
              <button onClick={handleUpdate} style={styles.saveButton}>
                Cập nhật
              </button>
              <button 
                onClick={() => navigation.goBack()} 
                style={styles.cancelButton}
              >
                Hủy
              </button>
            </div>
          </div>
        </div>
      </div>

      {message.text && (
        <div style={{
          ...styles.messagePopup,
          backgroundColor: message.type === 'success' ? '#d4edda' : '#f8d7da',
          color: message.type === 'success' ? '#155724' : '#721c24'
        }}>
          {message.text}
        </div>
      )}
    </div>
  );
};

const styles = {
  container: {
    minHeight: '100vh',
    backgroundColor: '#f8f9fa',
    display: 'flex',
    flexDirection: 'column',
  },
  content: {
    flex: 1,
    padding: '20px',
    maxWidth: '1200px',
    margin: '0 auto',
    width: '100%',
  },
  headerSection: {
    marginBottom: '30px',
    borderBottom: '1px solid #dee2e6',
    paddingBottom: '15px',
  },
  title: {
    fontSize: '24px',
    fontWeight: '500',
    color: '#2c3e50',
    margin: 0,
  },
  formContainer: {
    display: 'flex',
    justifyContent: 'center',
    width: '100%',
  },
  form: {
    backgroundColor: 'white',
    padding: '30px',
    borderRadius: '8px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    width: '100%',
    maxWidth: '600px',
  },
  formGroup: {
    marginBottom: '20px',
  },
  label: {
    display: 'block',
    marginBottom: '8px',
    fontWeight: '500',
    color: '#2c3e50',
    fontSize: '14px',
  },
  input: {
    width: '100%',
    height: '42px',
    padding: '8px 12px',
    borderRadius: '6px',
    border: '1px solid #ddd',
    fontSize: '14px',
    transition: 'border-color 0.2s',
    boxSizing: 'border-box',
    ':focus': {
      borderColor: '#4CAF50',
      outline: 'none',
    },
  },
  select: {
    width: '100%',
    height: '42px',
    padding: '8px 12px',
    borderRadius: '6px',
    border: '1px solid #ddd',
    fontSize: '14px',
    backgroundColor: 'white',
    cursor: 'pointer',
    boxSizing: 'border-box',
    appearance: 'none',
    backgroundImage: `url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e")`,
    backgroundRepeat: 'no-repeat',
    backgroundPosition: 'right 12px center',
    backgroundSize: '16px',
    paddingRight: '40px',
  },
  buttonGroup: {
    display: 'flex',
    gap: '12px',
    marginTop: '30px',
    justifyContent: 'flex-end',
  },
  saveButton: {
    padding: '10px 24px',
    backgroundColor: '#4CAF50',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '500',
    transition: 'background-color 0.2s',
    ':hover': {
      backgroundColor: '#45a049',
    },
  },
  cancelButton: {
    padding: '10px 24px',
    backgroundColor: '#6c757d',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '500',
    transition: 'background-color 0.2s',
    ':hover': {
      backgroundColor: '#5a6268',
    },
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
  '@keyframes fadeOut': {
    '0%': { opacity: 1 },
    '70%': { opacity: 1 },
    '100%': { opacity: 0 }
  },
};

export default EditUserScreen;
