'use client';

import Link from 'next/link';
import { 
  FaTasks, 
  FaPlus, 
  FaEdit, 
  FaTrash, 
  FaCheck,
  FaArrowRight,
  FaClipboardList,
  FaListUl,
  FaCheckCircle,
  FaClock
} from "react-icons/fa";

export default function Tutorial() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Hero Section */}
      <section className="py-16 md:py-24 px-4">
        <div className="max-w-5xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-army-dark mb-6 leading-tight">
            Welcome to <span className="text-army-default">TaskFlow</span>
          </h1>
          <p className="text-xl md:text-2xl mb-10 text-gray-600 max-w-3xl mx-auto">
            Let's get you started with managing your tasks efficiently
          </p>

          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link href="/dashboard" className="btn btn-primary">
              Go to Dashboard <FaArrowRight className="text-sm" />
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-gray-50 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-army-dark mb-4">
              How to Use TaskFlow
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Follow these simple steps to make the most of your task management experience
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-xl shadow-md border-t-4 border-army-default text-center hover:shadow-lg transition">
              <div className="flex justify-center mb-6">
                <div className="bg-army-light p-4 rounded-full">
                  <FaPlus className="text-3xl text-army-dark" />
                </div>
              </div>
              <h3 className="text-xl font-semibold mb-3">Create Tasks</h3>
              <p className="text-gray-600">
                Click the "Add Task" button to create new tasks. Add a title, description, and set a due date to get started.
              </p>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-md border-t-4 border-olive text-center hover:shadow-lg transition">
              <div className="flex justify-center mb-6">
                <div className="bg-[#f0f4ea] p-4 rounded-full">
                  <FaListUl className="text-3xl text-olive" />
                </div>
              </div>
              <h3 className="text-xl font-semibold mb-3">Organize Tasks</h3>
              <p className="text-gray-600">
                Drag and drop tasks between different status columns: To Do, In Progress, and Completed.
              </p>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-md border-t-4 border-khaki text-center hover:shadow-lg transition">
              <div className="flex justify-center mb-6">
                <div className="bg-[#f7f5e8] p-4 rounded-full">
                  <FaCheckCircle className="text-3xl text-khaki" />
                </div>
              </div>
              <h3 className="text-xl font-semibold mb-3">Track Progress</h3>
              <p className="text-gray-600">
                Monitor your task completion and stay on top of deadlines with our intuitive progress tracking.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Task Management Tips */}
      <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-army-dark mb-4">
              Task Management Tips
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Best practices to help you stay organized and productive
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white p-5 rounded-lg shadow-sm hover:shadow-md transition">
              <div className="flex items-center mb-3">
                <div className="mr-3 text-army-default">
                  <FaEdit className="text-xl" />
                </div>
                <h3 className="font-semibold">Be Specific</h3>
              </div>
              <p className="text-gray-600 text-sm">
                Write clear, actionable task descriptions to avoid confusion
              </p>
            </div>

            <div className="bg-white p-5 rounded-lg shadow-sm hover:shadow-md transition">
              <div className="flex items-center mb-3">
                <div className="mr-3 text-army-default">
                  <FaClock className="text-xl" />
                </div>
                <h3 className="font-semibold">Set Deadlines</h3>
              </div>
              <p className="text-gray-600 text-sm">
                Always assign due dates to keep tasks on track
              </p>
            </div>

            <div className="bg-white p-5 rounded-lg shadow-sm hover:shadow-md transition">
              <div className="flex items-center mb-3">
                <div className="mr-3 text-army-default">
                  <FaCheck className="text-xl" />
                </div>
                <h3 className="font-semibold">Regular Updates</h3>
              </div>
              <p className="text-gray-600 text-sm">
                Update task status regularly to maintain accurate progress
              </p>
            </div>

            <div className="bg-white p-5 rounded-lg shadow-sm hover:shadow-md transition">
              <div className="flex items-center mb-3">
                <div className="mr-3 text-army-default">
                  <FaTrash className="text-xl" />
                </div>
                <h3 className="font-semibold">Clean Up</h3>
              </div>
              <p className="text-gray-600 text-sm">
                Remove completed tasks to keep your dashboard organized
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
} 