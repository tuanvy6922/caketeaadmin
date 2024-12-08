import React, { useState, useEffect } from 'react';
import Header from '../components/Header';
import { db, auth } from '../connect/firebaseConfig';
import { doc, getDoc, collection, query, orderBy, onSnapshot, getCountFromServer, getDocs } from 'firebase/firestore';
import { FiDollarSign, FiShoppingBag, FiUsers, FiGrid, FiShoppingCart } from 'react-icons/fi';
import DashboardCharts from '../components/dashboard/DashboardCharts';
import StatsCards from '../components/dashboard/StatsCards';

const HomeScreen = () => {
  const [adminInfo, setAdminInfo] = useState(null);
  const [totalRevenue, setTotalRevenue] = useState({
    today: 0,
    week: 0,
    month: 0,
    total: 0
  });
  const [chartData, setChartData] = useState({
    daily: [],
    monthly: []
  });
  const [stats, setStats] = useState({
    bills: 0,
    users: 0,
    products: 0,
    categories: 0
  });
  const [topProducts, setTopProducts] = useState([]);
  const [categoryStats, setCategoryStats] = useState([]);

  // Hàm tính doanh thu
  const calculateRevenue = (billsList) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const lastWeek = new Date(today);
    lastWeek.setDate(lastWeek.getDate() - 7);
    
    const lastMonth = new Date(today);
    lastMonth.setDate(lastMonth.getDate() - 30);

    const revenue = {
      today: 0,
      week: 0,
      month: 0,
      total: 0
    };

    billsList.forEach(bill => {
      // Chỉ tính các đơn hàng đã hoàn thành hoặc đã xác nhận
      if (bill.status === 'completed' || bill.status === 'confirmed') {
        const billDate = bill.date?.toDate() || new Date(bill.date);
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

        // Tính doanh thu theo thời gian
        if (billDate >= today) {
          revenue.today += amount;
        }
        if (billDate >= lastWeek) {
          revenue.week += amount;
        }
        if (billDate >= lastMonth) {
          revenue.month += amount;
        }
      }
    });

    setTotalRevenue(revenue);
  };

  // Hàm chuẩn bị dữ liệu cho biểu đồ
  const prepareChartData = (billsList) => {
    // Dữ liệu 7 ngày gần nhất
    const dailyData = new Array(7).fill(0).map((_, index) => {
      const date = new Date();
      date.setDate(date.getDate() - index);
      date.setHours(0, 0, 0, 0);
      
      const dayRevenue = billsList
        .filter(bill => {
          const billDate = bill.date?.toDate() || new Date(bill.date);
          billDate.setHours(0, 0, 0, 0);
          return billDate.getTime() === date.getTime() && 
                 (bill.status === 'completed' || bill.status === 'confirmed');
        })
        .reduce((sum, bill) => {
          const amount = typeof bill.totalAmount === 'number' 
            ? bill.totalAmount 
            : Number(bill.totalAmount.replace(/[đ,]/g, ''));
          return sum + amount;
        }, 0);

      return {
        date: date.toLocaleDateString('vi-VN', { weekday: 'short', day: 'numeric', month: 'numeric' }),
        revenue: dayRevenue
      };
    }).reverse();

    // Dữ liệu 1 tháng gần nhất (30 ngày)
    const monthlyData = new Array(30).fill(0).map((_, index) => {
      const date = new Date();
      date.setDate(date.getDate() - index);
      date.setHours(0, 0, 0, 0);
      
      const dayRevenue = billsList
        .filter(bill => {
          const billDate = bill.date?.toDate() || new Date(bill.date);
          billDate.setHours(0, 0, 0, 0);
          return billDate.getTime() === date.getTime() && 
                 (bill.status === 'completed' || bill.status === 'confirmed');
        })
        .reduce((sum, bill) => {
          const amount = typeof bill.totalAmount === 'number' 
            ? bill.totalAmount 
            : Number(bill.totalAmount.replace(/[đ,]/g, ''));
          return sum + amount;
        }, 0);

      return {
        date: date.toLocaleDateString('vi-VN', { day: 'numeric', month: 'numeric' }),
        revenue: dayRevenue
      };
    }).reverse();

    setChartData({ daily: dailyData, monthly: monthlyData });
  };

  // Hàm tính số lượng sản phẩm đã bán nhiều nhất
  const calculateTopProducts = (billsList) => {
    const productStats = {};
    
    billsList.forEach(bill => {
      if (bill.status !== 'cancelled') {
        bill.items.forEach(item => {
          if (productStats[item.name]) {
            productStats[item.name] += item.quantity;
          } else {
            productStats[item.name] = item.quantity;
          }
        });
      }
    });

    const sortedProducts = Object.entries(productStats)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 3);

    setTopProducts(sortedProducts);
  };

  const calculateCategoryStats = async () => {
    try {
      const productsSnapshot = await getDocs(collection(db, 'Product'));
      const categoryCount = {};

      // Đếm số lượng sản phẩm cho mỗi danh mục
      productsSnapshot.docs.forEach(doc => {
        const product = doc.data();
        const category = product.category; // Sử dụng trường category trực tiếp
        
        if (category) {
          categoryCount[category] = (categoryCount[category] || 0) + 1;
        }
      });

      // Chuyển đổi dữ liệu để hiển thị biểu đồ
      const categoryData = Object.entries(categoryCount).map(([name, value]) => ({name, value}));
      setCategoryStats(categoryData);
    } catch (error) {
      console.error('Error calculating category stats:', error);
    }
  };

  useEffect(() => {
    // Lấy thông tin admin
    const fetchAdminInfo = async () => {
      try {
        const user = auth.currentUser;
        if (user) {
          const userDoc = await getDoc(doc(db, 'USERS', user.email));
          if (userDoc.exists()) {
            setAdminInfo(userDoc.data());
          }
        }
      } catch (error) {
        console.error('Error fetching admin info:', error);
      }
    };

    // Lấy dữ liệu hóa đơn
    const billsQuery = query(collection(db, 'Bills'), orderBy('date', 'desc'));
    const unsubscribe = onSnapshot(billsQuery, (snapshot) => {
      try {
        const billsList = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        calculateRevenue(billsList);
        prepareChartData(billsList);
        calculateTopProducts(billsList);
      } catch (error) {
        console.error('Error processing bills:', error);
      }
    });

    // Thêm hàm lấy thống kê
    const fetchStats = async () => {
      try {
        const billsSnapshot = await getCountFromServer(collection(db, 'Bills'));
        const usersSnapshot = await getCountFromServer(collection(db, 'USERS'));
        const productsSnapshot = await getCountFromServer(collection(db, 'Product'));
        const categoriesSnapshot = await getCountFromServer(collection(db, 'Category'));

        setStats({
          bills: billsSnapshot.data().count,
          users: usersSnapshot.data().count,
          products: productsSnapshot.data().count,
          categories: categoriesSnapshot.data().count
        });
      } catch (error) {
        console.error('Error fetching stats:', error);
      }
    };

    fetchAdminInfo();
    fetchStats();
    calculateCategoryStats();
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    // Theo dõi bills cho doanh thu và biểu đồ doanh thu
    const unsubscribeBillsRevenue = onSnapshot(
      query(collection(db, 'Bills'), orderBy('date', 'desc')), 
      (snapshot) => {
        try {
          const billsList = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          }));
          calculateRevenue(billsList);
          prepareChartData(billsList);
        } catch (error) {
          console.error('Error processing revenue data:', error);
        }
      }
    );

    return () => unsubscribeBillsRevenue();
  }, []);

  useEffect(() => {
    // Theo dõi Product và Bills cho stats, category stats và top products
    const unsubscribeProducts = onSnapshot(collection(db, 'Product'), (snapshot) => {
      try {
        setStats(prev => ({
          ...prev,
          products: snapshot.size
        }));

        const categoryCount = {};
        snapshot.docs.forEach(doc => {
          const product = doc.data();
          const category = product.category;
          
          if (category) {
            categoryCount[category] = (categoryCount[category] || 0) + 1;
          }
        });

        const categoryData = Object.entries(categoryCount)
          .map(([name, value]) => ({
            name,
            value,
            color: getColorForIndex(Object.keys(categoryCount).indexOf(name))
          }))
          .sort((a, b) => b.value - a.value);

        setCategoryStats(categoryData);
      } catch (error) {
        console.error('Error updating category stats:', error);
      }
    });

    const unsubscribeBillsStats = onSnapshot(collection(db, 'Bills'), (snapshot) => {
      const billsList = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      setStats(prev => ({
        ...prev,
        bills: snapshot.size
      }));

      const productStats = {};
      billsList.forEach(bill => {
        if (bill.status !== 'cancelled') {
          bill.items.forEach(item => {
            productStats[item.name] = (productStats[item.name] || 0) + item.quantity;
          });
        }
      });

      const sortedProducts = Object.entries(productStats)
        .map(([name, value]) => ({
          name,
          value,
          color: getColorForIndex(Object.keys(productStats).indexOf(name))
        }))
        .sort((a, b) => b.value - a.value)
        .slice(0, 3);

      setTopProducts(sortedProducts);
    });

    return () => {
      unsubscribeProducts();
      unsubscribeBillsStats();
    };
  }, []);

  return (
    <div style={styles.container}>
      <Header />
      <div style={styles.content}>
        {/* Tổng doanh thu */}
        <div style={styles.revenueSummary}>
          <div style={styles.revenueCard}>
            <FiDollarSign style={styles.revenueIcon} />
            <div>
              <h3 style={styles.revenueLabel}>Hôm nay</h3>
              <p style={styles.revenueValue}>{totalRevenue.today.toLocaleString('vi-VN')}đ</p>
            </div>
          </div>
          <div style={styles.revenueCard}>
            <FiDollarSign style={styles.revenueIcon} />
            <div>
              <h3 style={styles.revenueLabel}>7 Ngày qua</h3>
              <p style={styles.revenueValue}>{totalRevenue.week.toLocaleString('vi-VN')}đ</p>
            </div>
          </div>
          <div style={styles.revenueCard}>
            <FiDollarSign style={styles.revenueIcon} />
            <div>
              <h3 style={styles.revenueLabel}>30 Ngày qua</h3>
              <p style={styles.revenueValue}>{totalRevenue.month.toLocaleString('vi-VN')}đ</p>
            </div>
          </div>
          <div style={styles.revenueCard}>
            <FiDollarSign style={styles.revenueIcon} />
            <div>
              <h3 style={styles.revenueLabel}>Tổng doanh thu</h3>
              <p style={styles.revenueValue}>{totalRevenue.total.toLocaleString('vi-VN')}đ</p>
            </div>
          </div>
        </div>

        {/* Thống kê */}
        <StatsCards stats={stats} />

        {/* Biểu đồ */}
        <DashboardCharts 
          chartData={chartData}
          topProducts={topProducts}
          categoryStats={categoryStats}
        />
      </div>
    </div>
  );
};

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    height: '100vh',
    width: '100%',
    overflow: 'hidden',
    backgroundColor: '#f8fafc',
  },
  content: {
    flex: 1,
    padding: '24px',
    overflowY: 'auto',
  },
  revenueSummary: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
    gap: '16px',
    marginBottom: '20px',
  },
  revenueCard: {
    backgroundColor: '#fff',
    padding: '16px',
    borderRadius: '8px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.24)',
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
  },
  revenueIcon: {
    fontSize: '24px',
    padding: '8px',
    backgroundColor: '#E8F5E9',
    borderRadius: '50%',
  },
  revenueLabel: {
    fontSize: '14px',
    color: '#64748b',
    margin: '0 0 8px 0',
  },
  revenueValue: {
    fontSize: '20px',
    fontWeight: '600',
    color: '#1e293b',
    margin: 0,
  },
};

export default HomeScreen;