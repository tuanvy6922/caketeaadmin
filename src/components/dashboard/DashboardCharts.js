import React from 'react';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { getColorForIndex, COLORS } from '../../utils/colorUtils';

const DashboardCharts = ({ chartData, topProducts, categoryStats }) => {
  const topProductsWithColors = topProducts.map((product, index) => ({
    ...product,
    color: product.color || getColorForIndex(index)
  }));

  const categoryStatsWithColors = categoryStats.map((category, index) => ({
    ...category,
    color: category.color || getColorForIndex(index)
  }));

  const renderPieChart = () => (
    <div style={styles.chartCard}>
      <h3 style={styles.chartTitle}>Top 3 Sản phẩm bán chạy</h3>
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={topProductsWithColors}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
            outerRadius={80}
            fill="#8884d8"
            dataKey="value"
          >
            {topProductsWithColors.map((entry, index) => (
              <Cell 
                key={`cell-${index}`} 
                fill={entry.color}
              />
            ))}
          </Pie>
          <Tooltip 
            formatter={(value, name) => [`${value} sản phẩm`, name]}
            contentStyle={{ backgroundColor: '#fff', borderRadius: '8px' }}
          />
          <Legend 
            formatter={(value, entry) => (
              <span style={{ color: entry.color }}>{value}</span>
            )}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );

  const renderBarChart = () => (
    <div style={styles.chartCard}>
      <h3 style={styles.chartTitle}>Sản phẩm theo danh mục</h3>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart
          data={categoryStatsWithColors}
          layout="vertical"
          margin={{ top: 5, right: 30, left: 100, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis type="number" />
          <YAxis 
            type="category" 
            dataKey="name" 
            width={90}
            tick={{ fontSize: 12 }}
          />
          <Tooltip 
            formatter={(value) => [`${value} sản phẩm`]}
            contentStyle={{ backgroundColor: '#fff', borderRadius: '8px' }}
          />
          <Legend />
          <Bar dataKey="value" name="Số lượng">
            {categoryStatsWithColors.map((entry, index) => (
              <Cell 
                key={`cell-${index}`} 
                fill={entry.color}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );

  return (
    <div style={styles.chartsContainer}>
      <div style={styles.mainCharts}>
        <div style={styles.chartCard}>
          <h3 style={styles.chartTitle}>Doanh thu 7 ngày gần nhất</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData.daily}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip formatter={(value) => `${value.toLocaleString('vi-VN')}đ`} />
              <Legend />
              <Bar dataKey="revenue" name="Doanh thu" fill={COLORS[0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div style={styles.chartCard}>
          <h3 style={styles.chartTitle}>Doanh thu 30 ngày gần nhất</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData.monthly}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip formatter={(value) => `${value.toLocaleString('vi-VN')}đ`} />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="revenue" 
                name="Doanh thu" 
                stroke={COLORS[1]}
                strokeWidth={2} 
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
      <div style={styles.sideCharts}>
        {renderPieChart()}
        {renderBarChart()}
      </div>
    </div>
  );
};

const styles = {
  chartsContainer: {
    display: 'grid',
    gridTemplateColumns: '3fr 2fr',
    gap: '20px',
    '@media (max-width: 1200px)': {
      gridTemplateColumns: '1fr',
    },
  },
  mainCharts: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
  },
  sideCharts: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
  },
  chartCard: {
    backgroundColor: '#fff',
    padding: '20px',
    borderRadius: '12px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.24)',
    flex: 1,
    minHeight: '400px',
  },
  chartTitle: {
    fontSize: '18px',
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: '24px',
    textAlign: 'left',
  },
};

export default DashboardCharts; 