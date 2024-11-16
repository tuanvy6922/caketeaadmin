import React, { useState, useEffect, useRef } from 'react';
import { db } from '../connect/firebaseConfig';
import { collection, addDoc, doc, updateDoc } from 'firebase/firestore';
import Header from '../components/Header';
import { FiSave, FiX, FiSearch } from 'react-icons/fi';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix cho marker icon
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

// Component để handle map click
function LocationMarker({ position, onLocationChange }) {
  useMapEvents({
    click(e) {
      const { lat, lng } = e.latlng;
      onLocationChange(lat, lng);
    },
  });

  // Kiểm tra position có phải là mảng hợp lệ không
  if (!position || !Array.isArray(position) || position.some(isNaN)) {
    return null;
  }

  return <Marker position={position} />;
}

// Định nghĩa các hằng số mặc định (có thể đặt ở file config riêng)
const DEFAULT_CENTER = {
  latitude: '10.762622',  // Tọa độ trung tâm TP.HCM
  longitude: '106.660172'
};

const AddStoreScreen = ({ navigation, route }) => {
  const editingStore = route.params?.store;
  
  const [storeData, setStoreData] = useState({
    name: editingStore?.name || '',
    address: editingStore?.address || '',
    latitude: editingStore ? editingStore.latitude.toString() : DEFAULT_CENTER.latitude,
    longitude: editingStore ? editingStore.longitude.toString() : DEFAULT_CENTER.longitude,
  });

  // Thêm state để theo dõi xem người dùng đã chọn vị trí chưa
  const [hasSelectedLocation, setHasSelectedLocation] = useState(!!editingStore);

  const [message, setMessage] = useState({ text: '', type: '' });
  const [searchQuery, setSearchQuery] = useState('');
  const [mapType, setMapType] = useState('streets'); // 'streets' or 'satellite'
  const mapRef = useRef(null);

  useEffect(() => {
    if (editingStore) {
      setStoreData({
        name: editingStore.name,
        address: editingStore.address,
        latitude: editingStore.latitude.toString(),
        longitude: editingStore.longitude.toString(),
      });
    }
  }, [editingStore]);

  const handleLocationChange = (lat, lng) => {
    setStoreData({
      ...storeData,
      latitude: lat.toString(),
      longitude: lng.toString(),
    });
    setHasSelectedLocation(true);
  };

  const handleSubmit = async () => {
    try {
      if (!storeData.name.trim()) {
        setMessage({ text: 'Vui lòng nhập tên cửa hàng', type: 'error' });
        return;
      }
      if (!storeData.address.trim()) {
        setMessage({ text: 'Vui lòng nhập địa chỉ', type: 'error' });
        return;
      }

      if (!hasSelectedLocation && !editingStore) {
        setMessage({ text: 'Vui lòng chọn vị trí cửa hàng trên bản đồ', type: 'error' });
        return;
      }

      const storeToSave = {
        name: storeData.name,
        address: storeData.address,
        latitude: parseFloat(storeData.latitude),
        longitude: parseFloat(storeData.longitude),
      };

      if (editingStore) {
        await updateDoc(doc(db, 'Store', editingStore.id), storeToSave);
        setMessage({ text: 'Cập nhật cửa hàng thành công!', type: 'success' });
      } else {
        await addDoc(collection(db, 'Store'), storeToSave);
        setMessage({ text: 'Thêm cửa hàng thành công!', type: 'success' });
      }

      setTimeout(() => {
        navigation.goBack();
      }, 1000);
    } catch (error) {
      console.error('Error saving store:', error);
      setMessage({ 
        text: `Lỗi khi ${editingStore ? 'cập nhật' : 'thêm'} cửa hàng!`, 
        type: 'error' 
      });
    }
  };

  const handleSearch = async () => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}`
      );
      const data = await response.json();
      
      if (data.length > 0) {
        const { lat, lon } = data[0];
        setStoreData({
          ...storeData,
          latitude: lat,
          longitude: lon,
        });
        mapRef.current.setView([lat, lon], 15);
      } else {
        setMessage({ text: 'Không tìm thấy địa điểm', type: 'error' });
      }
    } catch (error) {
      console.error('Error searching location:', error);
      setMessage({ text: 'Lỗi khi tìm kiếm địa điểm', type: 'error' });
    }
  };

  return (
    <div style={styles.container}>
      <Header />
      <div style={styles.content}>
        <div style={styles.headerSection}>
          <h1 style={styles.title}>
            {editingStore ? 'Cập nhật cửa hàng' : 'Thêm cửa hàng mới'}
          </h1>
          <button onClick={() => navigation.goBack()} style={styles.closeButton}>
            <FiX style={styles.buttonIcon} />Đóng
          </button>
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

        <div style={styles.formContainer}>
          <div style={styles.formGroup}>
            <label style={styles.label}>Tên cửa hàng:</label>
            <input
              type="text"
              value={storeData.name}
              onChange={(e) => setStoreData({...storeData, name: e.target.value})}
              style={styles.input}
              placeholder="Nhập tên cửa hàng"
            />
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Địa chỉ:</label>
            <input
              type="text"
              value={storeData.address}
              onChange={(e) => setStoreData({...storeData, address: e.target.value})}
              style={styles.input}
              placeholder="Nhập địa chỉ cửa hàng"
            />
          </div>

          <div style={styles.mapContainer}>
            <label style={styles.label}>
              Chọn vị trí trên bản đồ:
              {!hasSelectedLocation && !editingStore && 
                <span style={styles.helperText}> (Vui lòng click chọn vị trí trên bản đồ)</span>
              }
            </label>
            
            {/* Search box */}
            <div style={styles.searchContainer}>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                style={styles.searchInput}
                placeholder="Tìm kiếm địa điểm..."
              />
              <button onClick={handleSearch} style={styles.searchButton}>
                <FiSearch style={styles.buttonIcon} />Tìm
              </button>
            </div>

            {/* Map type selector */}
            <div style={styles.mapTypeContainer}>
              <button
                onClick={() => setMapType('streets')}
                style={{...styles.mapTypeButton,
                  backgroundColor: mapType === 'streets' ? '#4CAF50' : '#6c757d',
                }}>Bản đồ
              </button>
              <button
                onClick={() => setMapType('satellite')}
                style={{
                  ...styles.mapTypeButton,
                  backgroundColor: mapType === 'satellite' ? '#4CAF50' : '#6c757d',
                }}>Vệ tinh
              </button>
            </div>

            <MapContainer
              center={[parseFloat(storeData.latitude), parseFloat(storeData.longitude)]}
              zoom={13}
              style={styles.map}
              ref={mapRef}
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                url={mapType === 'streets' 
                  ? "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  : "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
                }
              />
              <LocationMarker 
                position={[
                  parseFloat(storeData.latitude), 
                  parseFloat(storeData.longitude)
                ]}
                onLocationChange={handleLocationChange}
              />
            </MapContainer>
          </div>

          <div style={styles.formRow}>
            <div style={styles.formGroup}>
              <label style={styles.label}>Vĩ độ:</label>
              <input
                type="number"
                value={storeData.latitude}
                onChange={(e) => setStoreData({...storeData, latitude: e.target.value})}
                style={styles.input}
                step="any"
                readOnly
              />
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Kinh độ:</label>
              <input
                type="number"
                value={storeData.longitude}
                onChange={(e) => setStoreData({...storeData, longitude: e.target.value})}
                style={styles.input}
                step="any"
                readOnly
              />
            </div>
          </div>

          <button 
            onClick={handleSubmit}
            style={styles.submitButton}
          >
            <FiSave style={styles.buttonIcon} />
            {editingStore ? 'Cập nhật' : 'Thêm mới'}
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
    maxWidth: '800px',
    margin: '0 auto',
  },
  headerSection: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '20px',
  },
  title: {
    fontSize: '24px',
    margin: '0',
  },
  closeButton: {
    padding: '8px 16px',
    backgroundColor: '#6c757d',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  formContainer: {
    backgroundColor: 'white',
    padding: '20px',
    borderRadius: '8px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
  },
  formGroup: {
    marginBottom: '16px',
  },
  formRow: {
    display: 'flex',
    gap: '24px',
  },
  label: {
    display: 'block',
    marginBottom: '8px',
    fontWeight: '500',
  },
  input: {
    width: '97%',
    padding: '8px 12px',
    fontSize: '14px',
    border: '1px solid #ddd',
    borderRadius: '4px',
  },
  mapContainer: {
    marginBottom: '20px',
  },
  map: {
    width: '100%',
    height: '400px',
    borderRadius: '4px',
    border: '1px solid #ddd',
  },
  submitButton: {
    backgroundColor: '#4CAF50',
    color: 'white',
    border: 'none',
    padding: '10px 20px',
    borderRadius: '4px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    marginTop: '20px',
  },
  buttonIcon: {
    fontSize: '16px',
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
  searchContainer: {
    display: 'flex',
    gap: '8px',
    marginBottom: '10px',
  },
  searchInput: {
    flex: 1,
    padding: '8px 12px',
    fontSize: '14px',
    border: '1px solid #ddd',
    borderRadius: '4px',
  },
  searchButton: {
    padding: '8px 16px',
    backgroundColor: '#4CAF50',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  mapTypeContainer: {
    display: 'flex',
    gap: '8px',
    marginBottom: '10px',
  },
  mapTypeButton: {
    padding: '8px 16px',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '14px',
  },
  helperText: {
    fontSize: '12px',
    color: '#666',
    fontStyle: 'italic',
    marginLeft: '8px',
  },
};

export default AddStoreScreen;
