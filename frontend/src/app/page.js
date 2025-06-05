"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import {
  FaTasks,
  FaChartLine,
  FaMobileAlt,
  FaClipboardList,
  FaArrowRight,
  FaCheckCircle,
  FaClock,
  FaHourglass,
  FaDownload,
} from "react-icons/fa"

export default function Home() {
  const [deferredPrompt, setDeferredPrompt] = useState(null)
  const [isInstallable, setIsInstallable] = useState(false)
  const [isStandalone, setIsStandalone] = useState(false)

  useEffect(() => {
    // Check if the app is running in standalone mode (installed PWA)
    if (window.matchMedia("(display-mode: standalone)").matches || window.navigator.standalone === true) {
      setIsStandalone(true)
    }

    // Listen for beforeinstallprompt event
    window.addEventListener("beforeinstallprompt", (e) => {
      // Prevent Chrome 67 and earlier from automatically showing the prompt
      e.preventDefault()
      // Stash the event so it can be triggered later
      setDeferredPrompt(e)
      setIsInstallable(true)
    })

    // Listen for appinstalled event
    window.addEventListener("appinstalled", () => {
      // Log install to analytics
      console.log("PWA was installed")
      setIsInstallable(false)
    })
  }, [])

  const handleInstallClick = () => {
    if (!deferredPrompt) return

    // Show the install prompt
    deferredPrompt.prompt()

    // Wait for the user to respond to the prompt
    deferredPrompt.userChoice.then((choiceResult) => {
      if (choiceResult.outcome === "accepted") {
        console.log("User accepted the install prompt")
      } else {
        console.log("User dismissed the install prompt")
      }
      // Clear the saved prompt since it can't be used again
      setDeferredPrompt(null)
      setIsInstallable(false)
    })
  }

  return (
    <div className="min-h-screen bg-army-light">
      {/* Hero Section */}
      <section className="py-16 md:py-24 px-4">
        <div className="max-w-5xl mx-auto text-center">
          <div className="flex justify-center mb-8">
            <div className="p-4 bg-gradient-to-r from-army-green-800 to-army-green-700 rounded-2xl shadow-lg">
              <FaTasks className="text-4xl text-white" />
            </div>
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-army-dark mb-6 leading-tight">
            Manage Your Tasks <span className="text-army-green-800">Efficiently</span>
          </h1>
          <p className="text-xl md:text-2xl mb-10 text-gray-600 max-w-3xl mx-auto">
            TaskFlow helps you organize your work, boost productivity, and accomplish more with less stress.
          </p>

          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link
              href="/register"
              className="px-6 py-3 bg-gradient-to-r from-army-green-800 to-army-green-700 text-white rounded-xl font-medium transition-all transform hover:scale-[1.02] hover:-translate-y-0.5 hover:brightness-110 shadow-lg hover:shadow-xl hover:shadow-army-green-800/30 flex items-center gap-2"
            >
              Get Started <FaArrowRight className="text-sm" />
            </Link>
            <Link
              href="/login"
              className="px-6 py-3 bg-white text-army-dark rounded-xl font-medium transition-all hover:bg-gray-50 shadow-lg hover:shadow-xl flex items-center gap-2"
            >
              Login
            </Link>
          </div>

          {/* Install PWA Button - Only show when installable and not in standalone mode */}
          {isInstallable && !isStandalone && (
            <div className="mt-8">
              <button
                onClick={handleInstallClick}
                className="inline-flex items-center gap-2 px-6 py-3 bg-army-green-800 text-white rounded-xl font-medium transition-all hover:bg-army-green-700 shadow-lg"
              >
                <FaDownload className="text-sm" /> Install TaskFlow App
              </button>
              <p className="text-sm text-gray-600 mt-2">Install our app for the best experience!</p>
            </div>
          )}
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-white/80 backdrop-blur-sm px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-army-dark mb-4">Why Choose TaskFlow?</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Our intuitive task management solution helps you stay organized and focused on what matters most.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white/90 backdrop-blur-sm p-6 rounded-xl shadow-lg border border-gray-200/50 text-center hover:shadow-xl transition-all transform hover:-translate-y-1">
              <div className="flex justify-center mb-6">
                <div className="p-4 bg-army-light rounded-xl">
                  <FaClipboardList className="text-3xl text-army-green-800" />
                </div>
              </div>
              <h3 className="text-xl font-semibold mb-3 text-army-dark">Intuitive Task Management</h3>
              <p className="text-gray-600">
                Create, organize, and track your tasks with our simple drag-and-drop interface. Easily move tasks
                between different statuses.
              </p>
            </div>

            <div className="bg-white/90 backdrop-blur-sm p-6 rounded-xl shadow-lg border border-gray-200/50 text-center hover:shadow-xl transition-all transform hover:-translate-y-1">
              <div className="flex justify-center mb-6">
                <div className="p-4 bg-army-light rounded-xl">
                  <FaMobileAlt className="text-3xl text-army-green-800" />
                </div>
              </div>
              <h3 className="text-xl font-semibold mb-3 text-army-dark">Works Offline</h3>
              <p className="text-gray-600">
                Access your tasks even without internet connection. TaskFlow works offline and syncs when you're back
                online.
              </p>
            </div>

            <div className="bg-white/90 backdrop-blur-sm p-6 rounded-xl shadow-lg border border-gray-200/50 text-center hover:shadow-xl transition-all transform hover:-translate-y-1">
              <div className="flex justify-center mb-6">
                <div className="p-4 bg-army-light rounded-xl">
                  <FaChartLine className="text-3xl text-army-green-800" />
                </div>
              </div>
              <h3 className="text-xl font-semibold mb-3 text-army-dark">Track Your Progress</h3>
              <p className="text-gray-600">
                Visualize your workflow and track task progress across different stages. Celebrate your achievements as
                you complete tasks.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Task Status Section */}
      <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-army-dark mb-4">Task Management Made Simple</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Organize your tasks with our intuitive status system
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-white/90 backdrop-blur-sm p-6 rounded-xl shadow-lg border border-gray-200/50 hover:shadow-xl transition-all">
              <div className="flex items-center gap-4 mb-4">
                <div className="p-3 bg-yellow-50 rounded-xl">
                  <FaHourglass className="text-2xl text-yellow-500" />
                </div>
                <h3 className="text-lg font-semibold text-army-dark">Pending Tasks</h3>
              </div>
              <p className="text-gray-600">
                Keep track of tasks that are waiting to be started. Plan your work effectively with our pending task
                management.
              </p>
            </div>

            <div className="bg-white/90 backdrop-blur-sm p-6 rounded-xl shadow-lg border border-gray-200/50 hover:shadow-xl transition-all">
              <div className="flex items-center gap-4 mb-4">
                <div className="p-3 bg-blue-50 rounded-xl">
                  <FaClock className="text-2xl text-blue-500" />
                </div>
                <h3 className="text-lg font-semibold text-army-dark">In Progress</h3>
              </div>
              <p className="text-gray-600">
                Monitor tasks that are currently being worked on. Stay focused and track your active work items.
              </p>
            </div>

            <div className="bg-white/90 backdrop-blur-sm p-6 rounded-xl shadow-lg border border-gray-200/50 hover:shadow-xl transition-all">
              <div className="flex items-center gap-4 mb-4">
                <div className="p-3 bg-green-50 rounded-xl">
                  <FaCheckCircle className="text-2xl text-green-500" />
                </div>
                <h3 className="text-lg font-semibold text-army-dark">Completed</h3>
              </div>
              <p className="text-gray-600">
                Celebrate your achievements with our completed tasks view. Review your progress and maintain a record of
                accomplishments.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="bg-gradient-to-r from-army-green-800 to-army-green-700 rounded-2xl p-12 shadow-xl">
            <h2 className="text-3xl font-bold text-white mb-6">Ready to Get Started?</h2>
            <p className="text-white/90 text-xl mb-8">
              Join TaskFlow today and transform the way you manage your tasks
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Link
                href="/register"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white text-army-green-800 rounded-xl font-medium transition-all transform hover:scale-[1.02] hover:-translate-y-0.5 hover:brightness-110 shadow-lg hover:shadow-xl"
              >
                Create Free Account <FaArrowRight className="text-sm" />
              </Link>

              {/* Install PWA Button in CTA - Only show when installable and not in standalone mode */}
              {isInstallable && !isStandalone && (
                <button
                  onClick={handleInstallClick}
                  className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-army-green-600 text-white rounded-xl font-medium transition-all hover:bg-army-green-500 shadow-lg border border-white/20"
                >
                  <FaDownload className="text-sm" /> Install App
                </button>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
