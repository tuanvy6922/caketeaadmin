import React, { useState, useEffect } from 'react';
import { db } from '../connect/firebaseConfig';
import { collection, addDoc, doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import Header from '../components/Header';

const AddCategoryScreen = ({ navigation, route }) => {
  const editingCategory = route.params?.category;
  const [categoryName, setCategoryName] = useState('');
  const [message, setMessage] = useState({ text: '', type: '' });

  useEffect(() => {
    if (editingCategory) {
      setCategoryName(editingCategory.name);
    }
  }, [editingCategory]);

  const handleSave = async () => {
    if (!categoryName.trim()) {
      setMessage({ text: 'Vui lòng nhập tên danh mục!', type: 'error' });
      return;
    }

    try {
      if (editingCategory) {
        // Cập nhật danh mục
        const categoryRef = doc(db, 'Category', editingCategory.id);
        await updateDoc(categoryRef, { name: categoryName.trim(), updatedAt: serverTimestamp() });
        setMessage({ text: 'Cập nhật danh mục thành công!', type: 'success' });
      } else {
        // Thêm danh mục mới
        await addDoc(collection(db, 'Category'), {
          name: categoryName.trim(),
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        });
        setMessage({ text: 'Thêm danh mục thành công!', type: 'success' });
      }
      
      if (window.confirm(`${editingCategory ? 'Cập nhật' : 'Thêm'} danh mục thành công! Bạn có muốn quay lại trang danh sách?`)) {
        navigation.navigate('MainApp', { screen: 'CategoryScreen' });
      }
    } catch (error) {
      console.error('Error saving category:', error);
      setMessage({ text: `Lỗi khi ${editingCategory ? 'cập nhật' : 'thêm'} danh mục!`, type: 'error' });
    }
  };

  return (
    <div style={styles.container}>
      <Header />
      <div style={styles.content}>
        <div style={styles.header}>
          <h2 style={styles.title}>{editingCategory ? 'Sửa Danh mục' : 'Thêm Danh mục mới'}</h2>
          <button onClick={() => navigation.goBack()} style={styles.backButton}>Quay lại</button>
        </div>

        {message.text && (
          <div style={{...styles.message, 
            backgroundColor: message.type === 'success' ? '#d4edda' : '#f8d7da', 
            color: message.type === 'success' ? '#155724' : '#721c24'}}>{message.text}
          </div>
        )}

        <div style={styles.addForm}>
          <input
            type="text"
            value={categoryName}
            onChange={(e) => setCategoryName(e.target.value)}
            placeholder="Nhập tên danh mục"
            style={styles.input}
          />
          <div style={styles.buttonGroup}>
            <button onClick={handleSave} style={styles.saveButton}>{editingCategory ? 'Cập nhật' : 'Thêm'} Danh mục </button>
            <button onClick={() => navigation.goBack()} style={styles.cancelButton}>Hủy</button>
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
};

export default AddCategoryScreen;
