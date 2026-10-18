import { createContext, useContext, useEffect, useState } from 'react';
import { api } from '../services/api';
const AuthContext = createContext(null);
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null),
    [loading, setLoading] = useState(true),
    [error, setError] = useState('');
  useEffect(() => {
    let active = true;
    api
      .get('/auth/me')
      .then((r) => {
        if (active) setUser(r.data.data.user);
      })
      .catch((e) => {
        if (active && e.response?.status !== 401)
          setError('The service could not be reached. Please try signing in.');
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    const expire = () => {
      setUser(null);
      setError('Your session has expired. Please sign in again.');
    };
    window.addEventListener('session-expired', expire);
    return () => {
      active = false;
      window.removeEventListener('session-expired', expire);
    };
  }, []);
  const authenticate = async (mode, data) => {
    const r = await api.post(`/auth/${mode}`, data);
    setUser(r.data.data.user);
    setError('');
    return r.data.data.user;
  };
  const logout = async () => {
    await api.post('/auth/logout');
    setUser(null);
  };
  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        error,
        authenticate,
        logout,
        updateUser: setUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
export const useAuth = () => useContext(AuthContext);
