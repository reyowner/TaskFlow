import "../styles/globals.css"
import { AuthProvider } from "@/contexts/AuthContext"
import ClientLayout from "@/components/ClientLayout"

// Metadata (server component)
export const metadata = {
  title: {
    template: "%s | TaskFlow",
    default: "TaskFlow",
  },
  description: "TaskFlow - Manage your tasks efficiently",
  icons: {
    icon: "/task.png",
  },
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "TaskFlow",
    startupImage: [
      {
        url: "/icons/icon-512x512.png",
        media: "(device-width: 320px) and (device-height: 568px) and (-webkit-device-pixel-ratio: 2)",
      },
    ],
  },
}

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
  themeColor: "#4b5320",
}

// Root layout (server component)
export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#4b5320" />
        <link rel="apple-touch-icon" href="/icons/icon-192x192.png" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="TaskFlow" />
      </head>
      <body className="min-h-screen flex flex-col bg-army-light">
        <AuthProvider>
          <ClientLayout>{children}</ClientLayout>
        </AuthProvider>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', function() {
                  navigator.serviceWorker.register('/sw.js').then(
                    function(registration) {
                      console.log('ServiceWorker registration successful');
                    },
                    function(err) {
                      console.log('ServiceWorker registration failed: ', err);
                    }
                  );
                });
              }
            `,
          }}
        />
      </body>
    </html>
  )
}
