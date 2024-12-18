import React, { useState } from 'react';
import { db } from '../connect/firebaseConfig';
import { collection, deleteDoc, doc, onSnapshot } from 'firebase/firestore';
import { useFocusEffect } from '@react-navigation/native';
import Header from '../components/Header';
import { FiEdit2, FiTrash2 } from 'react-icons/fi';

const CategoryScreen = ({ navigation }) => {
  const [categories, setCategories] = useState([]);
  const [message, setMessage] = useState({ text: '', type: '' });
  const [currentPage, setCurrentPage] = useState(1);
  const categoriesPerPage = 5;

  // Tính toán categories cho trang hiện tại
  const indexOfLastCategory = currentPage * categoriesPerPage;
  const indexOfFirstCategory = indexOfLastCategory - categoriesPerPage;
  const currentCategories = categories.slice(indexOfFirstCategory, indexOfLastCategory);
  const totalPages = Math.ceil(categories.length / categoriesPerPage);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  useFocusEffect(
    React.useCallback(() => {
      const unsubscribe = onSnapshot(
        collection(db, 'Category'),
        (snapshot) => {
          try {
            const categoriesList = snapshot.docs.map(doc => ({
              id: doc.id,
              ...doc.data(),
              createdAt: doc.data().createdAt?.toDate() || new Date()
            }));
            const sortedCategories = categoriesList.sort((a, b) => {
              return b.createdAt - a.createdAt;
            });
            setCategories(sortedCategories);
          } catch (error) {
            console.error('Error processing categories:', error);
            setMessage({ text: 'Lỗi khi xử lý dữ liệu danh mục!', type: 'error' });
          }
        },
        (error) => {
          console.error('Error listening to categories:', error);
          setMessage({ text: 'Lỗi khi theo dõi dữ liệu danh mục!', type: 'error' });
        }
      );
      return () => unsubscribe();
    }, [])
  );

  const handleDeleteCategory = async (categoryId) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa danh mục này?')) {
      try {
        // Cập nhật UI trước
        setCategories(prevCategories => prevCategories.filter(category => category.id !== categoryId));
        // Xóa category từ Firestore
        await deleteDoc(doc(db, 'Category', categoryId));
        setMessage({ text: 'Xóa danh mục thành công!', type: 'success' });
        setTimeout(() => setMessage({ text: '', type: '' }), 3000);
      } catch (error) {
        console.error('Error deleting category:', error);
        setMessage({ text: 'Lỗi khi xóa danh mục!', type: 'error' });
      }
    }
  };

  return (
    <div style={styles.container}>
      <Header />
      <div style={styles.content}>
        <div style={styles.headerSection}>
          <h1 style={styles.title}>Quản lý Thể loại</h1>
          <button onClick={() => navigation.navigate('AddCategoryScreen')} style={styles.addButton}>+ Thêm Danh mục</button>
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
        <div style={styles.tableContainer}>
          <div style={styles.tableWrapper}>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={{...styles.th, width: '10%', textAlign: 'center'}}>STT</th>
                  <th style={{...styles.th, width: '60%', textAlign: 'left'}}>Tên danh mục</th>
                  <th style={{...styles.th, width: '30%', textAlign: 'center'}}>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {currentCategories.map((category, index) => (
                  <tr key={category.id} style={styles.tr}>
                    <td style={{...styles.td, width: '10%', textAlign: 'center'}}>
                      {indexOfFirstCategory + index + 1}
                    </td>
                    <td style={{...styles.td, width: '60%', textAlign: 'left'}}>
                      {category.name}
                    </td>
                    <td style={{...styles.td, width: '30%'}}>
                      <div style={styles.actionButtons}>
                        <button
                          onClick={() => navigation.navigate('AddCategoryScreen', { category })}
                          style={styles.editButton}
                        >
                          <FiEdit2 style={styles.buttonIcon} />
                          Sửa
                        </button>
                        <button
                          onClick={() => handleDeleteCategory(category.id)}
                          style={styles.deleteButton}
                        >
                          <FiTrash2 style={styles.buttonIcon} />
                          Xóa
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

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
              style={styles.pageButton}
            >
              Sau
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const styles = {
  container: {
    height: '100vh',
    display: 'flex',
    flexDirection: 'column',
    backgroundColor: '#f8f9fa',
    overflow: 'hidden',
  },
  content: {
    flex: 1,
    padding: '20px',
    maxWidth: '1200px',
    margin: '0 auto',
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
    overflowY: 'auto',
    scrollbarWidth: 'none',
    msOverflowStyle: 'none',
    '&::-webkit-scrollbar': {
      display: 'none'
    }
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
    color: '#2c3e50',
    margin: 0,
  },
  addButton: {
    backgroundColor: '#4CAF50',
    color: 'white',
    border: 'none',
    padding: '10px 20px',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '14px',
  },
  tableContainer: {
    backgroundColor: 'white',
    borderRadius: '8px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    marginBottom: '20px',
  },
  tableWrapper: {
    flex: 1,
    overflow: 'auto', // Cho phép cuộn
    // Tùy chỉnh thanh cuộn
    '&::-webkit-scrollbar': {
      width: '8px',
      height: '8px',
    },
    '&::-webkit-scrollbar-track': {
      background: '#f1f1f1',
      borderRadius: '4px',
    },
    '&::-webkit-scrollbar-thumb': {
      background: '#888',
      borderRadius: '4px',
      '&:hover': {
        background: '#555',
      },
    },
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    minWidth: '600px', // Đảm bảo bảng không bị vỡ ở màn hình nhỏ
  },
  th: {
    padding: '15px 20px',
    textAlign: 'left',
    borderBottom: '2px solid #dee2e6',
    backgroundColor: '#f8f9fa',
    color: '#495057',
    fontWeight: '600',
    fontSize: '14px',
  },
  td: {
    padding: '15px 20px',
    borderBottom: '1px solid #dee2e6',
    color: '#2c3e50',
    fontSize: '14px',
    verticalAlign: 'middle', // Căn giữa theo chiều dọc
  },
  pagination: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    gap: '10px',
    padding: '20px 0',
    marginTop: '20px',
  },
  pageButton: {
    padding: '6px 12px',
    border: '1px solid #ddd',
    borderRadius: '4px',
    backgroundColor: '#fff',
    cursor: 'pointer',
    fontSize: '13px',
    transition: 'all 0.2s',
    '&:hover': {
      backgroundColor: '#f8f9fa',
    },
    '&:disabled': {
      cursor: 'not-allowed',
      opacity: 0.5,
    }
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
  actionButtons: {
    display: 'flex',
    justifyContent: 'center',
    gap: '10px',
  },
  editButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '5px',
    padding: '8px 16px',
    backgroundColor: '#ffc107',
    color: '#000',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '14px',
    transition: 'background-color 0.2s',
    '&:hover': {
      backgroundColor: '#e0a800',
    },
  },
  deleteButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '5px',
    padding: '8px 16px',
    backgroundColor: '#dc3545',
    color: '#fff',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '14px',
    transition: 'background-color 0.2s',
    '&:hover': {
      backgroundColor: '#c82333',
    },
  },
  buttonIcon: {
    fontSize: '16px',
  },
};

export default CategoryScreen;
