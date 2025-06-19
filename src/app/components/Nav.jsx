"use client";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { FiLogIn } from "react-icons/fi";

export default function NavbarWithDropdown() {
  const [serviceDropdownOpen, setServiceDropdownOpen] = useState(false);
  const [moreDropdownOpen, setMoreDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const serviceRef = useRef();
  const moreRef = useRef();
  const menuRef = useRef(null);

  const pathname = usePathname();

  const user =
    typeof window !== "undefined" ? localStorage.getItem("user") : null;
  const isAuthenticated = user && user !== "null";

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 80);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (moreRef.current && !moreRef.current.contains(e.target)) {
        setMoreDropdownOpen(false);
      }
      if (serviceRef.current && !serviceRef.current.contains(e.target)) {
        setServiceDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleDropdownItemClick = () => {
    setMoreDropdownOpen(false);
    setServiceDropdownOpen(false);
  };

  const handleLinkClick = () => {
    setMobileMenuOpen(false);
  };

  const isActive = (route) =>
    pathname === route
      ? "font-bold text-[#129990]  border-b-2 border-[#129990]"
      : "";

  // ----------------------------
  // Mobile Navbar
  // ----------------------------
  const MobileNavbar = () => (
    <nav
      className="md:hidden bg-[#002a32] text-white fixed top-0 left-0 w-full z-[9999]"
      ref={menuRef}
    >
      <div className="flex items-center justify-between px-4 py-2">
        <Link href="/" className="text-2xl font-semibold text-white">
          <Image src="/mmLogo.png" alt="Logo" width={40} height={40} />
        </Link>
        <button
          className="focus:outline-none"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            {mobileMenuOpen ? (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 18L18 6M6 6l12 12"
              />
            ) : (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M4 6h16M4 12h16M4 18h16"
              />
            )}
          </svg>
        </button>
      </div>

      {mobileMenuOpen && (
        <ul className="flex flex-col gap-2 px-4 pb-4 text-sm bg-[#002a32] text-white shadow-md">
          <li>
            <Link href="/" onClick={handleLinkClick} className={isActive("/")}>
              Home
            </Link>
          </li>
          <li>
            <Link
              href="/facilities"
              onClick={handleLinkClick}
              className={isActive("/facilities")}
            >
              1st Batch
            </Link>
          </li>
          <li>
            <Link
              href="/seminar"
              onClick={handleLinkClick}
              className={isActive("/seminar")}
            >
              2nd Batch
            </Link>
          </li>
          <li>
            <Link
              href="/honorboard"
              onClick={handleLinkClick}
              className={isActive("/honorboard")}
            >
              Honor Board
            </Link>
          </li>
          <li>
            <Link
              href="/teachers"
              onClick={handleLinkClick}
              className={isActive("/teachers")}
            >
              Teachers
            </Link>
          </li>
          <li>
            <Link
              href="/noticeboard"
              onClick={handleLinkClick}
              className={isActive("/noticeboard")}
            >
              Notice
            </Link>
          </li>
          <li>
            <Link
              href="/students"
              onClick={handleLinkClick}
              className={isActive("/students")}
            >
              Students
            </Link>
          </li>
          <li>
            {isAuthenticated ? (
              <Link
                href="/registration"
                onClick={handleLinkClick}
                className={isActive("/registration")}
              >
                Dashboard
              </Link>
            ) : (
              <li className={`hover:underline ${isActive("/authentication")}`}>
                <span className="flex items-center gap-1">
                  <Link
                    className="flex items-center justify-center gap-2"
                    href="/authentication"
                  >
                    Log In{" "}
                    <span>
                      <FiLogIn />
                    </span>{" "}
                  </Link>
                </span>
              </li>
            )}
          </li>
        </ul>
      )}
    </nav>
  );

  // ----------------------------
  // Desktop Navbar
  // ----------------------------
  const DesktopNavbar = () => (
    <nav
      className={`hidden md:block fixed top-0 left-0 w-full z-50 transition-all duration-300 ${
        scrolled ? "bg-[#002a32] shadow-md text-white" : "bg-transparent"
      } ${pathname === "/" ? "text-white" : "text-black"}`}
    >
      <div className="flex items-center justify-between px-8 py-2">
        <Link href="/" className="text-2xl font-semibold">
          <Image src="/mmLogo.png" alt="Logo" width={50} height={50} />
        </Link>


        <ul className="flex items-center gap-6">
          <li className={`hover:underline ${isActive("/")}`}>
            <Link href="/">Home</Link>
          </li>

          

          <li className={`hover:underline ${isActive("/honorboard")}`}>
            <Link href="/honorboard">Honor Board</Link>
          </li>
          <li className={`hover:underline ${isActive("/teachers")}`}>
            <Link href="/teachers">Teachers</Link>
          </li>
          <li className={`hover:underline ${isActive("/students")}`}>
            <Link href="/students">Students</Link>
          </li>
          <li className={`hover:underline ${isActive("/alumni")}`}>
            <Link href="/alumni">Alumni</Link>
          </li>
          <li>
            <Link
              href="/noticeboard"
              onClick={handleLinkClick}
              className={isActive("/noticeboard")}
            >
              Notice
            </Link>
          </li>
          <li className={`hover:underline ${isActive("/seminars")}`}>
            <Link href="/seminars">Seminars</Link>
          </li>
          <li className={`hover:underline ${isActive("/photogallery")}`}>
            <Link href="/photogallery">Gallery</Link>
          </li>
          <li className={`hover:underline ${isActive("/result")}`}>
            <Link href="/result">Results</Link>
          </li>

          {/* <li className="relative" ref={serviceRef}>
            <button
              onClick={() => setServiceDropdownOpen((prev) => !prev)}
              className="flex items-center gap-1 hover:underline"
            >
              <span
                className={
                  pathname === "/registration" || pathname === "/authentication"
                    ? "font-bold border-b-2 border-white"
                    : ""
                }
              >
                Services
              </span>
              <svg
                className={`transition-transform duration-300 ${
                  serviceDropdownOpen ? "rotate-180" : ""
                }`}
                width="20"
                height="20"
                fill="none"
                stroke="currentColor"
              >
                <path
                  d="m6 9 6 6 6-6"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
            <ul
              className={`absolute top-full mt-2 z-10 w-24 rounded-md text-xs bg-gray-700 p-2 text-white shadow-lg transform transition-all duration-300 origin-top ${
                serviceDropdownOpen
                  ? "opacity-100 scale-100 visible"
                  : "opacity-0 scale-95 invisible"
              }`}
            >
              <li className="px-1 py-1 text-center hover:underline">
                {isAuthenticated ? (
                  <Link
                    href="/registration"
                    onClick={handleDropdownItemClick}
                    className={isActive("/registration")}
                  >
                    Dashboard
                  </Link>
                ) : (
                  <Link
                    href="/authentication"
                    onClick={handleDropdownItemClick}
                    className={isActive("/authentication")}
                  >
                    Login
                  </Link>
                )}
              </li>
            </ul>
          </li> */}

          <li>
            {isAuthenticated ? (
              <Link
                href="/registration"
                onClick={handleLinkClick}
                className={isActive("/registration")}
              >
                Dashboard
              </Link>
            ) : (
              <li className={`hover:underline ${isActive("/authentication")}`}>
                <span className="flex items-center gap-1">
                  <Link
                    className="flex items-center justify-center gap-2"
                    href="/authentication"
                  >
                    Log In{" "}
                    <span>
                      <FiLogIn />
                    </span>{" "}
                  </Link>
                </span>
              </li>
            )}
          </li>
        </ul>
      </div>
    </nav>
  );

  return (
    <>
      <MobileNavbar />
      <DesktopNavbar />
    </>
  );
}
