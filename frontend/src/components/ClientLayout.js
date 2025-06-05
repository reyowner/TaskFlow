"use client"

import { useEffect, useState } from "react"
import { usePathname, useRouter } from "next/navigation"
import Link from "next/link"
import Navbar from "./Navbar"
import { useAuth } from "@/contexts/AuthContext"
import { FaGithub } from "react-icons/fa"
import { Toaster } from "react-hot-toast"

const ClientLayout = ({ children }) => {
  const auth = useAuth()
  const router = useRouter()
  const pathname = usePathname()
  const [isStandalone, setIsStandalone] = useState(false)

  const publicRoutes = ["/login", "/register", "/"]
  const isPublicRoute = publicRoutes.includes(pathname)

  useEffect(() => {
    // Check if the app is running in standalone mode (installed PWA)
    if (window.matchMedia("(display-mode: standalone)").matches || window.navigator.standalone === true) {
      setIsStandalone(true)
    }

    // Don't do anything while still loading
    if (auth?.loading) {
      return
    }

    // If user is not authenticated and trying to access protected route
    if (!auth?.isAuthenticated && !isPublicRoute) {
      router.push("/login")
      return
    }

    // If user is authenticated and on home page, redirect to overview
    if (auth?.isAuthenticated && pathname === "/") {
      router.push("/overview")
      return
    }
  }, [auth?.isAuthenticated, auth?.loading, router, isPublicRoute, pathname])

  // Show loading spinner while checking authentication
  if (auth?.loading) {
    return (
      <>
        <Toaster
          position="top-right"
          toastOptions={{
            // Mobile-optimized toast styling
            style: {
              fontSize: "14px",
              padding: "12px 16px",
              maxWidth: "90vw",
              borderRadius: "8px",
            },
            success: {
              style: {
                background: "#6b7040",
                color: "white",
              },
            },
            error: {
              style: {
                background: "#dc2626",
                color: "white",
              },
            },
            duration: 1500,
          }}
        />
        <Navbar isStandalone={isStandalone} />
        <main className="flex-grow container mx-auto px-4 py-8 flex items-center justify-center">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-army-light border-t-army-green-800 rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600 font-medium">Loading...</p>
          </div>
        </main>
      </>
    )
  }

  return (
    <>
      <Toaster
        position="top-right"
        toastOptions={{
          // Mobile-optimized toast styling
          style: {
            fontSize: "14px",
            padding: "12px 16px",
            maxWidth: "90vw",
            borderRadius: "8px",
          },
          success: {
            style: {
              background: "#6b7040",
              color: "white",
            },
          },
          error: {
            style: {
              background: "#dc2626",
              color: "white",
            },
          },
          duration: 1500,
        }}
      />
      <Navbar isStandalone={isStandalone} />

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
                Email:{" "}
                <a href="mailto:domasigreoner@gmail.com" className="underline hover:text-white">
                  domasigreoner@gmail.com
                </a>
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
                <Link
                  href="https://github.com/reyowner/TaskFlow"
                  className="block text-gray-300 hover:text-white text-sm"
                >
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
  )
}

export default ClientLayout
