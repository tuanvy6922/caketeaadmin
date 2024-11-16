import React, { useState, useEffect } from 'react';
import { db } from '../connect/firebaseConfig';
import { collection, addDoc, doc, updateDoc, serverTimestamp, getDocs, onSnapshot } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { storage } from '../connect/firebaseConfig';
import Header from '../components/Header';

const AddProductScreen = ({ navigation, route }) => {
  const editingProduct = route.params?.product;
  const [message, setMessage] = useState({ text: '', type: '' });
  const [newProduct, setNewProduct] = useState({
    name: '',
    price: { S: '', M: '', L: '' },
    description: '',
    imagelink_square: '',
    category: '',
    ingredients: '',
    complexity: '',
    special_ingredient: '',
    type: ''
  });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    if (editingProduct) {
      setNewProduct(editingProduct);
    }
  }, [editingProduct]);

  useEffect(() => {
    const unsubscribe = onSnapshot(
      collection(db, 'Category'),
      (snapshot) => {
        try {
          const categoriesList = snapshot.docs.map(doc => ({
            id: doc.id,
            name: doc.data().name
          }));
          setCategories(categoriesList);
        } catch (error) {
          console.error('Error loading categories:', error);
          setMessage({ text: 'Lỗi khi tải danh mục!', type: 'error' });
        }
      }
    );

    return () => unsubscribe();
  }, []);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.type.match('image.*')) {
        setMessage({ text: 'Vui lòng chọn file ảnh!', type: 'error' });
        return;
      }

      if (file.size > 5 * 1024 * 1024) {
        setMessage({ text: 'Kích thước ảnh quá lớn! Vui lòng chọn ảnh nhỏ hơn 5MB', type: 'error' });
        return;
      }

      if (imagePreview) {
        URL.revokeObjectURL(imagePreview);
      }

      setImageFile(file);
      const objectUrl = URL.createObjectURL(file);
      setImagePreview(objectUrl);
    }
  };
  // Upload ảnh lên Firebase Storage
  const handleImageUpload = async (file) => {
    try {
      const timestamp = new Date().getTime();
      const storageRef = ref(storage, `posts/${timestamp}_${file.name}`);
      await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(storageRef);
      return downloadURL;
    } catch (error) {
      console.error('Error uploading image:', error);
      throw error;
    }
  };

  const handleResetForm = async () => {
    return new Promise((resolve) => {
      setNewProduct({
        name: '',
        price: { S: '', M: '', L: '' },
        description: '',
        imagelink_square: '',
        category: '',
        ingredients: '',
        complexity: '',
        special_ingredient: '',
        type: ''
      });

      // Xóa preview URL và cleanup
      if (imagePreview) {
        URL.revokeObjectURL(imagePreview);
      }
      
      setImageFile(null);
      setImagePreview(null);
      setMessage({ text: '', type: '' });

      // Reset file input nếu tồn tại
      const fileInput = document.getElementById('imageUpload');
      if (fileInput) {
        fileInput.value = '';
      }

      resolve();
    });
  };

  const handleSave = async () => {
    if (!newProduct.name || !newProduct.price.M || (!newProduct.imagelink_square && !imageFile)) {
      setMessage({ text: 'Vui lòng điền đầy đủ thông tin!', type: 'error' });
      return;
    }

    try {
      let imageUrl = newProduct.imagelink_square;
      
      if (imageFile) {
        // Nếu đang sửa sản phẩm và có ảnh cũ, xóa ảnh cũ trước
        if (editingProduct && editingProduct.imagelink_square) {
          try {
            let oldImagePath = editingProduct.imagelink_square;
            
            // Xử lý đường dẫn ảnh cũ
            if (oldImagePath.includes('firebasestorage.googleapis.com')) {
              const postsIndex = oldImagePath.indexOf('/posts/');
              if (postsIndex !== -1) {
                oldImagePath = 'posts/' + oldImagePath.substring(postsIndex + 7).split('?')[0];
              }
            } else {
              oldImagePath = oldImagePath.startsWith('posts/') ? oldImagePath : `posts/${oldImagePath}`;
            }
            
            const oldImageRef = ref(storage, oldImagePath);
            await deleteObject(oldImageRef);
            console.log('Đã xóa ảnh cũ thành công');
          } catch (error) {
            console.error('Lỗi khi xóa ảnh cũ:', error);
          }
        }
        
        // Upload ảnh mới
        imageUrl = await handleImageUpload(imageFile);
      }

      if (editingProduct) {
        // Cập nhật sản phẩm
        const productRef = doc(db, 'Product', editingProduct.id);
        await updateDoc(productRef, {
          ...newProduct,
          imagelink_square: imageUrl,
          price: {
            S: Number(newProduct.price.S),
            M: Number(newProduct.price.M),
            L: Number(newProduct.price.L)
          },
          updatedAt: serverTimestamp()
        });
        
        setMessage({ text: 'Cập nhật sản phẩm thành công!', type: 'success' });
        // Chỉ ẩn message sau 2 giây, không reset form
        setTimeout(() => {
          setMessage({ text: '', type: '' });
        }, 2000);
        
      } else {
        // Thêm sản phẩm mới
        const productsRef = collection(db, 'Product');
        const productsSnapshot = await getDocs(productsRef);
        const products = productsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));

        let maxIndex = -1;
        products.forEach(product => {
          if (product.index > maxIndex) {
            maxIndex = product.index;
          }
        });

        const newIndex = maxIndex + 1;

        await addDoc(collection(db, 'Product'), {
          ...newProduct,
          imagelink_square: imageUrl,
          index: newIndex,
          price: {
            S: Number(newProduct.price.S),
            M: Number(newProduct.price.M),
            L: Number(newProduct.price.L)
          },
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
          status: 'active'
        });

        setMessage({ text: 'Thêm sản phẩm thành công!', type: 'success' });
        // Reset form sau 2 giây chỉ khi thêm mới
        setTimeout(async () => {
          await handleResetForm();
          setMessage({ text: '', type: '' });
        }, 2000);
      }

    } catch (error) {
      console.error('Error saving product:', error);
      setMessage({ text: 'Có lỗi xảy ra khi lưu sản phẩm!', type: 'error' });
    }
  };

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      // Reset toàn bộ form và image state khi focus vào màn hình
      if (!editingProduct) {
        if (imagePreview) {
          URL.revokeObjectURL(imagePreview);
        }
        setImageFile(null);
        setImagePreview(null);
        
        const fileInput = document.getElementById('imageUpload');
        if (fileInput) {
          fileInput.value = '';
        }
        
        handleResetForm();
      }
    });

    return () => {
      unsubscribe();
    };
  }, [navigation, editingProduct]);

  // Định nghĩa options với cả tiếng Anh và tiếng Việt
  const complexityOptions = [
    { value: 'Simple', label: 'Đơn giản' },
    { value: 'Medium', label: 'Trung bình' },
    { value: 'Complex', label: 'Phức tạp' },
    { value: 'Very Complex', label: 'Rất phức tạp' }
  ];

  const handleRemoveImage = () => {
    const fileInput = document.getElementById('imageUpload');
    if (fileInput) {
      fileInput.value = '';
    }
    
    if (imagePreview) {
      URL.revokeObjectURL(imagePreview);
    }
    
    setImageFile(null);
    setImagePreview(null);
    setNewProduct(prev => ({
      ...prev,
      imagelink_square: ''
    }));
  };

  // Thêm useEffect mới để xử lý cleanup khi component unmount
  useEffect(() => {
    return () => {
      if (imagePreview) {
        URL.revokeObjectURL(imagePreview);
      }
      setImageFile(null);
      setImagePreview(null);
      
      const fileInput = document.getElementById('imageUpload');
      if (fileInput) {
        fileInput.value = '';
      }
    };
  }, []);

  // Thêm logic để thay đổi màu theo type của message
  const getMessageStyle = (type) => ({
    ...styles.floatingMessage,
    backgroundColor: type === 'error' ? '#dc3545' : '#4CAF50', // Đỏ cho lỗi, xanh cho thành công
  });

  return (
    <div style={styles.container}>
      <Header />
      <div style={styles.content}>
        <div style={styles.header}>
          <h2 style={styles.title}> {editingProduct ? 'Sửa sản phẩm' : 'Thêm sản phẩm mới'} </h2>
          <button onClick={() => navigation.goBack()} style={styles.backButton}> Quay lại </button>
        </div>

        {message.text && (
          <div style={getMessageStyle(message.type)}>{message.text}</div>
        )}

        <div style={styles.addForm}>
          <input
            type="text"
            value={newProduct.name}
            onChange={(e) => setNewProduct({...newProduct, name: e.target.value})}
            placeholder="Tên sản phẩm"
            style={styles.input}
          />

          <div style={styles.priceInputs}>
            <input
              type="number"
              value={newProduct.price.S}
              onChange={(e) => setNewProduct({...newProduct, price: {...newProduct.price, S: e.target.value}})}
              placeholder="Giá size S"
              style={styles.input}
            />
            <input
              type="number"
              value={newProduct.price.M}
              onChange={(e) => setNewProduct({...newProduct, price: {...newProduct.price, M: e.target.value}})}
              placeholder="Giá size M"
              style={styles.input}
            />
            <input
              type="number"
              value={newProduct.price.L}
              onChange={(e) => setNewProduct({...newProduct, price: {...newProduct.price, L: e.target.value}})}
              placeholder="Giá size L"
              style={styles.input}
            />
          </div>

          <textarea
            value={newProduct.description}
            onChange={(e) => setNewProduct({...newProduct, description: e.target.value})}
            placeholder="Mô tả sản phẩm"
            style={{...styles.input, minHeight: '100px'}}
          />

          <div style={styles.imageSection}>
            <input
              type="text"
              value={newProduct.imagelink_square}
              onChange={(e) => setNewProduct({...newProduct, imagelink_square: e.target.value})}
              placeholder="URL hình ảnh"
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
              <label htmlFor="imageUpload" style={styles.uploadButton}>Chọn ảnh từ thiết bị</label>
            </div>
            {imagePreview && (
              <div style={styles.previewContainer}>
                <img 
                  src={imagePreview} 
                  alt="Preview" 
                  style={styles.imagePreview}
                  onError={(e) => {
                    console.error('Image preview error:', e);
                    setMessage({ text: 'Lỗi hiển thị ảnh preview!', type: 'error' });
                  }}
                />
                <button 
                  onClick={handleRemoveImage}
                  style={styles.removePreview}
                >
                  Xóa ảnh
                </button>
              </div>
            )}
          </div>

          <select value={newProduct.category} onChange={(e) => setNewProduct({...newProduct, category: e.target.value})} style={styles.input}>
            <option value="">Chọn danh mục</option>
            {categories.map((category) => (<option key={category.id} value={category.name}>{category.name}</option>))}
          </select>

          <input
            type="text"
            value={newProduct.ingredients}
            onChange={(e) => setNewProduct({...newProduct, ingredients: e.target.value})}
            placeholder="Thành phần chính của sản phẩm"
            style={styles.input}
          />

          <select
            value={newProduct.complexity}
            onChange={(e) => setNewProduct({...newProduct, complexity: e.target.value})}
            style={styles.input}
          >
            <option value="">Chọn độ phức tạp của sản phẩm</option>
            {complexityOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>

          <input
            type="text"
            value={newProduct.special_ingredient}
            onChange={(e) => setNewProduct({...newProduct, special_ingredient: e.target.value})}
            placeholder="Thành phần đặc biệt của sản phẩm"
            style={styles.input}
          />

          <input
            type="text"
            value={newProduct.type}
            onChange={(e) => setNewProduct({...newProduct, type: e.target.value})}
            placeholder="Loại sản phẩm"
            style={styles.input}
          />

          <div style={styles.buttonGroup}>
            <button onClick={handleSave} style={styles.saveButton}>{editingProduct ? 'Cập nhật' : 'Thêm sản phẩm'}</button>
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
  priceInputs: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '10px',
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
  floatingMessage: {
    position: 'fixed',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    padding: '15px 25px',
    borderRadius: '8px',
    backgroundColor: '#4CAF50', // Màu xanh lá cho thông báo thành công
    color: 'white',            // Chữ màu trắng
    zIndex: 1000,
    boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
    animation: 'fadeIn 0.3s ease-out',
    minWidth: '300px',
    textAlign: 'center',
    fontSize: '16px',
    fontWeight: '500'
  },
  '@keyframes fadeIn': {
    from: {
      opacity: 0,
      transform: 'translate(-50%, -40%)',
    },
    to: {
      opacity: 1,
      transform: 'translate(-50%, -50%)',
    }
  },
  imageSection: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
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

export default AddProductScreen;
