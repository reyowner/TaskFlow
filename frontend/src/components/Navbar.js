"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/AuthContext"
import { FaTasks, FaSignOutAlt, FaBars, FaTimes, FaFolder, FaDownload } from "react-icons/fa"

const Navbar = ({ isStandalone = false }) => {
  const { user, logout } = useAuth()
  const router = useRouter()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [deferredPrompt, setDeferredPrompt] = useState(null)
  const [isInstallable, setIsInstallable] = useState(false)
  const [showInstallModal, setShowInstallModal] = useState(false)

  useEffect(() => {
    // Listen for beforeinstallprompt event
    window.addEventListener("beforeinstallprompt", (e) => {
      e.preventDefault()
      setDeferredPrompt(e)
      setIsInstallable(true)
    })

    // Listen for appinstalled event
    window.addEventListener("appinstalled", () => {
      console.log("PWA was installed")
      setIsInstallable(false)
      setShowInstallModal(false)
    })
  }, [])

  const handleLogout = () => {
    logout()
    router.push("/login")
  }

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen)
  }

  const handleInstallClick = () => {
    setShowInstallModal(true)
  }

  const confirmInstall = () => {
    if (!deferredPrompt) return

    deferredPrompt.prompt()
    deferredPrompt.userChoice.then((choiceResult) => {
      if (choiceResult.outcome === "accepted") {
        console.log("User accepted the install prompt")
      } else {
        console.log("User dismissed the install prompt")
      }
      setDeferredPrompt(null)
      setIsInstallable(false)
      setShowInstallModal(false)
    })
  }

  // Determine the correct link for TaskFlow logo based on user authentication
  const getTaskFlowLink = () => {
    return user ? "/overview" : "/"
  }

  return (
    <>
      <nav className={`bg-army-green-800 text-white shadow-md ${isStandalone ? "pt-safe-top" : ""}`}>
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center py-4">
            <Link
              href={getTaskFlowLink()}
              className="flex items-center hover:text-yellow-400 transition-colors duration-200"
            >
              <FaTasks className="mr-2 text-2xl" />
              <span className="text-xl font-bold">TaskFlow</span>
            </Link>

            {/* Desktop navigation */}
            <div className="hidden md:flex items-center space-x-4">
              {user ? (
                <>
                  <Link href="/categories" className="hover:text-yellow-400 flex items-center">
                    <FaFolder className="mr-1" /> Categories
                  </Link>
                  <button onClick={handleLogout} className="flex items-center hover:text-yellow-400">
                    <span className="mr-1">Logout</span>
                    <FaSignOutAlt />
                  </button>
                </>
              ) : (
                <>
                  <Link href="/login" className="hover:text-yellow-400">
                    Login
                  </Link>
                  <Link href="/register" className="hover:text-yellow-400">
                    Register
                  </Link>
                </>
              )}
            </div>

            {/* Mobile navigation - Install button and burger menu */}
            <div className="md:hidden flex items-center space-x-3">
              {/* Install App button - Only show when installable and not in standalone mode */}
              {isInstallable && !isStandalone && (
                <button
                  onClick={handleInstallClick}
                  className="flex items-center justify-center p-2 text-white hover:text-yellow-400 focus:outline-none transition-colors"
                  aria-label="Install TaskFlow App"
                >
                  <FaDownload size={20} />
                </button>
              )}

              {/* Mobile menu button - at the far right */}
              <button
                className="flex items-center text-white focus:outline-none"
                onClick={toggleMenu}
                aria-label={isMenuOpen ? "Close menu" : "Open menu"}
              >
                {isMenuOpen ? <FaTimes size={24} /> : <FaBars size={24} />}
              </button>
            </div>
          </div>

          {/* Mobile menu */}
          {isMenuOpen && (
            <div className="md:hidden bg-army-green-800 py-4 border-t border-army-green-700">
              {user ? (
                <div className="flex flex-col space-y-3">
                  <Link
                    href="/categories"
                    className="px-4 py-2 hover:bg-army-green-700 rounded-lg flex items-center"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <FaFolder className="mr-2" /> My Categories
                  </Link>

                  <button
                    onClick={() => {
                      handleLogout()
                      setIsMenuOpen(false)
                    }}
                    className="px-4 py-2 hover:bg-army-green-700 rounded-lg flex items-center text-left w-full"
                  >
                    <FaSignOutAlt className="mr-2" /> Logout
                  </button>
                </div>
              ) : (
                <div className="flex flex-col space-y-3">
                  <Link
                    href="/login"
                    className="px-4 py-2 hover:bg-army-green-700 rounded-lg"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Login
                  </Link>
                  <Link
                    href="/register"
                    className="px-4 py-2 hover:bg-army-green-700 rounded-lg"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Register
                  </Link>
                </div>
              )}
            </div>
          )}
        </div>
      </nav>

      {/* Install Confirmation Modal */}
      {showInstallModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex justify-center items-center p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-sm w-full overflow-hidden">
            <div className="bg-gradient-to-r from-army-green-800 to-army-green-700 px-6 py-4">
              <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                <FaDownload className="text-base" />
                Install TaskFlow App
              </h3>
            </div>
            <div className="p-6">
              <div className="flex items-center gap-4 mb-4">
                <img src="/task.png" alt="TaskFlow" className="w-12 h-12 rounded-lg" />
                <div>
                  <h4 className="font-semibold text-army-dark">TaskFlow</h4>
                  <p className="text-sm text-gray-600">Task Management App</p>
                </div>
              </div>
              <p className="text-gray-600 mb-6 text-sm">
                Install TaskFlow on your device for quick access and a better experience. The app will work offline and
                send you notifications.
              </p>
              <div className="flex flex-col gap-3">
                <button
                  onClick={confirmInstall}
                  className="w-full px-4 py-3 bg-gradient-to-r from-army-green-800 to-army-green-700 text-white rounded-lg font-medium transition-all transform hover:scale-[1.02] hover:-translate-y-0.5 hover:brightness-110 shadow-lg"
                >
                  Install App
                </button>
                <button
                  onClick={() => setShowInstallModal(false)}
                  className="w-full px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium transition-all"
                >
                  Maybe Later
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default Navbar
