import React, { useState } from 'react';
import { db, storage } from '../connect/firebaseConfig';
import { collection, deleteDoc, doc, onSnapshot } from 'firebase/firestore';
import { ref, getDownloadURL, deleteObject } from 'firebase/storage';
import { useFocusEffect } from '@react-navigation/native';
import Header from '../components/Header';
import { FiTrash2 } from 'react-icons/fi';

const SlidersScreen = ({ navigation }) => {
  const [sliders, setSliders] = useState([]);
  const [message, setMessage] = useState({ text: '', type: '' });
  const [currentPage, setCurrentPage] = useState(1);
  const slidersPerPage = 8;

  // Tính toán slider cho trang hiện tại
  const indexOfLastSlider = currentPage * slidersPerPage;
  const indexOfFirstSlider = indexOfLastSlider - slidersPerPage;
  const currentSliders = sliders.slice(indexOfFirstSlider, indexOfLastSlider);
  const totalPages = Math.ceil(sliders.length / slidersPerPage);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  useFocusEffect(
    React.useCallback(() => {
      const unsubscribe = onSnapshot(
        collection(db, 'Sliders'),
        async (snapshot) => {
          try {
            const slidersPromises = snapshot.docs.map(async doc => {
              const sliderData = doc.data();
              const imageUrl = await getImageUrl(sliderData.image);
              
              return {
                id: doc.id,
                ...sliderData,
                imageUrl: imageUrl || sliderData.image,
                createdAt: sliderData.createdAt?.toDate() || new Date()
              };
            });

            const slidersList = await Promise.all(slidersPromises);
            
            const sortedSliders = slidersList.sort((a, b) => {
              return b.createdAt - a.createdAt;
            });
            
            setSliders(sortedSliders);
          } catch (error) {
            console.error('Error processing sliders:', error);
            setMessage({ text: 'Lỗi khi xử lý dữ liệu slider!', type: 'error' });
          }
        },
        (error) => {
          console.error('Error listening to sliders:', error);
          setMessage({ text: 'Lỗi khi theo dõi dữ liệu slider!', type: 'error' });
        }
      );

      return () => unsubscribe();
    }, [])
  );

  const getImageUrl = async (imagePath) => {
    try {
      const cleanImagePath = imagePath.startsWith('sliders/') 
        ? imagePath 
        : `sliders/${imagePath}`;
      
      const pathWithoutQuery = cleanImagePath.split('?')[0];
      
      const imageRef = ref(storage, pathWithoutQuery);
      const url = await getDownloadURL(imageRef);
      return url;
    } catch (error) {
      console.error('Error getting image URL:', error);
      return null;
    }
  };

  const handleDeleteSlider = async (sliderId) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa slider này?')) {
      try {
        // Tìm slider cần xóa
        const sliderToDelete = sliders.find(s => s.id === sliderId);
        
        // Cập nhật UI trước
        setSliders(prevSliders => 
          prevSliders.filter(s => s.id !== sliderId)
        );
        
        // Xóa ảnh từ Storage
        if (sliderToDelete.image) {
          try {
            let imagePath = sliderToDelete.image;
            
            if (imagePath.includes('firebasestorage.googleapis.com')) {
              const slidersIndex = imagePath.indexOf('/sliders/');
              if (slidersIndex !== -1) {
                imagePath = 'sliders/' + imagePath.substring(slidersIndex + 9).split('?')[0];
              }
            } else {
              imagePath = imagePath.startsWith('sliders/') ? imagePath : `sliders/${imagePath}`;
            }
            
            console.log('Đường dẫn ảnh cần xóa:', imagePath);
            const imageRef = ref(storage, imagePath);
            
            await deleteObject(imageRef);
            console.log('Đã xóa ảnh thành công');
          } catch (storageError) {
            console.error('Lỗi khi xóa ảnh:', storageError);
          }
        }

        // Xóa slider từ Firestore
        await deleteDoc(doc(db, 'Sliders', sliderId));
        
        setMessage({ text: 'Xóa slider thành công!', type: 'success' });
        
        setTimeout(() => {
          setMessage({ text: '', type: '' });
        }, 3000);

      } catch (error) {
        console.error('Error deleting slider:', error);
        setMessage({ text: 'Lỗi khi xóa slider!', type: 'error' });
      }
    }
  };

  return (
    <div style={styles.container}>
      <Header />
      <div style={styles.content}>
        <div style={styles.headerSection}>
          <h1 style={styles.title}>Quản lý Slider</h1>
          <button 
            onClick={() => navigation.navigate('AddSliderScreen')}
            style={styles.addButton}
          >
            + Thêm Slider
          </button>
        </div>

        {message.text && (
          <div style={{
            ...styles.message,
            backgroundColor: message.type === 'success' ? '#d4edda' : '#f8d7da',
            color: message.type === 'success' ? '#155724' : '#721c24'
          }}>
            {message.text}
          </div>
        )}

        <div style={styles.sliderListContainer}>
          <div style={styles.sliderGrid}>
            {currentSliders.map((slider) => (
              <div key={slider.id} style={styles.sliderItem}>
                <img 
                  src={slider.imageUrl || slider.image} 
                  alt="Slider" 
                  style={styles.sliderImage}
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = 'placeholder-image-url';
                  }}
                />
                <button
                  onClick={() => handleDeleteSlider(slider.id)}
                  style={styles.deleteButton}
                >
                  <FiTrash2 style={styles.buttonIcon} />
                  Xóa
                </button>
              </div>
            ))}
          </div>

          {/* Phân trang */}
          <div style={styles.pagination}>
            <button 
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              style={{
                ...styles.pageButton,
                opacity: currentPage === 1 ? 0.5 : 1
              }}
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
                  color: currentPage === index + 1 ? '#fff' : '#333'
                }}
              >
                {index + 1}
              </button>
            ))}
            
            <button 
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              style={{
                ...styles.pageButton,
                opacity: currentPage === totalPages ? 0.5 : 1
              }}
            >
              Sau
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Thêm styles cho phân trang
const styles = {
  container: {
    minHeight: '100vh',
    backgroundColor: '#f8f9fa',
    display: 'flex',
    flexDirection: 'column',
  },
  title: {
    fontSize: '24px',
    fontWeight: '500',
    color: '#2c3e50',
    margin: 0,
  },
  addForm: {
    marginBottom: '20px',
    display: 'flex',
    gap: '10px',
  },
  input: {
    padding: '8px',
    flex: 1,
    borderRadius: '4px',
    border: '1px solid #ddd',
  },
  addButton: {
    padding: '8px 16px',
    backgroundColor: '#007bff',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
  },
  sliderGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
    gap: '20px',
  },
  sliderItem: {
    border: '1px solid #ddd',
    borderRadius: '8px',
    overflow: 'hidden',
    position: 'relative',
  },
  sliderImage: {
    width: '100%',
    height: '200px',
    objectFit: 'cover',
  },
  deleteButton: {
    position: 'absolute',
    bottom: '10px',
    right: '10px',
    padding: '5px 10px',
    backgroundColor: '#dc3545',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '5px',
  },
  message: {
    padding: '10px',
    marginBottom: '20px',
    borderRadius: '4px',
    textAlign: 'center',
  },
  content: {
    flex: 1,
    padding: '20px',
    maxWidth: '1200px',
    margin: '0 auto',
    width: '100%',
  },
  sliderListContainer: {
    flex: 1,
    overflowY: 'auto',
    padding: '10px',
    backgroundColor: '#f8f9fa',
    borderRadius: '8px',
  },
  imageUpload: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    marginTop: '10px',
  },
  fileInput: {
    display: 'none',
  },
  uploadButton: {
    padding: '8px 16px',
    backgroundColor: '#4CAF50',
    color: 'white',
    borderRadius: '4px',
    cursor: 'pointer',
    display: 'inline-block',
  },
  previewContainer: {
    position: 'relative',
    width: '200px',
    marginTop: '10px',
  },
  imagePreview: {
    width: '100%',
    height: 'auto',
    borderRadius: '4px',
  },
  removePreview: {
    position: 'absolute',
    top: '5px',
    right: '5px',
    padding: '5px 10px',
    backgroundColor: 'rgba(220, 53, 69, 0.8)',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
  },
  headerSection: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '20px',
  },
  addButton: {
    backgroundColor: '#4CAF50',
    color: 'white',
    border: 'none',
    padding: '10px 20px',
    borderRadius: '6px',
    fontSize: '14px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  pagination: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    gap: '10px',
    padding: '20px 0',
    marginTop: '20px',
    borderTop: '1px solid #eee',
  },
  pageButton: {
    padding: '8px 16px',
    border: '1px solid #ddd',
    borderRadius: '4px',
    backgroundColor: '#fff',
    cursor: 'pointer',
    transition: 'all 0.2s',
    ':hover': {
      backgroundColor: '#f8f9fa',
    },
    ':disabled': {
      cursor: 'not-allowed',
    }
  },
  buttonIcon: {
    fontSize: '16px',
  },
};

export default SlidersScreen;
