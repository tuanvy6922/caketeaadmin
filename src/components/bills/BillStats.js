import React from 'react';
import { FiDollarSign } from 'react-icons/fi';

const BillStats = ({ totalRevenue }) => {
  const stats = [
    { label: 'Hôm nay', value: totalRevenue.today },
    { label: '7 ngày qua', value: totalRevenue.week },
    { label: '30 ngày qua', value: totalRevenue.month },
    { label: 'Tổng doanh thu', value: totalRevenue.total },
  ];

  return (
    <div style={styles.statsContainer}>
      {stats.map((stat) => (
        <div key={stat.label} style={styles.statCard}>
          <div style={styles.statIcon}><FiDollarSign/></div>
          <div style={styles.statInfo}>
            <div style={styles.statLabel}>{stat.label}</div>
            <div style={styles.statValue}>{stat.value.toLocaleString('vi-VN')}đ</div>
          </div>
        </div>
      ))}
    </div>
  );
};

const styles = {
  statsContainer: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '20px',
    marginBottom: '20px',
  },
  statCard: {
    backgroundColor: '#fff',
    padding: '20px',
    borderRadius: '8px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    display: 'flex',
    alignItems: 'center',
    gap: '15px',
  },
  statIcon: {
    backgroundColor: '#e9ecef',
    padding: '10px',
    borderRadius: '50%',
    color: '#495057',
  },
  statInfo: {
    flex: 1,
  },
  statLabel: {
    color: '#6c757d',
    fontSize: '14px',
    marginBottom: '5px',
  },
  statValue: {
    color: '#212529',
    fontSize: '18px',
    fontWeight: 'bold',
  },
};

export default BillStats; 