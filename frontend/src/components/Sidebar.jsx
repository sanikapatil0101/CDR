import React, { useContext } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import Button from './ui/Button';

export default function Sidebar({ open = true, setOpen = () => {} }) {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const isAdmin = user?.email === 'admin@gmail.com';

  const handleLogout = () => {
    logout();
    navigate('/signin');
  };

  // if closed, render nothing (completely hidden)
  if (!open) return null;

  return (
    <aside className={`bg-white border-r h-screen p-4 w-64 transition-all`}> 
      <div className="flex items-center justify-start mb-6">
        <div className="font-bold">{isAdmin ? 'Admin' : 'Menu'}</div>
      </div>

      <nav className="flex flex-col gap-3">
        {!isAdmin && (
          <>
            <NavLink to="/dashboard" className={({isActive}) => isActive ? 'font-semibold' : ''}>
              Dashboard
            </NavLink>
            <NavLink to="/profile" className={({isActive}) => isActive ? 'font-semibold' : ''}>
              Profile
            </NavLink>
            <NavLink to="/analytics" className={({isActive}) => isActive ? 'font-semibold' : ''}>
              Analytics
            </NavLink>
          </>
        )}

        {isAdmin && (
          <>
            <NavLink to="/admin" className={({isActive}) => isActive ? 'font-semibold' : ''}>
              Admin Dashboard
            </NavLink>
          </>
        )}

        <div className="mt-auto">
          <Button onClick={handleLogout} className="w-full bg-red-500 hover:bg-red-600 text-white">Logout</Button>
        </div>
      </nav>
    </aside>
  );
}
