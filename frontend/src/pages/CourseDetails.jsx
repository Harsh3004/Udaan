import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';
import { endpoints } from '../services/api';
import { request } from '../services/operations/authApi';
import { HighlightedText } from '../components/HighlightedText';
import { buyCourse } from '../services/operations/paymentService';
import { useSelector, useDispatch } from 'react-redux';
import { addToCart } from '../slices/cartSlice';
import { CourseCard } from '../components/CourseCard';
import RatingModal from '../components/RatingModal';

const CourseDetails = () => {
    const { courseId } = useParams();
    const [loading, setLoading] = useState(false);
    const [course, setCourse] = useState(null);
    const [recommendedCourses, setRecommendedCourses] = useState([]);
    const [enrolledCourseIds, setEnrolledCourseIds] = useState(new Set());
    const [showRatingModal, setShowRatingModal] = useState(false);
    const [userReview, setUserReview] = useState(null);
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const { token } = useSelector((state) => state.auth);
    const { user } = useSelector((state) => state.profile);
    const { cart } = useSelector((state) => state.cart);

    const isEnrolled = token && user && enrolledCourseIds.has(courseId);
    const canReview = isEnrolled && !userReview;

    const fetchRecommendedCourses = async (id) => {
        try {
            const url = `${endpoints.GET_RECOMMENDED_COURSES_API.replace(':courseId', id)}`;
            const res = await request(url, 'GET');
            const data = await res.json();
            if (res.ok) {
                setRecommendedCourses(data.recommendedCourses || []);
            }
        } catch (error) {
            console.error("Failed to fetch recommended courses", error);
        }
    };

    useEffect(() => {
        const fetchCourse = async () => {
            if (!courseId) return;
            setLoading(true);
            try {
                const url = `${endpoints.GET_COURSE_DETAILS_API}/${courseId}`;
                const res = await request(url, 'GET');
                const data = await res.json();
                if (!res.ok) {
                    throw new Error(data.message || 'Unable to fetch course');
                }
                const fetchedCourse = data.courseDetails || data.course || null;
                setCourse(fetchedCourse);
                
                if (fetchedCourse) {
                    fetchRecommendedCourses(courseId);
                }
            } catch (error) {
                toast.error(error.message || 'Failed to load course');
                setCourse(null);
            } finally {
                setLoading(false);
            }
        };
        fetchCourse();
    }, [courseId]);

    useEffect(() => {
        if (!token) return;
        const loadEnrolledCourses = async () => {
            try {
                const res = await request(endpoints.GET_ENROLLED_COURSES, 'GET');
                const data = await res.json();
                if (res.ok && data.courses) {
                    setEnrolledCourseIds(new Set(data.courses.map((c) => c._id)));
                }
            } catch (error) {
                console.error('Failed to load enrolled courses', error);
            }
        };
        loadEnrolledCourses();
    }, [token]);

    useEffect(() => {
        if (course && token && enrolledCourseIds.has(courseId)) {
            navigate(`/view-course/${courseId}`, { replace: true });
        }
    }, [course, courseId, token, enrolledCourseIds, navigate]);

    const handleBuyCourse = () => {
        if (!token) {
            toast.error("Please log in to purchase this course.");
            navigate('/login');
            return;
        }

        buyCourse(course, navigate);
    };

    const handleAddToCart = () => {
        if (user && user?.role === "Instructor") {
            toast.error("You are an Instructor. You can't buy a course.");
            return;
        }
        if (!token) {
            toast.error("Please log in to add items to your cart.");
            navigate('/login');
            return;
        }

        dispatch(addToCart(course));
    };

    const isInCart = cart ? cart.some((item) => item._id === course?._id) : false;

    const checkUserReview = async () => {
        if (!token || !isEnrolled) return;
        try {
            const res = await request(
                `${endpoints.GET_COURSE_DETAILS_API}/${courseId}/rating`,
                'GET',
                null,
                token
            );
            const data = await res.json();
            if (res.ok && data.ratingAndReviews) {
                const myReview = data.ratingAndReviews.find(
                    (r) => r.user?._id === user?.id || r.user === user?.id
                );
                setUserReview(myReview || null);
            }
        } catch (error) {
            console.error('Error fetching user review:', error);
        }
    };

    useEffect(() => {
        if (isEnrolled) {
            checkUserReview();
        }
    }, [isEnrolled, user, courseId, token]);

    const handleReviewSubmitted = () => {
        checkUserReview();
        window.location.reload();
    };

    if (loading) {
        return <div className='min-h-screen bg-rich-black-900 text-white flex items-center justify-center'>Loading course...</div>
    }

    if (!course) {
        return <div className='min-h-screen bg-rich-black-900 text-white flex items-center justify-center'>Course not found.</div>
    }

    const cover = (typeof course.thumbnail === 'string') ? course.thumbnail : (course.thumbnail?.url || '');
    const totalSections = course.section?.length || 0;
    const totalLessons = course.section?.reduce((acc, sec) => acc + (sec.subsection?.length || 0), 0) || 0;
    const rating = course.avgRating || (course.ratingAndReviews && course.ratingAndReviews.length ? (course.ratingAndReviews.reduce((a, b) => a + (b.rating || 0), 0) / course.ratingAndReviews.length).toFixed(1) : null);

    const breadcrumbs = [
        { name: "Home", link: "/" },
        { name: "Courses", link: "/catalog" },
        { name: course?.category?.name || "Category", link: `/catalog/${course?.category?._id}` },
        { name: "Details", link: null },
    ];

    return (
        <div className='bg-rich-black-900 min-h-screen text-white font-inter pb-10 relative'>

            {/* --- HERO BACKGROUND --- */}
            <div className='absolute top-0 left-0 w-full h-[400px] bg-rich-black-800 border-b border-rich-black-700 z-0'></div>

            {/* --- MAIN LAYOUT GRID --- */}
            <div className='relative w-11/12 max-w-maxContent mx-auto pt-12 pb-4 z-10'>
                <div className='grid grid-cols-1 lg:grid-cols-3 gap-12'>

                    {/* LEFT COLUMN: Hero Text & Content */}
                    <div className='lg:col-span-2 space-y-12'>

                        {/* Hero Information */}
                        <div className='flex flex-col gap-4'>
                            {/* Breadcrumbs */}
                            <div className='flex items-center gap-2 text-sm text-rich-black-300 mb-2'>
                                {breadcrumbs.map((bc, index) => (
                                    <React.Fragment key={index}>
                                        {bc.link ? (
                                            <span className='hover:text-yellow-50 cursor-pointer transition-all' onClick={() => navigate(bc.link)}>{bc.name}</span>
                                        ) : (
                                            <span className='text-rich-black-50 font-medium'>{bc.name}</span>
                                        )}
                                        {index < breadcrumbs.length - 1 && <span>/</span>}
                                    </React.Fragment>
                                ))}
                            </div>

                            <div className='space-y-6'>
                                <div className='space-y-2'>
                                    <p className='text-yellow-50 font-medium text-lg'>Welcome to <HighlightedText color="bg-gradient-05 text-transparent bg-clip-text">Udaan</HighlightedText> Family</p>
                                    <h1 className='text-4xl md:text-5xl font-bold text-rich-black-5 tracking-tight'>
                                        {course.title}
                                    </h1>
                                </div>

                                <p className='text-rich-black-200 text-lg leading-relaxed max-w-3xl'>
                                    {course.desc?.length > 200 ? `${course.desc.substring(0, 200)}...` : course.desc}
                                </p>

                                {/* Quick Stats Row */}
                                <div className='flex flex-wrap items-center gap-6 pt-4'>
                                    <div className='flex items-center gap-2 bg-rich-black-700/50 px-4 py-2 rounded-full border border-rich-black-600'>
                                        <svg className="w-5 h-5 text-yellow-50" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path></svg>
                                        <span className='text-sm font-medium'>{totalLessons} Lectures</span>
                                    </div>
                                    <div className='flex items-center gap-2 bg-rich-black-700/50 px-4 py-2 rounded-full border border-rich-black-600'>
                                        <svg className="w-5 h-5 text-pictonBlue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5c-1 3.142-2.341 5.462-3.751 7"></path></svg>
                                        <span className='text-sm font-medium'>{course.language || 'English'}</span>
                                    </div>
                                    <div className='flex items-center gap-2 bg-rich-black-700/50 px-4 py-2 rounded-full border border-rich-black-600 font-bold'>
                                        <span className='text-yellow-50'>{rating || '4.5'}</span>
                                        <div className='flex text-yellow-100 text-xs'>
                                            {[...Array(5)].map((_, i) => (
                                                <svg key={i} className={`w-3 h-3 ${i < Math.floor(rating || 4.5) ? 'fill-yellow-50' : 'fill-rich-black-400'}`} viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path></svg>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* About Section */}
                        <div className='space-y-6 pt-24'>
                            <h2 className='text-3xl font-bold text-rich-black-5 border-l-4 border-yellow-50 pl-4'>About Course</h2>
                            <div className='bg-rich-black-800 p-8 rounded-2xl border border-rich-black-700 shadow-xl'>
                                <p className='text-rich-black-100 leading-relaxed text-lg'>
                                    {course.desc}
                                </p>
                            </div>
                        </div>

                        {/* Course Highlights Icon Grid */}
                        <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                            {[
                                { icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z', color: 'text-pastelGreen-500', bg: 'bg-pastelGreen-500/10', label: 'Duration', val: 'Self-Paced Learning' },
                                { icon: 'M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z', color: 'text-pictonBlue-500', bg: 'bg-pictonBlue-500/10', label: 'Lectures', val: `${totalLessons} HD Videos` },
                                { icon: 'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z', color: 'text-yellow-50', bg: 'bg-yellow-50/10', label: 'Certificate', val: 'Course Completion Certificate' },
                                { icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z', color: 'text-pink-200', bg: 'bg-pink-200/10', label: 'Validity', val: 'Lifetime Access' },
                            ].map((item, idx) => (
                                <div key={idx} className='flex items-center gap-4 p-5 bg-rich-black-800 rounded-xl border border-rich-black-700 hover:border-rich-black-600 transition-all group'>
                                    <div className={`w-12 h-12 flex items-center justify-center rounded-full ${item.bg} ${item.color} group-hover:scale-110 transition-transform`}>
                                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={item.icon}></path></svg>
                                    </div>
                                    <div>
                                        <p className='text-xs text-rich-black-400 uppercase tracking-widest font-bold'>{item.label}</p>
                                        <p className='text-rich-black-5 font-semibold'>{item.val}</p>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Benefits & Requirements Sections */}
                        <div className='grid grid-cols-1 md:grid-cols-2 gap-8'>
                            <div className='bg-rich-black-800 p-8 rounded-2xl border border-rich-black-700 space-y-4'>
                                <h3 className='text-2xl font-bold text-yellow-50 flex items-center gap-2'>
                                    What you'll learn
                                </h3>
                                <div className='text-rich-black-200 text-sm leading-relaxed space-y-3'>
                                    {Array.isArray(course.whatyouwilllearn) ? (
                                        <ul className='space-y-3'>
                                            {course.whatyouwilllearn.map((benefit, index) => (
                                                <li key={index} className='flex gap-2 items-start'>
                                                    <svg className="w-5 h-5 text-pastelGreen-500 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                                                    <span>{benefit}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    ) : (
                                        <div className='whitespace-pre-wrap'>{course.whatyouwilllearn}</div>
                                    )}
                                </div>
                            </div>

                            <div className='bg-rich-black-800 p-8 rounded-2xl border border-rich-black-700 space-y-4'>
                                <h3 className='text-2xl font-bold text-pink-200 flex items-center gap-2'>
                                    Requirements
                                </h3>
                                {course.instructions?.length > 0 ? (
                                    <ul className='space-y-3'>
                                        {course.instructions.map((req, index) => (
                                            <li key={index} className='text-rich-black-200 text-sm flex gap-2 items-start'>
                                                <svg className="w-5 h-5 text-pink-200 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path></svg>
                                                <span>{req}</span>
                                            </li>
                                        ))}
                                    </ul>
                                ) : (
                                    <p className='text-rich-black-400 text-sm italic'>No specific requirements mentioned.</p>
                                )}
                            </div>
                        </div>

                        {/* Curriculum Section */}
                        <div className='space-y-6'>
                            <h2 className='text-3xl font-bold text-rich-black-5 border-l-4 border-yellow-50 pl-4'>Course Modules</h2>
                            <div className='bg-rich-black-800 rounded-2xl border border-rich-black-700 overflow-hidden'>
                                {course.section?.length ? (
                                    <div className='divide-y divide-rich-black-700'>
                                        {course.section.map((sec) => {
                                            const lectures = Array.isArray(sec.subsection) ? sec.subsection : [];
                                            return (
                                                <details key={sec._id || sec.title} className='group open:bg-rich-black-900 transition-all duration-300'>
                                                    <summary className='flex items-center justify-between p-6 cursor-pointer hover:bg-rich-black-700/50 transition-colors'>
                                                        <div className='flex items-center gap-4'>
                                                            <div className='group-open:rotate-180 transition-transform duration-300'>
                                                                <svg className="w-6 h-6 text-rich-black-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                                                            </div>
                                                            <span className='text-xl font-semibold text-rich-black-5'>{sec.title}</span>
                                                        </div>
                                                        <span className='text-xs font-bold px-3 py-1 bg-rich-black-700 rounded-full text-rich-black-300'>{lectures.length} lessons</span>
                                                    </summary>
                                                    <div className='px-16 pb-6 space-y-4'>
                                                        {lectures.length ? (
                                                            <div className='space-y-3'>
                                                                {lectures.map((sub, idx) => (
                                                                    <div key={idx} className='flex items-center gap-4 text-sm text-rich-black-200 p-3 rounded-lg hover:bg-rich-black-800 transition-colors'>
                                                                        <div className='flex items-center gap-3'>
                                                                            <svg className="w-5 h-5 text-yellow-50" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                                                                            <span className='font-medium'>{sub.title || sub.topic}</span>
                                                                        </div>
                                                                        {sub.timeDuration && (
                                                                            <span className='text-xs text-rich-black-500 bg-rich-black-900 border border-rich-black-700 px-2 py-0.5 rounded italic'>
                                                                                {sub.timeDuration}
                                                                            </span>
                                                                        )}
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        ) : <p className='text-rich-black-500 italic'>No content in this module.</p>}
                                                    </div>
                                                </details>
                                            );
                                        })}
                                    </div>
                                ) : <p className='p-10 text-center text-rich-black-400'>Curriculum coming soon.</p>}
                            </div>
                        </div>

                        {/* Meet Your Instructor Section */}
                        <div className='space-y-6'>
                            <h2 className='text-3xl font-bold text-rich-black-5 border-l-4 border-yellow-50 pl-4'>Meet Your Instructor</h2>
                            <div className='bg-rich-black-800 p-8 rounded-2xl border border-rich-black-700 shadow-xl flex flex-col md:flex-row gap-8 items-center md:items-start'>
                                <div className='relative shrink-0'>
                                    <img 
                                        src={course.instructor?.profileImage} 
                                        alt={course.instructor?.fName} 
                                        onError={(e) => {
                                            if (!e.target.dataset.fallback) {
                                                e.target.dataset.fallback = 'true';
                                                e.target.src = `https://api.dicebear.com/7.x/initials/png?seed=${course.instructor?.fName || 'U'}${course.instructor?.lName || ''}&size=128`;
                                            }
                                        }}
                                        className='w-32 h-32 md:w-40 md:h-40 rounded-full object-cover border-4 border-rich-black-700 shadow-2xl'
                                    />
                                    <div className='absolute -bottom-2 -right-2 bg-yellow-50 p-2 rounded-full shadow-lg'>
                                        <svg className="w-5 h-5 text-rich-black-900" fill="currentColor" viewBox="0 0 20 20"><path d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"></path></svg>
                                    </div>
                                </div>
                                <div className='space-y-4 flex-1 text-center md:text-left'>
                                    <div>
                                        <h3 className='text-3xl font-bold text-rich-black-5'>{course.instructor?.fName} {course.instructor?.lName}</h3>
                                        <p className='text-yellow-50 font-medium tracking-wide uppercase text-sm mt-1'>
                                            {course.instructor?.additionalDetails?.profession || "Instructor"} at <span className='text-pictonBlue-500'>Udaan</span>
                                        </p>
                                    </div>
                                    <p className='text-rich-black-200 leading-relaxed text-lg'>
                                        {course.instructor?.additionalDetails?.bio || "No bio available for this instructor."}
                                    </p>
                                    <div className='flex flex-wrap justify-center md:justify-start gap-4 pt-2'>
                                        <div className='flex items-center gap-2 text-rich-black-300 text-sm'>
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path></svg>
                                            {course.instructor?.courses?.length || 0} Courses
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Student Reviews Section */}
                        <div className='space-y-8'>
                            <div className='flex items-center justify-between'>
                                <div className='flex items-center gap-4'>
                                    <h2 className='text-3xl font-bold text-rich-black-5 border-l-4 border-pictonBlue-500 pl-4'>Student Reviews</h2>
                                    {course.ratingAndReviews?.length > 0 && (
                                        <div className='flex items-center gap-2 bg-rich-black-800/60 px-4 py-2 rounded-full border border-rich-black-700'>
                                            <div className='flex'>
                                                {[...Array(5)].map((_, i) => (
                                                    <svg key={i} className={`w-4 h-4 ${i < Math.round(rating || 0) ? 'fill-yellow-50' : 'fill-rich-black-600'}`} viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path></svg>
                                                ))}
                                            </div>
                                            <span className='text-sm font-semibold text-yellow-50'>{rating || '0'}</span>
                                            <span className='text-xs text-rich-black-400'>({course.ratingAndReviews.length} reviews)</span>
                                        </div>
                                    )}
                                </div>
                                <div className='flex items-center gap-3'>
                                    {userReview && (
                                        <span className='text-sm text-pastelGreen-400 font-medium flex items-center gap-2 bg-pastelGreen-500/10 px-4 py-2 rounded-full border border-pastelGreen-500/20'>
                                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path></svg>
                                            You rated {userReview.rating}/5
                                        </span>
                                    )}
                                    {canReview && (
                                        <motion.button
                                            onClick={() => setShowRatingModal(true)}
                                            whileHover={{ scale: 1.05 }}
                                            whileTap={{ scale: 0.95 }}
                                            className='px-6 py-3 bg-gradient-to-r from-yellow-50 to-yellow-100 text-rich-black-900 font-bold rounded-xl hover:shadow-[0_4px_20px_rgba(255,193,7,0.4)] transition-all duration-200'
                                        >
                                            Write a Review
                                        </motion.button>
                                    )}
                                </div>
                            </div>
                            {!isEnrolled && (
                                <div className='bg-rich-black-800/40 p-6 rounded-2xl border border-rich-black-700/50 flex items-center gap-4'>
                                    <div className='w-12 h-12 rounded-full bg-rich-black-700 flex items-center justify-center'>
                                        <svg className="w-6 h-6 text-rich-black-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path></svg>
                                    </div>
                                    <div>
                                        <p className='text-rich-black-200 font-medium'>Enroll in this course to leave a review</p>
                                        <p className='text-sm text-rich-black-400'>Share your learning experience with other students</p>
                                    </div>
                                </div>
                            )}
                            {course.ratingAndReviews?.length > 0 ? (
                                <div className='grid grid-cols-1 md:grid-cols-2 gap-5'>
                                    {course.ratingAndReviews.slice(0, 4).map((review, i) => (
                                        <motion.div
                                            key={i}
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: i * 0.1 }}
                                            className='group bg-rich-black-800/60 p-6 rounded-2xl border border-rich-black-700/50 hover:border-yellow-50/30 hover:bg-rich-black-800/80 transition-all duration-300'
                                        >
                                            <div className='flex items-start gap-4'>
                                                <div className='relative'>
                                                    <img
                                                        src={review.user?.profileImage}
                                                        alt={review.user?.fName}
                                                        onError={(e) => {
                                                            if (!e.target.dataset.fallback) {
                                                                e.target.dataset.fallback = 'true';
                                                                e.target.src = `https://api.dicebear.com/7.x/initials/png?seed=${review.user?.fName || 'U'}${review.user?.lName || ''}&size=128`;
                                                            }
                                                        }}
                                                        className='w-12 h-12 rounded-full object-cover ring-2 ring-rich-black-700 group-hover:ring-yellow-50/30 transition-all'
                                                    />
                                                    <div className='absolute -bottom-1 -right-1 w-5 h-5 bg-pastelGreen-500 rounded-full flex items-center justify-center border-2 border-rich-black-800'>
                                                        <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"></path></svg>
                                                    </div>
                                                </div>
                                                <div className='flex-1 min-w-0'>
                                                    <div className='flex items-center justify-between mb-2'>
                                                        <p className='text-rich-black-5 font-semibold truncate'>
                                                            {review.user?.fName} {review.user?.lName}
                                                        </p>
                                                        <div className='flex items-center gap-1'>
                                                            {[...Array(5)].map((_, idx) => (
                                                                <svg key={idx} className={`w-3.5 h-3.5 ${idx < review.rating ? 'fill-yellow-50' : 'fill-rich-black-600'}`} viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path></svg>
                                                            ))}
                                                        </div>
                                                    </div>
                                                    {review.review && (
                                                        <p className='text-rich-black-300 text-sm leading-relaxed line-clamp-3 group-hover:line-clamp-none transition-all'>
                                                            "{review.review}"
                                                        </p>
                                                    )}
                                                    {review.createdAt && (
                                                        <p className='text-xs text-rich-black-500 mt-3'>
                                                            {new Date(review.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>
                            ) : (
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className='bg-gradient-to-br from-rich-black-800/30 to-rich-black-900/30 p-12 rounded-3xl border border-dashed border-rich-black-700/50 text-center'
                                >
                                    <div className='w-20 h-20 mx-auto mb-6 rounded-full bg-rich-black-800/50 flex items-center justify-center'>
                                        <svg className="w-10 h-10 text-rich-black-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"></path></svg>
                                    </div>
                                    <p className='text-lg font-semibold text-rich-black-300 mb-2'>No reviews yet</p>
                                    <p className='text-sm text-rich-black-500'>Be the first to share your experience and help others learn!</p>
                                </motion.div>
                            )}
                        </div>

                        {/* Recommended Courses Slider */}
                        {recommendedCourses.length > 0 && (
                            <div className='bg-rich-black-800/50 p-8 rounded-3xl border border-rich-black-700 mt-12 mb-12 shadow-inner'>
                                <div className='space-y-8'>
                                    <h2 className='text-3xl font-bold text-rich-black-5 border-l-4 border-yellow-50 pl-4'>Recommended Courses</h2>
                                    <div className='flex gap-8 overflow-x-auto pb-10 pt-2 snap-x custom-scrollbar' style={{ scrollSnapType: 'x mandatory' }}>
                                        {recommendedCourses.map((recCourse) => {
                                            const avgRating = recCourse.ratingAndReviews?.length 
                                                ? (recCourse.ratingAndReviews.reduce((acc, curr) => acc + curr.rating, 0) / recCourse.ratingAndReviews.length).toFixed(1)
                                                : null;
                                            
                                            return (
                                                <div key={recCourse._id} className='snap-start shrink-0 h-full'>
                                                    <CourseCard 
                                                        title={recCourse.title}
                                                        description={recCourse.desc}
                                                        thumbnail={recCourse.thumbnail}
                                                        rating={avgRating}
                                                        reviewsCount={recCourse.ratingAndReviews?.length}
                                                        onClick={() => {
                                                            if (token && enrolledCourseIds.has(recCourse._id)) {
                                                                navigate(`/view-course/${recCourse._id}`);
                                                            } else {
                                                                navigate(`/course/${recCourse._id}`);
                                                            }
                                                            window.scrollTo(0, 0);
                                                        }}
                                                    />
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* FAQ Section */}
                        <div className='space-y-6'>
                            <h2 className='text-3xl font-bold text-rich-black-5 border-l-4 border-indigo-500 pl-4'>Frequently Asked Questions</h2>
                            <div className='space-y-4 font-inter'>
                                {[
                                    { q: "Is this course for absolute beginners?", a: "Yes, this course starts from the absolute basics and progressively moves to advanced concepts. No prior experience is required." },
                                    { q: "Will I get a certificate after completion?", a: "Yes, once you complete all modules and assignments, you will be awarded a verified course completion certificate." },
                                    { q: "How long can I access the course content?", a: "You will have lifetime access to all course materials, including future updates." },
                                    { q: "Is there a community forum for doubts?", a: "Yes! Every student gets access to our exclusive Discord community for doubt assistance and networking." }
                                ].map((faq, i) => (
                                    <details key={i} className='bg-rich-black-800 rounded-xl border border-rich-black-700 group transition-all duration-300'>
                                        <summary className='flex items-center justify-between p-6 cursor-pointer font-semibold text-rich-black-5 hover:bg-rich-black-700/50 transition-colors'>
                                            {faq.q}
                                            <svg className="w-5 h-5 group-open:rotate-45 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path></svg>
                                        </summary>
                                        <div className='px-6 pb-6 text-rich-black-200 leading-relaxed text-sm'>
                                            {faq.a}
                                        </div>
                                    </details>
                                ))}
                            </div>
                        </div>

                    </div>

                    {/* RIGHT COLUMN: Sticky Sidebar */}
                    <div className='lg:col-span-1 relative h-full'>
                        <div className='lg:sticky lg:top-[100px] self-start space-y-6 z-30'>
                            <div className='bg-rich-black-800 border-2 border-rich-black-700 rounded-2xl overflow-hidden shadow-2xl'>
                                {cover && (
                                    <div className='relative aspect-video group'>
                                        <img src={cover} alt={course.title} className='w-full h-full object-cover transition-transform duration-500 group-hover:scale-110' />
                                    </div>
                                )}
                                <div className='p-8 space-y-6'>
                                    <div className='flex items-baseline gap-2'>
                                        <p className='text-4xl font-bold text-yellow-50'>₹{course.price}</p>
                                        <p className='text-rich-black-400 line-through text-lg'>₹{course.price * 2}</p>
                                    </div>

                                    <div className='flex flex-col gap-3'>
                                        <button className='w-full bg-yellow-50 text-rich-black-900 font-bold py-4 rounded-xl hover:bg-yellow-400 transition-all duration-300 shadow-[0_4px_20px_0_rgba(255,193,7,0.4)]'
                                            onClick={handleBuyCourse}>
                                            Buy Now
                                        </button>
                                        <button className='w-full bg-rich-black-900 font-bold py-4 rounded-xl hover:bg-rich-black-800 transition-all duration-300 border border-rich-black-700'
                                            onClick={isInCart ? () => navigate('/dashboard/cart') : handleAddToCart}>
                                            {isInCart ? "Go to Cart" : "Add to Cart"}
                                        </button>
                                    </div>

                                </div>
                            </div>

                        </div>
                    </div>

                </div>
            </div>

            <RatingModal
                isOpen={showRatingModal}
                onClose={() => setShowRatingModal(false)}
                courseId={courseId}
                courseName={course?.title}
                onReviewSubmitted={handleReviewSubmitted}
            />
        </div>
    );
};

export default CourseDetails;
