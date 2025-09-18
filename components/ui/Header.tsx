'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { useAuth } from '../auth/AuthProvider';
import {
  UserIcon,
  ArrowLeftStartOnRectangleIcon,
  HomeIcon,
  CubeIcon,
  MagnifyingGlassIcon,
  BuildingOfficeIcon,
  DocumentTextIcon,
  Bars3Icon,
  XMarkIcon
} from '@heroicons/react/24/outline';

interface HeaderProps {
  title?: string;
  subtitle?: string;
  showNavigation?: boolean;
}

export default function Header({
  title = "FisSales Admin",
  subtitle,
  showNavigation = true
}: HeaderProps) {
  const { user } = useAuth();
  const router = useRouter();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    try {
      const { signOut } = await import('firebase/auth');
      const { auth } = await import('@/lib/firebase');
      await signOut(auth);
      router.push('/login');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const handleNavigation = (path: string) => {
    router.push(path);
    setIsMobileMenuOpen(false); // Close mobile menu after navigation
  };

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          {/* Left side - Logo and Title */}
          <div className="flex items-center space-x-4">
            <Image
              src="/images/Logo.png"
              alt="FisSales Logo"
              width={40}
              height={40}
              className="object-contain"
            />
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
              {subtitle && (
                <p className="text-sm text-gray-600">{subtitle}</p>
              )}
            </div>
          </div>

          {/* Center - Desktop Navigation */}
          {showNavigation && (
            <nav className="hidden lg:flex items-center space-x-6">
              <button
                onClick={() => handleNavigation('/dashboard')}
                className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors"
              >
                <HomeIcon className="w-4 h-4" />
                Dashboard
              </button>
              <button
                onClick={() => handleNavigation('/dashboard/products')}
                className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors"
              >
                <CubeIcon className="w-4 h-4" />
                Products
              </button>
              <button
                onClick={() => handleNavigation('/dashboard/search')}
                className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors"
              >
                <MagnifyingGlassIcon className="w-4 h-4" />
                Search
              </button>
              <button
                onClick={() => handleNavigation('/dashboard/company')}
                className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors"
              >
                <BuildingOfficeIcon className="w-4 h-4" />
                Company
              </button>
              <button
                onClick={() => handleNavigation('/dashboard/prompts')}
                className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors"
              >
                <DocumentTextIcon className="w-4 h-4" />
                Prompts
              </button>
            </nav>
          )}

          {/* Mobile menu button */}
          {showNavigation && (
            <div className="lg:hidden">
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors"
                aria-label="Toggle navigation menu"
              >
                {isMobileMenuOpen ? (
                  <XMarkIcon className="w-6 h-6" />
                ) : (
                  <Bars3Icon className="w-6 h-6" />
                )}
              </button>
            </div>
          )}

          {/* Right side - User info and logout (Desktop only) */}
          <div className="hidden lg:flex items-center space-x-4">
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <UserIcon className="w-4 h-4" />
              <span>{user?.displayName || user?.email}</span>
            </div>

            <button
              onClick={handleLogout}
              className="flex items-center space-x-2 text-sm text-gray-600 hover:text-gray-900"
            >
              <ArrowLeftStartOnRectangleIcon className="w-4 h-4" />
              <span>Logout</span>
            </button>
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        {showNavigation && isMobileMenuOpen && (
          <div className="lg:hidden border-t border-gray-200 bg-white">
            {/* Mobile User Info */}
            <div className="px-4 py-3 border-b border-gray-200">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <UserIcon className="w-4 h-4" />
                <span className="truncate">{user?.displayName || user?.email}</span>
              </div>
            </div>

            <nav className="px-4 py-2 space-y-1">
              <button
                onClick={() => handleNavigation('/dashboard')}
                className="w-full flex items-center gap-3 px-3 py-3 text-left text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors"
              >
                <HomeIcon className="w-5 h-5" />
                Dashboard
              </button>
              <button
                onClick={() => handleNavigation('/dashboard/products')}
                className="w-full flex items-center gap-3 px-3 py-3 text-left text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors"
              >
                <CubeIcon className="w-5 h-5" />
                Products
              </button>
              <button
                onClick={() => handleNavigation('/dashboard/search')}
                className="w-full flex items-center gap-3 px-3 py-3 text-left text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors"
              >
                <MagnifyingGlassIcon className="w-5 h-5" />
                Search
              </button>
              <button
                onClick={() => handleNavigation('/dashboard/company')}
                className="w-full flex items-center gap-3 px-3 py-3 text-left text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors"
              >
                <BuildingOfficeIcon className="w-5 h-5" />
                Company
              </button>
              <button
                onClick={() => handleNavigation('/dashboard/prompts')}
                className="w-full flex items-center gap-3 px-3 py-3 text-left text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors"
              >
                <DocumentTextIcon className="w-5 h-5" />
                Prompts
              </button>

              {/* Mobile Logout */}
              <div className="border-t border-gray-200 pt-2 mt-2">
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-3 py-3 text-left text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors"
                >
                  <ArrowLeftStartOnRectangleIcon className="w-5 h-5" />
                  Logout
                </button>
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
