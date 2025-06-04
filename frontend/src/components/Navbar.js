import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { FaTasks, FaSignOutAlt } from 'react-icons/fa';

const Navbar = () => {
  const { user, logout } = useAuth();
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  return (
    <nav className="bg-army-green-800 text-white shadow-md">
      <div className="container mx-auto px-4 flex justify-between items-center py-4">
        <Link href={user ? "/categories" : "/"} className="flex items-center hover:text-yellow-400 transition-colors duration-200">
          <FaTasks className="mr-2 text-2xl" />
          <span className="text-xl font-bold">TaskFlow</span>
        </Link>
        <div className="flex items-center space-x-4">
          {user ? (
            <>
              <button onClick={handleLogout} className="flex items-center hover:text-yellow-400">
                <span className="mr-1">Logout</span>
                <FaSignOutAlt />
              </button>
            </>
          ) : (
            <>
              <Link href="/login" className="hover:text-yellow-400">Login</Link>
              <Link href="/register" className="hover:text-yellow-400">Register</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;