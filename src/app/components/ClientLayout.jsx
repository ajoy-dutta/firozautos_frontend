"use client";

import React from "react";
import SidebarContent from "./Sidebar";
import ProtectedRoute from "../provider/ProtectedRoute";
import { usePathname } from "next/navigation";

import Footer from "./Footer";
import Navbar from "./Navbar";

export default function ClientLayout({ children }) {
  const pathname = usePathname();
  const isHomePage = pathname === "/";
  const isLoginPage = pathname === "/authentication";
  const isHonorboard = pathname === "/honorboard";
  const isStudent = pathname === "/students";
  const isAlumni = pathname === "/alumni";
  const isTeachers = pathname === "/teachers";
  const isResult = pathname === "/result";
  const isPhotoGallery = pathname === "/photogallery";
  const isNotice = pathname === "/noticeboard";
  const isAbout = pathname === "/aboutcollege";
  const isHistoricalPlace = pathname === "/historicalplace";
  const isCollegeHistory = pathname === "/collegehistory";
  const isOfficeOfPrincipal = pathname === "/officeofprincipal";
  const isOfficeOfVicePrinciple = pathname === "/officeofVicePrinciple";
  const isCollegeLocation = pathname === "/collegelocation";
  const isFormalPrincipal = pathname === "/formarprincipal";
  const isFormalVicePrincipal = pathname === "/formarviceprincipal";
  const isNotableAlumni = pathname === "/notablealumni";
  const isCitizenCharter = pathname === "/citizencharter";
  const isFormerFaculty = pathname === "/formerfaculty";

  const user =
    typeof window !== "undefined" ? localStorage.getItem("user") : null;

  const isAuthenticated =
    user !== null && user !== undefined && user !== "null";

  if (isAuthenticated) {
    if (isHonorboard || isStudent || isTeachers) {
      return (
        <div className="flex h-screen">
          <SidebarContent />
          <div className="flex-1 bg-slate-200 p-10 overflow-y-auto">
            {children}
          </div>
        </div>
      );
    }
  }

  console.log("Authenticated:", isAuthenticated);

  if (
    isHomePage ||
    isHonorboard ||
    isStudent ||
    isTeachers ||
    isResult ||
    isNotice ||
    isPhotoGallery ||
    isAlumni ||
    isAbout ||
    isHistoricalPlace ||
    isCollegeHistory ||
    isOfficeOfPrincipal ||
    isOfficeOfVicePrinciple ||
    isCollegeLocation ||
    isFormalPrincipal ||
    isFormalVicePrincipal ||
    isNotableAlumni ||
    isCitizenCharter ||
    isFormerFaculty
    
  ) {
    return (
      <>
        <Navbar />
        <div className="bg-slate-200 ">{children}</div>
        <Footer />
      </>
    );
  }
  if (isLoginPage) {
    return <>{children}</>;
  }

  return (
    <div>
      <ProtectedRoute>
        <div className="flex h-screen">
          <SidebarContent />
          <div className="flex-1 bg-slate-200 p-10 overflow-y-auto">
            {children}
          </div>
        </div>
      </ProtectedRoute>
    </div>
  );
}
