import React, { useState } from 'react';
import { db } from '../connect/firebaseConfig';
import { collection, onSnapshot } from 'firebase/firestore';
import { useFocusEffect } from '@react-navigation/native';
import Header from '../components/Header';
import { FiEdit2, FiSearch } from 'react-icons/fi';

const VoucherScreen = ({ navigation }) => {
  const [vouchers, setVouchers] = useState([]);
  const [message, setMessage] = useState({ text: '', type: '' });
  const [currentPage, setCurrentPage] = useState(1);
  const vouchersPerPage = 5;
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  // Tính toán vouchers cho trang hiện tại
  const indexOfLastVoucher = currentPage * vouchersPerPage;
  const indexOfFirstVoucher = indexOfLastVoucher - vouchersPerPage;
  const currentVouchers = vouchers.slice(indexOfFirstVoucher, indexOfLastVoucher);
  const totalPages = Math.ceil(vouchers.length / vouchersPerPage);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  useFocusEffect(
    React.useCallback(() => {
      const unsubscribe = onSnapshot(
        collection(db, 'Vouchers'),
        (snapshot) => {
          try {
            const voucherList = snapshot.docs.map(doc => ({
              id: doc.id,
              ...doc.data()
            }));
            setVouchers(voucherList);
          } catch (error) {
            console.error('Error processing vouchers:', error);
            setMessage({ text: 'Lỗi khi xử lý dữ liệu voucher!', type: 'error' });
          }
        },
        (error) => {
          console.error('Error listening to vouchers:', error);
          setMessage({ text: 'Lỗi khi theo dõi dữ liệu voucher!', type: 'error' });
        }
      );
      return () => unsubscribe();
    }, [])
  );

  const handleSearch = (value) => {
    setSearchTerm(value);
    if (value.trim() === '') {
      setSearchResults([]);
      setShowSuggestions(false);
      return;
    }

    const filtered = vouchers.filter(voucher => 
      voucher.code.toLowerCase().includes(value.toLowerCase())
    );
    
    setSearchResults(filtered);
    setShowSuggestions(true);
  };

  const handleSelectVoucher = (voucher) => {
    setSearchTerm(voucher.code);
    setSearchResults([vouchers.find(v => v.id === voucher.id)]);
    setShowSuggestions(false);
  };

  // Lọc vouchers hiển thị
  const displayVouchers = searchTerm.trim() !== '' ? searchResults : vouchers;
  const currentDisplayVouchers = displayVouchers.slice(indexOfFirstVoucher, indexOfLastVoucher);

  return (
    <div style={styles.container}>
      <Header />
      <div style={styles.content}>
        <div style={styles.headerSection}>
          <div style={styles.searchContainer}>
            <input
              type="text"
              placeholder="Tìm kiếm theo mã voucher..."
              value={searchTerm}
              onChange={(e) => handleSearch(e.target.value)}
              style={styles.searchInput}
            />
          </div>
          <button
            onClick={() => navigation.navigate('AddVoucherScreen')}
            style={styles.addButton}
          >
            + Thêm Voucher
          </button>
        </div>

        <div style={styles.tableContainer}>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={{...styles.th, width: '5%', textAlign: 'center'}}>STT</th>
                <th style={{...styles.th, width: '15%', textAlign: 'center'}}>Mã Voucher</th>
                <th style={{...styles.th, width: '10%', textAlign: 'center'}}>Giảm giá</th>
                <th style={{...styles.th, width: '25%', textAlign: 'center'}}>Thời gian hiệu lực</th>
                <th style={{...styles.th, width: '15%', textAlign: 'center'}}>Đơn tối thiểu</th>
                <th style={{...styles.th, width: '15%', textAlign: 'center'}}>Trạng thái</th>
                <th style={{...styles.th, width: '15%', textAlign: 'center'}}>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {currentDisplayVouchers.map((voucher, index) => (
                <tr key={voucher.id} style={styles.tr}>
                  <td style={{...styles.td, textAlign: 'center'}}>{indexOfFirstVoucher + index + 1}</td>
                  <td style={{...styles.td, textAlign: 'center'}}>{voucher.code}</td>
                  <td style={{...styles.td, textAlign: 'center'}}>{(voucher.discount * 100).toFixed(0)}%</td>
                  <td style={{...styles.td, textAlign: 'center'}}>
                    {new Date(voucher.startDate).toLocaleDateString()} - 
                    {new Date(voucher.endDate).toLocaleDateString()}
                  </td>
                  <td style={{...styles.td, textAlign: 'center'}}>{voucher.minimumAmount.toLocaleString()}đ</td>
                  <td style={{...styles.td, textAlign: 'center'}}>
                    <span style={{
                      ...styles.statusBadge,
                      backgroundColor: voucher.isActive ? '#28a745' : '#dc3545'
                    }}>
                      {voucher.isActive ? 'Đang hoạt động' : 'Hết hiệu lực'}
                    </span>
                  </td>
                  <td style={{...styles.td, textAlign: 'center'}}>
                    <button
                      onClick={() => navigation.navigate('EditVoucherScreen', { voucher })}
                      style={styles.editButton}
                    >
                      <FiEdit2 style={styles.buttonIcon} /> Sửa
                    </button>
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
  searchContainer: {
    width: '300px',
  },
  searchInput: {
    width: '100%',
    padding: '8px 12px',
    fontSize: '14px',
    border: '1px solid #ddd',
    borderRadius: '4px',
    outline: 'none',
  },
  addButton: {
    backgroundColor: '#4CAF50',
    color: 'white',
    border: 'none',
    padding: '8px 16px',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '14px',
  },
  tableContainer: {
    backgroundColor: 'white',
    borderRadius: '4px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
    overflow: 'hidden',
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
  },
  td: {
    padding: '12px 8px',
    borderBottom: '1px solid #dee2e6',
  },
  tr: {
    '&:hover': {
      backgroundColor: '#f8f9fa',
    },
  },
  statusBadge: {
    padding: '4px 8px',
    borderRadius: '4px',
    color: 'white',
    fontSize: '14px',
    display: 'inline-block',
  },
  editButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    padding: '6px 12px',
    backgroundColor: '#4CAF50',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    margin: '0 auto',
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

export default VoucherScreen;