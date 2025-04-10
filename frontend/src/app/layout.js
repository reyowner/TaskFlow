import "../styles/globals.css";
import { AuthProvider } from "@/contexts/AuthContext";
import ClientLayout from "@/components/ClientLayout";

// Metadata (server component)
export const metadata = {
  title: {
    template: '%s | TaskFlow',
    default: 'TaskFlow',
  },
  description: 'TaskFlow - Manage your tasks efficiently',
  icons: {
    icon: "/task.png",
  },
};

// Root layout (server component)
export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="min-h-screen flex flex-col bg-army-light">
        <AuthProvider>
          <ClientLayout>{children}</ClientLayout>
        </AuthProvider>
      </body>
    </html>
  );
}