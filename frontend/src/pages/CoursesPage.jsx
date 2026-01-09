import React, { useState } from "react";
import Header from "../components/Header";
import Sidebar from "../components/Sidebar";
import { Play, CheckCircle, Clock, Star, Bookmark } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

const CoursesPage = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [activeTab, setActiveTab] = useState("my-courses");
  const { user } = useAuth();

  const Navigate = useNavigate();

  const CoursesPage = () => {
    const Navigate = useNavigate();
    const [sidebarOpen, setSidebarOpen] = useState(false);
  };

  /* ---------------- MY COURSES DATA ---------------- */
  const mockCourses = [
    {
      id: 1,
      title: "React Fundamentals",
      status: "In Progress",
      progress: 75,
      lessons: "18 of 24 lessons",
      level: "Intermediate",
      image:
        "https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=800&auto=format&fit=crop&q=60",
      statusColor: "bg-blue-500",
      levelColor: "bg-purple-50 text-purple-600",
      progressColor: "bg-blue-500",
      buttonClass: "bg-[#2DD4BF] hover:bg-[#14B8A6] text-white",
    },
    {
      id: 2,
      title: "Python For AI",
      status: "In Progress",
      progress: 50,
      lessons: "9 of 20 lessons",
      level: "Advanced",
      image:
        "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=800&auto=format&fit=crop&q=60",
      statusColor: "bg-blue-500",
      levelColor: "bg-orange-50 text-orange-600",
      progressColor: "bg-blue-500",
      buttonClass: "bg-[#2DD4BF] hover:bg-[#14B8A6] text-white",
    },
    {
      id: 3,
      title: "AI Ethics & Bias",
      status: "Completed",
      progress: 100,
      lessons: "6 of 6 lessons",
      level: "Beginner",
      image:
        "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800&auto=format&fit=crop&q=60",
      statusColor: "bg-green-500",
      levelColor: "bg-green-50 text-green-600",
      progressColor: "bg-green-500",
      buttonClass: "bg-[#F1F5F9] text-[#94A3B8] cursor-not-allowed",
    },
  ];

  /* ---------------- EXPLORE COURSES DATA ---------------- */
  const exploreCourses = [
    {
      id: 1,
      title: "React Fundamentals",
      category: "Development",
      lessons: 24,
      level: "Intermediate",
      students: "2.5k",
      price: 1999,
      rating: 4.8,
      image:
        "https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=800&auto=format&fit=crop&q=60",
    },
    {
      id: 2,
      title: "Python For AI",
      category: "AI & ML",
      lessons: 20,
      level: "Advanced",
      students: "2.5k",
      price: 1299,
      rating: 4.9,
      image:
        "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=800&auto=format&fit=crop&q=60",
    },
    {
      id: 3,
      title: "AI Ethics & Bias",
      category: "AI & ML",
      lessons: 6,
      level: "Beginner",
      students: "2.5k",
      price: 1499,
      rating: 4.7,
      image:
        "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800&auto=format&fit=crop&q=60",
    },
    {
      id: 4,
      title: "Full Stack Web Development",
      category: "Development",
      lessons: 36,
      level: "Beginner",
      students: "2.5k",
      price: 1299,
      rating: 4.9,
      image:
        "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=800&auto=format&fit=crop&q=60",
    },
  ];

  if (!user) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-slate-900 mb-4">
            Please Login
          </h1>
          <p className="text-slate-500">
            You need to be logged in to access the courses page.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col">
      <Header sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

      <Sidebar
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        sidebarCollapsed={sidebarCollapsed}
        setSidebarCollapsed={setSidebarCollapsed}
        activePage="courses"
      />

      <div
        className={`flex-1 transition-all duration-300 ${
          sidebarCollapsed ? "lg:ml-20" : "lg:ml-80"
        }`}
      >
        <main className="mt-16 p-8">
          <div className="max-w-7xl mx-auto space-y-10">
            {/* Header */}
            <div>
              <h1 className="text-3xl font-bold text-slate-900">
                Learning Hub
              </h1>
              <p className="text-slate-500 mt-1">
                Discover and continue your AI learning journey
              </p>
            </div>

            {/* Tabs */}
            <div className="bg-white rounded-xl p-2 inline-flex border border-slate-100 shadow-sm">
              <button
                onClick={() => setActiveTab("my-courses")}
                className={`px-6 py-2 rounded-lg font-semibold transition ${
                  activeTab === "my-courses"
                    ? "bg-[#2DD4BF] text-white shadow"
                    : "text-slate-500"
                }`}
              >
                My Courses
              </button>
              <button
                onClick={() => setActiveTab("explore")}
                className={`px-6 py-2 rounded-lg font-semibold transition ${
                  activeTab === "explore"
                    ? "bg-[#2DD4BF] text-white shadow"
                    : "text-slate-500"
                }`}
              >
                Explore Courses
              </button>
            </div>

            {/* ---------------- MY COURSES ---------------- */}
            {activeTab === "my-courses" && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {mockCourses.map((course) => (
                  <div
                    key={course.id}
                    className="bg-white rounded-3xl border border-slate-100 overflow-hidden shadow-sm"
                  >
                    <div className="relative h-40">
                      <img
                        src={course.image}
                        className="w-full h-full object-cover"
                        alt={course.title}
                      />
                      <span
                        className={`absolute top-4 left-4 px-4 py-1.5 rounded-full text-xs font-semibold text-white ${course.statusColor}`}
                      >
                        {course.status}
                      </span>
                    </div>

                    <div className="p-6 space-y-4">
                      <h3 className="text-lg font-semibold text-slate-900">
                        {course.title}
                      </h3>

                      <div>
                        <div className="h-2 bg-slate-100 rounded-full">
                          <div
                            className={`h-2 rounded-full ${course.progressColor}`}
                            style={{ width: `${course.progress}%` }}
                          />
                        </div>
                        <p className="text-xs text-slate-400 mt-1">
                          {course.progress}% Complete
                        </p>
                      </div>

                      <div className="flex justify-between items-center">
                        <span className="text-sm text-slate-400">
                          {course.lessons}
                        </span>
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-semibold ${course.levelColor}`}
                        >
                          {course.level}
                        </span>
                      </div>

                      <button
                        disabled={course.status === "Completed"}
                        onClick={() => Navigate(`/learning/${course.id}`)}
                        className={`w-full py-3 rounded-xl font-semibold transition ${course.buttonClass}`}
                      >
                        {course.status === "Completed"
                          ? "Review Course"
                          : "Continue Learning"}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* ---------------- EXPLORE COURSES ---------------- */}
            {activeTab === "explore" && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                {exploreCourses.map((course) => (
                  <div
                    key={course.id}
                    className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden"
                  >
                    <div className="relative h-40">
                      <img
                        src={course.image}
                        className="w-full h-full object-cover"
                        alt={course.title}
                      />
                      <div className="absolute bottom-3 right-3 bg-white px-2 py-1 rounded-full text-xs font-semibold flex items-center gap-1 shadow">
                        <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                        {course.rating}
                      </div>
                    </div>

                    <div className="p-4 space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-xs px-3 py-1 rounded-full bg-cyan-50 text-cyan-600 font-semibold">
                          {course.category}
                        </span>
                        <span className="text-xs text-slate-400">
                          {course.students} students
                        </span>
                      </div>

                      <h3 className="text-sm font-semibold text-slate-900">
                        {course.title}
                      </h3>

                      <p className="text-xs text-slate-400">
                        {course.lessons} lessons • {course.level}
                      </p>

                      <div className="flex justify-between items-center pt-2">
                        <span className="font-bold text-slate-900">
                          ₹{course.price}
                        </span>
                        <button className="w-9 h-9 rounded-full border border-cyan-400 flex items-center justify-center text-cyan-500 hover:bg-cyan-50">
                          <Bookmark className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default CoursesPage;
