import { useState, useEffect } from 'react';
import { auth, db } from '../connect/firebaseConfig';
import { doc, getDoc } from 'firebase/firestore';

const useCheckRole = () => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkUser = async () => {
      try {
        const user = auth.currentUser;
        if (user) {
          const docRef = doc(db, "Staff", user.email);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            setCurrentUser({
              ...docSnap.data(),
              email: user.email
            });
          }
        }
        setLoading(false);
      } catch (error) {
        console.error("Error checking user role:", error);
        setLoading(false);
      }
    };

    checkUser();
  }, []);

  return { currentUser, loading };
};

export default useCheckRole;
