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
  FiX
} from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { endpoints } from '../services/api';
import { request } from '../services/operations/authApi';
import AiSidebar from '../components/ViewCourse/AiSidebar';
import PersonalNotes from '../components/ViewCourse/PersonalNotes';

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
    <div className="h-screen bg-[#000814] text-rich-black-5 flex flex-col lg:flex-row shadow-inner overflow-hidden relative">
      
      {/* Sidebar Toggle Button (Floating when collapsed) */}
      <AnimatePresence>
        {isSidebarCollapsed && (
            <motion.button 
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                onClick={() => setIsSidebarCollapsed(false)}
                className="absolute right-6 top-8 z-[60] w-12 h-12 bg-yellow-50 text-rich-black-900 rounded-full flex items-center justify-center shadow-[0_0_20px_rgba(255,214,10,0.4)] hover:scale-110 transition-transform"
                title="Expand Curriculum"
            >
                <FiChevronLeft size={24} />
            </motion.button>
        )}
      </AnimatePresence>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-y-auto custom-scrollbar transition-all duration-300">
        
        {/* Navigation / Breadcrumb */}
        <div className="px-6 py-4 flex items-center gap-4 bg-[#000B1C] border-b border-rich-black-800">
            <button 
                onClick={() => navigate('/dashboard/enrolled-courses')}
                className="p-2 hover:bg-rich-black-800 rounded-full transition-colors text-rich-black-100 hover:text-white"
            >
                <FiArrowLeft size={20} />
            </button>
            <div className="flex items-center gap-2 text-sm">
                <span className="text-rich-black-200">Enrolled Courses</span>
                <span className="text-rich-black-600">/</span>
                <span className="text-yellow-50 font-medium truncate max-w-[200px] md:max-w-none">{course.title}</span>
            </div>
        </div>

        {/* Video Player Section */}
        <div className="p-6 lg:p-10 space-y-8 max-w-7xl mx-auto w-full">
            <div className="relative aspect-video rounded-3xl overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.5)] bg-black group border border-rich-black-800">
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
                            className="w-20 h-20 bg-yellow-50 rounded-full flex items-center justify-center text-rich-black-900 shadow-[0_0_30px_rgba(255,214,10,0.4)]"
                        >
                            <FiPlay size={32} fill="currentColor" className="ml-1" />
                        </motion.div>
                    </div>
                )}

                {/* Custom Video Controls Bar */}
                <div className={`absolute bottom-0 left-0 right-0 p-6 video-gradient-overlay transition-all duration-300 ${!isPlaying ? 'translate-y-0' : 'translate-y-full group-hover:translate-y-0'}`}>
                    <div className="space-y-4">
                        {/* Progress Bar */}
                        <div className="w-full h-1.5 bg-white/20 rounded-full relative group/progress cursor-pointer overflow-hidden">
                            <input 
                                type="range" 
                                min="0" 
                                max="100" 
                                value={(currentTime / duration) * 100 || 0}
                                onChange={handleSeek}
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                            />
                            <div 
                                className="absolute top-0 left-0 h-full bg-yellow-50" 
                                style={{ width: `${(currentTime / duration) * 100}%` }}
                            />
                            <div 
                                className="absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-yellow-50 rounded-full shadow-[0_0_10px_rgba(255,214,10,0.8)] opacity-0 group-hover/progress:opacity-100 transition-opacity"
                                style={{ left: `${(currentTime / duration) * 100}%` }}
                            />
                        </div>
                        
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-6">
                                <motion.button whileHover={{ scale: 1.1 }} onClick={togglePlay} className="text-white">
                                    {isPlaying ? <FiPause size={22} fill="currentColor" /> : <FiPlay size={22} fill="currentColor" />}
                                </motion.button>
                                <motion.button whileHover={{ scale: 1.1 }} onClick={toggleMute} className="text-white">
                                    {isMuted ? <FiVolumeX size={22} /> : <FiVolume2 size={22} />}
                                </motion.button>
                                <span className="text-sm text-rich-black-50 font-medium lining-nums">
                                    {formatTime(currentTime)} / {formatTime(duration)}
                                </span>
                            </div>
                            <div className="flex items-center gap-6 relative">
                                <motion.button 
                                    whileHover={{ scale: 1.1 }} 
                                    onClick={() => setIsSettingsOpen(!isSettingsOpen)}
                                    className={`transition-colors ${isSettingsOpen ? 'text-yellow-50' : 'text-white hover:text-yellow-50'}`}
                                >
                                    <FiSettings size={22} />
                                </motion.button>

                                <AnimatePresence>
                                    {isSettingsOpen && (
                                        <motion.div
                                            initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                            animate={{ opacity: 1, y: 0, scale: 1 }}
                                            exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                            className="absolute bottom-full right-0 mb-4 w-40 bg-rich-black-800 border border-rich-black-700 rounded-2xl overflow-hidden shadow-[0_10px_30px_rgba(0,0,0,0.5)] z-[70] backdrop-blur-xl"
                                        >
                                            <div className="p-3 border-b border-rich-black-700">
                                                <span className="text-[10px] font-bold text-rich-black-400 uppercase tracking-widest">Playback Speed</span>
                                            </div>
                                            <div className="p-1">
                                                {[0.5, 0.75, 1, 1.25, 1.5, 2].map((speed) => (
                                                    <button
                                                        key={speed}
                                                        onClick={() => setSpeed(speed)}
                                                        className={`w-full text-left px-4 py-2.5 text-xs font-semibold rounded-xl transition-all flex items-center justify-between group ${
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
                                    className="text-white hover:text-yellow-50 transition-colors"
                                >
                                    <FiMaximize size={22} />
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
                      className="bg-rich-black-800/50 backdrop-blur-md rounded-3xl border border-rich-black-700 p-8 shadow-[0_20px_60px_rgba(0,0,0,0.5)]"
                  >
                      <div className="flex items-center justify-between mb-6">
                          <h3 className="text-2xl font-bold text-yellow-50 flex items-center gap-3">
                              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                              </svg>
                              Quiz: {currentVideo?.topic}
                          </h3>
                          <button
                              onClick={closeQuiz}
                              className="p-2 hover:bg-rich-black-700 rounded-xl transition-colors text-rich-black-400 hover:text-white"
                          >
                              <FiX size={20} />
                          </button>
                      </div>

                      {quizError ? (
                          <div className="text-center py-12">
                              <div className="w-16 h-16 rounded-full bg-pink-500/20 flex items-center justify-center mx-auto mb-4">
                                  <svg className="w-8 h-8 text-pink-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                                  </svg>
                              </div>
                              <p className="text-rich-black-100 mb-2">Failed to generate quiz</p>
                              <p className="text-sm text-rich-black-400 mb-6">{quizError}</p>
                              <button
                                  onClick={() => { setQuizError(null); generateQuiz(); }}
                                  className="px-6 py-3 bg-yellow-50 text-rich-black-900 font-bold rounded-xl hover:scale-105 transition-transform"
                              >
                                  Try Again
                              </button>
                          </div>
                      ) : quizLoading ? (
                          <div className="flex flex-col items-center justify-center py-12 gap-4">
                              <div className="w-12 h-12 border-4 border-yellow-50 border-t-transparent rounded-full animate-spin"></div>
                              <p className="text-rich-black-200">Generating quiz based on the video...</p>
                          </div>
                      ) : quizQuestions.length > 0 ? (
                          <>
                              {!quizSubmitted ? (
                                  <div className="space-y-6">
                                      {quizQuestions.map((q, qIdx) => (
                                          <div key={qIdx} className="bg-rich-black-900/50 rounded-2xl p-6 border border-rich-black-700">
                                              <p className="text-white font-semibold mb-4">
                                                  {qIdx + 1}. {q.question}
                                              </p>
                                              <div className="space-y-3">
                                                  {q.options?.map((option, oIdx) => (
                                                      <button
                                                          key={oIdx}
                                                          onClick={() => handleQuizAnswer(qIdx, oIdx)}
                                                          className={`w-full text-left px-4 py-3 rounded-xl transition-all ${
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

                                      <div className="flex items-center justify-between pt-4">
                                          <p className="text-sm text-rich-black-400">
                                              {Object.keys(quizAnswers).length} of {quizQuestions.length} answered
                                          </p>
                                          <button
                                              onClick={handleQuizSubmit}
                                              disabled={Object.keys(quizAnswers).length < quizQuestions.length}
                                              className="px-6 py-3 bg-yellow-50 text-rich-black-900 font-bold rounded-xl hover:scale-105 transition-transform disabled:opacity-50 disabled:cursor-not-allowed"
                                          >
                                              Submit Quiz
                                          </button>
                                      </div>
                                  </div>
                              ) : (
                                  <div className="text-center py-8">
                                      <div className={`w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6 ${
                                          quizScore >= 80 ? 'bg-greenish-500/20 text-greenish-300' :
                                          quizScore >= 60 ? 'bg-yellow-50/20 text-yellow-50' :
                                          'bg-pink-500/20 text-pink-300'
                                      }`}>
                                          <span className="text-3xl font-bold">{quizScore}%</span>
                                      </div>
                                      <h4 className="text-xl font-bold text-white mb-2">
                                          {quizScore >= 80 ? 'Excellent!' : quizScore >= 60 ? 'Good Job!' : 'Keep Practicing!'}
                                      </h4>
                                      <p className="text-rich-black-300 mb-6">
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
                          <div className="text-center py-12">
                              <p className="text-rich-black-300">No questions generated. Please try again.</p>
                          </div>
                      )}
                  </motion.div>
              )}

             {/* Title and Status Area */}
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 h-fit">
                <div className="space-y-3 flex-1">
                    <h2 className="text-2xl md:text-3xl font-bold text-white tracking-tight">
                        {currentVideo?.topic || "Loading lesson..."}
                    </h2>
                    <div className="flex items-center gap-4 flex-wrap">
                        <span className="flex items-center gap-2 text-greenish-300 text-sm font-semibold bg-greenish-500/10 px-3 py-1 rounded-full border border-greenish-500/20">
                            <div className="w-1.5 h-1.5 rounded-full bg-greenish-300 animate-pulse" />
                            {course.title.split(":")[0]}
                        </span>
                    </div>
                </div>

                {completedVideos.includes(currentVideo?._id) ? (
                    <div className="flex items-center gap-3 bg-greenish-500 text-white px-8 py-4 rounded-2xl font-bold shadow-[0_10px_30px_rgba(5,167,123,0.3)] border border-greenish-300/30">
                        <FiCheckCircle size={22} />
                        <span>Completed</span>
                    </div>
                ) : (
                    <div className="flex items-center gap-3 bg-rich-black-800 text-rich-black-200 px-8 py-4 rounded-2xl font-bold border border-rich-black-700 opacity-60">
                        <div className="w-5 h-5 rounded-full border-2 border-rich-black-600" />
                        <span>In Progress</span>
                    </div>
                )}
            </div>

            <hr className="border-rich-black-800" />

            {/* Tabs and Bottom Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                <div className="lg:col-span-8 flex flex-col gap-8">
                    {/* Tab Navigation */}
                    <div className="flex items-center gap-10 border-b border-rich-black-800">
                        {['Discussion', 'Resources', 'Personal Notes', 'Quiz Results'].map((tab) => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={`pb-4 text-sm font-semibold transition-all relative ${
                                    activeTab === tab ? 'text-yellow-50' : 'text-rich-black-200 hover:text-white'
                                }`}
                            >
                                {tab === 'Discussion' && <span className="flex items-center gap-2"><FiMessageSquare /> Discussion</span>}
                                {tab === 'Resources' && <span className="flex items-center gap-2"><FiFileText /> Resources</span>}
                                {tab === 'Personal Notes' && <span className="flex items-center gap-2"><FiEdit /> Personal Notes</span>}
                                {tab === 'Quiz Results' && <span className="flex items-center gap-2"><FiCheckCircle /> Quiz Results</span>}
                                
                                {activeTab === tab && (
                                    <motion.div 
                                        layoutId="tab-underline"
                                        className="absolute bottom-0 left-0 right-0 h-0.5 bg-yellow-50 rounded-full"
                                    />
                                )}
                            </button>
                        ))}
                    </div>

                    {/* Tab Content */}
                    <div className="min-h-[300px] glass-morphism rounded-3xl p-8">
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={activeTab}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                transition={{ duration: 0.2 }}
                            >
                                {activeTab === 'Discussion' && (
                                    <div className="space-y-6">
                                        <div className="flex flex-col gap-4">
                                            <textarea 
                                                placeholder="Ask a technical question..."
                                                className="w-full bg-[#000B1C] border border-rich-black-700 rounded-2xl p-5 text-sm text-rich-black-50 focus:border-yellow-50 focus:ring-1 focus:ring-yellow-50 outline-none transition-all placeholder:text-rich-black-400"
                                                rows={4}
                                            />
                                            <button className="self-end px-8 py-3 bg-yellow-50 text-rich-black-900 font-bold rounded-xl hover:scale-105 transition-transform">
                                                Post Question
                                            </button>
                                        </div>
                                    </div>
                                )}
                                {activeTab === 'Resources' && (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="flex items-center justify-between p-4 bg-[#000B1C] border border-rich-black-700 rounded-2xl group hover:border-yellow-50 transition-colors">
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 bg-red-500/10 text-red-500 rounded-lg flex items-center justify-center">
                                                    <FiFileText size={20} />
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="text-sm font-medium">Lesson_Slides.pdf</span>
                                                    <span className="text-[10px] text-rich-black-400">12.4 MB</span>
                                                </div>
                                            </div>
                                            <FiDownload className="text-rich-black-300 group-hover:text-yellow-50 cursor-pointer" />
                                        </div>
                                    </div>
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
                                    <div className="space-y-6">
                                        {/* Score Summary */}
                                        <div className="bg-rich-black-800/50 rounded-2xl p-6 border border-rich-black-700">
                                            <div className="flex items-center justify-between mb-4">
                                                <h4 className="text-xl font-bold text-white">Quiz Results</h4>
                                                <span className={`px-4 py-1.5 rounded-full text-sm font-bold ${
                                                    quizScore >= 80 ? 'bg-greenish-500/20 text-greenish-300' :
                                                    quizScore >= 60 ? 'bg-yellow-50/20 text-yellow-50' :
                                                    'bg-pink-500/20 text-pink-300'
                                                }`}>
                                                    {quizScore}%
                                                </span>
                                            </div>
                                            <p className="text-sm text-rich-black-300">
                                                You answered {quizResults.filter(r => r.isCorrect).length} out of {quizResults.length} questions correctly
                                            </p>
                                        </div>

                                        {/* Detailed Results */}
                                        <div className="space-y-4">
                                            {quizResults.map((result, idx) => (
                                                <div key={idx} className={`p-6 rounded-2xl border ${
                                                    result.isCorrect 
                                                        ? 'bg-greenish-500/5 border-greenish-500/20' 
                                                        : 'bg-pink-500/5 border-pink-500/20'
                                                }`}>
                                                    <div className="flex items-start gap-3 mb-4">
                                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                                                            result.isCorrect ? 'bg-greenish-500/20 text-greenish-300' : 'bg-pink-500/20 text-pink-300'
                                                        }`}>
                                                            {result.isCorrect ? <FiCheckCircle size={16} /> : <FiX size={16} />}
                                                        </div>
                                                        <div className="flex-1">
                                                            <p className="text-white font-semibold mb-3">
                                                                {idx + 1}. {result.question}
                                                            </p>

                                                            {/* Student's Answer */}
                                                            <div className="mb-3">
                                                                <p className="text-[10px] font-bold text-rich-black-400 uppercase tracking-widest mb-1.5">Your Answer</p>
                                                                <p className={`text-sm ${
                                                                    result.isCorrect ? 'text-greenish-300' : 'text-pink-300'
                                                                }`}>
                                                                    {result.studentAnswer !== null 
                                                                        ? `${String.fromCharCode(65 + result.studentAnswer)}. ${result.options[result.studentAnswer]}`
                                                                        : 'Not answered'
                                                                    }
                                                                </p>
                                                            </div>

                                                            {/* Correct Answer */}
                                                            <div className="mb-3">
                                                                <p className="text-[10px] font-bold text-rich-black-400 uppercase tracking-widest mb-1.5">Correct Answer</p>
                                                                <p className="text-sm text-greenish-300">
                                                                    {String.fromCharCode(65 + result.correctAnswer)}. {result.options[result.correctAnswer]}
                                                                </p>
                                                            </div>

                                                            {/* Result Status */}
                                                            <div className={`text-xs font-semibold ${
                                                                result.isCorrect ? 'text-greenish-400' : 'text-pink-400'
                                                            }`}>
                                                                {result.isCorrect ? '✓ Correct' : '✗ Incorrect'}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>

                                        {/* Action Buttons */}
                                        <div className="flex items-center gap-4 pt-4">
                                            <button
                                                onClick={() => {
                                                    setQuizSubmitted(false);
                                                    setQuizResults([]);
                                                    generateQuiz();
                                                }}
                                                className="px-6 py-3 bg-yellow-50 text-rich-black-900 font-bold rounded-xl hover:scale-105 transition-transform"
                                            >
                                                Retake Quiz
                                            </button>
                                            <button
                                                onClick={() => setActiveTab('Discussion')}
                                                className="px-6 py-3 bg-rich-black-800 text-rich-black-100 font-medium rounded-xl hover:bg-rich-black-700 transition-colors"
                                            >
                                                Back to Discussion
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </motion.div>
                        </AnimatePresence>
                    </div>
                </div>

                <div className="lg:col-span-4 flex flex-col gap-6">
                    <span className="text-xs font-bold text-rich-black-400 uppercase tracking-widest">Essential Tools</span>
                    <div className="flex flex-col gap-4">
                        <div className="flex items-center justify-between p-5 bg-rich-black-800/40 border border-rich-black-700 rounded-2xl group cursor-pointer hover:bg-rich-black-800 transition-all">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-greenish-500/10 text-greenish-300 rounded-xl flex items-center justify-center">
                                    <FiFileText size={24} />
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-sm font-semibold">Architecture_Spec.pdf</span>
                                    <span className="text-[10px] text-rich-black-400 uppercase tracking-tighter">Documentation</span>
                                </div>
                            </div>
                            <FiDownload className="text-rich-black-400 group-hover:text-yellow-50" />
                        </div>
                        <div className="flex items-center justify-between p-5 bg-rich-black-800/40 border border-rich-black-700 rounded-2xl group cursor-pointer hover:bg-rich-black-800 transition-all">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-blue-500/10 text-blue-400 rounded-xl flex items-center justify-center">
                                    <FiVideo size={24} />
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

      {/* Right Sidebar - Curriculum */}
      <motion.div 
        initial={false}
        animate={{ width: isSidebarCollapsed ? 0 : 400 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        className="bg-[#000814] sidebar-gradient border-l border-rich-black-800 flex flex-col h-screen sticky top-0 shadow-[-10px_0_30px_rgba(0,0,0,0.5)] overflow-hidden relative group/sidebar"
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

      {/* AI Study Assistant — Floating */}
      {currentVideo && (
        <AiSidebar
          courseId={courseId}
          currentVideo={currentVideo}
          token={token}
        />
      )}

    </div>
  );
};

export default ViewCourse;
