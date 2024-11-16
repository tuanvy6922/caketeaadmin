// Mảng màu mở rộng với nhiều màu đẹp và đa dạng
export const COLORS = [
  // Blues
  '#2196F3', // Blue
  '#1976D2', // Dark Blue
  '#64B5F6', // Light Blue
  '#0D47A1', // Navy Blue
  '#4FC3F7', // Sky Blue

  // Greens
  '#4CAF50', // Green
  '#2E7D32', // Dark Green
  '#81C784', // Light Green
  '#00C853', // Bright Green
  '#00BFA5', // Teal

  // Reds
  '#F44336', // Red
  '#C62828', // Dark Red
  '#FF5252', // Bright Red
  '#FF1744', // Pink Red
  '#FF8A80', // Light Red

  // Purples
  '#9C27B0', // Purple
  '#6A1B9A', // Dark Purple
  '#E040FB', // Bright Purple
  '#AA00FF', // Deep Purple
  '#EA80FC', // Light Purple

  // Oranges
  '#FF9800', // Orange
  '#F57C00', // Dark Orange
  '#FFB74D', // Light Orange
  '#FF6D00', // Bright Orange
  '#FFAB40', // Soft Orange

  // Yellows
  '#FFEB3B', // Yellow
  '#F9A825', // Dark Yellow
  '#FFF176', // Light Yellow
  '#FFD600', // Bright Yellow
  '#FFE57F', // Soft Yellow

  // Pinks
  '#E91E63', // Pink
  '#C2185B', // Dark Pink
  '#FF4081', // Bright Pink
  '#F50057', // Deep Pink
  '#FF80AB', // Light Pink

  // Teals
  '#009688', // Teal
  '#00796B', // Dark Teal
  '#4DB6AC', // Light Teal
  '#1DE9B6', // Bright Teal
  '#64FFDA', // Aqua

  // Browns
  '#795548', // Brown
  '#4E342E', // Dark Brown
  '#8D6E63', // Light Brown
  '#6D4C41', // Medium Brown
  '#A1887F', // Soft Brown

  // Grays
  '#9E9E9E', // Gray
  '#616161', // Dark Gray
  '#E0E0E0', // Light Gray
  '#424242', // Deep Gray
  '#BDBDBD', // Soft Gray

  // Indigos
  '#3F51B5', // Indigo
  '#283593', // Dark Indigo
  '#7986CB', // Light Indigo
  '#304FFE', // Bright Indigo
  '#8C9EFF', // Soft Indigo

  // Cyans
  '#00BCD4', // Cyan
  '#0097A7', // Dark Cyan
  '#4DD0E1', // Light Cyan
  '#00E5FF', // Bright Cyan
  '#84FFFF', // Soft Cyan

  // Limes
  '#CDDC39', // Lime
  '#9E9D24', // Dark Lime
  '#DCE775', // Light Lime
  '#AEEA00', // Bright Lime
  '#F4FF81'  // Soft Lime
];

// Hàm tạo màu ngẫu nhiên
export const generateRandomColor = () => {
  const letters = '0123456789ABCDEF';
  let color = '#';
  for (let i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
};

// Định nghĩa các nhóm màu chính
const COLOR_GROUPS = [
  // Mỗi mảng con đại diện cho một nhóm màu riêng biệt
  ['#2196F3', '#1976D2', '#64B5F6', '#0D47A1', '#4FC3F7'], // Blues
  ['#4CAF50', '#2E7D32', '#81C784', '#00C853', '#00BFA5'], // Greens
  ['#F44336', '#C62828', '#FF5252', '#FF1744', '#FF8A80'], // Reds
  ['#9C27B0', '#6A1B9A', '#E040FB', '#AA00FF', '#EA80FC'], // Purples
  ['#FF9800', '#F57C00', '#FFB74D', '#FF6D00', '#FFAB40'], // Oranges
  ['#FFEB3B', '#F9A825', '#FFF176', '#FFD600', '#FFE57F'], // Yellows
  ['#795548', '#4E342E', '#8D6E63', '#6D4C41', '#A1887F'], // Browns
  ['#00BCD4', '#0097A7', '#4DD0E1', '#00E5FF', '#84FFFF'], // Cyans
];

// Hàm lấy màu cho một index cụ thể
export const getColorForIndex = (index) => {
  // Lấy một màu đại diện từ mỗi nhóm màu
  const representativeColors = COLOR_GROUPS.map(group => group[0]);
  
  // Nếu index nằm trong phạm vi của mảng màu đại diện
  if (index < representativeColors.length) {
    return representativeColors[index];
  }
  
  // Nếu vượt quá số lượng nhóm màu, tạo màu ngẫu nhiên
  return generateRandomColor();
};

// Hàm lấy màu ngẫu nhiên từ bảng màu có sẵn
export const getRandomColorFromPalette = () => {
  return COLORS[Math.floor(Math.random() * COLORS.length)];
};

// Hàm tạo màu gradient giữa hai màu
export const createGradientColor = (color1, color2, ratio) => {
  const hex = (x) => {
    x = x.toString(16);
    return x.length === 1 ? '0' + x : x;
  };

  const r1 = parseInt(color1.substring(1, 3), 16);
  const g1 = parseInt(color1.substring(3, 5), 16);
  const b1 = parseInt(color1.substring(5, 7), 16);

  const r2 = parseInt(color2.substring(1, 3), 16);
  const g2 = parseInt(color2.substring(3, 5), 16);
  const b2 = parseInt(color2.substring(5, 7), 16);

  const r = Math.round(r1 * (1 - ratio) + r2 * ratio);
  const g = Math.round(g1 * (1 - ratio) + g2 * ratio);
  const b = Math.round(b1 * (1 - ratio) + b2 * ratio);

  return `#${hex(r)}${hex(g)}${hex(b)}`;
}; 