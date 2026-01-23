import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import logoIcon from "../icons/logo.png";

const Navbar = () => {
  const { user, signOut, loading } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
    setMobileMenuOpen(false);
  };

  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
  };

  return (
    <nav className='bg-gray-900 border-b border-gray-800'>
      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
        <div className='flex justify-between h-16'>
          {/* Logo */}
          <div className='flex items-center'>
            <Link to='/' className='flex items-center space-x-2 group' onClick={closeMobileMenu}>
              <img
                src={logoIcon}
                alt='URL Shortener Logo'
                className='h-8 w-8 object-contain transition-transform duration-300 group-hover:scale-110 group-hover:rotate-12'
              />
              <span className='text-xl font-bold text-gray-100 transition-all duration-300 group-hover:text-primary-400 group-hover:scale-105'>Linklet</span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className='hidden md:flex items-center space-x-4'>
            <Link
              to='/'
              className='text-gray-300 hover:text-primary-400 px-3 py-2 rounded-md text-sm font-medium transition-all duration-300 hover:scale-110 hover:translate-y-[-2px]'
            >
              Home
            </Link>
            <Link
              to='/dashboard'
              className='text-gray-300 hover:text-primary-400 px-3 py-2 rounded-md text-sm font-medium transition-all duration-300 hover:scale-110 hover:translate-y-[-2px]'
            >
              Dashboard
            </Link>
            {!loading && (
              <>
                {user ? (
                  <button
                    onClick={handleSignOut}
                    className='text-gray-300 hover:text-primary-400 px-3 py-2 rounded-md text-sm font-medium transition-all duration-300 hover:scale-110 hover:translate-y-[-2px]'
                  >
                    Sign Out
                  </button>
                ) : (
                  <>
                    <Link
                      to='/login'
                      className='text-gray-300 hover:text-primary-400 px-3 py-2 rounded-md text-sm font-medium transition-all duration-300 hover:scale-110 hover:translate-y-[-2px]'
                    >
                      Login
                    </Link>
                    <Link
                      to='/signup'
                      className='bg-primary-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-primary-500 transition-all duration-300 hover:scale-110 hover:translate-y-[-2px] hover:shadow-lg hover:shadow-primary-500/50'
                    >
                      Sign Up
                    </Link>
                  </>
                )}
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <div className='md:hidden flex items-center'>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className='text-gray-300 hover:text-primary-400 p-2 rounded-md transition-colors'
              aria-label='Toggle menu'
            >
              {mobileMenuOpen ? (
                <svg className='h-6 w-6' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                  <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M6 18L18 6M6 6l12 12' />
                </svg>
              ) : (
                <svg className='h-6 w-6' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                  <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M4 6h16M4 12h16M4 18h16' />
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        {mobileMenuOpen && (
          <div className='md:hidden border-t border-gray-800'>
            <div className='px-2 pt-2 pb-3 space-y-1'>
              <Link
                to='/'
                onClick={closeMobileMenu}
                className='block text-gray-300 hover:text-primary-400 hover:bg-gray-800 px-3 py-2 rounded-md text-base font-medium transition-colors'
              >
                Home
              </Link>
              <Link
                to='/dashboard'
                onClick={closeMobileMenu}
                className='block text-gray-300 hover:text-primary-400 hover:bg-gray-800 px-3 py-2 rounded-md text-base font-medium transition-colors'
              >
                Dashboard
              </Link>
              {!loading && (
                <>
                  {user ? (
                    <button
                      onClick={handleSignOut}
                      className='w-full text-left text-gray-300 hover:text-primary-400 hover:bg-gray-800 px-3 py-2 rounded-md text-base font-medium transition-colors'
                    >
                      Sign Out
                    </button>
                  ) : (
                    <>
                      <Link
                        to='/login'
                        onClick={closeMobileMenu}
                        className='block text-gray-300 hover:text-primary-400 hover:bg-gray-800 px-3 py-2 rounded-md text-base font-medium transition-colors'
                      >
                        Login
                      </Link>
                      <Link
                        to='/signup'
                        onClick={closeMobileMenu}
                        className='block bg-primary-600 text-white hover:bg-primary-500 px-3 py-2 rounded-md text-base font-medium text-center transition-colors'
                      >
                        Sign Up
                      </Link>
                    </>
                  )}
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
