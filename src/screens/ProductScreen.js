import React, { useState } from 'react';
import { db, storage } from '../connect/firebaseConfig';
import { collection, deleteDoc, doc, updateDoc, onSnapshot, getDocs } from 'firebase/firestore';
import { ref, getDownloadURL, deleteObject } from 'firebase/storage';
import { useFocusEffect } from '@react-navigation/native';
import Header from '../components/Header';
import { FiEdit2, FiTrash2 } from 'react-icons/fi';

const ProductScreen = ({ navigation }) => {
  const [products, setProducts] = useState([]);
  const [message, setMessage] = useState({ text: '', type: '' });
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const productsPerPage = 10;

  // Thêm logic lọc sản phẩm theo tìm kiếm
  const filteredProducts = products.filter(product => 
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Cập nhật tính toán phân trang với danh sách đã lọc
  const indexOfLastProduct = currentPage * productsPerPage;
  const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
  const currentProducts = filteredProducts.slice(indexOfFirstProduct, indexOfLastProduct);
  const totalPages = Math.ceil(filteredProducts.length / productsPerPage);

  // Thêm hàm xử lý chuyển trang
  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };
  // Lấy dữ liệu sản phẩm từ Firestore
  useFocusEffect(
    React.useCallback(() => {
      const unsubscribe = onSnapshot(
        collection(db, 'Product'),
        async (snapshot) => {
          try {
            const productsPromises = snapshot.docs.map(async doc => {
              const productData = doc.data();
              const imageUrl = await getImageUrl(productData.imagelink_square);
              
              return {
                id: doc.id,
                ...productData,
                imageUrl: imageUrl || productData.imagelink_square,
                createdAt: productData.createdAt?.toDate() || new Date()
              };
            });

            const productsList = await Promise.all(productsPromises);
            
            const sortedProducts = productsList.sort((a, b) => {
              return b.createdAt - a.createdAt;
            });
            
            setProducts(sortedProducts);
          } catch (error) {
            console.error('Error processing products:', error);
            setMessage({ text: 'Lỗi khi xử lý dữ liệu sản phẩm!', type: 'error' });
          }
        },
        (error) => {
          console.error('Error listening to products:', error);
          setMessage({ text: 'Lỗi khi theo dõi dữ liệu sản phẩm!', type: 'error' });
        }
      );

      return () => unsubscribe();
    }, [])
  );

  const getImageUrl = async (imagePath) => {
    try {
      const cleanImagePath = imagePath.startsWith('posts/') 
        ? imagePath 
        : `posts/${imagePath}`;
      
      const pathWithoutQuery = cleanImagePath.split('?')[0];
      
      const imageRef = ref(storage, pathWithoutQuery);
      const url = await getDownloadURL(imageRef);
      return url;
    } catch (error) {
      console.error('Error getting image URL:', error);
      return null;
    }
  };

  const handleDeleteProduct = async (productId) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa sản phẩm này?')) {
      try {
        // Tìm sản phẩm cần xóa
        const productToDelete = products.find(p => p.id === productId);
        
        // Cập nhật UI trước
        setProducts(prevProducts => 
          prevProducts.filter(p => p.id !== productId)
        );
        
        // Xóa ảnh từ Storage
        if (productToDelete.imagelink_square) {
          try {
            // Lấy tên file từ URL hoặc đường dẫn
            let imagePath = productToDelete.imagelink_square;
            
            // Nếu là URL đầy đủ, cắt lấy phần path
            if (imagePath.includes('firebasestorage.googleapis.com')) {
              // Tìm phần /posts/ trong URL và lấy phần còn lại
              const postsIndex = imagePath.indexOf('/posts/');
              if (postsIndex !== -1) {
                imagePath = 'posts/' + imagePath.substring(postsIndex + 7).split('?')[0];
              }
            } else {
              // Nếu không phải URL đầy đủ, đảm bảo đường dẫn bắt đầu bằng posts/
              imagePath = imagePath.startsWith('posts/') ? imagePath : `posts/${imagePath}`;
            }
            
            console.log('Đường dẫn ảnh cần xóa:', imagePath);
            const imageRef = ref(storage, imagePath);
            
            await deleteObject(imageRef);
            console.log('Đã xóa ảnh thành công');
          } catch (storageError) {
            console.error('Lỗi khi xóa ảnh:', storageError);
          }
        }

        // Xóa sản phẩm từ Firestore
        await deleteDoc(doc(db, 'Product', productId));
        
        setMessage({ text: 'Xóa sản phẩm thành công!', type: 'success' });
        
        // Tự động ẩn thông báo sau 3 giây
        setTimeout(() => {
          setMessage({ text: '', type: '' });
        }, 3000);

      } catch (error) {
        console.error('Error deleting product:', error);
        setMessage({ text: 'Lỗi khi xóa sản phẩm!', type: 'error' });
      }
    }
  };

  return (
    <div style={styles.container}>
      <Header />
      <div style={styles.content}>
        <div style={styles.headerSection}>
          <h1 style={styles.title}>Quản lý Sản phẩm</h1>
          <button 
            onClick={() => {
              // Reset form trước khi navigate
              navigation.navigate('AddProductScreen', { 
                resetForm: true  // Thêm flag để báo hiệu cần reset form
              });
            }}
            style={styles.addButton}
          >
            + Thêm Sản phẩm
          </button>
        </div>

        {/* Thêm thanh tìm kiếm */}
        <div style={styles.searchContainer}>
          <input
            type="text"
            placeholder="Tìm kiếm theo tên sản phẩm hoặc danh mục..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1); // Reset về trang 1 khi tìm kiếm
            }}
            style={styles.searchInput}
          />
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

        <div style={styles.productListContainer}>
          <div style={styles.productGrid}>
            {currentProducts.map((product) => (
              <div key={product.id} style={styles.productItem}>
                <img 
                  src={product.imageUrl || 'placeholder-image-url'} 
                  alt={product.name} 
                  style={styles.productImage}
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = 'placeholder-image-url';
                  }}
                />
                <div style={styles.productInfo}>
                  <h3 style={styles.productName}>{product.name}</h3>
                  <div style={styles.priceList}>
                    <p style={styles.productPrice}>Size S: {product.price.S?.toLocaleString('vi-VN')} đ</p>
                    <p style={styles.productPrice}>Size M: {product.price.M?.toLocaleString('vi-VN')} đ</p>
                    <p style={styles.productPrice}>Size L: {product.price.L?.toLocaleString('vi-VN')} đ</p>
                  </div>
                  <p style={styles.productCategory}>{product.category}</p>
                  <div style={styles.buttonGroup}>
                    <button
                      onClick={() => navigation.navigate('AddProductScreen', { product })}
                      style={styles.editButton}
                    >
                      <FiEdit2 style={styles.buttonIcon} />
                      Sửa
                    </button>
                    <button
                      onClick={() => handleDeleteProduct(product.id)}
                      style={styles.deleteButton}
                    >
                      <FiTrash2 style={styles.buttonIcon} />
                      Xóa
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          {/* Thêm phần pagination */}
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

export default ProductScreen;

const styles = {
  container: {
    height: '100vh',
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
  },
  content: {
    flex: 1,
    padding: '20px',
    display: 'flex',
    flexDirection: 'column',
    maxWidth: '1200px',
    margin: '0 auto',
    width: '100%',
    overflowY: 'auto',
    scrollbarWidth: 'none',
    msOverflowStyle: 'none',
    '&::-webkit-scrollbar': {
      display: 'none'
    }
  },
  productListContainer: {
    flex: 1,
    padding: '10px',
    backgroundColor: '#f8f9fa',
    borderRadius: '8px',
  },
  productGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
    gap: '15px',
    minHeight: 'min-content',
  },
  productItem: {
    border: '1px solid #eee',
    borderRadius: '8px',
    overflow: 'hidden',
    backgroundColor: 'white',
    transition: 'transform 0.2s, box-shadow 0.2s',
    ':hover': {
      transform: 'translateY(-2px)',
      boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
    }
  },
  productImage: {
    width: '100%',
    height: '160px',
    objectFit: 'cover',
  },
  productInfo: {
    padding: '12px',
  },
  productName: {
    margin: '0 0 8px 0',
    fontSize: '14px',
    fontWeight: '500',
    color: '#333',
  },
  priceList: {
    marginBottom: '8px',
  },
  productPrice: {
    margin: '0 0 4px 0',
    fontSize: '13px',
    color: '#e44d26',
    fontWeight: '500',
  },
  productCategory: {
    margin: '0 0 8px 0',
    fontSize: '12px',
    color: '#666',
  },
  deleteButton: {
    padding: '4px 8px',
    backgroundColor: '#dc3545',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '12px',
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
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
  buttonGroup: {
    display: 'flex',
    gap: '8px',
    marginTop: '8px',
  },
  editButton: {
    padding: '4px 8px',
    backgroundColor: '#ffc107',
    color: 'black',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '12px',
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
  },
  updateButton: {
    padding: '8px 16px',
    backgroundColor: '#28a745',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
  },
  cancelButton: {
    padding: '8px 16px',
    backgroundColor: '#6c757d',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
  },
  headerSection: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '20px 0',
    borderBottom: '1px solid #e0e0e0',
    marginBottom: '24px',
  },
  title: {
    fontSize: '24px',
    fontWeight: '500',
    color: '#333',
    margin: 0,
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
    transition: 'background-color 0.2s',
    ':hover': {
      backgroundColor: '#45a049',
    }
  },
  pagination: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    gap: '8px',
    padding: '16px 0',
    marginTop: '16px',
    borderTop: '1px solid #eee',
  },
  pageButton: {
    padding: '6px 12px',
    border: '1px solid #ddd',
    borderRadius: '4px',
    backgroundColor: '#fff',
    cursor: 'pointer',
    fontSize: '13px',
    transition: 'all 0.2s',
    ':hover': {
      backgroundColor: '#f8f9fa',
    },
    ':disabled': {
      cursor: 'not-allowed',
      opacity: 0.5,
    }
  },
  buttonIcon: {
    fontSize: '14px',
  },
  searchContainer: {
    marginBottom: '20px',
    width: '100%',
  },
  searchInput: {
    width: '97%',
    padding: '8px 12px',
    fontSize: '14px',
    border: '1px solid #ddd',
    borderRadius: '6px',
    backgroundColor: '#fff',
    transition: 'border-color 0.2s',
    ':focus': {
      outline: 'none',
      borderColor: '#4CAF50',
      boxShadow: '0 0 0 2px rgba(76, 175, 80, 0.1)',
    }
  },
};