import React, { useState, useEffect } from 'react';
import { db, auth } from '../connect/firebaseConfig';
import { collection, onSnapshot, query, orderBy, doc, updateDoc, getDoc, getDocs } from 'firebase/firestore';
import Header from '../components/Header';
import BillStats from '../components/bills/BillStats';
import BillFilters from '../components/bills/BillFilters';
import BillTable from '../components/bills/BillTable';
import { formatDate, calculateRevenue, exportToExcel } from '../utils/billUtils';

// Phần hiển thị trang
const Pagination = ({ currentPage, totalPages, onPageChange }) => {
  // Tính toán các trang hiển thị
  const getPageNumbers = () => {
    const delta = 1; // Số trang hiển thị ở mỗi bên của trang hiện tại
    const range = [];
    const rangeWithDots = [];

    // Luôn hiển thị trang đầu
    range.push(1);
    for (let i = currentPage - delta; i <= currentPage + delta; i++) {
      if (i > 1 && i < totalPages) {
        range.push(i);
      }
    }
    // Luôn hiển thị trang cuối nếu không phải trang 1
    if (totalPages > 1) {
      range.push(totalPages);
    }
    // Tạo các dấu chấm để hiển thị các trang không liên tục
    let prev;
    for (const i of range) {
      if (prev) {
        if (i - prev === 2) {
          // Nếu khoảng cách giữa 2 số là 2, thêm số ở giữa
          rangeWithDots.push(prev + 1);
        } else if (i - prev !== 1) {
          // Nếu có khoảng cách, thêm dấu ...
          rangeWithDots.push('...');
        }
      }
      rangeWithDots.push(i);
      prev = i;
    }

    // Trả về các trang hiển thị
    return rangeWithDots;
  };

  return (
    <div style={styles.pagination}>
      <button 
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        style={{
          ...styles.pageButton,
          cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
          opacity: currentPage === 1 ? 0.5 : 1
        }}
      >
        Trước
      </button>
      
      {getPageNumbers().map((pageNumber, index) => (
        <button
          key={index}
          onClick={() => pageNumber !== '...' ? onPageChange(pageNumber) : null}
          style={{
            ...styles.pageButton,
            backgroundColor: currentPage === pageNumber ? '#28a745' : '#fff',
            color: currentPage === pageNumber ? '#fff' : '#000',
            cursor: pageNumber === '...' ? 'default' : 'pointer'
          }}
        >
          {pageNumber}
        </button>
      ))}

      <button 
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        style={{
          ...styles.pageButton,
          cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
          opacity: currentPage === totalPages ? 0.5 : 1
        }}
      >
        Sau
      </button>
    </div>
  );
};

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
  const [selectedMonth, setSelectedMonth] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [currentStaff, setCurrentStaff] = useState(null);
  const [staffFilter, setStaffFilter] = useState('all');
  const [staffList, setStaffList] = useState([]);

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
    applyFilters(bills, query, staffFilter, statusFilter, dateFilter, startDate, endDate);
  };

  const handleStatusFilter = (status) => {
    setStatusFilter(status);
    applyFilters(bills, searchQuery, staffFilter, status, dateFilter, startDate, endDate);
  };

  const handleDateFilter = (date) => {
    setDateFilter(date);
    applyFilters(bills, searchQuery, staffFilter, statusFilter, date, startDate, endDate);
  };

  const handleMonthFilter = (monthYear) => {
    setSelectedMonth(monthYear);
    applyFilters(bills, searchQuery, staffFilter, statusFilter, dateFilter, monthYear, startDate, endDate);
  };

  const handleDateRangeFilter = (start, end) => {
    setStartDate(start);
    setEndDate(end);
    applyFilters(bills, searchQuery, staffFilter, statusFilter, dateFilter, start, end);
  };

  const handleStaffFilter = (staffEmail) => {
    setStaffFilter(staffEmail);
    applyFilters(bills, searchQuery, staffEmail, statusFilter, dateFilter, startDate, endDate);
  };

  // Áp dụng các bộ lọc
  const applyFilters = (billsList, search, staffEmail, status, dateFilter, start, end) => {
    let filtered = [...billsList];

    // Tìm kiếm theo tên khách hàng hoặc email
    if (search) {
      filtered = filtered.filter(bill => 
        bill.fullName?.toLowerCase().includes(search.toLowerCase()) || 
        bill.user?.toLowerCase().includes(search.toLowerCase())
      );
    }

    // Lọc theo nhân viên duyệt
    if (staffEmail !== 'all') {
      filtered = filtered.filter(bill => bill.staffEmail === staffEmail);
    }

    // Lọc theo trạng thái
    if (status !== 'all') {
      filtered = filtered.filter(bill => bill.status === status);
    }

    // Lọc theo khoảng thời gian đã chọn
    if (start && end) {
      const startDateTime = new Date(start);
      startDateTime.setHours(0, 0, 0, 0);
      const endDateTime = new Date(end);
      endDateTime.setHours(23, 59, 59, 999);

      filtered = filtered.filter(bill => {
        const billDate = bill.date?.toDate() || new Date(bill.date);
        return billDate >= startDateTime && billDate <= endDateTime;
      });

      // Tính toán doanh thu cho khoảng thời gian đã chọn
      const filteredRevenue = calculateFilteredRevenue(filtered, start, end);
      setTotalRevenue(filteredRevenue);
    } 
    // Lọc theo các option có sẵn (hôm nay, 7 ngày, 30 ngày)
    else if (dateFilter !== 'all') {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      // Lọc theo khoảng thời gian đã chọn
      filtered = filtered.filter(bill => {
        const billDate = bill.date?.toDate() || new Date(bill.date);
        const billDateTime = new Date(billDate);
        billDateTime.setHours(0, 0, 0, 0);

        switch(dateFilter) {
          case 'today':
            return billDateTime.getTime() === today.getTime();
          case 'week': {
            const lastWeek = new Date(today);
            lastWeek.setDate(lastWeek.getDate() - 7);
            return billDateTime >= lastWeek;
          }
          case 'month': {
            const lastMonth = new Date(today);
            lastMonth.setMonth(lastMonth.getMonth() - 1);
            return billDateTime >= lastMonth;
          }
          default:
            return true;
        }
      });

      // Tính toán doanh thu cho filter có sẵn
      const revenue = calculateRevenue(filtered);
      setTotalRevenue(revenue);
    } else {
      // Nếu không có bất kỳ filter nào
      const revenue = calculateRevenue(filtered);
      setTotalRevenue(revenue);
    }

    setFilteredBills(filtered);
    setCurrentPage(1);
  };

  // Tính toán doanh thu cho các filter có sẵn
  const calculateFilteredRevenue = (billsList, startDate, endDate) => {
    const revenue = {
      today: 0,
      week: 0,
      month: 0,
      total: 0
    };

    // Nếu không có khoảng thời gian đã chọn, trả về doanh thu 0
    if (!startDate || !endDate) return revenue;
    const start = new Date(startDate);
    start.setHours(0, 0, 0, 0);
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999);

    // Tính toán doanh thu cho khoảng thời gian đã chọn
    billsList.forEach(bill => {
      if (bill.status === 'completed') {
        const billDate = bill.date?.toDate() || new Date(bill.date);
        if (billDate >= start && billDate <= end) {
          // Đảm bảo totalAmount là số
          let amount = 0;
          if (typeof bill.totalAmount === 'number') {
            amount = bill.totalAmount;
          } else if (typeof bill.totalAmount === 'string') {
            // Loại bỏ 'đ' và dấu ',' rồi chuyển sang số
            amount = Number(bill.totalAmount.replace(/[đ,]/g, ''));
          }
          revenue.total += amount;
        }
      }
    });

    return revenue;
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
        applyFilters(billsList, searchQuery, staffFilter, statusFilter, dateFilter, startDate, endDate);

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

        // Tính toán doanh thu cho từng đơn hàng
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

  useEffect(() => {
    // Lấy thông tin nhân viên đang đăng nhập
    const fetchStaffInfo = async () => {
      const user = auth.currentUser;
      if (user) {
        const staffDoc = await getDoc(doc(db, 'Staff', user.email));
        if (staffDoc.exists()) {
          setCurrentStaff(staffDoc.data());
        }
      }
    };
    fetchStaffInfo();
  }, []);

  useEffect(() => {
    // Lấy danh sách nhân viên
    const fetchStaffList = async () => {
      const staffCollection = collection(db, 'Staff');
      const staffSnapshot = await getDocs(staffCollection);
      const staffData = staffSnapshot.docs.map(doc => ({
        email: doc.id,
        ...doc.data()
      }));
      setStaffList(staffData);
    };

    fetchStaffList();
  }, []);

  // Cập nhật trạng thái đơn hàng
  const handleStatusChange = async (billId, newStatus) => {
    try {
      if (!currentStaff) {
        setMessage({ text: 'Không tìm thấy thông tin nhân viên!', type: 'error' });
        return;
      }

      // Cập nhật trạng thái đơn hàng
      const updateData = {
        status: newStatus,
        updatedBy: currentStaff.fullName || currentStaff.email,
        updatedAt: new Date(),
        staffEmail: currentStaff.email
      };
      
      await updateDoc(doc(db, 'Bills', billId), updateData);
      setMessage({ text: 'Cập nhật trạng thái thành công!', type: 'success' });
      setTimeout(() => { setMessage({ text: '', type: '' }); }, 2000);
    } catch (error) {
      console.error('Error updating status:', error);
      setMessage({ text: 'Lỗi khi cập nhật trạng thái!', type: 'error' });
      setTimeout(() => { setMessage({ text: '', type: '' }); }, 2000);
    }
  };

  // Cập nhật trạng thái giao hàng
  const handleDeliveryStatusChange = async (billId, newDeliveryStatus) => {
    try {
      if (!currentStaff) {
        setMessage({ text: 'Không tìm thấy thông tin nhân viên!', type: 'error' });
        return;
      }

      // Cập nhật trạng thái giao hàng
      const updateData = {
        deliveryStatus: newDeliveryStatus,
        updatedBy: currentStaff.fullName || currentStaff.email,
        updatedAt: new Date(),
        staffEmail: currentStaff.email
      };

      // Nếu đã giao hàng thì tự động cập nhật trạng thái thành "completed"
      // if (newDeliveryStatus === 'delivered') {
      //   updateData.status = 'completed';
      // }
      
      await updateDoc(doc(db, 'Bills', billId), updateData);
      setMessage({ text: 'Cập nhật quá trình thành công!', type: 'success' });
      setTimeout(() => { setMessage({ text: '', type: '' }); }, 2000);
    } catch (error) {
      console.error('Error updating delivery status:', error);
      setMessage({ text: 'Lỗi khi cập nhật quá trình!', type: 'error' });
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
          staffFilter={staffFilter}
          dateFilter={dateFilter}
          startDate={startDate}
          endDate={endDate}
          handleSearch={handleSearch}
          handleStatusFilter={handleStatusFilter}
          handleStaffFilter={handleStaffFilter}
          handleDateFilter={handleDateFilter}
          handleDateRangeFilter={handleDateRangeFilter}
          exportToExcel={() => exportToExcel(filteredBills, totalRevenue)}
          statusOptions={statusOptions}
          staffList={staffList}
        />
        {/* Hiển thị bảng hóa đơn */}
        <BillTable
          bills={currentBills}
          handleStatusChange={handleStatusChange}
          handleDeliveryStatusChange={handleDeliveryStatusChange}
          onViewBill={(bill) => navigation.navigate('BillDetailScreen', { bill })}
          formatDate={formatDate}
          indexOfFirstBill={indexOfFirstBill}
          currentStaff={currentStaff}
        />
        {/* Phần hiển thị trang */}
        <Pagination 
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />
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
    maxWidth: '1500px',
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
    minWidth: '40px',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    transition: 'all 0.2s',
    '&:hover': {
      backgroundColor: '#e9ecef',
    },
  },
};

export default BillsScreen;
