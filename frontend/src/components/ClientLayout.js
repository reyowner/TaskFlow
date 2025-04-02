// src/components/ClientLayout.js
"use client";

import React, { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import Navbar from "./Navbar";
import { useAuth } from "@/contexts/AuthContext";
import { FaGithub } from "react-icons/fa";

const ClientLayout = ({ children }) => {
  const auth = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  const publicRoutes = ["/login", "/register"];
  const isPublicRoute = publicRoutes.includes(pathname);

  useEffect(() => {
    if (!isPublicRoute && auth?.user === null && pathname !== "/") {
      router.push("/login");
    }
  }, [auth?.user, router, isPublicRoute, pathname]);

  return (
    <>
      <Navbar />
      <main className="flex-grow container mx-auto px-4 py-8">{children}</main>
      <footer className="bg-army-green-800 text-white py-6">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Company Info */}
            <div>
              <h3 className="text-lg font-semibold mb-2">TaskFlow</h3>
              <p className="text-gray-300 text-sm">
                Manage your tasks efficiently with our simple and intuitive task management system.
              </p>
            </div>
            
            {/* Contact Us */}
            <div>
              <h3 className="text-lg font-semibold mb-2">Contact Us</h3>
              <p className="text-gray-300 text-sm">Have questions or need support?</p>
              <p className="text-gray-300 text-sm">
                Email: <a href="mailto:domasigreoner@gmail.com" className="underline hover:text-white">domasigreoner@gmail.com</a>
              </p>
            </div>
            
            {/* GitHub / Repo Links */}
            <div>
              <h3 className="text-lg font-semibold flex items-center mb-2">
                <FaGithub className="mr-2" size={20} />
                <span>GitHub</span>
              </h3>
              <div className="space-y-1">
                <Link href="https://github.com/reyowner" className="block text-gray-300 hover:text-white text-sm">
                  My Account
                </Link>
                <Link href="https://github.com/reyowner/TaskFlow" className="block text-gray-300 hover:text-white text-sm">
                  TaskFlow Repository
                </Link>
              </div>
            </div>
          </div>
          
          <div className="border-t border-gray-700 mt-4 pt-4 text-center text-gray-300 text-sm">
            <p>&copy; {new Date().getFullYear()} TaskFlow. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </>
  );
};

export default ClientLayout;