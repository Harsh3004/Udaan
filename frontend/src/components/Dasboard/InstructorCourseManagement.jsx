import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { 
  FiArrowLeft, FiUsers, FiEdit, FiUpload, 
  FiFileText, FiVideo, FiStar, FiBookOpen, FiCheckCircle,
  FiDownload, FiTrash2, FiEye, FiMail, FiMessageSquare
} from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { endpoints } from '../../services/api';
import { request } from '../../services/operations/authApi';
import Resources from '../ViewCourse/Resources';
import { FaRupeeSign } from 'react-icons/fa';

const InstructorCourseManagement = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const { token } = useSelector((state) => state.auth);
  
  const [course, setCourse] = useState(null);
  const [enrolledStudents, setEnrolledStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadData, setUploadData] = useState({ title: '', description: '', file: null });
  const [uploading, setUploading] = useState(false);
  const fileInputRef = React.useRef(null);

  const fetchCourseDetails = async () => {
    setLoading(true);
    try {
      const res = await request(`${endpoints.GET_FULL_COURSE_DETAILS_API}/${courseId}`, 'GET', null, token);
      const data = await res.json();
      
      if (data.success) {
        setCourse(data.courseDetails);
        setEnrolledStudents(data.courseDetails.studentEnrolled || []);
      } else {
        toast.error('Failed to load course details');
      }
    } catch (error) {
      toast.error('Error fetching course details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (courseId && token) {
      fetchCourseDetails();
    }
  }, [courseId, token]);

  const totalRevenue = enrolledStudents.length * (course?.price || 0);
  const totalLectures = course?.section?.reduce((acc, sec) => acc + (sec.subsection?.length || 0), 0) || 0;

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', { 
      month: 'short', day: 'numeric', year: 'numeric' 
    });
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      setUploadData(prev => ({ ...prev, file, title: file.name.replace(/\.[^/.]+$/, '') }));
    }
  };

  const handleUpload = async () => {
    if (!uploadData.title.trim() || !uploadData.file) {
      toast.error('Title and file are required');
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('courseId', courseId);
      formData.append('title', uploadData.title.trim());
      formData.append('description', uploadData.description.trim());
      formData.append('file', uploadData.file);

      const res = await fetch(endpoints.RESOURCE_UPLOAD, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData
      });

      const data = await res.json();
      if (data.success) {
        toast.success('Resource uploaded successfully');
        setShowUploadModal(false);
        setUploadData({ title: '', description: '', file: null });
      } else {
        toast.error(data.message || 'Failed to upload');
      }
    } catch (error) {
      toast.error('Error uploading resource');
    } finally {
      setUploading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-rich-black-900 flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-yellow-50 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen bg-rich-black-900 flex items-center justify-center">
        <div className="text-center">
          <p className="text-rich-black-300 text-lg">Course not found</p>
          <button 
            onClick={() => navigate('/dashboard/my-courses')}
            className="mt-4 px-6 py-3 bg-yellow-50 text-rich-black-900 font-bold rounded-xl"
          >
            Back to My Courses
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-rich-black-900 text-white">
      {/* Header */}
      <div className="bg-rich-black-800 border-b border-rich-black-700">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center gap-4 mb-4">
            <button 
              onClick={() => navigate('/dashboard/my-courses')}
              className="p-2 hover:bg-rich-black-700 rounded-lg transition-colors"
            >
              <FiArrowLeft size={20} />
            </button>
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-rich-black-5">{course.title}</h1>
              <p className="text-sm text-rich-black-400">Course Management</p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate(`/dashboard/edit-course/${courseId}`)}
                className="flex items-center gap-2 px-5 py-2.5 bg-rich-black-700 text-rich-black-200 font-medium rounded-xl hover:bg-rich-black-600 transition-colors"
              >
                <FiEdit size={16} />
                Edit Course
              </button>
              <button
                onClick={() => setActiveTab('resources')}
                className="flex items-center gap-2 px-5 py-2.5 bg-yellow-50 text-rich-black-900 font-bold rounded-xl hover:scale-105 transition-transform"
              >
                <FiUpload size={16} />
                Upload Resources
              </button>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
            <div className="bg-rich-black-900/50 rounded-2xl p-4 border border-rich-black-700">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-500/20 text-blue-400 rounded-xl flex items-center justify-center">
                  <FiUsers size={20} />
                </div>
                <div>
                  <p className="text-xs text-rich-black-400 uppercase tracking-wider">Students</p>
                  <p className="text-xl font-bold text-white">{enrolledStudents.length}</p>
                </div>
              </div>
            </div>
            <div className="bg-rich-black-900/50 rounded-2xl p-4 border border-rich-black-700">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-500/20 text-green-400 rounded-xl flex items-center justify-center">
                  <FaRupeeSign size={20} />
                </div>
                <div>
                  <p className="text-xs text-rich-black-400 uppercase tracking-wider">Revenue</p>
                  <p className="text-xl font-bold text-white flex items-center">
                    {totalRevenue.toLocaleString()}
                  </p>
                </div>
              </div>
            </div>
            <div className="bg-rich-black-900/50 rounded-2xl p-4 border border-rich-black-700">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-purple-500/20 text-purple-400 rounded-xl flex items-center justify-center">
                  <FiVideo size={20} />
                </div>
                <div>
                  <p className="text-xs text-rich-black-400 uppercase tracking-wider">Lectures</p>
                  <p className="text-xl font-bold text-white">{totalLectures}</p>
                </div>
              </div>
            </div>
            <div className="bg-rich-black-900/50 rounded-2xl p-4 border border-rich-black-700">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                  course.status === 'Published' ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'
                }`}>
                  {course.status === 'Published' ? <FiCheckCircle size={20} /> : <FiBookOpen size={20} />}
                </div>
                <div>
                  <p className="text-xs text-rich-black-400 uppercase tracking-wider">Status</p>
                  <p className="text-xl font-bold text-white">{course.status}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex items-center gap-6 mt-6 border-b border-rich-black-700">
            {['overview', 'students', 'resources', 'discussions'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`pb-3 text-sm font-medium transition-all relative capitalize ${
                  activeTab === tab ? 'text-yellow-50' : 'text-rich-black-400 hover:text-white'
                }`}
              >
                {tab}
                {activeTab === tab && (
                  <motion.div
                    layoutId="manage-tab-underline"
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-yellow-50"
                  />
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <AnimatePresence mode="wait">
          {activeTab === 'overview' && (
            <motion.div
              key="overview"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-6"
            >
              {/* Course Info */}
              <div className="bg-rich-black-800 rounded-3xl p-8 border border-rich-black-700">
                <h3 className="text-xl font-bold mb-4">Course Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <img 
                      src={course.thumbnail?.url} 
                      alt={course.title}
                      className="w-full h-48 object-cover rounded-2xl"
                    />
                  </div>
                  <div className="space-y-4">
                    <div>
                      <p className="text-xs text-rich-black-400 uppercase tracking-wider mb-1">Description</p>
                      <p className="text-rich-black-200">{course.desc || 'No description'}</p>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-xs text-rich-black-400 uppercase tracking-wider mb-1">Price</p>
                        <p className="text-white font-semibold flex items-center">
                          <FaRupeeSign size={14} className="mr-0.5" />
                          {course.price?.toLocaleString()}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-rich-black-400 uppercase tracking-wider mb-1">Language</p>
                        <p className="text-white">{course.language || 'English'}</p>
                      </div>
                      <div>
                        <p className="text-xs text-rich-black-400 uppercase tracking-wider mb-1">Category</p>
                        <p className="text-white">{course.category?.name || 'N/A'}</p>
                      </div>
                      <div>
                        <p className="text-xs text-rich-black-400 uppercase tracking-wider mb-1">Created</p>
                        <p className="text-white">{formatDate(course.createdAt)}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {course.whatyouwilllearn?.length > 0 && (
                  <div className="mt-6">
                    <p className="text-xs text-rich-black-400 uppercase tracking-wider mb-3">What you'll learn</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {course.whatyouwilllearn.map((item, idx) => (
                        <div key={idx} className="flex items-start gap-2 text-sm text-rich-black-200">
                          <FiCheckCircle className="text-green-400 mt-0.5 flex-shrink-0" size={14} />
                          {item}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Course Content */}
              <div className="bg-rich-black-800 rounded-3xl p-8 border border-rich-black-700">
                <h3 className="text-xl font-bold mb-4">Course Content</h3>
                <p className="text-sm text-rich-black-400 mb-4">{course.section?.length || 0} sections • {totalLectures} lectures</p>
                <div className="space-y-3">
                  {course.section?.map((section, idx) => (
                    <div key={section._id} className="bg-rich-black-900/50 rounded-xl p-4 border border-rich-black-700">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <span className="text-xs font-bold text-rich-black-500 bg-rich-black-800 px-2 py-1 rounded">
                            Section {idx + 1}
                          </span>
                          <span className="font-medium text-white">{section.title}</span>
                        </div>
                        <span className="text-xs text-rich-black-400">
                          {section.subsection?.length || 0} lectures
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'students' && (
            <motion.div
              key="students"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              <div className="bg-rich-black-800 rounded-3xl p-8 border border-rich-black-700">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold">Enrolled Students ({enrolledStudents.length})</h3>
                  <div className="flex items-center gap-2 bg-green-500/20 text-green-400 px-4 py-2 rounded-xl">
                    <FaRupeeSign size={18} />
                    <span className="font-bold">Total Revenue: ₹{totalRevenue.toLocaleString()}</span>
                  </div>
                </div>

                {enrolledStudents.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-rich-black-700 flex items-center justify-center">
                      <FiUsers size={24} className="text-rich-black-500" />
                    </div>
                    <p className="text-rich-black-300">No students enrolled yet</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="text-left text-xs text-rich-black-400 uppercase tracking-wider border-b border-rich-black-700">
                          <th className="pb-3 font-medium">Student</th>
                          <th className="pb-3 font-medium">Email</th>
                          <th className="pb-3 font-medium">Enrolled Date</th>
                          <th className="pb-3 font-medium">Progress</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-rich-black-700">
                        {enrolledStudents.map((student) => (
                          <tr key={student._id} className="hover:bg-rich-black-700/50 transition-colors">
                            <td className="py-4">
                              <div className="flex items-center gap-3">
                                <img
                                  src={student.profileImage}
                                  alt={student.fName}
                                  onError={(e) => {
                                    e.target.src = `https://api.dicebear.com/7.x/initials/png?seed=${student.fName}&size=128`;
                                  }}
                                  className="w-10 h-10 rounded-full object-cover"
                                />
                                <div>
                                  <p className="font-medium text-white">{student.fName} {student.lName}</p>
                                  <p className="text-xs text-rich-black-400">{student.role || 'Student'}</p>
                                </div>
                              </div>
                            </td>
                            <td className="py-4 text-sm text-rich-black-200">{student.email}</td>
                            <td className="py-4 text-sm text-rich-black-400">{formatDate(student.createdAt || Date.now())}</td>
                            <td className="py-4">
                              <div className="flex items-center gap-2">
                                <div className="w-24 h-2 bg-rich-black-700 rounded-full overflow-hidden">
                                  <div 
                                    className="h-full bg-green-500 rounded-full"
                                    style={{ width: '0%' }}
                                  />
                                </div>
                                <span className="text-xs text-rich-black-400">0%</span>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {activeTab === 'resources' && (
            <motion.div
              key="resources"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              <Resources
                courseId={courseId}
                token={token}
                user={{ id: course.instructor?._id || course.instructor }}
                isInstructor={true}
              />
            </motion.div>
          )}

          {activeTab === 'discussions' && (
            <motion.div
              key="discussions"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              <div className="bg-rich-black-800 rounded-3xl p-8 border border-rich-black-700">
                <h3 className="text-xl font-bold mb-4">Course Discussions</h3>
                <p className="text-rich-black-400 text-sm mb-6">Monitor and moderate course discussions</p>
                {/* Discussion management can be added here */}
                <div className="text-center py-12">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-rich-black-700 flex items-center justify-center">
                    <FiMessageSquare size={24} className="text-rich-black-500" />
                  </div>
                  <p className="text-rich-black-300">Discussion management coming soon</p>
                  <button
                    onClick={() => navigate(`/view-course/${courseId}`)}
                    className="mt-4 px-6 py-3 bg-yellow-50 text-rich-black-900 font-bold rounded-xl"
                  >
                    View in Student Mode
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default InstructorCourseManagement;