import React, { useState, useEffect } from 'react';
import { FiUser, FiFileText, FiGrid, FiBox, FiImage, FiHome, FiUsers, FiLogOut, FiTag } from 'react-icons/fi';
import { auth, db } from '../connect/firebaseConfig';
import { signOut } from 'firebase/auth';
import Swal from 'sweetalert2'; // Import SweetAlert2
import { doc, updateDoc, serverTimestamp, getDoc } from 'firebase/firestore'; // Thêm các import cần thiết

const DrawerContent = (props) => {
  const { navigation } = props;
  const [userRole, setUserRole] = useState(null);
  const [userPermissions, setUserPermissions] = useState(null);
  const [adminInfo, setAdminInfo] = useState(null);

  useEffect(() => {
    const checkUserPermissions = async () => {
      try {
        const user = auth.currentUser;
        if (user) {
          const docRef = doc(db, "Staff", user.email);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            const userData = docSnap.data();
            setUserRole(userData.role);
            setUserPermissions(userData.permissions || {});
            setAdminInfo(userData);
            console.log("Fetched permissions:", userData.permissions);
          }
        }
      } catch (error) {
        console.error("Error fetching permissions:", error);
      }
    };

    checkUserPermissions();
  }, []);

  // Menu items chung cho cả Admin và Staff
  const allMenuItems = [
    { icon: <FiHome size={24} />, text: 'Trang chủ', route: 'Home', permission: null },
    { icon: <FiFileText size={24} />, text: 'Đơn hàng', route: 'BillsScreen', permission: 'orders' },
    { icon: <FiBox size={24} />, text: 'Sản phẩm', route: 'ProductScreen', permission: 'products' },
    { icon: <FiUsers size={24} />, text: 'Tài khoản khách hàng', route: 'UsersScreen', permission: 'customers' },
    { icon: <FiTag size={24} />, text: 'Mã giảm giá', route: 'VoucherScreen', permission: 'vouchers' },
    { icon: <FiUsers size={24} />, text: 'Nhân viên', route: 'StaffScreen', permission: 'staff' },
    { icon: <FiImage size={24} />, text: 'Quảng cáo Slider', route: 'SlidersScreen', permission: 'sliders' },
    { icon: <FiGrid size={24} />, text: 'Danh mục thể loại', route: 'CategoryScreen', permission: 'categories' },
    { icon: <FiHome size={24} />, text: 'Thông tin cửa hàng', route: 'StoreScreen', permission: 'store' },
  ];

  // Kiểm tra quyền truy cập cho từng menu item
  const canAccess = (permission) => {
    if (!permission) return true; // Cho phép truy cập các route không cần quyền (như Home)
    if (userRole === 'Admin') return true; // Admin có tất cả quyền
    return userPermissions?.[permission] === true; // Kiểm tra quyền cụ thể của Staff
  };

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
        <div style={styles.drawerHeader}>
          <FiUser size={50} />
          <span style={styles.adminText}>{adminInfo.fullName}</span>
          <span style={styles.adminEmail}>{adminInfo.email}</span>
          <span style={styles.adminRole}>{adminInfo.role}</span>
        </div>
      )}
      
      {allMenuItems.map((item, index) => (
        <button 
          key={index}
          style={{
            ...styles.drawerItem,
            opacity: canAccess(item.permission) ? 1 : 0.5,
            cursor: canAccess(item.permission) ? 'pointer' : 'not-allowed'
          }}
          onClick={() => {
            if (canAccess(item.permission)) {
              navigation.navigate(item.route);
            } else {
              alert('Bạn không có quyền truy cập chức năng này!');
            }
          }}
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
    transition: 'opacity 0.3s ease',
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
