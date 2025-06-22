'use client';

import { useState } from 'react';
import { usePathname } from 'next/navigation';
import { FaSearch, FaShoppingCart, FaUser, FaBars, FaTimes } from 'react-icons/fa';
import { FiMail } from 'react-icons/fi';
import { MdHeadsetMic } from 'react-icons/md';
import { IoIosArrowDown } from 'react-icons/io';
import logo from '../assets/Feroz_logo.jpg';
import { useUser } from "../provider/UserProvider";

const Navbar = () => {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const { signOut } = useUser();

  const user = typeof window !== "undefined" ? localStorage.getItem("user") : null;
  const isAuthenticated = user !== null && user !== undefined && user !== "null";

const handleSignOut = () => {
    signOut();
    Router.push("/");
  };
  const activeClass = "text-green-600 font-semibold";

  return (
<div className="border-b bg-[#FAFBFC] fixed top-0 left-0 w-full z-50 shadow-md">
      {/* Top Bar */}
      <div className="flex flex-col lg:flex-row items-center justify-between px-4 lg:px-6 bg-white">
        <div className="flex items-center w-full justify-between lg:w-auto">
          <img src={logo.src} alt="Motor Sheba" className="h-20 w-auto" />
          <button className="lg:hidden text-xl" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            {mobileMenuOpen ? <FaTimes /> : <FaBars />}
          </button>
        </div>

        {/* Search Box */}
        <div className="hidden lg:flex relative w-full lg:w-96 my-2">
          <input
            type="text"
            placeholder="I am searching for..."
            className="border rounded-md px-4 py-2 w-full text-sm focus:outline-none"
          />
          <button className="absolute right-2 top-2.5 text-gray-600">
            <FaSearch />
          </button>
        </div>

        {/* Contact/Account/Cart */}
        <div className="hidden lg:flex flex-wrap justify-center gap-6 text-sm">
          <div className="flex items-center space-x-2">
            <FiMail className="text-xl" />
            <div>
              <p className="font-medium">Make an Email</p>
              <p className="text-blue-600 text-xs">info@motorsheba.com</p>
            </div>
          </div>
          <div className="flex items-center space-x-2 border-l pl-4">
            <MdHeadsetMic className="text-xl" />
            <div>
              <p className="font-medium">Call Us 24/7</p>
              <p className="text-blue-600 text-xs">09610-500500</p>
            </div>
          </div>
          <div className="flex items-center space-x-2 border-l pl-4">
            <FaUser />
            <div className="flex flex-col text-xs">
              <span className="text-gray-600 font-medium">Your Account</span>
              <div className="flex space-x-2">
                {isAuthenticated ? (
                  <button onClick={handleSignOut} className="cursor-pointer hover:underline text-red-600">Sign Out</button>
                ) : (
                  <a href="/authentication" className="cursor-pointer hover:underline">Login or Register</a>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Desktop Menu */}
      <div className="hidden lg:flex items-center justify-center gap-6 px-6 py-1 bg-[#FAFBFC] text-sm font-semibold">
        <a href="/" className={`hover:text-blue-600 ${pathname === "/" ? activeClass : ""}`}>Home</a>
        <a href="/brands" className={`hover:text-blue-600 ${pathname === "/brands" ? activeClass : ""}`}>Brands</a>
        <a href="/accessories" className={`hover:text-blue-600 ${pathname === "/accessories" ? activeClass : ""}`}>Accessories</a>
        <a href="/how-to-order" className={`hover:text-blue-600 ${pathname === "/how-to-order" ? activeClass : ""}`}>How to order</a>
        <a href="/contact" className={`hover:text-blue-600 ${pathname === "/contact" ? activeClass : ""}`}>Contact Us</a>

        {/* Dashboard */}
        {isAuthenticated && (
          <a href="/dashboard" className={`hover:text-blue-600 ${pathname === "/dashboard" ? activeClass : ""}`}>Dashboard</a>
        )}

        <div className="relative text-center text-xs">
          <FaShoppingCart className="mx-auto text-xl" />
          <span className="absolute -top-2 -right-2 text-[10px] bg-red-600 text-white rounded-full h-4 w-4 flex items-center justify-center">0</span>
          <div>Cart</div>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden flex flex-col px-4 space-y-2 pb-4 text-sm font-medium bg-white border-t">
          <a href="/" className={pathname === "/" ? activeClass : ""}>Home</a>
          <a href="/brands" className={pathname === "/brands" ? activeClass : ""}>Brands</a>
          <a href="/accessories" className={pathname === "/accessories" ? activeClass : ""}>Accessories</a>
          <a href="/how-to-order" className={pathname === "/how-to-order" ? activeClass : ""}>How to order</a>
          <a href="/contact" className={pathname === "/contact" ? activeClass : ""}>Contact Us</a>
          {isAuthenticated ? (
            <>
              <a href="/dashboard" className={pathname === "/dashboard" ? activeClass : ""}>Dashboard</a>
              <button onClick={handleSignOut} className="text-left text-red-600">Sign Out</button>
            </>
          ) : (
            <a href="/authentication" className={pathname === "/authentication" ? activeClass : ""}>Login or Register</a>
          )}
        </div>
      )}
    </div>
  );
};

export default Navbar;
