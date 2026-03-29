import React, { useEffect, useState } from 'react';
import { request } from '../../services/operations/authApi';
import { endpoints } from '../../services/api';
import toast from 'react-hot-toast';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../../services/functions/auth';
import { useNavigate, Link } from 'react-router-dom';
import { FaBook, FaUsers, FaRupeeSign, FaArrowRight } from 'react-icons/fa';

export const InstructorDashboard = () => {
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const { user } = useSelector((state) => state.profile);
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const fetchCourses = async () => {
        try {
            const response = await request(endpoints.GET_INSTRUCTOR_COURSES, "GET");
            if (response.status === 401) {
                dispatch(logout(dispatch, navigate, false));
            } else if (!response.ok) {
                throw new Error("Error while fetching instructor courses");
            } else {
                const data = await response.json();
                setCourses(data.courses || []);
            }
            setLoading(false);
        } catch (error) {
            setLoading(false);
            toast.error("Failed to load dashboard data");
        }
    };

    useEffect(() => {
        fetchCourses();
    }, []);

    // Calculate Stats
    const totalCourses = courses.length;
    const totalStudents = courses.reduce((acc, course) => acc + (course.studentEnrolled?.length || 0), 0);
    const totalIncome = courses.reduce((acc, course) => acc + ((course.studentEnrolled?.length || 0) * (course.price || 0)), 0);

    // Get Recent 3 Courses
    const recentCourses = [...courses].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 3);

    if (loading) {
        return (
            <div className="flex w-full min-h-screen items-center justify-center text-rich-black-50 text-xl font-semibold">
                Loading Dashboard...
            </div>
        );
    }

    return (
        <div className="flex w-full min-h-screen flex-col p-8 text-rich-black-5">
            <div className="mb-10">
                <h1 className="text-4xl font-extrabold text-rich-black-5 tracking-tight">
                    Hi {user?.firstName || "Instructor"} 👋
                </h1>
                <p className="text-lg text-rich-black-200 mt-2 font-medium">
                    Let's start something new and inspire the world.
                </p>
            </div>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                {/* Total Courses Card */}
                <div className="relative overflow-hidden flex flex-col justify-center rounded-2xl bg-rich-black-800 border box-border border-rich-black-700 p-6 shadow-lg transition-transform duration-300 hover:-translate-y-1 group">
                    <div className="absolute -right-4 -top-4 opacity-5 pointer-events-none group-hover:scale-110 transition-transform duration-500">
                        <FaBook className="text-9xl text-white" />
                    </div>
                    <div className="flex items-center gap-4 mb-4">
                        <div className="p-3 bg-blue-100 rounded-lg text-blue-600">
                            <FaBook className="text-2xl" />
                        </div>
                        <h2 className="text-xl font-semibold text-rich-black-50 text-opacity-80">Total Courses</h2>
                    </div>
                    <p className="text-4xl font-bold text-rich-black-5">{totalCourses}</p>
                </div>

                {/* Total Students Card */}
                <div className="relative overflow-hidden flex flex-col justify-center rounded-2xl bg-rich-black-800 border box-border border-rich-black-700 p-6 shadow-lg transition-transform duration-300 hover:-translate-y-1 group">
                    <div className="absolute -right-4 -top-4 opacity-5 pointer-events-none group-hover:scale-110 transition-transform duration-500">
                        <FaUsers className="text-9xl text-white" />
                    </div>
                    <div className="flex items-center gap-4 mb-4">
                        <div className="p-3 bg-pink-100 rounded-lg text-pink-600">
                            <FaUsers className="text-2xl" />
                        </div>
                        <h2 className="text-xl font-semibold text-rich-black-50 text-opacity-80">Total Students</h2>
                    </div>
                    <p className="text-4xl font-bold text-rich-black-5">{totalStudents}</p>
                </div>

                {/* Total Income Card */}
                <div className="relative overflow-hidden flex flex-col justify-center rounded-2xl bg-rich-black-800 border box-border border-rich-black-700 p-6 shadow-lg transition-transform duration-300 hover:-translate-y-1 group">
                    <div className="absolute -right-4 -top-4 opacity-5 pointer-events-none group-hover:scale-110 transition-transform duration-500">
                        <FaRupeeSign className="text-9xl text-white" />
                    </div>
                    <div className="flex items-center gap-4 mb-4">
                        <div className="p-3 bg-yellow-100 rounded-lg text-yellow-600">
                            <FaRupeeSign className="text-2xl" />
                        </div>
                        <h2 className="text-xl font-semibold text-rich-black-50 text-opacity-80">Total Income</h2>
                    </div>
                    <p className="text-4xl font-bold text-rich-black-5">₹ {totalIncome.toLocaleString()}</p>
                </div>
            </div>

            {/* Recent Courses Section */}
            <div className="bg-rich-black-800 rounded-2xl border border-rich-black-700 shadow-lg p-6 w-full">
                <div className="flex justify-between items-center mb-8">
                    <h2 className="text-2xl font-bold text-rich-black-5">Your Recent Courses</h2>
                    <Link to="/dashboard/my-courses" className="text-yellow-50 font-medium hover:text-yellow-100 transition-colors flex items-center gap-2">
                        View all <FaArrowRight className="text-sm" />
                    </Link>
                </div>

                {recentCourses.length === 0 ? (
                    <div className="text-center py-10">
                        <p className="text-rich-black-200 text-lg mb-4">You have not created any courses yet.</p>
                        <Link 
                            to="/dashboard/add-course" 
                            className="bg-yellow-50 text-rich-black-900 px-6 py-3 rounded-md font-semibold hover:bg-yellow-100 transition-colors inline-block"
                        >
                            Create Your First Course
                        </Link>
                    </div>
                ) : (
                    <div className="flex flex-col gap-6">
                        {recentCourses.map((course) => (
                            <div key={course._id} className="flex flex-col md:flex-row gap-6 p-4 rounded-xl hover:bg-rich-black-700 transition-colors border border-transparent hover:border-rich-black-600 group">
                                <img 
                                    src={course.thumbnail?.url} 
                                    alt={course.title} 
                                    className="w-full md:w-[250px] h-[150px] object-cover rounded-xl shadow-sm"
                                />
                                <div className="flex flex-col justify-center flex-1">
                                    <h3 className="text-xl font-bold text-rich-black-5 mb-2 group-hover:text-yellow-50 transition-colors">
                                        {course.title}
                                    </h3>
                                    <p className="text-rich-black-200 text-sm line-clamp-2 mb-4">
                                        {course.desc}
                                    </p>
                                    <div className="flex items-center gap-6 mt-auto">
                                        <div className="flex items-center gap-2 text-rich-black-50">
                                            <FaUsers className="text-rich-black-200" />
                                            <span className="font-semibold text-sm">{course.studentEnrolled?.length || 0} Students</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-rich-black-50">
                                            <FaRupeeSign className="text-rich-black-200" />
                                            <span className="font-semibold text-sm">₹ {course.price || 0}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};
