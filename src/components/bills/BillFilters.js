import React from 'react';
import { FiDownload } from 'react-icons/fi';

const BillFilters = ({ 
  searchQuery, 
  statusFilter, 
  dateFilter, 
  handleSearch, 
  handleStatusFilter, 
  handleDateFilter,
  exportToExcel,
  statusOptions 
}) => {
  return (
    <div style={styles.filterSection}>
      <div style={styles.leftControls}>
        <div style={styles.searchContainer}>
          <input 
            type="text" 
            placeholder="Tìm kiếm theo tên hoặc email..." 
            value={searchQuery} 
            onChange={(e) => handleSearch(e.target.value)} 
            style={styles.searchInput} 
          />
        </div>
      </div>
      
      <div style={styles.rightControls}>
        <button onClick={exportToExcel} style={styles.exportButton} title="Xuất danh sách hóa đơn">
          <FiDownload style={styles.exportIcon} /> Xuất Excel
        </button>

        <select 
          value={statusFilter} 
          onChange={(e) => handleStatusFilter(e.target.value)} 
          style={styles.filterSelect}
        >
          {Object.entries(statusOptions).map(([value, label]) => (
            <option key={value} value={value}>{label}</option>
          ))}
        </select>

        <select 
          value={dateFilter} 
          onChange={(e) => handleDateFilter(e.target.value)} 
          style={styles.filterSelect}
        >
          <option value="all">Tất cả ngày</option>
          <option value="today">Hôm nay</option>
          <option value="week">7 ngày qua</option>
          <option value="month">30 ngày qua</option>
        </select>
      </div>
    </div>
  );
};

const styles = {
  filterSection: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '20px',
    gap: '20px',
  },
  leftControls: {
    flex: 1,
  },
  rightControls: {
    display: 'flex',
    gap: '10px',
  },
  searchContainer: {
    position: 'relative',
    width: '100%',
    maxWidth: '400px',
  },
  searchInput: {
    width: '100%',
    padding: '8px 12px',
    borderRadius: '4px',
    border: '1px solid #ced4da',
    fontSize: '14px',
  },
  exportButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '5px',
    padding: '8px 16px',
    backgroundColor: '#28a745',
    color: '#fff',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '14px',
  },
  exportIcon: {
    fontSize: '16px',
  },
  filterSelect: {
    padding: '8px 12px',
    borderRadius: '4px',
    border: '1px solid #ced4da',
    fontSize: '14px',
    minWidth: '120px',
  },
};

export default BillFilters; 