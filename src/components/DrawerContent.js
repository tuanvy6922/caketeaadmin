import React from 'react';
import { FiUser, FiFileText, FiGrid, FiBox, FiImage, FiHome, FiUsers, FiLogOut, FiTag } from 'react-icons/fi';
import { auth } from '../connect/firebaseConfig';
import { signOut } from 'firebase/auth';
import Swal from 'sweetalert2'; // Import SweetAlert2

const DrawerContent = (props) => {
  const { navigation, adminInfo } = props;

  const menuItems = [
    { icon: <FiHome size={24} />, text: 'Trang chủ', route: 'Home' },
    { icon: <FiFileText size={24} />, text: 'Quản lý hóa đơn', route: 'BillsScreen' },
    { icon: <FiGrid size={24} />, text: 'Quản lý danh mục', route: 'CategoryScreen' },
    { icon: <FiBox size={24} />, text: 'Quản lý sản phẩm', route: 'ProductScreen' },
    { icon: <FiImage size={24} />, text: 'Quản lý slider', route: 'SlidersScreen' },
    { icon: <FiHome size={24} />, text: 'Quản lý cửa hàng', route: 'StoreScreen' },
    { icon: <FiUsers size={24} />, text: 'Quản lý người dùng', route: 'UsersScreen' },
    { icon: <FiTag size={24} />, text: 'Quản lý phiếu giảm giá', route: 'VoucherScreen' },
  ];

  const handleLogout = async () => {
    // Hiện thông báo xác nhận trước khi đăng xuất
    const result = await Swal.fire({
      title: 'Xác nhận đăng xuất',
      text: 'Bạn có chắc chắn muốn đăng xuất không?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Đồng ý',
      cancelButtonText: 'Hủy'
    });

    // Nếu người dùng xác nhận đăng xuất
    if (result.isConfirmed) {
      try {
        await signOut(auth);
        
        // Hiện thông báo đăng xuất thành công
        await Swal.fire({
          title: 'Thành công!',
          text: 'Đăng xuất thành công',
          icon: 'success',
          timer: 1500, // Tự động đóng sau 1.5 giây
          showConfirmButton: false
        });

        // Sau khi hiện thông báo thành công, chuyển về trang Login
        navigation.reset({
          index: 0,
          routes: [{ name: 'Login' }],
        });
      } catch (error) {
        // Hiện thông báo lỗi nếu đăng xuất thất bại
        Swal.fire({
          title: 'Lỗi!',
          text: 'Có lỗi xảy ra khi đăng xuất',
          icon: 'error',
          confirmButtonText: 'Đóng'
        });
        console.error('Lỗi khi đăng xuất:', error);
      }
    }
  };

  return (
    <div style={styles.drawerContainer}>
      {adminInfo && (
        <>
          <div style={styles.drawerHeader}>
            <FiUser size={50} />
            <span style={styles.adminText}>{adminInfo.fullName}</span>
            <span style={styles.adminEmail}>{adminInfo.email}</span>
            <span style={styles.adminRole}>{adminInfo.role}</span>
          </div>
          
          <div style={styles.adminInfo}>
            <div style={styles.infoItem}>
              <span style={styles.label}>Địa chỉ:</span>
              <span style={styles.value}>{adminInfo.address}</span>
            </div>
            <div style={styles.infoItem}>
              <span style={styles.label}>Số điện thoại:</span>
              <span style={styles.value}>{adminInfo.phoneNumber}</span>
            </div>
          </div>
        </>
      )}
      
      {menuItems.map((item, index) => (
        <button 
          key={index}
          style={styles.drawerItem}
          onClick={() => navigation.navigate(item.route)}
        >
          {item.icon}
          <span style={styles.drawerItemText}>{item.text}</span>
        </button>
      ))}
      
      <button style={styles.drawerItem} onClick={handleLogout}>
        <FiLogOut size={24} />
        <span style={styles.drawerItemText}>Đăng xuất</span>
      </button>
    </div>
  );
};

export default DrawerContent;

const styles = {
  drawerContainer: {
    flex: 1,
    backgroundColor: '#fff',
    padding: '16px',
    width: '250px',
    borderRight: '1px solid #ddd',
    height: '100vh',
    overflowY: 'auto',
    position: 'relative',
    left: 0,
  },
  drawerHeader: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: '16px',
    borderBottom: '1px solid #ddd',
    marginBottom: '16px',
  },
  adminText: {
    fontSize: '18px',
    fontWeight: 'bold',
    marginTop: '8px',
  },
  drawerItem: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    padding: '16px',
    border: 'none',
    borderRadius: '8px',
    marginBottom: '8px',
    background: 'none',
    cursor: 'pointer',
    transition: 'background-color 0.3s',
    '&:hover': {
      backgroundColor: '#f5f5f5',
    },
  },
  drawerItemText: {
    fontSize: '16px',
    marginLeft: '16px',
  },
  adminEmail: {
    fontSize: '14px',
    color: '#666',
    marginTop: '4px',
  },
  adminRole: {
    fontSize: '14px',
    color: '#007bff',
    fontWeight: '500',
    marginTop: '4px',
  },
  adminInfo: {
    padding: '16px',
    borderBottom: '1px solid #ddd',
    marginBottom: '16px',
  },
  infoItem: {
    marginBottom: '8px',
  },
  label: {
    fontSize: '14px',
    color: '#666',
    marginRight: '8px',
  },
  value: {
    fontSize: '14px',
    color: '#333',
  },
}
