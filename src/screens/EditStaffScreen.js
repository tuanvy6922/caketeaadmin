import React, { useState, useEffect } from 'react';
import { db } from '../connect/firebaseConfig';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { useNavigation } from '@react-navigation/native';
import Header from '../components/Header';
import Swal from 'sweetalert2';

const EditStaffScreen = ({ route }) => {
  const { staff } = route.params;
  const navigation = useNavigation();
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phoneNumber: '',
    address: '',
    gender: '',
    role: '',
    state: ''
  });
  const [permissions, setPermissions] = useState({
    orders: false,
    products: false,
    customers: false,
    vouchers: false,
    sliders: false,
    categories: false,
    staff: false,
    store: false
  });

  useEffect(() => {
    if (staff) {
      setFormData({
        fullName: staff.fullName || '',
        email: staff.email || '',
        phoneNumber: staff.phoneNumber || '',
        address: staff.address || '',
        gender: staff.gender || '',
        role: staff.role || '',
        state: staff.state || ''
      });
      setPermissions(staff.permissions || {
        orders: false,
        products: false,
        customers: false,
        vouchers: false,
        sliders: false,
        categories: false,
        staff: false,
        store: false
      });
    }
  }, [staff]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await updateDoc(doc(db, "Staff", staff.email), {
        fullName: formData.fullName,
        phoneNumber: formData.phoneNumber,
        address: formData.address,
        gender: formData.gender,
        role: formData.role,
        state: formData.state,
        permissions: permissions
      });

      Swal.fire({
        icon: 'success',
        title: 'Thành công',
        text: 'Cập nhật thông tin nhân viên thành công!',
        showConfirmButton: false,
        timer: 1500
      }).then(() => {
        navigation.navigate('StaffScreen');
      });

    } catch (error) {
      console.error('Lỗi cập nhật:', error);
      Swal.fire({
        icon: 'error',
        title: 'Lỗi',
        text: 'Cập nhật thông tin thất bại!'
      });
    }
  };

  const renderPermissionsSection = () => (
    <div style={styles.permissionsSection}>
      <h3 style={styles.permissionsTitle}>Phân quyền truy cập:</h3>
      <div style={styles.permissionsGrid}>
        <div style={styles.permissionItem}>
          <input
            type="checkbox"
            id="orders"
            checked={permissions.orders}
            onChange={(e) => setPermissions({...permissions, orders: e.target.checked})}
          />
          <label htmlFor="orders">Đơn hàng</label>
        </div>
        <div style={styles.permissionItem}>
          <input
            type="checkbox"
            id="products"
            checked={permissions.products}
            onChange={(e) => setPermissions({...permissions, products: e.target.checked})}
          />
          <label htmlFor="products">Sản phẩm</label>
        </div>
        <div style={styles.permissionItem}>
          <input
            type="checkbox"
            id="customers"
            checked={permissions.customers}
            onChange={(e) => setPermissions({...permissions, customers: e.target.checked})}
          />
          <label htmlFor="customers">Khách hàng</label>
        </div>
        <div style={styles.permissionItem}>
          <input
            type="checkbox"
            id="vouchers"
            checked={permissions.vouchers}
            onChange={(e) => setPermissions({...permissions, vouchers: e.target.checked})}
          />
          <label htmlFor="vouchers">Mã giảm giá</label>
        </div>
        <div style={styles.permissionItem}>
          <input
            type="checkbox"
            id="sliders"
            checked={permissions.sliders}
            onChange={(e) => setPermissions({...permissions, sliders: e.target.checked})}
          />
          <label htmlFor="sliders">Quảng cáo Slider</label>
        </div>
        <div style={styles.permissionItem}>
          <input
            type="checkbox"
            id="categories"
            checked={permissions.categories}
            onChange={(e) => setPermissions({...permissions, categories: e.target.checked})}
          />
          <label htmlFor="categories">Danh mục</label>
        </div>
        <div style={styles.permissionItem}>
          <input
            type="checkbox"
            id="staff"
            checked={permissions.staff}
            onChange={(e) => setPermissions({...permissions, staff: e.target.checked})}
          />
          <label htmlFor="staff">Nhân viên</label>
        </div>
        <div style={styles.permissionItem}>
          <input
            type="checkbox"
            id="store"
            checked={permissions.store}
            onChange={(e) => setPermissions({...permissions, store: e.target.checked})}
          />
          <label htmlFor="store">Thông tin cửa hàng</label>
        </div>
      </div>
    </div>
  );

  return (
    <div style={styles.container}>
      <Header />
      <div style={styles.content}>
        <h1 style={styles.title}>Sửa thông tin nhân viên</h1>
        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.inputGroup}>
            <label style={styles.label}>Họ tên:</label>
            <input
              type="text"
              name="fullName"
              value={formData.fullName}
              onChange={handleChange}
              style={styles.input}
            />
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>Email:</label>
            <input
              type="email"
              value={formData.email}
              disabled
              style={{...styles.input, backgroundColor: '#f0f0f0'}}
            />
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>Số điện thoại:</label>
            <input
              type="text"
              name="phoneNumber"
              value={formData.phoneNumber}
              onChange={handleChange}
              style={styles.input}
            />
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>Địa chỉ:</label>
            <input
              type="text"
              name="address"
              value={formData.address}
              onChange={handleChange}
              style={styles.input}
            />
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>Giới tính:</label>
            <select
              name="gender"
              value={formData.gender}
              onChange={handleChange}
              style={styles.select}
            >
              <option value="">Chọn giới tính</option>
              <option value="Nam">Nam</option>
              <option value="Nữ">Nữ</option>
            </select>
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>Vai trò:</label>
            <select
              name="role"
              value={formData.role}
              onChange={handleChange}
              style={styles.select}
            >
              <option value="">Chọn vai trò</option>
              <option value="Admin">Admin</option>
              <option value="Staff">Staff</option>
            </select>
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>Trạng thái:</label>
            <select
              name="state"
              value={formData.state}
              onChange={handleChange}
              style={styles.select}
            >
              <option value="Active">Hoạt động</option>
              <option value="Inactive">Không hoạt động</option>
            </select>
          </div>

          {formData.role === 'Staff' && renderPermissionsSection()}

          <div style={styles.buttonGroup}>
            <button type="submit" style={styles.submitButton}>
              Cập nhật
            </button>
            <button
              type="button"
              onClick={() => navigation.navigate('StaffScreen')}
              style={styles.cancelButton}
            >
              Hủy
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const styles = {
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    height: '100vh',
    overflow: 'auto'
  },
  content: {
    padding: '20px',
    maxWidth: '800px',
    margin: '0 auto',
    paddingBottom: '40px'
  },
  title: {
    fontSize: '24px',
    fontWeight: 'bold',
    marginBottom: '20px',
    color: '#333',
  },
  form: {
    backgroundColor: 'white',
    padding: '30px',
    borderRadius: '8px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    maxWidth: '600px',
    margin: '0 auto',
  },
  inputGroup: {
    marginBottom: '20px',
    display: 'flex',
    alignItems: 'center',
    gap: '20px',
  },
  label: {
    width: '120px',
    textAlign: 'right',
    marginBottom: 0,
    fontSize: '14px',
    fontWeight: '500',
    color: '#333',
    flexShrink: 0,
  },
  input: {
    flex: 1,
    padding: '10px',
    fontSize: '14px',
    border: '1px solid #ddd',
    borderRadius: '4px',
    outline: 'none',
    maxWidth: '400px',
  },
  select: {
    flex: 1,
    padding: '10px',
    fontSize: '14px',
    border: '1px solid #ddd',
    borderRadius: '4px',
    outline: 'none',
    backgroundColor: 'white',
    maxWidth: '400px',
  },
  buttonGroup: {
    display: 'flex',
    gap: '10px',
    justifyContent: 'flex-end',
    marginTop: '20px',
  },
  submitButton: {
    padding: '10px 20px',
    backgroundColor: '#4CAF50',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '14px',
  },
  cancelButton: {
    padding: '10px 20px',
    backgroundColor: '#f44336',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '14px',
  },
  permissionsSection: {
    marginTop: '20px',
    padding: '20px',
    border: '1px solid #ddd',
    borderRadius: '4px',
  },
  permissionsTitle: {
    fontSize: '16px',
    fontWeight: '500',
    marginBottom: '15px',
    color: '#333',
  },
  permissionsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
    gap: '15px',
  },
  permissionItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
};

export default EditStaffScreen;
