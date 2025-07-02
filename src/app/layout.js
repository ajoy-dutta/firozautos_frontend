import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import ClientLayout from "./components/ClientLayout";
import { UserProvider } from "./provider/UserProvider";
import { Toaster } from "react-hot-toast";  // ✅ import toaster

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "Feroz Autos",
  description: "",
  icons: {
    icon: "/Feroz_logo.jpg",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <UserProvider>
          <ClientLayout>
            {children}
          </ClientLayout>
        </UserProvider>
        <Toaster position="top-center" reverseOrder={false} />  {/* ✅ show toast in the middle top */}
      </body>
    </html>
  );
}
