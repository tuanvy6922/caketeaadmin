import React, { useState } from 'react';
import { db } from '../connect/firebaseConfig';
import { collection, deleteDoc, doc, onSnapshot } from 'firebase/firestore';
import { useFocusEffect } from '@react-navigation/native';
import Header from '../components/Header';
import { FiEdit2, FiTrash2, FiMapPin } from 'react-icons/fi';

const StoreScreen = ({ navigation }) => {
  const [stores, setStores] = useState([]);
  const [message, setMessage] = useState({ text: '', type: '' });
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const storesPerPage = 4;

  // Lọc stores theo tìm kiếm
  const filteredStores = stores.filter(store => 
    store.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    store.address.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Tính toán stores cho trang hiện tại
  const indexOfLastStore = currentPage * storesPerPage;
  const indexOfFirstStore = indexOfLastStore - storesPerPage;
  const currentStores = filteredStores.slice(indexOfFirstStore, indexOfLastStore);
  const totalPages = Math.ceil(filteredStores.length / storesPerPage);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  useFocusEffect(
    React.useCallback(() => {
      const unsubscribe = onSnapshot(
        collection(db, 'Store'),
        (snapshot) => {
          const storesList = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          }));
          setStores(storesList);
        },
        (error) => {
          console.error('Error fetching stores:', error);
          setMessage({ text: 'Lỗi khi tải dữ liệu cửa hàng!', type: 'error' });
        }
      );

      return () => unsubscribe();
    }, [])
  );

  const handleDeleteStore = async (storeId) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa cửa hàng này?')) {
      try {
        await deleteDoc(doc(db, 'Store', storeId));
        setMessage({ text: 'Xóa cửa hàng thành công!', type: 'success' });
        
        setTimeout(() => {
          setMessage({ text: '', type: '' });
        }, 3000);
      } catch (error) {
        console.error('Error deleting store:', error);
        setMessage({ text: 'Lỗi khi xóa cửa hàng!', type: 'error' });
      }
    }
  };

  return (
    <div style={styles.container}>
      <Header />
      <div style={styles.content}>
        <div style={styles.headerSection}>
          <h1 style={styles.title}>Quản lý Cửa hàng</h1>
          <button 
            onClick={() => navigation.navigate('AddStoreScreen')}
            style={styles.addButton}
          >
            <FiMapPin style={styles.buttonIcon} />
            Thêm cửa hàng mới
          </button>
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

        <div style={styles.searchContainer}>
          <input
            type="text"
            placeholder="Tìm kiếm cửa hàng..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={styles.searchInput}
          />
        </div>

        <div style={styles.tableContainer}>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={{...styles.th, width: '5%', textAlign: 'center'}}>STT</th>
                <th style={{...styles.th, width: '15%', textAlign: 'left'}}>Tên cửa hàng</th>
                <th style={{...styles.th, width: '35%', textAlign: 'left'}}>Địa chỉ</th>
                <th style={{...styles.th, width: '15%', textAlign: 'center'}}>Vĩ độ</th>
                <th style={{...styles.th, width: '15%', textAlign: 'center'}}>Kinh độ</th>
                <th style={{...styles.th, width: '15%', textAlign: 'center'}}>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {currentStores.map((store, index) => (
                <tr key={store.id} style={styles.tr}>
                  <td style={{...styles.td, textAlign: 'center'}}>{indexOfFirstStore + index + 1}</td>
                  <td style={{...styles.td, textAlign: 'left'}}>{store.name}</td>
                  <td style={{...styles.td, textAlign: 'left'}}>{store.address}</td>
                  <td style={{...styles.td, textAlign: 'center'}}>{store.latitude}</td>
                  <td style={{...styles.td, textAlign: 'center'}}>{store.longitude}</td>
                  <td style={{...styles.td, textAlign: 'center'}}>
                    <div style={styles.actionButtons}>
                      <button
                        onClick={() => navigation.navigate('AddStoreScreen', { store })}
                        style={{...styles.actionButton, backgroundColor: '#28a745'}}
                      >
                        <FiEdit2 style={styles.buttonIcon} /> Sửa
                      </button>
                      <button
                        onClick={() => handleDeleteStore(store.id)}
                        style={{...styles.actionButton, backgroundColor: '#dc3545'}}
                      >
                        <FiTrash2 style={styles.buttonIcon} /> Xóa
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Phân trang */}
        <div style={styles.pagination}>
          <button 
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            style={styles.pageButton}
          >
            Trước
          </button>
          {[...Array(totalPages)].map((_, index) => (
            <button
              key={index + 1}
              onClick={() => handlePageChange(index + 1)}
              style={{
                ...styles.pageButton,
                backgroundColor: currentPage === index + 1 ? '#007bff' : '#fff',
                color: currentPage === index + 1 ? '#fff' : '#000',
              }}
            >
              {index + 1}
            </button>
          ))}
          <button 
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            style={styles.pageButton}
          >
            Sau
          </button>
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
    padding: '20px',
    maxWidth: '1200px',
    margin: '0 auto',
  },
  headerSection: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '20px',
  },
  title: {
    fontSize: '24px',
    fontWeight: '500',
    margin: '0',
  },
  addButton: {
    backgroundColor: '#28a745',
    color: 'white',
    border: 'none',
    padding: '10px 20px',
    borderRadius: '4px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
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
  searchContainer: {
    marginBottom: '20px',
  },
  searchInput: {
    width: '98%',
    padding: '8px 12px',
    fontSize: '14px',
    border: '1px solid #ddd',
    borderRadius: '4px',
  },
  tableContainer: {
    backgroundColor: 'white',
    borderRadius: '4px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    tableLayout: 'fixed',
  },
  th: {
    padding: '12px 8px',
    borderBottom: '2px solid #dee2e6',
    backgroundColor: '#f8f9fa',
    fontWeight: 'bold',
    whiteSpace: 'nowrap',
  },
  td: {
    padding: '12px 8px',
    borderBottom: '1px solid #dee2e6',
    whiteSpace: 'normal',
  },
  tr: {
    '&:hover': {
      backgroundColor: '#f8f9fa',
    },
  },
  actionButtons: {
    display: 'flex',
    gap: '8px',
  },
  actionButton: {
    padding: '6px 12px',
    border: 'none',
    borderRadius: '4px',
    color: 'white',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
  },
  buttonIcon: {
    fontSize: '16px',
  },
  pagination: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    gap: '8px',
    marginTop: '20px',
  },
  pageButton: {
    padding: '6px 12px',
    border: '1px solid #dee2e6',
    borderRadius: '4px',
    backgroundColor: '#fff',
    cursor: 'pointer',
    '&:disabled': {
      cursor: 'not-allowed',
      opacity: 0.5,
    },
  },
};

export default StoreScreen;
