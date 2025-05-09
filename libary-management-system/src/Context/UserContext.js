import React, { createContext, useState, useEffect } from 'react';
import Cookies from 'js-cookie';

export const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [userId, setUserId] = useState(null);
  const [userName, setUserName] = useState(null);
  const [userRole, setUserRole] = useState(null); // Track user role

  useEffect(() => {
    // Get role, id, and name from cookies on initial load
    const savedRole = Cookies.get('userRole');
    const savedUserId = Cookies.get('userId');
    const savedUserName = Cookies.get('userName');
    
    if (savedRole) {
      setUserRole(savedRole);
    }
    if (savedUserId) {
      setUserId(savedUserId);
    }
    if (savedUserName) {
      setUserName(savedUserName);
    }
  }, []);

  return (
    <UserContext.Provider value={{ userId, setUserId, userName, setUserName, userRole, setUserRole }}>
      {children}
    </UserContext.Provider>
  );
};
