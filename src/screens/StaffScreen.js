import React, { useState } from 'react';
import { db } from '../connect/firebaseConfig';
import { collection, doc, onSnapshot, updateDoc } from 'firebase/firestore';
import { useFocusEffect } from '@react-navigation/native';
import Header from '../components/Header';
import { FiEdit2, FiLock, FiUnlock, FiSearch } from 'react-icons/fi';

const StaffScreen = ({ navigation }) => {
  const [staffs, setStaffs] = useState([]);
  const [message, setMessage] = useState({ text: '', type: '' });
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const staffsPerPage = 6;
  const indexOfLastStaff = currentPage * staffsPerPage;
  const indexOfFirstStaff = indexOfLastStaff - staffsPerPage;
  const totalPages = Math.ceil(staffs.length / staffsPerPage);

  const formatDateTime = (timestamp) => {
    if (!timestamp) return 'Chưa có';
    return new Date(timestamp.toDate()).toLocaleString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    });
  };

  useFocusEffect(
    React.useCallback(() => {
      const unsubscribe = onSnapshot(
        collection(db, 'Staff'),
        (snapshot) => {
          try {
            const staffList = snapshot.docs.map(doc => ({
              id: doc.id,
              ...doc.data()
            }));
            setStaffs(staffList);
          } catch (error) {
            console.error('Error processing staffs:', error);
            setMessage({ text: 'Lỗi khi xử lý dữ liệu nhân viên!', type: 'error' });
          }
        },
        (error) => {
          console.error('Error listening to staffs:', error);
          setMessage({ text: 'Lỗi khi theo dõi dữ liệu nhân viên!', type: 'error' });
        }
      );

      return () => unsubscribe();
    }, [])
  );

  const handleUpdateStaffState = async (staffId, currentState) => {
    const newState = currentState === 'Active' ? 'Inactive' : 'Active';
    const confirmMessage = newState === 'Inactive' ? 
      'Bạn có chắc chắn muốn vô hiệu hóa nhân viên này?' : 
      'Bạn có chắc chắn muốn kích hoạt nhân viên này?';

    if (window.confirm(confirmMessage)) {
      try {
        await updateDoc(doc(db, 'Staff', staffId), {
          state: newState
        });
        setMessage({ 
          text: `${newState === 'Inactive' ? 'Vô hiệu hóa' : 'Kích hoạt'} nhân viên thành công!`, 
          type: 'success' 
        });
        
        setTimeout(() => {
          setMessage({ text: '', type: '' });
        }, 3000);
      } catch (error) {
        console.error('Error updating staff state:', error);
        setMessage({ text: 'Lỗi khi cập nhật trạng thái nhân viên!', type: 'error' });
      }
    }
  };

  const handleSearch = (value) => {
    setSearchTerm(value);
    if (value.trim() === '') {
      setSearchResults([]);
      setShowSuggestions(false);
      return;
    }

    const filtered = staffs.filter(staff => 
      staff.fullName.toLowerCase().includes(value.toLowerCase()) ||
      staff.email.toLowerCase().includes(value.toLowerCase()) ||
      staff.phoneNumber.includes(value)
    );
    
    setSearchResults(filtered);
    setShowSuggestions(true);
  };

  const handleSelectStaff = (staff) => {
    setSearchTerm(staff.fullName);
    setSearchResults([staffs.find(s => s.id === staff.id)]);
    setShowSuggestions(false);
  };

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const displayStaffs = searchTerm.trim() !== '' ? searchResults : staffs;
  const currentDisplayStaffs = displayStaffs.slice(indexOfFirstStaff, indexOfLastStaff);

  return (
    <div style={styles.container}>
      <Header />
      <div style={styles.content}>
        <div style={styles.headerSection}>
          <h1 style={styles.title}>Quản lý Nhân viên</h1>
          <div style={styles.searchContainer}>
            <div style={styles.searchWrapper}>
              <FiSearch style={styles.searchIcon} />
              <input
                type="text"
                placeholder="Tìm kiếm theo tên, email hoặc số điện thoại..."
                value={searchTerm}
                onChange={(e) => handleSearch(e.target.value)}
                style={styles.searchInput}
                onFocus={() => setShowSuggestions(true)}
              />
            </div>
            {showSuggestions && searchResults.length > 0 && (
              <div style={styles.suggestions}>
                {searchResults.map(staff => (
                  <div
                    key={staff.id}
                    style={styles.suggestionItem}
                    onClick={() => handleSelectStaff(staff)}
                  >
                    <div style={styles.suggestionInfo}>
                      <span style={styles.suggestionName}>{staff.fullName}</span>
                      <span style={styles.suggestionEmail}>{staff.email}</span>
                    </div>
                    <span style={styles.suggestionPhone}>{staff.phoneNumber}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div style={styles.staffList}>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={{...styles.th, width: '5%', textAlign: 'center'}}>STT</th>
                <th style={{...styles.th, width: '15%'}}>Họ tên</th>
                <th style={{...styles.th, width: '15%'}}>Email</th>
                <th style={{...styles.th, width: '10%'}}>Số điện thoại</th>
                <th style={{...styles.th, width: '15%'}}>Thời gian bắt đầu</th>
                <th style={{...styles.th, width: '15%'}}>Thời gian kết thúc</th>
                <th style={{...styles.th, width: '10%', textAlign: 'center'}}>Trạng thái</th>
                <th style={{...styles.th, width: '15%', textAlign: 'center'}}>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {currentDisplayStaffs.map((staff, index) => (
                <tr key={staff.id} style={styles.tr}>
                  <td style={{...styles.td, textAlign: 'center'}}>{indexOfFirstStaff + index + 1}</td>
                  <td style={styles.td}>{staff.fullName}</td>
                  <td style={styles.td}>{staff.email}</td>
                  <td style={styles.td}>{staff.phoneNumber}</td>
                  <td style={styles.td}>{formatDateTime(staff.startActivityTime)}</td>
                  <td style={styles.td}>
                    {staff.endActivityTime ? 
                      formatDateTime(staff.endActivityTime) : 
                      (staff.startActivityTime ? 'Đang hoạt động' : 'Chưa có')
                    }
                  </td>
                  <td style={{...styles.td, textAlign: 'center'}}>
                    <span style={{
                      ...styles.statusBadge,
                      backgroundColor: staff.startActivityTime && !staff.endActivityTime ? '#28a745' : '#dc3545'
                    }}>
                      {staff.startActivityTime && !staff.endActivityTime ? 'Đang hoạt động' : 'Không hoạt động'}
                    </span>
                  </td>
                  <td style={{...styles.td, textAlign: 'center'}}>
                    <div style={styles.actionButtons}>
                      <button
                        onClick={() => navigation.navigate('EditStaffScreen', { staff })}
                        style={{...styles.actionButton, backgroundColor: '#4CAF50'}}
                      >
                        <FiEdit2 style={styles.buttonIcon} /> Sửa
                      </button>
                      <button
                        onClick={() => handleUpdateStaffState(staff.id, staff.state)}
                        style={{
                          ...styles.actionButton,
                          backgroundColor: staff.state === 'Active' ? '#ffc107' : '#28a745'
                        }}
                      >
                        {staff.state === 'Active' ? 
                          <><FiLock style={styles.buttonIcon} />Vô hiệu</> : 
                          <><FiUnlock style={styles.buttonIcon} />Kích hoạt</>
                        }
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div style={styles.pagination}>
            <button 
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              style={{
                ...styles.pageButton,
                opacity: currentPage === 1 ? 0.5 : 1
              }}
            >
              Trước
            </button>
            
            {[...Array(totalPages)].map((_, index) => (
              <button
                key={index + 1}
                onClick={() => handlePageChange(index + 1)}
                style={{
                  ...styles.pageButton,
                  backgroundColor: currentPage === index + 1 ? '#4CAF50' : '#fff',
                  color: currentPage === index + 1 ? '#fff' : '#333'
                }}
              >
                {index + 1}
              </button>
            ))}
            
            <button 
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              style={{
                ...styles.pageButton,
                opacity: currentPage === totalPages ? 0.5 : 1
              }}
            >
              Sau
            </button>
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
    overflowY: 'auto',
    scrollbarWidth: 'none',
    msOverflowStyle: 'none',
    '::-webkit-scrollbar': {
      display: 'none'
    },
  },
  headerSection: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
    marginBottom: '20px',
  },
  title: {
    fontSize: '24px',
    fontWeight: '500',
    color: '#2c3e50',
    margin: 0,
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
  userList: {
    backgroundColor: 'white',
    borderRadius: '8px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    overflow: 'hidden',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    backgroundColor: 'white',
  },
  th: {
    padding: '12px',
    borderBottom: '1px solid #dee2e6',
    backgroundColor: '#f8f9fa',
    fontWeight: '500',
    textAlign: 'left',
  },
  td: {
    padding: '12px',
    borderBottom: '1px solid #dee2e6',
    fontSize: '14px',
  },
  tr: {
    ':hover': {
      backgroundColor: '#f8f9fa',
    },
  },
  actionButtons: {
    display: 'flex',
    gap: '8px',
    justifyContent: 'center',
  },
  actionButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    padding: '6px 12px',
    border: 'none',
    borderRadius: '4px',
    color: 'white',
    cursor: 'pointer',
    fontSize: '13px',
    fontWeight: '500',
  },
  buttonIcon: {
    fontSize: '14px',
  },
  statusBadge: {
    padding: '4px 8px',
    borderRadius: '4px',
    color: 'white',
    fontSize: '12px',
    fontWeight: '500',
    display: 'inline-block',
    minWidth: '100px',
    textAlign: 'center'
  },
  pagination: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    gap: '10px',
    padding: '20px 0',
  },
  pageButton: {
    padding: '8px 16px',
    border: '1px solid #ddd',
    borderRadius: '4px',
    backgroundColor: '#fff',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  searchContainer: {
    position: 'relative',
    width: '100%',
    maxWidth: '600px',
  },
  searchWrapper: {
    position: 'relative',
    width: '100%',
  },
  searchIcon: {
    position: 'absolute',
    left: '12px',
    top: '50%',
    transform: 'translateY(-50%)',
    color: '#666',
    fontSize: '18px',
  },
  searchInput: {
    width: '100%',
    padding: '12px 12px 12px 40px',
    fontSize: '14px',
    border: '1px solid #ddd',
    borderRadius: '8px',
    outline: 'none',
    transition: 'border-color 0.2s',
    ':focus': {
      borderColor: '#4CAF50',
    },
  },
  suggestions: {
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0,
    backgroundColor: 'white',
    border: '1px solid #ddd',
    borderRadius: '8px',
    marginTop: '4px',
    maxHeight: '300px',
    overflowY: 'auto',
    zIndex: 1000,
    boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
  },
  suggestionItem: {
    padding: '12px',
    cursor: 'pointer',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottom: '1px solid #eee',
    ':hover': {
      backgroundColor: '#f5f5f5',
    },
  },
  suggestionInfo: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
  },
  suggestionName: {
    fontWeight: '500',
    color: '#2c3e50',
  },
  suggestionEmail: {
    fontSize: '12px',
    color: '#666',
  },
  suggestionPhone: {
    fontSize: '13px',
    color: '#666',
  },
  // ... các styles khác giống như trong UsersScreen
};

export default StaffScreen;