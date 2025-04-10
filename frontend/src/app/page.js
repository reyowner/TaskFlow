'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  FaTasks, 
  FaUserCheck, 
  FaRocket, 
  FaChartLine, 
  FaMobileAlt,
  FaClipboardList,
  FaRegThumbsUp,
  FaRegLightbulb,
  FaArrowRight
} from "react-icons/fa";

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      router.push('/dashboard');
    }
  }, [router]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Hero Section */}
      <section className="py-16 md:py-24 px-4">
        <div className="max-w-5xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-army-dark mb-6 leading-tight">
            Manage Your Tasks <span className="text-army-default">Efficiently</span>
          </h1>
          <p className="text-xl md:text-2xl mb-10 text-gray-600 max-w-3xl mx-auto">
            TaskFlow helps you organize your work, boost productivity, and accomplish more with less stress.
          </p>

          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link href="/register" className="btn btn-primary">
              Get Started <FaArrowRight className="text-sm" />
            </Link>
            <Link href="/login" className="btn btn-secondary">
              Login
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-gray-50 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-army-dark mb-4">
              Why Choose TaskFlow?
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Our intuitive task management solution helps you stay organized and focused on what matters most.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-xl shadow-md border-t-4 border-army-default text-center hover:shadow-lg transition">
              <div className="flex justify-center mb-6">
                <div className="bg-army-light p-4 rounded-full">
                  <FaClipboardList className="text-3xl text-army-dark" />
                </div>
              </div>
              <h3 className="text-xl font-semibold mb-3">Intuitive Task Management</h3>
              <p className="text-gray-600">
                Create, organize, and track your tasks with our simple drag-and-drop interface. Easily move tasks between different statuses.
              </p>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-md border-t-4 border-olive text-center hover:shadow-lg transition">
              <div className="flex justify-center mb-6">
                <div className="bg-[#f0f4ea] p-4 rounded-full">
                  <FaMobileAlt className="text-3xl text-olive" />
                </div>
              </div>
              <h3 className="text-xl font-semibold mb-3">Accessible Anywhere</h3>
              <p className="text-gray-600">
                Access your tasks from any device with our responsive design. Stay on top of your responsibilities whether at home or on the go.
              </p>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-md border-t-4 border-khaki text-center hover:shadow-lg transition">
              <div className="flex justify-center mb-6">
                <div className="bg-[#f7f5e8] p-4 rounded-full">
                  <FaChartLine className="text-3xl text-khaki" />
                </div>
              </div>
              <h3 className="text-xl font-semibold mb-3">Track Your Progress</h3>
              <p className="text-gray-600">
                Visualize your workflow and track task progress across different stages. Celebrate your achievements as you complete tasks.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-army-dark mb-4">
              Benefits of Using TaskFlow
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Experience the difference with our thoughtfully designed task management system
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white p-5 rounded-lg shadow-sm hover:shadow-md transition">
              <div className="flex items-center mb-3">
                <div className="mr-3 text-army-default">
                  <FaRegLightbulb className="text-xl" />
                </div>
                <h3 className="font-semibold">Increased Focus</h3>
              </div>
              <p className="text-gray-600 text-sm">
                Prioritize tasks effectively and maintain concentration on what matters most
              </p>
            </div>

            <div className="bg-white p-5 rounded-lg shadow-sm hover:shadow-md transition">
              <div className="flex items-center mb-3">
                <div className="mr-3 text-army-default">
                  <FaRocket className="text-xl" />
                </div>
                <h3 className="font-semibold">Enhanced Productivity</h3>
              </div>
              <p className="text-gray-600 text-sm">
                Complete more tasks in less time with our streamlined workflow system
              </p>
            </div>

            <div className="bg-white p-5 rounded-lg shadow-sm hover:shadow-md transition">
              <div className="flex items-center mb-3">
                <div className="mr-3 text-army-default">
                  <FaUserCheck className="text-xl" />
                </div>
                <h3 className="font-semibold">Personal Accountability</h3>
              </div>
              <p className="text-gray-600 text-sm">
                Track your progress and build accountability for your personal and professional goals
              </p>
            </div>

            <div className="bg-white p-5 rounded-lg shadow-sm hover:shadow-md transition">
              <div className="flex items-center mb-3">
                <div className="mr-3 text-army-default">
                  <FaRegThumbsUp className="text-xl" />
                </div>
                <h3 className="font-semibold">Reduced Stress</h3>
              </div>
              <p className="text-gray-600 text-sm">
                Decrease mental load by organizing tasks in a clear, visual system
              </p>
            </div>
          </div>
        </div>
      </section>


    </div>
  );
}