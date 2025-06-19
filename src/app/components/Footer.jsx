// components/Footer.jsx
import Image from "next/image";
import Link from "next/link";
import React from "react";

export default function Footer() {
  return (
    <footer className="bg-white border-t border-teal-500 pt-6 pb-6 px-4 sm:px-10">
      <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6 text-sm text-gray-700">
        <div>
          <h4 className="font-semibold mb-2">GET TO KNOW US</h4>
          <ul className="space-y-1">
            <li>Careers</li>
            <li>Blog</li>
            <li>About</li>
            <li>Store locator</li>
            <li>Contact us</li>
          </ul>
        </div>
        <div>
          <h4 className="font-semibold mb-2">LOOKING FOR SOLUTION?</h4>
          <ul className="space-y-1">
            <li>Your Account</li>
            <li>Your Orders</li>
            <li>Shipping Rates & Policies</li>
            <li>Returns & Replacements</li>
            <li>Coupons & Discounts</li>
            <li>Help</li>
          </ul>
        </div>
        <div>
          <h4 className="font-semibold mb-2">Links</h4>
          <div className="flex flex-col space-y-1">
            <Link className="hover:underline hover:text-teal-600" href="https://mmcollege.edu.bd/">Govt. M M College, Jashore</Link>
            <Link className="hover:underline hover:text-teal-600" href="https://www.nu.ac.bd/"> National University Bangladesh </Link>
            <Link className="hover:underline hover:text-teal-600" href="https://moedu.portal.gov.bd/">Ministry of Education</Link>
            <Link className="hover:underline hover:text-teal-600" href="https://ibas.finance.gov.bd">Integrated Budget & Accounting System (IBAS++)
</Link>
          </div>
        </div>
        <div>
          <h4 className="font-semibold mb-2">FOLLOW US</h4>
          <ul className="space-y-1">
            <li>Facebook</li>
            <li>X</li>
            <li>Instagram</li>
            <li>YouTube</li>
            <li>TikTok</li>
          </ul>
        </div>
      </div>

      <hr className="border-t border-teal-500 my-6" />

      <div className="max-2xl md:max-w-7xl mx-auto flex  justify-between items-center text-sm text-gray-800 gap-4 px-2">
        <div className="flex items-center gap-2 font-bold text-lg text-teal-600">
          <Image
            src="/mmLogo.png"
            alt=""
            width={50} // or your desired width
            height={40} // or your desired height
          />
        </div>

        <div className="text-center sm:text-left">
          <p>Call: XXXXX</p>
          <p>( From 9 AM - 10 PM, Except Saturday)</p>
        </div>

        <div className="text-right">
          <p>WhatsApp: XXXXX</p>
          <p>XXXXXX</p>
          <p>Phone:</p>
        </div>
      </div>
    </footer>
  );
}
