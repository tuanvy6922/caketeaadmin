import React, { useState, useEffect } from 'react';
import { FiUser, FiFileText, FiGrid, FiBox, FiImage, FiHome, FiUsers, FiLogOut, FiTag } from 'react-icons/fi';
import { auth, db } from '../connect/firebaseConfig';
import { signOut } from 'firebase/auth';
import Swal from 'sweetalert2'; // Import SweetAlert2
import { doc, updateDoc, serverTimestamp, getDoc } from 'firebase/firestore'; // Thêm các import cần thiết

const DrawerContent = (props) => {
  const { navigation, adminInfo } = props;
  const [userRole, setUserRole] = useState(null);

  // Thêm useEffect để kiểm tra role
  useEffect(() => {
    const checkUserRole = async () => {
      try {
        const user = auth.currentUser;
        if (user) {
          const docRef = doc(db, "Staff", user.email);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            setUserRole(docSnap.data().role);
            console.log("Fetched role:", docSnap.data().role);
          }
        }
      } catch (error) {
        console.error("Error fetching role:", error);
      }
    };

    checkUserRole();
  }, []);

  // Menu items cho admin
  const adminMenuItems = [
    { icon: <FiHome size={24} />, text: 'Trang chủ', route: 'Home' },
    { icon: <FiFileText size={24} />, text: 'Đơn hàng', route: 'BillsScreen' },
    { icon: <FiBox size={24} />, text: 'Sản phẩm', route: 'ProductScreen' },
    { icon: <FiUsers size={24} />, text: 'Tài khoản khách hàng', route: 'UsersScreen' },
    { icon: <FiTag size={24} />, text: 'Mã giảm giá', route: 'VoucherScreen' },
    { icon: <FiUsers size={24} />, text: 'Nhân viên', route: 'StaffScreen' },
    { icon: <FiImage size={24} />, text: 'Quảng cáo Slider', route: 'SlidersScreen' },
    { icon: <FiGrid size={24} />, text: 'Danh mục thể loại', route: 'CategoryScreen' },
    { icon: <FiHome size={24} />, text: 'Thông tin cửa hàng', route: 'StoreScreen' },
  ];

  // Menu items cho staff
  const staffMenuItems = [
    { icon: <FiHome size={24} />, text: 'Trang chủ', route: 'Home' },
    { icon: <FiFileText size={24} />, text: 'Đơn hàng', route: 'BillsScreen' },
    { icon: <FiBox size={24} />, text: 'Sản phẩm', route: 'ProductScreen' },
    { icon: <FiUsers size={24} />, text: 'Tài khoản khách hàng', route: 'UsersScreen' },
  ];

  // Sửa logic chọn menu items để sử dụng cả adminInfo và userRole
  const menuItems = (adminInfo?.role === 'Admin' || userRole === 'Admin') 
    ? adminMenuItems 
    : staffMenuItems;

  const handleLogout = async () => {
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

    if (result.isConfirmed) {
      try {
        const user = auth.currentUser;
        if (user) {
          // Cập nhật thời gian kết thúc khi đăng xuất
          await updateDoc(doc(db, "Staff", user.email), {
            endActivityTime: serverTimestamp(),
            isCurrentlyActive: false
          });
        }
        
        await signOut(auth);
        await Swal.fire({
          title: 'Thành công!',
          text: 'Đăng xuất thành công',
          icon: 'success',
          timer: 1500,
          showConfirmButton: false
        });

        navigation.reset({
          index: 0,
          routes: [{ name: 'Login' }],
        });
      } catch (error) {
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

  // Render
  return (
    <div style={styles.drawerContainer}>
      {adminInfo && (
        <>
          <div style={styles.drawerHeader}>
            <FiUser size={50} />
            <span style={styles.adminText}>{adminInfo.fullName}</span>
            <span style={styles.adminEmail}>{adminInfo.email}</span>
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
