import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import {
  FiPlayCircle,
  FiCheckCircle,
  FiChevronDown,
  FiVideo,
  FiArrowLeft,
  FiLock,
  FiDownload,
  FiExternalLink,
  FiSettings,
  FiMaximize,
  FiVolume2,
  FiVolumeX,
  FiMessageSquare,
  FiFileText,
  FiEdit,
  FiPlay,
  FiPause,
  FiChevronRight,
  FiChevronLeft,
  FiX,
  FiStar
} from 'react-icons/fi';
import { FaStar } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { endpoints } from '../services/api';
import { request } from '../services/operations/authApi';
import AiSidebar from '../components/ViewCourse/AiSidebar';
import PersonalNotes from '../components/ViewCourse/PersonalNotes';
import RatingModal from '../components/RatingModal';
import InstructorChat from '../components/InstructorChat';
import Discussion from '../components/ViewCourse/Discussion';
import Resources from '../components/ViewCourse/Resources';

const ViewCourse = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const { token } = useSelector((state) => state.auth);
  
  const [course, setCourse] = useState(null);
  const [completedVideos, setCompletedVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentVideo, setCurrentVideo] = useState(null);
  const [openSections, setOpenSections] = useState({});
  const [activeTab, setActiveTab] = useState('Discussion');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  
  // Video state
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(1);
  const videoRef = useRef(null);

  // Quiz state
  const [showQuiz, setShowQuiz] = useState(false);
  const [quizQuestions, setQuizQuestions] = useState([]);
  const [quizLoading, setQuizLoading] = useState(false);
  const [quizAnswers, setQuizAnswers] = useState({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [quizScore, setQuizScore] = useState(null);
  const [quizError, setQuizError] = useState(null);
  const [quizResults, setQuizResults] = useState([]);

  // Reviews state
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [reviews, setReviews] = useState([]);
  const [averageRating, setAverageRating] = useState(0);
  const [userReview, setUserReview] = useState(null);

  // Chat state
  const [showChat, setShowChat] = useState(false);
  const [chatUnreadCount, setChatUnreadCount] = useState(0);
  const [showCurriculum, setShowCurriculum] = useState(false);

  // Check for chat unread messages
  useEffect(() => {
    const checkChatStatus = async () => {
      if (!courseId || !token) return;
      try {
        const res = await request(`${endpoints.CHAT_CHECK_EXISTS}/${courseId}`, 'GET', null, token);
        const data = await res.json();
        if (data.success) {
          setChatUnreadCount(data.unreadCount || 0);
        }
      } catch (error) {
        console.error('Error checking chat status:', error);
      }
    };

    checkChatStatus();
    const interval = setInterval(checkChatStatus, 30000);
    return () => clearInterval(interval);
  }, [courseId, token]);

  const fetchCourseData = async () => {
    setLoading(true);
    try {
      const response = await request(`${endpoints.GET_FULL_COURSE_DETAILS_API}/${courseId}`, 'GET', null, token);
      const data = await response.json();

      if (data.success) {
        setCourse(data.courseDetails);
        setCompletedVideos(data.completedVideos || []);
        
        let firstVideo = null;
        let firstSectionToOpen = null;

        for (const section of data.courseDetails.section) {
            for (const subSection of section.subsection) {
                if (!data.completedVideos.includes(subSection._id)) {
                    firstVideo = subSection;
                    firstSectionToOpen = section._id;
                    break;
                }
            }
            if (firstVideo) break;
        }

        if (!firstVideo && data.courseDetails.section?.length > 0) {
            const firstSec = data.courseDetails.section[0];
            if (firstSec.subsection?.length > 0) {
                firstVideo = firstSec.subsection[0];
                firstSectionToOpen = firstSec._id;
            }
        }

        setCurrentVideo(firstVideo);
        if (firstSectionToOpen) {
            setOpenSections(prev => ({ ...prev, [firstSectionToOpen]: true }));
        }
      } else {
        toast.error("Failed to load course details");
      }
    } catch (err) {
      console.error(err);
      toast.error("An error occurred");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourseData();
  }, [courseId, token]);

  // Video Handlers
  const togglePlay = () => {
    if (videoRef.current.paused) {
      videoRef.current.play();
      setIsPlaying(true);
    } else {
      videoRef.current.pause();
      setIsPlaying(false);
    }
  };

  const handleTimeUpdate = () => {
    setCurrentTime(videoRef.current.currentTime);
  };

  const handleLoadedMetadata = () => {
    setDuration(videoRef.current.duration);
  };

  const handleSeek = (e) => {
    const time = (e.target.value / 100) * duration;
    videoRef.current.currentTime = time;
    setCurrentTime(time);
  };

  const toggleMute = () => {
    videoRef.current.muted = !videoRef.current.muted;
    setIsMuted(videoRef.current.muted);
  };

  const handleVideoEnded = async () => {
    setIsPlaying(false);
    if (!currentVideo || completedVideos.includes(currentVideo._id)) return;

    try {
      const response = await request(endpoints.UPDATE_COURSE_PROGRESS_API, 'POST', {
        courseId,
        subsectionId: currentVideo._id
      }, token);
      const data = await response.json();

      if (data.success) {
        setCompletedVideos(prev => [...prev, currentVideo._id]);
        toast.success("Progress saved!");
        
        // Generate quiz after video ends
        generateQuiz();
      }
    } catch (err) {
      console.error("Error updating progress:", err);
    }
  };

   const generateQuiz = async () => {
    setQuizLoading(true);
    setShowQuiz(true);
    setQuizSubmitted(false);
    setQuizAnswers({});
    setQuizScore(null);
    setQuizError(null);
    
    try {
      const response = await request(endpoints.AI_GENERATE_QUIZ_API, 'POST', {
        topic: currentVideo?.topic || 'this lesson',
        courseId,
        subsectionId: currentVideo._id,
        numQuestions: 5
      }, token);
      
      const data = await response.json();
      
      if (data.success && data.quiz && data.quiz.questions?.length > 0) {
        setQuizQuestions(data.quiz.questions);
      } else {
        // Fallback: Generate questions using AI ask endpoint
        try {
          const questionPrompt = `Generate 5 multiple choice questions based on the topic "${currentVideo?.topic}". Return ONLY a valid JSON object with "questions" array. Each question must have: "question" (string), "options" (array of exactly 4 strings), "correctAnswer" (integer 0-3).`;
          
          const aiResponse = await request(endpoints.AI_ASK_API, 'POST', {
            question: questionPrompt,
            courseId,
            subsectionId: currentVideo._id
          }, token);
          
          const aiData = await aiResponse.json();
          
          if (aiData.success && aiData.answer) {
            try {
              // Try to extract JSON from the response
              const jsonMatch = aiData.answer.match(/\{[\s\S]*\}/);
              const jsonString = jsonMatch ? jsonMatch[0] : aiData.answer;
              const parsed = JSON.parse(jsonString);
              
              if (parsed.questions && Array.isArray(parsed.questions) && parsed.questions.length > 0) {
                // Validate question format
                const validQuestions = parsed.questions.filter(q => 
                  q.question && 
                  Array.isArray(q.options) && 
                  q.options.length === 4 && 
                  typeof q.correctAnswer === 'number' && 
                  q.correctAnswer >= 0 && q.correctAnswer <= 3
                );
                
                if (validQuestions.length > 0) {
                  setQuizQuestions(validQuestions);
                } else {
                  throw new Error('Invalid question format');
                }
              } else {
                throw new Error('No valid questions in response');
              }
            } catch (parseErr) {
              console.error('Failed to parse AI response as JSON:', parseErr);
              setQuizError('Failed to generate quiz. AI returned invalid format.');
              setQuizLoading(false);
              return;
            }
          } else {
            setQuizError('Failed to generate quiz. AI service unavailable.');
            setQuizLoading(false);
            return;
          }
        } catch (fallbackErr) {
          console.error('Fallback quiz generation failed:', fallbackErr);
          setQuizError('Failed to generate quiz. Please try again.');
          setQuizLoading(false);
          return;
        }
      }
    } catch (err) {
      console.error("Error generating quiz:", err);
      setQuizError(`Error: ${err.message || 'Failed to generate quiz'}`);
    } finally {
      setQuizLoading(false);
    }
  };

  const handleQuizAnswer = (questionIndex, answerIndex) => {
    setQuizAnswers(prev => ({
      ...prev,
      [questionIndex]: answerIndex
    }));
  };

  const handleQuizSubmit = () => {
    let correct = 0;
    const quizResults = quizQuestions.map((q, idx) => {
      const isCorrect = quizAnswers[idx] === q.correctAnswer;
      if (isCorrect) correct++;
      return {
        question: q.question,
        options: q.options,
        correctAnswer: q.correctAnswer,
        studentAnswer: quizAnswers[idx] !== undefined ? quizAnswers[idx] : null,
        isCorrect
      };
    });
    
    const score = Math.round((correct / quizQuestions.length) * 100);
    setQuizScore(score);
    setQuizSubmitted(true);
    setQuizResults(quizResults);
  };

  const closeQuiz = () => {
    setShowQuiz(false);
    setQuizQuestions([]);
    setQuizAnswers({});
    setQuizSubmitted(false);
    setQuizScore(null);
  };

  const { user } = useSelector((state) => state.profile);

  const fetchReviews = async () => {
    try {
      const res = await request(
        `${endpoints.GET_COURSE_DETAILS_API}/${courseId}/rating`,
        'GET',
        null,
        token
      );
      const data = await res.json();
      if (res.ok && data.ratingAndReviews) {
        setReviews(data.ratingAndReviews);
        const avg = data.ratingAndReviews.length > 0
          ? (data.ratingAndReviews.reduce((acc, r) => acc + r.rating, 0) / data.ratingAndReviews.length).toFixed(1)
          : 0;
        setAverageRating(avg);

        const myReview = data.ratingAndReviews.find(
          (r) => r.user?._id === user?.id || r.user === user?.id
        );
        setUserReview(myReview || null);
      }
    } catch (error) {
      console.error('Error fetching reviews:', error);
    }
  };

  const handleReviewSubmitted = () => {
    fetchReviews();
  };

  useEffect(() => {
    if (courseId && token) {
      fetchReviews();
    }
  }, [courseId, token, user]);

  const formatTime = (time) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  const setSpeed = (speed) => {
    videoRef.current.playbackRate = speed;
    setPlaybackSpeed(speed);
    setIsSettingsOpen(false);
  };

  const toggleSection = (sectionId) => {
    setOpenSections(prev => ({
      ...prev,
      [sectionId]: !prev[sectionId]
    }));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-rich-black-900 flex items-center justify-center text-white">
        <div className="w-12 h-12 border-4 border-yellow-50 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!course) return null;

  const totalLectures = course.section.reduce((acc, sec) => acc + (sec.subsection?.length || 0), 0);
  const progressPercentage = totalLectures > 0 ? Math.round((completedVideos.length / totalLectures) * 100) : 0;

return (
    <div className="min-h-screen bg-[#000814] text-rich-black-5 flex flex-col lg:flex-row shadow-inner overflow-hidden relative">

      {/* Curriculum Sidebar - Desktop */}
      <motion.div
        initial={false}
        animate={{ width: isSidebarCollapsed ? 0 : 400 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        className="hidden lg:flex bg-[#000814] sidebar-gradient border-l border-rich-black-800 flex-col h-screen sticky top-0 shadow-[-10px_0_30px_rgba(0,0,0,0.5)] overflow-hidden relative group/sidebar"
      >
        {/* Collapse Button (Internal) */}
        <button
            onClick={() => setIsSidebarCollapsed(true)}
            className="absolute left-4 top-8 z-50 p-2 bg-rich-black-800 border border-rich-black-700 rounded-xl text-rich-black-100 hover:text-yellow-50 transition-all"
            title="Collapse Sidebar"
        >
            <FiChevronRight size={20} />
        </button>

        <div className="min-w-[400px] flex flex-col h-full pl-10">
            {/* Progress Card */}
            <div className="p-8 border-b border-rich-black-800 space-y-6">
                <h3 className="text-xl font-bold flex items-center justify-between">
                    <span>Course Curriculum</span>
                    <span className="text-xs text-rich-black-400 font-medium">{completedVideos.length} / {totalLectures} Lessons</span>
                </h3>
                <div className="w-full h-2 bg-rich-black-800 rounded-full relative overflow-hidden group/sbar">
                    <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${progressPercentage}%` }}
                        transition={{ duration: 1, ease: "easeOut" }}
                        className="absolute top-0 left-0 h-full bg-greenish-500 rounded-full shadow-[0_0_15px_rgba(5,167,123,0.5)]"
                    />
                </div>
            </div>

            {/* Sections List */}
            <div className="flex-1 overflow-y-auto custom-scrollbar">
                {course.section.map((section, idx) => (
                    <div key={section._id} className="border-b border-rich-black-800 last:border-0 overflow-hidden">
                        <button
                            onClick={() => toggleSection(section._id)}
                            className={`w-full p-6 flex justify-between items-center transition-all bg-opacity-30 ${openSections[section._id] ? 'bg-rich-black-800/50' : 'hover:bg-rich-black-800/30'}`}
                        >
                            <span className="text-xs font-bold text-rich-black-400 uppercase tracking-widest flex items-center gap-3">
                                <span className="text-rich-black-600">SECTION {idx + 1 < 10 ? `0${idx + 1}` : idx+1}:</span>
                                {section.title}
                            </span>
                            <div className="flex items-center gap-3">
                                {!openSections[section._id] && <FiLock className="text-rich-black-600" size={12} />}
                                <FiChevronDown className={`transition-transform duration-300 text-rich-black-400 ${openSections[section._id] ? 'rotate-180' : ''}`} />
                            </div>
                        </button>

                        <AnimatePresence>
                            {openSections[section._id] && (
                                <motion.div
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: 'auto', opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    transition={{ duration: 0.3 }}
                                    className="overflow-hidden bg-[#000B1C]/30"
                                >
                                    {section.subsection.map((sub) => {
                                        const isCompleted = completedVideos.includes(sub._id);
                                        const isActive = currentVideo?._id === sub._id;
                                        const isLocked = false;

                                        return (
                                            <div
                                                key={sub._id}
                                                onClick={() => !isLocked && setCurrentVideo(sub)}
                                                className={`relative group flex justify-between items-center px-8 py-5 cursor-pointer border-t border-rich-black-800/50 transition-all ${
                                                    isActive ? 'bg-yellow-50/5' : 'hover:bg-white/5'
                                                } ${isLocked ? 'opacity-50 cursor-not-allowed' : ''}`}
                                            >
                                                {isActive && (
                                                    <motion.div
                                                        layoutId="active-lesson-indicator"
                                                        className="absolute left-0 top-0 bottom-0 w-1 bg-yellow-50 shadow-[0_0_20px_rgba(255,214,10,0.8)]"
                                                    />
                                                )}

                                                <div className="flex flex-col gap-1 pr-4">
                                                    <span className={`text-sm font-semibold transition-colors ${isActive ? 'text-yellow-50' : 'text-rich-black-50 group-hover:text-white'}`}>
                                                        {sub.topic}
                                                    </span>
                                                    <span className="text-[10px] text-rich-black-400 font-medium">
                                                        {sub.timeDuration}
                                                    </span>
                                                </div>

                                                <div className="flex items-center gap-4">
                                                    {isCompleted ? (
                                                        <div className="w-5 h-5 bg-greenish-500/20 text-greenish-300 rounded-full flex items-center justify-center shadow-[0_0_10px_rgba(5,167,123,0.3)]">
                                                            <FiCheckCircle size={14} />
                                                        </div>
                                                    ) : isActive ? (
                                                        <div className="w-5 h-5 bg-yellow-50/20 text-yellow-50 rounded-full flex items-center justify-center ring-2 ring-yellow-50/20">
                                                            <FiPlayCircle size={14} />
                                                        </div>
                                                    ) : isLocked ? (
                                                        <FiLock className="text-rich-black-600" size={16} />
                                                    ) : (
                                                        <div className="w-5 h-5 rounded-full border-2 border-rich-black-700 group-hover:border-rich-black-500 transition-colors" />
                                                    )}
                                                </div>
                                            </div>
                                        )
                                    })}
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                ))}
            </div>

            {/* Syllabus Download Footer */}
            <div className="p-8 border-t border-rich-black-800 bg-[#000814]">
                <button className="w-full flex items-center justify-center gap-3 py-4 rounded-2xl bg-rich-black-800 border border-rich-black-700 text-sm font-bold text-rich-black-200 hover:text-white hover:bg-rich-black-700 hover:border-rich-black-600 transition-all group">
                    <FiDownload className="group-hover:translate-y-0.5 transition-transform" />
                    Download Syllabus
                </button>
            </div>
        </div>
      </motion.div>

      {/* Mobile Curriculum Drawer */}
      {showCurriculum && (
        <>
          <div
            className='fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden'
            onClick={() => setShowCurriculum(false)}
          />
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed inset-y-0 right-0 z-50 w-[85%] max-w-sm lg:hidden bg-[#000814] sidebar-gradient border-l border-rich-black-800 flex flex-col shadow-[-10px_0_30px_rgba(0,0,0,0.5)]"
          >
            <div className="flex items-center justify-between p-4 border-b border-rich-black-800">
              <h3 className="text-lg font-bold text-white">Course Curriculum</h3>
              <button
                onClick={() => setShowCurriculum(false)}
                className="p-2 hover:bg-rich-black-700 rounded-lg text-rich-black-400 hover:text-white transition-colors"
              >
                <FiX size={20} />
              </button>
            </div>
            <div className="p-4 border-b border-rich-black-800">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-rich-black-400">{completedVideos.length} / {totalLectures} Lessons</span>
                <span className="text-xs text-yellow-50 font-medium">{progressPercentage}% Complete</span>
              </div>
              <div className="w-full h-2 bg-rich-black-800 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${progressPercentage}%` }}
                  className="h-full bg-greenish-500 rounded-full"
                />
              </div>
            </div>
            <div className="flex-1 overflow-y-auto custom-scrollbar">
              {course.section.map((section, idx) => (
                <div key={section._id} className="border-b border-rich-black-800 last:border-0">
                  <button
                    onClick={() => toggleSection(section._id)}
                    className={`w-full p-4 flex justify-between items-center ${openSections[section._id] ? 'bg-rich-black-800/50' : ''}`}
                  >
                    <span className="text-xs font-bold text-rich-black-400 uppercase tracking-wider flex items-center gap-2">
                      <span>{idx + 1}.</span>
                      <span className="truncate">{section.title}</span>
                    </span>
                    <FiChevronDown className={`transition-transform ${openSections[section._id] ? 'rotate-180' : ''}`} />
                  </button>
                  {openSections[section._id] && (
                    <div className="bg-[#000B1C]/30">
                      {section.subsection.map((sub) => {
                        const isCompleted = completedVideos.includes(sub._id);
                        const isActive = currentVideo?._id === sub._id;
                        return (
                          <div
                            key={sub._id}
                            onClick={() => {
                              setCurrentVideo(sub);
                              setShowCurriculum(false);
                            }}
                            className={`flex items-center gap-3 px-4 py-3 border-t border-rich-black-800/50 cursor-pointer ${
                              isActive ? 'bg-yellow-50/10 border-l-2 border-l-yellow-50' : ''
                            }`}
                          >
                            <div className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0">
                              {isCompleted ? (
                                <FiCheckCircle className="text-greenish-400" size={16} />
                              ) : isActive ? (
                                <FiPlayCircle className="text-yellow-50" size={16} />
                              ) : (
                                <div className="w-4 h-4 rounded-full border-2 border-rich-black-600" />
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className={`text-sm truncate ${isActive ? 'text-yellow-50 font-medium' : 'text-rich-black-200'}`}>
                                {sub.topic}
                              </p>
                              <p className="text-[10px] text-rich-black-500">{sub.timeDuration}</p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </motion.div>
        </>
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-y-auto custom-scrollbar transition-all duration-300 pb-24 lg:pb-0">
        
        {/* Navigation / Breadcrumb */}
        <div className="px-4 md:px-6 py-3 md:py-4 flex items-center gap-3 md:gap-4 bg-[#000B1C] border-b border-rich-black-800 sticky top-0 z-30">
            <button 
                onClick={() => navigate('/dashboard/enrolled-courses')}
                className="p-2 hover:bg-rich-black-800 rounded-full transition-colors text-rich-black-100 hover:text-white"
            >
                <FiArrowLeft size={20} />
            </button>
            <div className="flex items-center gap-2 text-xs md:text-sm min-w-0">
                <span className="text-rich-black-200 hidden sm:inline">Enrolled Courses</span>
                <span className="text-rich-black-600 hidden sm:inline">/</span>
                <span className="text-yellow-50 font-medium truncate">{course.title}</span>
            </div>
        </div>

        {/* Video Player Section */}
        <div className="p-3 md:p-6 lg:p-10 space-y-4 md:space-y-8 max-w-7xl mx-auto w-full">
            <div className="relative aspect-video rounded-2xl md:rounded-3xl overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.5)] bg-black group border border-rich-black-800">
                {currentVideo?.file?.url ? (
                    <video 
                        ref={videoRef}
                        src={currentVideo.file.url}
                        className="w-full h-full object-contain"
                        onTimeUpdate={handleTimeUpdate}
                        onLoadedMetadata={handleLoadedMetadata}
                        onEnded={handleVideoEnded}
                        onClick={togglePlay}
                    />
                ) : (
                    <div className="absolute inset-0 flex items-center justify-center text-rich-black-200">
                      Select a lecture to start watching
                    </div>
                )}

                {/* Custom Overlay for Initial Play State */}
                {!isPlaying && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-black/40 transition-all cursor-pointer" onClick={togglePlay}>
                        <motion.div 
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            className="w-16 h-16 md:w-20 md:h-20 bg-yellow-50 rounded-full flex items-center justify-center text-rich-black-900 shadow-[0_0_30px_rgba(255,214,10,0.4)]"
                        >
                            <FiPlay size={28} fill="currentColor" className="ml-1" />
                        </motion.div>
                    </div>
                )}

                {/* Custom Video Controls Bar */}
                <div className={`absolute bottom-0 left-0 right-0 p-3 md:p-6 video-gradient-overlay transition-all duration-300 ${!isPlaying ? 'translate-y-0' : 'translate-y-full group-hover:translate-y-0'}`}>
                    <div className="space-y-2 md:space-y-4">
                        {/* Progress Bar */}
                        <div className="w-full h-1 md:h-1.5 bg-white/20 rounded-full relative group/progress cursor-pointer overflow-hidden">
                            <input 
                                type="range"
                                min='0'
                                max='100'
                                value={(currentTime / duration) * 100 || 0}
                                onChange={handleSeek}
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                            />
                            <div
                                className="absolute top-0 left-0 h-full bg-yellow-50"
                                style={{ width: `${(currentTime / duration) * 100}%` }}
                            />
                        </div>
                        
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3 md:gap-6">
                                <motion.button whileHover={{ scale: 1.1 }} onClick={togglePlay} className="text-white">
                                    {isPlaying ? <FiPause size={20} fill="currentColor" /> : <FiPlay size={20} fill="currentColor" />}
                                </motion.button>
                                <motion.button whileHover={{ scale: 1.1 }} onClick={toggleMute} className="text-white">
                                    {isMuted ? <FiVolumeX size={20} /> : <FiVolume2 size={20} />}
                                </motion.button>
                                <span className="text-xs md:text-sm text-rich-black-50 font-medium lining-nums hidden sm:inline">
                                    {formatTime(currentTime)} / {formatTime(duration)}
                                </span>
                            </div>
                            <div className="flex items-center gap-3 md:gap-6 relative">
                                <motion.button 
                                    whileHover={{ scale: 1.1 }} 
                                    onClick={() => setIsSettingsOpen(!isSettingsOpen)}
                                    className={`transition-colors p-1 ${isSettingsOpen ? 'text-yellow-50' : 'text-white hover:text-yellow-50'}`}
                                >
                                    <FiSettings size={20} />
                                </motion.button>

                                <AnimatePresence>
                                    {isSettingsOpen && (
                                        <motion.div
                                            initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                            animate={{ opacity: 1, y: 0, scale: 1 }}
                                            exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                            className="absolute bottom-full right-0 mb-4 w-36 md:w-40 bg-rich-black-800 border border-rich-black-700 rounded-2xl overflow-hidden shadow-[0_10px_30px_rgba(0,0,0,0.5)] z-[70] backdrop-blur-xl"
                                        >
                                            <div className="p-3 border-b border-rich-black-700">
                                                <span className="text-[10px] font-bold text-rich-black-400 uppercase tracking-widest">Playback Speed</span>
                                            </div>
                                            <div className="p-1">
                                                {[0.5, 0.75, 1, 1.25, 1.5, 2].map((speed) => (
                                                    <button
                                                        key={speed}
                                                        onClick={() => setSpeed(speed)}
                                                        className={`w-full text-left px-3 md:px-4 py-2 text-xs font-semibold rounded-xl transition-all flex items-center justify-between group ${
                                                            playbackSpeed === speed ? 'bg-yellow-50 text-rich-black-900' : 'text-rich-black-100 hover:bg-white/5'
                                                        }`}
                                                    >
                                                        <span>{speed === 1 ? 'Normal' : `${speed}x`}</span>
                                                        {playbackSpeed === speed && <FiCheckCircle size={14} />}
                                                    </button>
                                                ))}
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>

                                <motion.button 
                                    whileHover={{ scale: 1.1 }} 
                                    onClick={() => videoRef.current?.requestFullscreen()} 
                                    className="text-white hover:text-yellow-50 transition-colors p-1"
                                >
                                    <FiMaximize size={20} />
                                </motion.button>
                            </div>
                        </div>
                    </div>
                 </div>
              </div>

              {/* AI Quiz Section */}
              {showQuiz && (
                  <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-rich-black-800/50 backdrop-blur-md rounded-2xl md:rounded-3xl border border-rich-black-700 p-4 md:p-8 shadow-[0_20px_60px_rgba(0,0,0,0.5)]"
                  >
                      <div className="flex items-center justify-between mb-4 md:mb-6">
                          <h3 className="text-lg md:text-2xl font-bold text-yellow-50 flex items-center gap-2 md:gap-3">
                              <svg className="w-5 h-5 md:w-6 md:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                              </svg>
                              <span className="hidden sm:inline">Quiz:</span> {currentVideo?.topic}
                          </h3>
                          <button
                              onClick={closeQuiz}
                              className="p-2 hover:bg-rich-black-700 rounded-xl transition-colors text-rich-black-400 hover:text-white"
                          >
                              <FiX size={20} />
                          </button>
                      </div>

                      {quizError ? (
                          <div className="text-center py-8 md:py-12">
                              <div className="w-12 h-12 md:w-16 md:h-16 rounded-full bg-pink-500/20 flex items-center justify-center mx-auto mb-4">
                                  <svg className="w-6 h-6 md:w-8 md:h-8 text-pink-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                                  </svg>
                              </div>
                              <p className="text-rich-black-100 mb-2">Failed to generate quiz</p>
                              <p className="text-sm text-rich-black-400 mb-4 md:mb-6">{quizError}</p>
                              <button
                                  onClick={() => { setQuizError(null); generateQuiz(); }}
                                  className="px-4 md:px-6 py-2 md:py-3 bg-yellow-50 text-rich-black-900 font-bold rounded-xl hover:scale-105 transition-transform"
                              >
                                  Try Again
                              </button>
                          </div>
                      ) : quizLoading ? (
                          <div className="flex flex-col items-center justify-center py-8 md:py-12 gap-4">
                              <div className="w-10 h-10 md:w-12 md:h-12 border-4 border-yellow-50 border-t-transparent rounded-full animate-spin"></div>
                              <p className="text-rich-black-200 text-sm md:text-base">Generating quiz based on the video...</p>
                          </div>
                      ) : quizQuestions.length > 0 ? (
                          <>
                              {!quizSubmitted ? (
                                  <div className="space-y-4 md:space-y-6">
                                      {quizQuestions.map((q, qIdx) => (
                                          <div key={qIdx} className="bg-rich-black-900/50 rounded-xl md:rounded-2xl p-4 md:p-6 border border-rich-black-700">
                                              <p className="text-white font-semibold mb-3 md:mb-4 text-sm md:text-base">
                                                  {qIdx + 1}. {q.question}
                                              </p>
                                              <div className="space-y-2 md:space-y-3">
                                                  {q.options?.map((option, oIdx) => (
                                                      <button
                                                          key={oIdx}
                                                          onClick={() => handleQuizAnswer(qIdx, oIdx)}
                                                          className={`w-full text-left px-3 md:px-4 py-2 md:py-3 rounded-xl transition-all text-sm ${
                                                              quizAnswers[qIdx] === oIdx
                                                                  ? 'bg-yellow-50/20 border-yellow-50 text-yellow-50 border'
                                                                  : 'bg-rich-black-800 border-rich-black-700 text-rich-black-100 hover:border-rich-black-500'
                                                          }`}
                                                      >
                                                          <span className="font-medium">{String.fromCharCode(65 + oIdx)}.</span> {option}
                                                      </button>
                                                  ))}
                                              </div>
                                          </div>
                                      ))}

                                      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2 md:pt-4">
                                          <p className="text-xs md:text-sm text-rich-black-400">
                                              {Object.keys(quizAnswers).length} of {quizQuestions.length} answered
                                          </p>
                                          <button
                                              onClick={handleQuizSubmit}
                                              disabled={Object.keys(quizAnswers).length < quizQuestions.length}
                                              className="w-full sm:w-auto px-6 py-3 bg-yellow-50 text-rich-black-900 font-bold rounded-xl hover:scale-105 transition-transform disabled:opacity-50 disabled:cursor-not-allowed"
                                          >
                                              Submit Quiz
                                          </button>
                                      </div>
                                  </div>
                              ) : (
                                  <div className="text-center py-6 md:py-8">
                                      <div className={`w-20 h-20 md:w-24 md:h-24 rounded-full flex items-center justify-center mx-auto mb-4 md:mb-6 ${
                                          quizScore >= 80 ? 'bg-greenish-500/20 text-greenish-300' :
                                          quizScore >= 60 ? 'bg-yellow-50/20 text-yellow-50' :
                                          'bg-pink-500/20 text-pink-300'
                                      }`}>
                                          <span className="text-2xl md:text-3xl font-bold">{quizScore}%</span>
                                      </div>
                                      <h4 className="text-lg md:text-xl font-bold text-white mb-2">
                                          {quizScore >= 80 ? 'Excellent!' : quizScore >= 60 ? 'Good Job!' : 'Keep Practicing!'}
                                      </h4>
                                      <p className="text-rich-black-300 mb-4 md:mb-6 text-sm md:text-base">
                                          You got {Math.round((quizScore / 100) * quizQuestions.length)} out of {quizQuestions.length} questions correct
                                      </p>
                                      <button
                                          onClick={closeQuiz}
                                          className="px-6 py-3 bg-rich-black-800 text-rich-black-100 font-medium rounded-xl hover:bg-rich-black-700 transition-colors"
                                      >
                                          Continue Learning
                                      </button>
                                  </div>
                              )}
                          </>
                      ) : (
                          <div className="text-center py-8 md:py-12">
                              <p className="text-rich-black-300">No questions generated. Please try again.</p>
                          </div>
                      )}
                  </motion.div>
              )}

             {/* Title and Status Area */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="space-y-2 flex-1">
                    <h2 className="text-xl md:text-2xl lg:text-3xl font-bold text-white tracking-tight">
                        {currentVideo?.topic || "Loading lesson..."}
                    </h2>
                    <div className="flex items-center gap-3 flex-wrap">
                        <span className="flex items-center gap-2 text-greenish-300 text-xs md:text-sm font-semibold bg-greenish-500/10 px-3 py-1 rounded-full border border-greenish-500/20">
                            <div className="w-1.5 h-1.5 rounded-full bg-greenish-300 animate-pulse" />
                            {course.title.split(":")[0]}
                        </span>
                    </div>
                </div>

                {completedVideos.includes(currentVideo?._id) ? (
                    <div className="flex items-center gap-2 md:gap-3 bg-greenish-500 text-white px-4 md:px-8 py-2 md:py-4 rounded-xl md:rounded-2xl font-bold shadow-[0_10px_30px_rgba(5,167,123,0.3)] border border-greenish-300/30 text-sm md:text-base">
                        <FiCheckCircle size={18} />
                        <span>Completed</span>
                    </div>
                ) : (
                    <div className="flex items-center gap-2 md:gap-3 bg-rich-black-800 text-rich-black-200 px-4 md:px-8 py-2 md:py-4 rounded-xl md:rounded-2xl font-bold border border-rich-black-700 opacity-60 text-sm md:text-base">
                        <div className="w-4 h-4 md:w-5 md:h-5 rounded-full border-2 border-rich-black-600" />
                        <span>In Progress</span>
                    </div>
                )}
            </div>

            {/* Mobile Curriculum Toggle Button */}
            <button
              onClick={() => setShowCurriculum(true)}
              className="lg:hidden flex items-center justify-between w-full p-4 bg-rich-black-800 border border-rich-black-700 rounded-2xl hover:bg-rich-black-700 transition-colors"
            >
              <div className="flex items-center gap-3">
                <FiVideo size={20} className="text-yellow-50" />
                <span className="text-sm font-medium">View Course Curriculum</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-rich-black-400">{completedVideos.length}/{totalLectures}</span>
                <FiChevronRight size={18} />
              </div>
            </button>

            <hr className="border-rich-black-800" />

            {/* Tabs and Bottom Grid */}
            <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 xl:gap-10">
                <div className="xl:col-span-8 flex flex-col gap-6 xl:gap-8">
                    {/* Tab Navigation - Horizontal Scroll on Mobile */}
                    <div className="overflow-x-auto pb-2 -mx-4 px-4 scrollbar-hide">
                        <div className="flex items-center gap-4 md:gap-8 min-w-max border-b border-rich-black-800">
                            {['Discussion', 'Resources', 'Personal Notes', 'Reviews', 'Quiz Results'].map((tab) => (
                                <button
                                    key={tab}
                                    onClick={() => setActiveTab(tab)}
                                    className={`pb-3 md:pb-4 text-xs md:text-sm font-semibold transition-all relative whitespace-nowrap ${
                                        activeTab === tab ? 'text-yellow-50' : 'text-rich-black-200 hover:text-white'
                                    }`}
                                >
                                    {tab === 'Discussion' && <span className="flex items-center gap-1.5 md:gap-2"><FiMessageSquare size={14} /> <span className="hidden xs:inline">Discussion</span></span>}
                                    {tab === 'Resources' && <span className="flex items-center gap-1.5 md:gap-2"><FiFileText size={14} /> <span className="hidden xs:inline">Resources</span></span>}
                                    {tab === 'Personal Notes' && <span className="flex items-center gap-1.5 md:gap-2"><FiEdit size={14} /> <span className="hidden sm:inline">Notes</span></span>}
                                    {tab === 'Reviews' && <span className="flex items-center gap-1.5 md:gap-2"><FaStar size={14} /> <span className="hidden xs:inline">Reviews</span></span>}
                                    {tab === 'Quiz Results' && <span className="flex items-center gap-1.5 md:gap-2"><FiCheckCircle size={14} /> <span className="hidden md:inline">Quiz Results</span></span>}

                                    {activeTab === tab && (
                                        <motion.div
                                            layoutId="tab-underline"
                                            className="absolute bottom-0 left-0 right-0 h-0.5 bg-yellow-50 rounded-full"
                                        />
                                    )}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Tab Content */}
                    <div className="min-h-[250px] md:min-h-[300px] glass-morphism rounded-2xl md:rounded-3xl p-4 md:p-6 lg:p-8">
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={activeTab}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                transition={{ duration: 0.2 }}
                            >
                                {activeTab === 'Discussion' && (
                                    <Discussion
                                        courseId={courseId}
                                        token={token}
                                        user={user}
                                    />
                                )}
                                {activeTab === 'Resources' && (
                                    <Resources
                                        courseId={courseId}
                                        token={token}
                                        user={user}
                                        isInstructor={course?.instructor?._id === user?.id || course?.instructor === user?.id}
                                    />
                                )}
                                {activeTab === 'Personal Notes' && (
                                    <PersonalNotes
                                        courseId={courseId}
                                        currentVideo={currentVideo}
                                        token={token}
                                        currentTime={currentTime}
                                    />
                                )}
                                {activeTab === 'Quiz Results' && quizResults.length > 0 && (
                                    <div className="space-y-4 md:space-y-6">
                                        {/* Score Summary */}
                                        <div className="bg-rich-black-800/50 rounded-xl md:rounded-2xl p-4 md:p-6 border border-rich-black-700">
                                            <div className="flex items-center justify-between mb-3 md:mb-4">
                                                <h4 className="text-lg md:text-xl font-bold text-white">Quiz Results</h4>
                                                <span className={`px-3 md:px-4 py-1 md:py-1.5 rounded-full text-xs md:text-sm font-bold ${
                                                    quizScore >= 80 ? 'bg-greenish-500/20 text-greenish-300' :
                                                    quizScore >= 60 ? 'bg-yellow-50/20 text-yellow-50' :
                                                    'bg-pink-500/20 text-pink-300'
                                                }`}>
                                                    {quizScore}%
                                                </span>
                                            </div>
                                            <p className="text-sm md:text-base text-rich-black-300">
                                                You answered {quizResults.filter(r => r.isCorrect).length} out of {quizResults.length} questions correctly
                                            </p>
                                        </div>

                                        {/* Detailed Results */}
                                        <div className="space-y-3 md:space-y-4">
                                            {quizResults.map((result, idx) => (
                                                <div key={idx} className={`p-4 md:p-6 rounded-xl md:rounded-2xl border ${
                                                    result.isCorrect
                                                        ? 'bg-greenish-500/5 border-greenish-500/20'
                                                        : 'bg-pink-500/5 border-pink-500/20'
                                                }`}>
                                                    <div className="flex items-start gap-2 md:gap-3 mb-3 md:mb-4">
                                                        <div className={`w-6 h-6 md:w-8 md:h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                                                            result.isCorrect ? 'bg-greenish-500/20 text-greenish-300' : 'bg-pink-500/20 text-pink-300'
                                                        }`}>
                                                            {result.isCorrect ? <FiCheckCircle size={14} /> : <FiX size={14} />}
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <p className="text-white font-semibold mb-2 md:mb-3 text-sm md:text-base">
                                                                {idx + 1}. {result.question}
                                                            </p>

                                                            {/* Student's Answer */}
                                                            <div className="mb-2 md:mb-3">
                                                                <p className="text-[10px] md:text-xs font-bold text-rich-black-400 uppercase tracking-widest mb-1">Your Answer</p>
                                                                <p className={`text-xs md:text-sm ${
                                                                    result.isCorrect ? 'text-greenish-300' : 'text-pink-300'
                                                                }`}>
                                                                    {result.studentAnswer !== null
                                                                        ? `${String.fromCharCode(65 + result.studentAnswer)}. ${result.options[result.studentAnswer]}`
                                                                        : 'Not answered'
                                                                    }
                                                                </p>
                                                            </div>

                                                            {/* Correct Answer */}
                                                            <div className="mb-2 md:mb-3">
                                                                <p className="text-[10px] md:text-xs font-bold text-rich-black-400 uppercase tracking-widest mb-1">Correct Answer</p>
                                                                <p className="text-xs md:text-sm text-greenish-300">
                                                                    {String.fromCharCode(65 + result.correctAnswer)}. {result.options[result.correctAnswer]}
                                                                </p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>

                                        {/* Action Buttons */}
                                        <div className="flex flex-col sm:flex-row items-center gap-3 md:gap-4 pt-2 md:pt-4">
                                            <button
                                                onClick={() => {
                                                    setQuizSubmitted(false);
                                                    setQuizResults([]);
                                                    generateQuiz();
                                                }}
                                                className="w-full sm:w-auto px-4 md:px-6 py-2 md:py-3 bg-yellow-50 text-rich-black-900 font-bold rounded-xl hover:scale-105 transition-transform text-sm md:text-base"
                                            >
                                                Retake Quiz
                                            </button>
                                            <button
                                                onClick={() => setActiveTab('Discussion')}
                                                className="w-full sm:w-auto px-4 md:px-6 py-2 md:py-3 bg-rich-black-800 text-rich-black-100 font-medium rounded-xl hover:bg-rich-black-700 transition-colors text-sm md:text-base"
                                            >
                                                Back to Discussion
                                            </button>
                                        </div>
                                    </div>
                                )}
                                {activeTab === 'Reviews' && (
                                    <div className="space-y-6 md:space-y-8">
                                        {/* Rating Summary */}
                                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                                            <div className="flex items-center gap-3 md:gap-4">
                                                <div className="flex items-center gap-2 md:gap-3 bg-rich-black-900/50 px-3 md:px-5 py-2 md:py-3 rounded-xl md:rounded-2xl border border-rich-black-700">
                                                    <span className="text-2xl md:text-3xl font-bold text-yellow-50">{averageRating}</span>
                                                    <div className="flex flex-col">
                                                        <div className="flex gap-0.5">
                                                            {[...Array(5)].map((_, i) => (
                                                                <FaStar key={i} size={12} md:size={14} className={i < Math.round(averageRating) ? 'fill-yellow-50 text-yellow-50' : 'fill-rich-black-600 text-rich-black-600'} />
                                                            ))}
                                                        </div>
                                                        <span className="text-xs text-rich-black-400 mt-1">{reviews.length} reviews</span>
                                                    </div>
                                                </div>
                                            </div>
                                            {!userReview ? (
                                                <motion.button
                                                    onClick={() => setShowRatingModal(true)}
                                                    whileHover={{ scale: 1.05 }}
                                                    whileTap={{ scale: 0.95 }}
                                                    className="flex items-center gap-2 px-4 md:px-6 py-2 md:py-3 bg-gradient-to-r from-yellow-50 to-yellow-100 text-rich-black-900 font-bold rounded-xl hover:shadow-[0_4px_20px_rgba(255,214,10,0.4)] transition-all text-sm md:text-base"
                                                >
                                                    <FaStar size={14} md:size={16} />
                                                    Write a Review
                                                </motion.button>
                                            ) : (
                                                <div className="flex items-center gap-2 bg-pastelGreen-500/10 px-3 md:px-4 py-2 rounded-full border border-pastelGreen-500/20">
                                                    <FaStar size={12} md:size={14} className="fill-pastelGreen-400 text-pastelGreen-400" />
                                                    <span className="text-xs md:text-sm text-pastelGreen-400 font-medium">You rated {userReview.rating}/5</span>
                                                </div>
                                            )}
                                        </div>

                                        {/* Reviews List */}
                                        {reviews.length > 0 ? (
                                            <div className="space-y-3 md:space-y-4">
                                                {reviews.map((review, idx) => (
                                                    <motion.div
                                                        key={review._id || idx}
                                                        initial={{ opacity: 0, y: 10 }}
                                                        animate={{ opacity: 1, y: 0 }}
                                                        transition={{ delay: idx * 0.05 }}
                                                        className="bg-rich-black-900/40 p-4 md:p-5 rounded-xl md:rounded-2xl border border-rich-black-700/50 hover:border-yellow-50/20 transition-all"
                                                    >
                                                        <div className="flex items-start gap-3 md:gap-4">
                                                            <img
                                                                src={review.user?.profileImage}
                                                                alt={review.user?.fName}
                                                                onError={(e) => {
                                                                    if (!e.target.dataset.fallback) {
                                                                        e.target.dataset.fallback = 'true';
                                                                        e.target.src = `https://api.dicebear.com/7.x/initials/png?seed=${review.user?.fName || 'U'}${review.user?.lName || ''}&size=128`;
                                                                    }
                                                                }}
                                                                className="w-8 h-8 md:w-10 md:h-10 rounded-full object-cover ring-2 ring-rich-black-700"
                                                            />
                                                            <div className="flex-1 min-w-0">
                                                                <div className="flex items-center justify-between mb-1 md:mb-2">
                                                                    <span className="text-xs md:text-sm font-semibold text-rich-black-5">
                                                                        {review.user?.fName} {review.user?.lName}
                                                                    </span>
                                                                    <div className="flex gap-0.5">
                                                                        {[...Array(5)].map((_, i) => (
                                                                            <FaStar key={i} size={10} md:size={12} className={i < review.rating ? 'fill-yellow-50 text-yellow-50' : 'fill-rich-black-600 text-rich-black-600'} />
                                                                        ))}
                                                                    </div>
                                                                </div>
                                                                {review.review && (
                                                                    <p className="text-xs md:text-sm text-rich-black-300 leading-relaxed">{review.review}</p>
                                                                )}
                                                                {review.createdAt && (
                                                                    <p className="text-[10px] md:text-xs text-rich-black-500 mt-1 md:mt-2">
                                                                        {new Date(review.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                                                    </p>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </motion.div>
                                                ))}
                                            </div>
                                        ) : (
                                            <div className="text-center py-8 md:py-10">
                                                <div className="w-14 h-14 md:w-16 md:h-16 mx-auto mb-4 rounded-full bg-rich-black-800/50 flex items-center justify-center">
                                                    <FaStar size={20} md:size={24} className="text-rich-black-500" />
                                                </div>
                                                <p className="text-rich-black-300 font-medium">No reviews yet</p>
                                                <p className="text-xs md:text-sm text-rich-black-500">Be the first to review this course!</p>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </motion.div>
                        </AnimatePresence>
                    </div>
                </div>

                {/* Essential Tools - Hidden on Mobile, Visible on Large Screens */}
                <div className="hidden xl:block xl:col-span-4 flex flex-col gap-4">
                    <span className="text-xs font-bold text-rich-black-400 uppercase tracking-widest">Essential Tools</span>
                    <div className="flex flex-col gap-3 md:gap-4">
                        <div className="flex items-center justify-between p-4 md:p-5 bg-rich-black-800/40 border border-rich-black-700 rounded-2xl group cursor-pointer hover:bg-rich-black-800 transition-all">
                            <div className="flex items-center gap-3 md:gap-4">
                                <div className="w-10 h-10 md:w-12 md:h-12 bg-greenish-500/10 text-greenish-300 rounded-xl flex items-center justify-center">
                                    <FiFileText size={20} md:size={24} />
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-sm font-semibold">Architecture_Spec.pdf</span>
                                    <span className="text-[10px] text-rich-black-400 uppercase tracking-tighter">Documentation</span>
                                </div>
                            </div>
                            <FiDownload className="text-rich-black-400 group-hover:text-yellow-50" />
                        </div>
                        <div className="flex items-center justify-between p-4 md:p-5 bg-rich-black-800/40 border border-rich-black-700 rounded-2xl group cursor-pointer hover:bg-rich-black-800 transition-all">
                            <div className="flex items-center gap-3 md:gap-4">
                                <div className="w-10 h-10 md:w-12 md:h-12 bg-blue-500/10 text-blue-400 rounded-xl flex items-center justify-center">
                                    <FiVideo size={20} md:size={24} />
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-sm font-semibold">Source_Repo_Module_4</span>
                                    <span className="text-[10px] text-rich-black-400 uppercase tracking-tighter">Code Snippets</span>
                                </div>
                            </div>
                            <FiExternalLink className="text-rich-black-400 group-hover:text-yellow-50" />
                        </div>
                    </div>
                </div>
            </div>
        </div>
      </div>

      {/* AI Study Assistant — Floating */}
      {currentVideo && (
        <AiSidebar
          courseId={courseId}
          currentVideo={currentVideo}
          token={token}
        />
      )}

      {/* Chat with Instructor — Floating Button */}
      <motion.button
        onClick={() => setShowChat(true)}
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        className="fixed right-4 md:right-6 bottom-20 md:bottom-28 z-50 w-12 h-12 md:w-14 md:h-14 bg-gradient-to-br from-violet-500 to-violet-600 rounded-full shadow-[0_4px_20px_rgba(139,92,246,0.5)] flex items-center justify-center hover:shadow-[0_6px_30px_rgba(139,92,246,0.6)] transition-all"
      >
        <div className="relative">
          <svg className="w-5 h-5 md:w-6 md:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
          {chatUnreadCount > 0 && (
            <span className="absolute -top-1 -right-1 w-4 h-4 md:w-5 md:h-5 bg-red-500 text-white text-[10px] md:text-xs font-bold rounded-full flex items-center justify-center animate-pulse">
              {chatUnreadCount > 9 ? '9+' : chatUnreadCount}
            </span>
          )}
        </div>
      </motion.button>

      {/* Instructor Chat Modal */}
      <InstructorChat
        courseId={courseId}
        courseTitle={course?.title}
        instructor={course?.instructor}
        isOpen={showChat}
        onClose={() => setShowChat(false)}
      />

      {/* Rating Modal */}
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

export default ViewCourse;
