"use client";

import Image from "next/image";
import Link from "next/link";
import { FaCarAlt, FaTruckPickup, FaSearch, FaShippingFast, FaShieldAlt, FaClock } from "react-icons/fa";
import banner from "@/app/assets/Banner.jpg";

export default function Base() {
  return (
    <main className="bg-white min-h-screen">
      {/* Hero Section */}
      <section className="relative h-[55vh] w-full overflow-hidden">
        <Image
          src={banner}
          alt="Hero Banner"
          fill
          style={{ objectFit: "contain" }}
          priority
        />


        <div className="absolute inset-0 bg-black/50 z-0"></div>

        {/* TEXT BLOCK */}
        <div className="absolute inset-0 flex items-center justify-center z-10">
          <div className="text-white text-center px-4">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Feroz Autos</h1>
            <p className="text-lg md:text-xl">Your Trusted Source for Motorcycle Parts & Accessories</p>
          </div>
        </div>
      </section>

      {/* Search Panel */}
      <section className="relative z-20 -mt-12 px-4">
        <div className="bg-white shadow-lg rounded-lg max-w-5xl mx-auto p-6 grid grid-cols-1 md:grid-cols-5 gap-4">
          <select className="border rounded px-3 py-2 text-sm">
            <option>Make</option>
            <option>Honda</option>
            <option>Yamaha</option>
          </select>
          <select className="border rounded px-3 py-2 text-sm">
            <option>Model</option>
            <option>CBR</option>
            <option>FZ</option>
          </select>
          <select className="border rounded px-3 py-2 text-sm">
            <option>Year</option>
            <option>2023</option>
            <option>2022</option>
          </select>
          <select className="border rounded px-3 py-2 text-sm">
            <option>Category</option>
            <option>Engine</option>
            <option>Brake</option>
          </select>
          <button className="bg-red-600 hover:bg-red-700 text-white rounded px-4 py-2 flex items-center justify-center">
            <FaSearch className="mr-2" /> Search Now
          </button>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-16 px-6 max-w-7xl mx-auto text-center">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <FaShieldAlt className="text-red-500 text-3xl mx-auto mb-3" />
            <h4 className="font-semibold">Original Products</h4>
            <p className="text-sm text-gray-600">Only genuine autos parts</p>
          </div>
          <div>
            <FaShippingFast className="text-red-500 text-3xl mx-auto mb-3" />
            <h4 className="font-semibold">Fast Delivery</h4>
            <p className="text-sm text-gray-600">All Over Bangladesh</p>
          </div>
          <div>
            <FaClock className="text-red-500 text-3xl mx-auto mb-3" />
            <h4 className="font-semibold">24/7 Support</h4>
            <p className="text-sm text-gray-600">Dedicated customer care</p>
          </div>
          <div>
            <FaShieldAlt className="text-red-500 text-3xl mx-auto mb-3" />
            <h4 className="font-semibold">Payment Security</h4>
            <p className="text-sm text-gray-600">100% Secured Transactions</p>
          </div>
        </div>
      </section>


      {/* Why Choose Us */}
      <section className="bg-pink-50 py-16 px-6">
        <div className="max-w-5xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-6 text-gray-800">Why Firoz Autos?</h2>
          <p className="text-lg text-gray-600 mb-10">Trusted by dealers across Bangladesh since 2012.</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { title: "Wholesale & Retail", desc: "We serve both retail buyers and bulk purchasers at great prices." },
              { title: "Top Brands", desc: "Parts for Hero, Yamaha, Suzuki, Honda and more." },
              { title: "Nationwide Reach", desc: "Supplying quality parts to 25+ districts across the country." },
            ].map((item, idx) => (
              <div key={idx} className="bg-white shadow rounded-lg p-6">
                <h4 className="text-xl font-semibold text-pink-500">{item.title}</h4>
                <p className="mt-2 text-gray-600">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Call To Action */}
      <section className="bg-black text-white py-16 text-center px-6">
        <h2 className="text-3xl md:text-4xl font-bold mb-4">Need Motorcycle Parts in Bulk?</h2>
        <p className="text-lg mb-6">Contact us now for dealer pricing and fast delivery.</p>
        <Link href="/contact">
          <button className="bg-pink-500 hover:bg-pink-600 px-6 py-3 rounded-full font-semibold">
            Contact Us
          </button>
        </Link>
      </section>
    </main>
  );
}
