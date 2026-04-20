import { createContext, useState, useEffect, useRef } from 'react';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const initializationComplete = useRef(false);

  // Initialize auth from localStorage on mount - ONLY ONCE
  useEffect(() => {
    if (initializationComplete.current) return;
    initializationComplete.current = true;

    const initializeAuth = () => {
      try {
        const token = localStorage.getItem('token');
        const userData = localStorage.getItem('user');
        
        // CRITICAL: Both token AND user data must exist
        if (token && userData) {
          const parsedUser = JSON.parse(userData);
          
          // ✅ Validate required fields
          if (parsedUser?.id && parsedUser?.role) {
            setUser(parsedUser);
          } else {
            // Invalid structure - clear everything
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            setUser(null);
          }
        } else {
          // No session - ensure everything is cleared
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          setUser(null);
        }
      } catch (error) {
        // Parse error or any other error - clear everything
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setUser(null);
      } finally {
        // Always mark loading as complete
        setLoading(false);
      }
    };

    // Initialize auth immediately and synchronously
    initializeAuth();
  }, []);

  // Watch for storage changes (e.g., logout from another tab or interceptor)
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === 'token' || e.key === 'user') {
        const token = localStorage.getItem('token');
        const userData = localStorage.getItem('user');
        
        // If token was cleared or user data is missing, logout
        if (!token || !userData) {
          console.log('Storage cleared - logging out');
          setUser(null);
        } else {
          try {
            const parsedUser = JSON.parse(userData);
            if (parsedUser && parsedUser.id && parsedUser.role) {
              setUser(parsedUser);
            } else {
              console.warn('Invalid user object structure:', parsedUser);
              setUser(null);
            }
          } catch (error) {
            console.error('Failed to parse user data:', error);
            setUser(null);
          }
        }
      }
    };

    // Listen for storage events (from other tabs/windows or interceptor)
    window.addEventListener('storage', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  const login = (userData, token) => {
    // Ensure user object has all required fields
    const safeUser = {
      id: userData.id,
      name: userData.name,
      email: userData.email || null,
      phone: userData.phone || null,
      role: userData.role, // CRITICAL: role must be present
      shopId: userData.shopId || null,
      isActive: userData.isActive !== false,
      createdAt: userData.createdAt || null
    };

    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(safeUser));
    setUser(safeUser);
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};
