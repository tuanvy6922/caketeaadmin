import React from 'react';
import { FiShoppingBag, FiUsers, FiShoppingCart, FiGrid } from 'react-icons/fi';

const StatsCards = ({ stats }) => {
  return (
    <div style={styles.statsContainer}>
      <div style={styles.statsCard}>
        <div style={styles.statsIconContainer}>
          <FiShoppingBag style={{...styles.statsIcon, color: '#4CAF50'}} />
        </div>
        <div style={styles.statsInfo}>
          <h3 style={styles.statsTitle}>Hoá đơn</h3>
          <p style={styles.statsValue}>{stats.bills}</p>
        </div>
      </div>

      <div style={styles.statsCard}>
        <div style={styles.statsIconContainer}>
          <FiUsers style={{...styles.statsIcon, color: '#2196F3'}} />
        </div>
        <div style={styles.statsInfo}>
          <h3 style={styles.statsTitle}>Người dùng</h3>
          <p style={styles.statsValue}>{stats.users}</p>
        </div>
      </div>

      <div style={styles.statsCard}>
        <div style={styles.statsIconContainer}>
          <FiShoppingCart style={{...styles.statsIcon, color: '#FFC107'}} />
        </div>
        <div style={styles.statsInfo}>
          <h3 style={styles.statsTitle}>Sản phẩm</h3>
          <p style={styles.statsValue}>{stats.products}</p>
        </div>
      </div>

      <div style={styles.statsCard}>
        <div style={styles.statsIconContainer}>
          <FiGrid style={{...styles.statsIcon, color: '#9C27B0'}} />
        </div>
        <div style={styles.statsInfo}>
          <h3 style={styles.statsTitle}>Danh mục</h3>
          <p style={styles.statsValue}>{stats.categories}</p>
        </div>
      </div>
    </div>
  );
};

const styles = {
  statsContainer: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
    gap: '20px',
    marginBottom: '24px',
  },
  statsCard: {
    backgroundColor: '#fff',
    padding: '24px',
    borderRadius: '12px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.24)',
    display: 'flex',
    alignItems: 'center',
    gap: '20px',
    transition: 'all 0.3s cubic-bezier(.25,.8,.25,1)',
    '&:hover': {
      transform: 'translateY(-5px)',
      boxShadow: '0 14px 28px rgba(0,0,0,0.25), 0 10px 10px rgba(0,0,0,0.22)',
    },
  },
  statsIconContainer: {
    padding: '12px',
    borderRadius: '50%',
    backgroundColor: '#f8fafc',
  },
  statsIcon: {
    fontSize: '24px',
  },
  statsInfo: {
    flex: 1,
  },
  statsTitle: {
    margin: '0 0 8px 0',
    fontSize: '14px',
    color: '#64748b',
  },
  statsValue: {
    margin: 0,
    fontSize: '24px',
    fontWeight: '600',
    color: '#1e293b',
  },
};

export default StatsCards;
