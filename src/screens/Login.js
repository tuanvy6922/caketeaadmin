import React, { useState } from 'react'
import { auth, db } from '../connect/firebaseConfig'
import { signInWithEmailAndPassword } from 'firebase/auth'
import { doc, getDoc, updateDoc, serverTimestamp } from 'firebase/firestore'
import { useNavigation } from '@react-navigation/native'
import { FiEye, FiEyeOff } from 'react-icons/fi'
import backgroundImage from '../../assets/backgroundCake-Tea.png';
import '../styles/Login.css';

const Login = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [errorMessage, setErrorMessage] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const navigation = useNavigation()

  const handleLogin = async () => {
    setErrorMessage('');
    try {
      const userDoc = await getDoc(doc(db, "Staff", email));
      
      if (userDoc.exists()) {
        const userData = userDoc.data();
        
        if (userData.state === 'Inactive') {
          setErrorMessage("Tài khoản của bạn đã bị vô hiệu hóa. Vui lòng liên hệ quản trị!");
          return;
        }

        if (userData.role !== "Admin" && userData.role !== "Staff") {
          setErrorMessage("Bạn không có quyền truy cập!");
          return;
        }

        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        
        await updateDoc(doc(db, "Staff", email), {
          startActivityTime: serverTimestamp(),
          endActivityTime: null,
          isCurrentlyActive: true
        });
        
        navigation.replace('MainApp');
      } else {
        setErrorMessage("Tài khoản không tồn tại!");
      }
    } catch (error) {
      console.error('Lỗi đăng nhập:', error);
      setErrorMessage("Email hoặc mật khẩu không đúng!");
    }
  }

  return (
    <div style={styles.container} className="container">
      <div style={styles.loginBox}>
        <h1 style={styles.title}>Sugar Cake & Tea</h1>
        <div style={styles.inputGroup}>
          <div style={styles.inputContainer}>
            <input
              style={styles.input}
              type="email"
              placeholder="Email Address *"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
        </div>
        <div style={styles.inputGroup}>
          <div style={styles.passwordContainer}>
            <input
              style={styles.passwordInput}
              type={showPassword ? "text" : "password"}
              placeholder="Password *"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
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
        {errorMessage && <p style={styles.error}>{errorMessage}</p>}
        <button style={styles.button} onClick={handleLogin}>
          <span style={styles.buttonText}>Đăng nhập</span>
        </button>

        <div style={styles.registerLink}>
          <span>Chưa có tài khoản? </span>
          <button 
            style={styles.linkButton}
            onClick={() => navigation.navigate('Register')}
          >
            Đăng ký
          </button>
        </div>
      </div>
    </div>
  )
}

export default Login

const styles = {
  container: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '100vh',
    width: '100vw',
    padding: '20px',
    backgroundImage: `url(${require('../../assets/backgroundCake-Tea.png')})`,
    backgroundSize: '100vw auto',
    backgroundPosition: 'center',
    backgroundRepeat: 'no-repeat',
    backgroundColor: '#e6e6e6',
    '@media (max-width: 768px)': {
      backgroundSize: 'contain',
    },
    '@media (min-width: 1200px)': {
      backgroundSize: '80vw auto',
    }
  },
  loginBox: {
    width: '100%',
    maxWidth: '400px',
    padding: '40px',
    backgroundColor: 'rgba(255, 255, 255, 0.85)',
    borderRadius: '12px',
    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
    backdropFilter: 'blur(8px)',
    border: '1px solid rgba(255, 255, 255, 0.2)',
    zIndex: 1,
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
  inputContainer: {
    width: '100%',
    display: 'flex',
    alignItems: 'center',
    backgroundColor: 'rgba(248, 249, 250, 0.9)',
    border: '1px solid rgba(0, 0, 0, 0.1)',
    borderRadius: '4px',
  },
  input: {
    width: '100%',
    padding: '12px',
    fontSize: '14px',
    border: 'none',
    backgroundColor: 'transparent',
    outline: 'none',
  },
  passwordContainer: {
    width: '100%',
    display: 'flex',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    border: '1px solid #ddd',
    borderRadius: '4px',
  },
  passwordInput: {
    width: '100%',
    padding: '12px',
    fontSize: '14px',
    border: 'none',
    backgroundColor: 'transparent',
    outline: 'none',
  },
  eyeButton: {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    color: '#666',
    padding: '0 12px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
  },
  error: {
    color: '#dc3545',
    fontSize: '14px',
    marginBottom: '15px',
    textAlign: 'center',
  },
  button: {
    width: '100%',
    padding: '12px',
    backgroundColor: '#4a90e2',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    '&:hover': {
      backgroundColor: '#357abd',
      transform: 'translateY(-1px)',
    }
  },
  buttonText: {
    color: 'white',
    fontSize: '14px',
    fontWeight: '500',
  },
  logo: {
    width: '120px',
    height: 'auto',
    display: 'block',
    margin: '0 auto 20px',
  },
  registerLink: {
    marginTop: '20px',
    textAlign: 'center',
    fontSize: '14px',
  },
  linkButton: {
    background: 'none',
    border: 'none',
    color: '#4a90e2',
    cursor: 'pointer',
    padding: '0',
    fontSize: '14px',
    textDecoration: 'underline',
  },
}