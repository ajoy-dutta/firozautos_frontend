"use client";
import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "../provider/UserProvider";
import { LuDelete } from "react-icons/lu";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import modelImage from "@/app/assets/model.jpg";
import bikeImage from "@/app/assets/bike.jpg";
import Image from "next/image";
import Link from "next/link";
import AxiosInstance from "@/app/components/AxiosInstance";

export default function Authentication() {
  const router = useRouter();
  const { refreshUser } = useUser();

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [registers, setRegister] = useState(false);
  const [showName1, setShowName1] = useState("");
  const fileInputRef = useRef();

  const [credentials, setCredentials] = useState({ username: "", password: "" });
  const [user, setUser] = useState({
    username: "",
    full_name: "",
    email: "",
    phone: "",
    profile_picture: null,
    password: "",
    confirm_password: "",
  });

  const handleLoginChange = (e) => setCredentials({ ...credentials, [e.target.name]: e.target.value });

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!credentials.username || !credentials.password) return alert("Username and password are required!");
    try {
      const res = await AxiosInstance.post("login/", credentials);
      localStorage.setItem("access_token", res.data.access);
      refreshUser();
      router.push("/dashboard");
    } catch (error) {
      alert(error.response?.status === 401 ? "Invalid credentials" : "Login failed!");
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files[0]) {
      const file = e.target.files[0];
      setShowName1(file.name);
      setUser({ ...user, profile_picture: file });
    }
  };

  const handleClearFile = () => {
    setShowName1("");
    setUser({ ...user, profile_picture: null });
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (user.password !== user.confirm_password) return alert("Passwords do not match!");

    const formData = new FormData();
    Object.entries(user).forEach(([key, value]) => value && formData.append(key, value));

    try {
      await AxiosInstance.post("register/", formData, { headers: { "Content-Type": "multipart/form-data" } });
      setUser({ username: "", full_name: "", email: "", phone: "", profile_picture: null, password: "", confirm_password: "" });
      setShowName1("");
      alert("Registered Successfully!");
    } catch (error) {
      alert("Registration failed!");
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-2 py-4 bg-cover bg-center" style={{ backgroundImage: "url('/register.avif')" }}>
      <div className="bg-white bg-opacity-90 backdrop-blur-md rounded-2xl shadow-2xl flex flex-col lg:flex-row overflow-hidden max-w-4xl w-full">
<div
  className={`w-full lg:w-2/5 relative p-6 flex flex-col items-center justify-center bg-white transition-all duration-500 ${
    registers ? "min-h-[600px]" : "min-h-[400px]"
  }`}
>
         
<Image src={modelImage} alt="Model" width={220} height={registers ? 330 : 200} className="rounded-xl object-cover shadow-lg mb-6" />
          <Image src={bikeImage} alt="Product" width={140} height={100} className="rounded-xl object-cover shadow-md" />
         <div className="mt-8">
            <Link href="/" className="text-pink-500 border border-pink-400 px-4 py-2 rounded-full font-semibold hover:bg-pink-100 transition">
              ← Back to Home
            </Link>
          </div>
        </div>

        <div className="w-full lg:w-3/5 p-10 bg-white">
          {registers ? (
            <form onSubmit={handleSubmit} className="space-y-6">
              <h2 className="text-2xl font-bold text-pink-500 mb-6 text-center">Create an Account</h2>
              {["username", "full_name", "email", "phone"].map((field) => (
                <input
                  key={field}
                  name={field}
                  value={user[field]}
                  onChange={(e) => setUser({ ...user, [field]: e.target.value })}
                  placeholder={field.replace("_", " ").toUpperCase()}
                  className="w-full px-2 py-2 rounded-full border border-gray-300 bg-gray-100 focus:outline-none focus:ring-2 focus:ring-pink-400"
                  required={field !== "email"}
                />
              ))}

              <div>
                <label className="text-sm mb-1 block">Profile Picture</label>
                <div className="cursor-pointer border px-4 py-2 rounded-full text-gray-600 bg-gray-100" onClick={() => fileInputRef.current.click()}>
                  {showName1 || "Choose File"}
                </div>
                <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" />
                {showName1 && (
                  <div className="text-sm text-red-500 flex items-center gap-2 mt-2">
                    <span>{showName1}</span>
                    <button onClick={handleClearFile} type="button">
                      <LuDelete />
                    </button>
                  </div>
                )}
              </div>

              {["password", "confirm_password"].map((field) => (
                <div key={field} className="relative">
                  <input
                    name={field}
                    type={field === "password" ? (showPassword ? "text" : "password") : showConfirmPassword ? "text" : "password"}
                    value={user[field]}
                    onChange={(e) => setUser({ ...user, [field]: e.target.value })}
                    placeholder={field.replace("_", " ").toUpperCase()}
                    className="w-full border px-2 py-2 rounded-full bg-gray-100 pr-10 focus:outline-none focus:ring-2 focus:ring-pink-400"
                    required
                  />
                  <span
                    onClick={() => field === "password" ? setShowPassword(!showPassword) : setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-4 top-3.5 cursor-pointer text-gray-500"
                  >
                    {field === "password"
                      ? showPassword ? <FaEyeSlash /> : <FaEye />
                      : showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                  </span>
                </div>
              ))}

              <button type="submit" className="w-full bg-pink-500 hover:bg-pink-600 text-white font-semibold py-3 rounded-full">
                SIGN UP
              </button>
              <p className="text-sm text-center text-gray-500">
                Already have an account? <span onClick={() => setRegister(false)} className="text-pink-500 cursor-pointer font-medium">Login</span>
              </p>
            </form>
          ) : (
            <form onSubmit={handleLogin} className="space-y-6">
              <h2 className="text-2xl font-bold text-pink-500 mb-6 text-center">Login</h2>
              <input
                name="username"
                value={credentials.username}
                onChange={handleLoginChange}
                placeholder="Username"
                className="w-full border px-5 py-3 rounded-full bg-gray-100 focus:outline-none focus:ring-2 focus:ring-pink-400"
                required
              />
              <div className="relative">
                <input
                  name="password"
                  type={showPassword ? "text" : "password"}
                  value={credentials.password}
                  onChange={handleLoginChange}
                  placeholder="Password"
                  className="w-full border px-5 py-3 rounded-full bg-gray-100 pr-10 focus:outline-none focus:ring-2 focus:ring-pink-400"
                  required
                />
                <span
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute top-3.5 right-4 cursor-pointer text-gray-500"
                >
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </span>
              </div>
              <button className="w-full bg-pink-500 hover:bg-pink-600 text-white py-3 rounded-full font-semibold cursor-pointer">
                LOGIN
              </button>
              <p className="text-center text-sm text-gray-500">
                Don’t have an account? <span onClick={() => setRegister(true)} className="text-pink-500 font-medium cursor-pointer">Register</span>
              </p>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}