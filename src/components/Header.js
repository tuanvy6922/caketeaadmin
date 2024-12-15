import React, { useState, useEffect } from 'react';
import { FiMenu, FiBell, FiUser } from 'react-icons/fi';
import { useNavigation } from '@react-navigation/native';
import { auth, db } from '../connect/firebaseConfig';
import { doc, getDoc } from 'firebase/firestore';
import logoIcon from '../../assets/icon_name.png';

const Header = ({ title = "Dashboard" }) => {
  const navigation = useNavigation();
  const [userInfo, setUserInfo] = useState(null);
  const [showTooltip, setShowTooltip] = useState(false);

  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        const user = auth.currentUser;
        if (user) {
          console.log("Current user email:", user.email);
          
          const userDoc = await getDoc(doc(db, 'Staff', user.email));
          console.log("User doc exists:", userDoc.exists());
          console.log("User data:", userDoc.data());
          
          if (userDoc.exists()) {
            setUserInfo(userDoc.data());
          } else {
            console.log("No such document in Staff collection!");
          }
        }
      } catch (error) {
        console.error('Error fetching user info:', error);
      }
    };

    fetchUserInfo();
  }, []);

  const handleMenuPress = () => {
    navigation.openDrawer();
  };

  return (
    <div style={styles.header}>
      <div style={styles.leftSection}>
        <button style={styles.menuButton} onClick={handleMenuPress}>
          <FiMenu size={28} color="#333" />
        </button>
        {/* <span style={styles.headerTitle}>{title}</span> */}
      </div>

      <div style={styles.centerSection}>
        <button style={styles.logoButton}>
          <img 
            src={logoIcon} 
            alt="Logo"
            style={styles.logoIcon}
          />
        </button>
      </div>

      <div style={styles.rightSection}>
        <div 
          style={styles.userIconContainer}
          onMouseEnter={() => setShowTooltip(true)}
          onMouseLeave={() => setShowTooltip(false)}
        >
          <button style={styles.iconButton}>
            <FiUser size={20} />
          </button>
          {showTooltip && userInfo && (
            <div style={styles.tooltip}>
              <p style={styles.tooltipName}>{userInfo.fullName}</p>
              <p style={styles.tooltipEmail}>{userInfo.email}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Header;

const styles = {
  header: {
    height: '60px',
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '16px',
    borderBottom: '1px solid #ddd',
    backgroundColor: '#fff',
  },
  leftSection: {
    display: 'flex',
    alignItems: 'center',
    flex: 1,
  },
  centerSection: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flex: 2,
  },
  rightSection: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    flex: 1,
    justifyContent: 'flex-end',
  },
  headerTitle: {
    fontSize: '20px',
    fontWeight: 'bold',
    marginLeft: '16px',
  },
  menuButton: {
    padding: '8px',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    borderRadius: '4px',
    transition: 'background-color 0.2s',
    ':hover': {
      backgroundColor: '#f5f5f5',
    }
  },
  iconButton: {
    padding: '8px',
    display: 'flex',
    justifyContent: 'center', 
    alignItems: 'center',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    borderRadius: '4px',
    transition: 'background-color 0.2s',
    ':hover': {
      backgroundColor: '#f5f5f5',
    }
  },
  userIconContainer: {
    position: 'relative',
  },
  tooltip: {
    position: 'absolute',
    top: '100%',
    right: 0,
    backgroundColor: 'white',
    padding: '12px',
    borderRadius: '8px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
    zIndex: 1000,
    minWidth: '200px',
    marginTop: '8px',
  },
  tooltipName: {
    margin: '0 0 4px 0',
    fontSize: '14px',
    fontWeight: 'bold',
    color: '#333',
  },
  tooltipEmail: {
    margin: 0,
    fontSize: '12px',
    color: '#666',
  },
  logoButton: {
    padding: '8px',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
  },
  logoIcon: {
    width: '60%',
    height: '50%',
    objectFit: 'contain',
  },
}
