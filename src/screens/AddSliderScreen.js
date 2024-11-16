import React, { useState } from 'react';
import { db, storage } from '../connect/firebaseConfig';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import Header from '../components/Header';

const AddSliderScreen = ({ navigation }) => {
  const [message, setMessage] = useState({ text: '', type: '' });
  const [imageUrl, setImageUrl] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
      setImageUrl('');
    }
  };

  const handleImageUpload = async (file) => {
    try {
      const timestamp = new Date().getTime();
      const storageRef = ref(storage, `sliders/${timestamp}_${file.name}`);
      await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(storageRef);
      return downloadURL;
    } catch (error) {
      console.error('Error uploading image:', error);
      throw error;
    }
  };

  const handleSave = async () => {
    if (!imageUrl && !imageFile) {
      setMessage({ text: 'Vui lòng chọn ảnh hoặc nhập URL!', type: 'error' });
      return;
    }

    try {
      let finalImageUrl = imageUrl;
      
      if (imageFile) {
        finalImageUrl = await handleImageUpload(imageFile);
      }

      await addDoc(collection(db, 'Sliders'), {
        image: finalImageUrl,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        status: 'active'
      });
      
      setMessage({ text: 'Thêm slider thành công!', type: 'success' });
      
      if (window.confirm('Thêm slider thành công! Bạn có muốn quay lại trang danh sách?')) {
        navigation.navigate('MainApp', { 
          screen: 'SlidersScreen'
        });
      }
    } catch (error) {
      console.error('Error adding slider:', error);
      setMessage({ text: 'Lỗi khi thêm slider!', type: 'error' });
    }
  };

  return (
    <div style={styles.container}>
      <Header />
      <div style={styles.content}>
        <div style={styles.header}>
          <h2 style={styles.title}>Thêm Slider mới</h2>
          <button 
            onClick={() => navigation.goBack()}
            style={styles.backButton}
          >
            Quay lại
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

        <div style={styles.addForm}>
          <input
            type="text"
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
            placeholder="Nhập URL hình ảnh"
            style={styles.input}
          />
          
          <div style={styles.imageUpload}>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              style={styles.fileInput}
              id="imageUpload"
            />
            <label htmlFor="imageUpload" style={styles.uploadButton}>
              Chọn ảnh từ thiết bị
            </label>
          </div>

          {imagePreview && (
            <div style={styles.previewContainer}>
              <img 
                src={imagePreview} 
                alt="Preview" 
                style={styles.imagePreview}
              />
              <button 
                onClick={() => {
                  setImageFile(null);
                  setImagePreview(null);
                }}
                style={styles.removePreview}
              >
                Xóa ảnh
              </button>
            </div>
          )}

          <div style={styles.buttonGroup}>
            <button onClick={handleSave} style={styles.saveButton}>
              Thêm Slider
            </button>
            <button 
              onClick={() => navigation.goBack()} 
              style={styles.cancelButton}
            >
              Hủy
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const styles = {
  container: {
    minHeight: '100vh',
    backgroundColor: '#f8f9fa',
    display: 'flex',
    flexDirection: 'column',
  },
  content: {
    flex: 1,
    maxWidth: '800px',
    margin: '0 auto',
    padding: '20px',
    width: '100%',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '20px',
    marginTop: '20px',
  },
  title: {
    fontSize: '24px',
    margin: 0,
  },
  backButton: {
    padding: '8px 16px',
    backgroundColor: '#6c757d',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
  },
  addForm: {
    display: 'flex',
    flexDirection: 'column',
    gap: '15px',
    backgroundColor: 'white',
    padding: '20px',
    borderRadius: '8px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
  },
  input: {
    padding: '8px 12px',
    borderRadius: '4px',
    border: '1px solid #ddd',
    fontSize: '14px',
  },
  buttonGroup: {
    display: 'flex',
    gap: '10px',
    marginTop: '20px',
  },
  saveButton: {
    padding: '10px 20px',
    backgroundColor: '#28a745',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
  },
  cancelButton: {
    padding: '10px 20px',
    backgroundColor: '#6c757d',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
  },
  message: {
    padding: '10px',
    marginBottom: '20px',
    borderRadius: '4px',
    textAlign: 'center',
  },
  imageUpload: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
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
};

export default AddSliderScreen;
