import React, { useState, useEffect } from 'react';
import { db } from '../connect/firebaseConfig';
import { collection, onSnapshot, query, orderBy, doc, updateDoc } from 'firebase/firestore';
import Header from '../components/Header';
import BillStats from '../components/bills/BillStats';
import BillFilters from '../components/bills/BillFilters';
import BillTable from '../components/bills/BillTable';
import { formatDate, calculateRevenue, exportToExcel } from '../utils/billUtils';

const BillsScreen = ({ navigation }) => {
  const [bills, setBills] = useState([]);
  const [filteredBills, setFilteredBills] = useState([]);
  const [message, setMessage] = useState({ text: '', type: '' });
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');
  const billsPerPage = 6;
  const [totalRevenue, setTotalRevenue] = useState({
    today: 0,
    week: 0,
    month: 0,
    total: 0
  });

  const statusOptions = {
    'all': 'Tất cả trạng thái',
    'confirmed': 'Đã xác nhận',
    'completed': 'Hoàn thành',
    'cancelled': 'Đã hủy'
  };

  // Tính toán bills cho trang hiện tại
  const indexOfLastBill = currentPage * billsPerPage;
  const indexOfFirstBill = indexOfLastBill - billsPerPage;
  const currentBills = filteredBills.slice(indexOfFirstBill, indexOfLastBill);
  const totalPages = Math.ceil(filteredBills.length / billsPerPage);

  const handleSearch = (query) => {
    setSearchQuery(query);
    applyFilters(bills, query, statusFilter, dateFilter);
  };

  const handleStatusFilter = (status) => {
    setStatusFilter(status);
    applyFilters(bills, searchQuery, status, dateFilter);
  };

  const handleDateFilter = (date) => {
    setDateFilter(date);
    applyFilters(bills, searchQuery, statusFilter, date);
  };

  const applyFilters = (billsList, search, status, date) => {
    let filtered = [...billsList];

    if (search) {
      filtered = filtered.filter(bill => bill.fullName?.toLowerCase().includes(search.toLowerCase()) || bill.user?.toLowerCase().includes(search.toLowerCase()));
    }

    if (status !== 'all') {
      filtered = filtered.filter(bill => bill.status === status);
    }

    if (date !== 'all') {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      const lastWeek = new Date(today);
      lastWeek.setDate(lastWeek.getDate() - 7);

      filtered = filtered.filter(bill => {
        const billDate = bill.date?.toDate() || new Date(bill.date);
        billDate.setHours(0, 0, 0, 0);

        switch(date) {
          case 'today':
            return billDate.getTime() === today.getTime();
          case 'yesterday':
            return billDate.getTime() === yesterday.getTime();
          case 'week':
            return billDate >= lastWeek;
          default:
            return true;
        }
      });
    }

    setFilteredBills(filtered);
    setCurrentPage(1);
  };

  // Tính toán doanh thu
  const calculateRevenue = (billsList) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const lastWeek = new Date(today);
    lastWeek.setDate(lastWeek.getDate() - 7);
    
    const lastMonth = new Date(today);
    lastMonth.setMonth(lastMonth.getMonth() - 1);

    const revenue = {
      today: 0,
      week: 0,
      month: 0,
      total: 0
    };

    billsList.forEach(bill => {
      if (bill.status !== 'cancelled') {
        const billDate = bill.date?.toDate() || new Date(bill.date);
        const billTotal = bill.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);

        revenue.total += billTotal;

        if (billDate.getTime() >= today.getTime()) {
          revenue.today += billTotal;
        }

        if (billDate.getTime() >= lastWeek.getTime()) {
          revenue.week += billTotal;
        }

        if (billDate.getTime() >= lastMonth.getTime()) {
          revenue.month += billTotal;
        }
      }
    });

    setTotalRevenue(revenue);
  };

  useEffect(() => {
    const billsQuery = query(collection(db, 'Bills'), orderBy('date', 'desc'));
    const unsubscribe = onSnapshot(billsQuery, (snapshot) => {
      try {
        const billsList = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setBills(billsList);
        applyFilters(billsList, searchQuery, statusFilter, dateFilter);

        // Tính toán doanh thu
        const now = new Date();
        const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const endOfToday = new Date(startOfToday);
        endOfToday.setDate(startOfToday.getDate() + 1);
        
        const revenue = {
          today: 0,
          week: 0,
          month: 0,
          total: 0
        };

        billsList.forEach(bill => {
          // Chỉ tính các đơn hàng đã hoàn thành
          if (bill.status === 'completed') {
            const billDate = bill.date?.toDate();
            // Đảm bảo totalAmount là số
            let amount = 0;
            if (typeof bill.totalAmount === 'number') {
              amount = bill.totalAmount;
            } else if (typeof bill.totalAmount === 'string') {
              // Loại bỏ 'đ' và dấu ',' rồi chuyển sang số
              amount = Number(bill.totalAmount.replace(/[đ,]/g, ''));
            }

            // Tổng doanh thu
            revenue.total += amount;

            if (billDate) {
              // Doanh thu hôm nay
              if (billDate >= startOfToday && billDate < endOfToday) {
                revenue.today += amount;
              }

              // Doanh thu 7 ngày
              const sevenDaysAgo = new Date(startOfToday);
              sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
              if (billDate >= sevenDaysAgo) {
                revenue.week += amount;
              }

              // Doanh thu 30 ngày
              const thirtyDaysAgo = new Date(startOfToday);
              thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
              if (billDate >= thirtyDaysAgo) {
                revenue.month += amount;
              }
            }
          }
        });

        setTotalRevenue(revenue);
      } catch (error) {
        console.error('Error processing bills:', error);
        setMessage({ text: 'Lỗi khi xử lý dữ liệu hóa đơn!', type: 'error' });
      }
    });

    return () => unsubscribe();
  }, []);

  const handleStatusChange = async (billId, newStatus) => {
    try {
      await updateDoc(doc(db, 'Bills', billId), { status: newStatus });
      setMessage({ text: 'Cập nhật trạng thái thành công!', type: 'success' });
      setTimeout(() => { setMessage({ text: '', type: '' }); }, 2000);
    } catch (error) {
      console.error('Error updating status:', error);
      setMessage({ text: 'Lỗi khi cập nhật trạng thái!', type: 'error' });
      setTimeout(() => { setMessage({ text: '', type: '' }); }, 2000);
    }
  };

  return (
    <div style={styles.container}>
      <Header />
      <div style={styles.content}>
        {/* Hiển thị thống kê doanh thu */}
        <BillStats totalRevenue={totalRevenue} />
        {/* Hiển thị các bộ lọc dữ liệu */}
        <BillFilters
          searchQuery={searchQuery}
          statusFilter={statusFilter}
          dateFilter={dateFilter}
          handleSearch={handleSearch}
          handleStatusFilter={handleStatusFilter}
          handleDateFilter={handleDateFilter}
          exportToExcel={() => exportToExcel(filteredBills, totalRevenue)}
          statusOptions={statusOptions}
        />
        {/* Hiển thị bảng hóa đơn */}
        <BillTable
          bills={currentBills}
          handleStatusChange={handleStatusChange}
          onViewBill={(bill) => navigation.navigate('BillDetailScreen', { bill })}
          formatDate={formatDate}
          indexOfFirstBill={indexOfFirstBill}
        />
        {/* Phần hiển thị trang */}
        <div style={styles.pagination}>
          <button onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))} 
          disabled={currentPage === 1} style={styles.pageButton}> Trước </button>

          {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
            <button 
            key={page} 
            onClick={() => setCurrentPage(page)} 
            style={{...styles.pageButton, 
              backgroundColor: currentPage === page ? '#4CAF50' : '#fff', color: currentPage === page ? '#fff' : '#333'}}
            >{page}</button>
          ))}
          
          <button onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))} 
          disabled={currentPage === totalPages} style={styles.pageButton}> Sau </button>
        </div>
      </div>

      {/* Hiển thị thông báo */}
      {message.text && (
        <div style={{...styles.messagePopup, 
        backgroundColor: message.type === 'success' ? '#d4edda' : '#f8d7da', 
        color: message.type === 'success' ? '#155724' : '#721c24'}}>{message.text}</div>)}
    </div>
  );
};

const styles = {
  container: {
    minHeight: '100vh',
    backgroundColor: '#f8f9fa',
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
  },
  content: {
    flex: 1,
    padding: '20px',
    maxWidth: '1200px',
    margin: '0 auto',
    width: '100%',
    overflowY: 'auto',
    height: 'calc(100vh - 64px)',
    '&::-webkit-scrollbar': {
      width: '0px',
      background: 'transparent',
    },
    scrollbarWidth: 'none',
    '-ms-overflow-style': 'none',
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
  pagination: {
    display: 'flex',
    justifyContent: 'center',
    gap: '10px',
    marginTop: '20px',
  },
  pageButton: {
    padding: '8px 12px',
    border: '1px solid #dee2e6',
    backgroundColor: '#fff',
    cursor: 'pointer',
    borderRadius: '4px',
  },
};

export default BillsScreen;
