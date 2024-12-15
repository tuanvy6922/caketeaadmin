import React, { useState } from 'react';
import { auth, db } from '../connect/firebaseConfig';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { useNavigation } from '@react-navigation/native';
import { FiEye, FiEyeOff } from 'react-icons/fi';
import Swal from 'sweetalert2';

const Register = () => {
  const navigation = useNavigation();
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    phoneNumber: '',
    address: '',
    gender: '',
    role: '',
    state: 'Active',
    userCode: '',
    startActivityTime: null,
    endActivityTime: null,
    isCurrentlyActive: false
  });
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // Nếu là trường email thì chuyển thành chữ thường
    const newValue = name === 'email' ? value.toLowerCase() : value;
    
    setFormData(prevState => ({
      ...prevState,
      [name]: newValue
    }));
  };

  const handleRegister = async () => {
    try {
      // Kiểm tra các trường bắt buộc
      if (!formData.email || !formData.password || !formData.fullName || 
          !formData.phoneNumber || !formData.role) {
        Swal.fire({
          icon: 'error',
          title: 'Lỗi',
          text: 'Vui lòng điền đầy đủ thông tin bắt buộc!'
        });
        return;
      }

      // Chuyển email thành chữ thường
      const normalizedEmail = formData.email.toLowerCase();

      // Tạo tài khoản authentication với email đã chuẩn hóa
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        normalizedEmail,
        formData.password
      );

      // Tạo document trong collection Staff với email đã chuẩn hóa và thêm các trường thời gian
      await setDoc(doc(db, "Staff", normalizedEmail), {
        ...formData,
        email: normalizedEmail,
        userCode: `${formData.role === 'Admin' ? 'ADM' : 'STF'}${Date.now()}`,
        startActivityTime: null,
        endActivityTime: null,
        isCurrentlyActive: false
      });

      Swal.fire({
        icon: 'success',
        title: 'Thành công',
        text: 'Đăng ký tài khoản thành công!',
        showConfirmButton: false,
        timer: 1500
      });

      navigation.navigate('Login');
    } catch (error) {
      console.error('Lỗi đăng ký:', error);
      Swal.fire({
        icon: 'error',
        title: 'Lỗi',
        text: 'Đăng ký thất bại. Vui lòng thử lại!'
      });
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.registerBox}>
        <h1 style={styles.title}>Đăng ký tài khoản</h1>
        
        <div style={styles.inputGroup}>
          <input
            style={styles.input}
            type="text"
            name="fullName"
            placeholder="Họ và tên *"
            value={formData.fullName}
            onChange={handleChange}
          />
        </div>

        <div style={styles.inputGroup}>
          <input
            style={{
              ...styles.input,
              textTransform: 'lowercase'
            }}
            type="email"
            name="email"
            placeholder="Email: example@gmail.com "
            value={formData.email}
            onChange={handleChange}
            autoCapitalize="none"
          />
        </div>

        <div style={styles.inputGroup}>
          <div style={styles.passwordContainer}>
            <input
              style={styles.passwordInput}
              type={showPassword ? "text" : "password"}
              name="password"
              placeholder="Mật khẩu *"
              value={formData.password}
              onChange={handleChange}
            />
            <button 
              style={styles.eyeButton}
              onClick={() => setShowPassword(!showPassword)}
              type="button"
            >
              {showPassword ? <FiEye size={20} /> : <FiEyeOff size={20} />}
            </button>
          </div>
        </div>

        <div style={styles.inputGroup}>
          <input
            style={styles.input}
            type="tel"
            name="phoneNumber"
            placeholder="Số điện thoại *"
            value={formData.phoneNumber}
            onChange={handleChange}
          />
        </div>

        <div style={styles.inputGroup}>
          <input
            style={styles.input}
            type="text"
            name="address"
            placeholder="Địa chỉ"
            value={formData.address}
            onChange={handleChange}
          />
        </div>

        <div style={styles.inputGroup}>
          <select
            style={styles.input}
            name="gender"
            value={formData.gender}
            onChange={handleChange}
          >
            <option value="">Chọn giới tính</option>
            <option value="Nam">Nam</option>
            <option value="Nữ">Nữ</option>
            <option value="Khác">Khác</option>
          </select>
        </div>

        <div style={styles.inputGroup}>
          <select
            style={styles.input}
            name="role"
            value={formData.role}
            onChange={handleChange}
            required
          >
            <option value="">Chọn vai trò *</option>
            <option value="Admin">Admin</option>
            <option value="Staff">Staff</option>
          </select>
        </div>

        <button style={styles.button} onClick={handleRegister}>
          <span style={styles.buttonText}>Đăng ký</span>
        </button>
      </div>
    </div>
  );
};

const styles = {
  container: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '100vh',
    padding: '20px',
    backgroundColor: '#f5f5f5',
  },
  registerBox: {
    width: '100%',
    maxWidth: '500px',
    padding: '40px',
    backgroundColor: 'white',
    borderRadius: '12px',
    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
  },
  title: {
    fontSize: '24px',
    fontWeight: 'bold',
    marginBottom: '30px',
    textAlign: 'center',
    color: '#333',
  },
  inputGroup: {
    marginBottom: '20px',
    width: '100%',
  },
  input: {
    width: '100%',
    padding: '12px',
    fontSize: '14px',
    border: '1px solid #ddd',
    borderRadius: '4px',
    backgroundColor: '#f8f9fa',
  },
  passwordContainer: {
    display: 'flex',
    alignItems: 'center',
    border: '1px solid #ddd',
    borderRadius: '4px',
    backgroundColor: '#f8f9fa',
  },
  passwordInput: {
    flex: 1,
    padding: '12px',
    fontSize: '14px',
    border: 'none',
    backgroundColor: 'transparent',
    outline: 'none',
  },
  eyeButton: {
    background: 'none',
    border: 'none',
    padding: '0 12px',
    cursor: 'pointer',
  },
  button: {
    width: '100%',
    padding: '12px',
    backgroundColor: '#4a90e2',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    marginTop: '20px',
  },
  buttonText: {
    color: 'white',
    fontSize: '16px',
    fontWeight: '500',
  },
};

export default Register;