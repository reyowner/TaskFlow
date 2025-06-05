"use client"

import { useEffect, useState } from "react"
import "../styles/globals.css"

function MyApp({ Component, pageProps }) {
  const [showSplash, setShowSplash] = useState(true)

  useEffect(() => {
    // Check if the app is running in standalone mode (installed PWA)
    const isStandalone = window.matchMedia("(display-mode: standalone)").matches || window.navigator.standalone === true

    // Only show splash screen in standalone mode
    if (isStandalone) {
      // Hide splash screen after 1.5 seconds
      const timer = setTimeout(() => {
        setShowSplash(false)
      }, 1500)

      return () => clearTimeout(timer)
    } else {
      setShowSplash(false)
    }
  }, [])

  return (
    <>
      {showSplash && (
        <div className="splash-screen">
          <img src="/task.png" alt="TaskFlow Logo" className="splash-logo" />
          <h1 className="text-white text-2xl font-bold">TaskFlow</h1>
        </div>
      )}
      <Component {...pageProps} />
    </>
  )
}

export default MyApp
