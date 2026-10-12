import React, { useState, useEffect } from 'react';
import {
  Search, RefreshCw, ClipboardList, CheckCircle2, XCircle, Filter,
  MoreVertical, Eye, Edit2, Power, X, User, BookOpen, MapPin, Shield, Calendar, Phone, Mail, GraduationCap, Heart, Hash
} from 'lucide-react';
import { apiRequest } from '../api';

const StudentDirectory = () => {
  // Dropdown options lists
  const [academicYears, setAcademicYears] = useState([]);
  const [classrooms, setClassrooms] = useState([]);

  // States for Search Request
  const [searchRequest, setSearchRequest] = useState({
    academicYearId: '',
    classroomId: '',
    active: ''
  });

  // Table Data & Loading States
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [metaLoading, setMetaLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  // Action & Modal States
  const [activeMenuId, setActiveMenuId] = useState(null);
  const [isDetailDrawerOpen, setIsDetailDrawerOpen] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);

  // Combines responses for Detailed View
  const [selectedStudentDetail, setSelectedStudentDetail] = useState(null);
  const [selectedEnrollmentDetail, setSelectedEnrollmentDetail] = useState(null);

  // 🔄 1. Load Dropdown Metadata on Mount
  useEffect(() => {
    const loadMetadata = async () => {
      setMetaLoading(true);
      try {
        const [yearsData, classroomsData] = await Promise.all([
          apiRequest('/academic-years', 'GET'),
          apiRequest('/classrooms', 'GET')
        ]);
        setAcademicYears(yearsData || []);
        setClassrooms(classroomsData || []);
      } catch (error) {
        console.error("Error loading directory metadata:", error);
        setMessage({ type: 'error', text: 'Failed to load Academic Years or Classrooms.' });
      } finally {
        setMetaLoading(false);
      }
    };
    loadMetadata();
    fetchStudents({ academicYearId: null, classroomId: null, active: null });
  }, []);

  // Close menus when clicking outside
  useEffect(() => {
    const handleOutsideClick = () => setActiveMenuId(null);
    window.addEventListener('click', handleOutsideClick);
    return () => window.removeEventListener('click', handleOutsideClick);
  }, []);

  // 🔍 2. Core Search API Invoker
  const fetchStudents = async (payload) => {
    setLoading(true);
    setMessage({ type: '', text: '' });
    try {
      const responseData = await apiRequest('/student-enrollments/search', 'POST', payload);
      setStudents(responseData || []);
    } catch (error) {
      console.error("Error fetching student roster:", error);
      setMessage({ type: 'error', text: error.message || 'Failed to fetch student directory.' });
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    const payload = {
      academicYearId: searchRequest.academicYearId ? Number(searchRequest.academicYearId) : null,
      classroomId: searchRequest.classroomId ? Number(searchRequest.classroomId) : null,
      active: searchRequest.active === 'true' ? true : searchRequest.active === 'false' ? false : null
    };
    fetchStudents(payload);
  };

  const handleReset = () => {
    const freshState = { academicYearId: '', classroomId: '', active: '' };
    setSearchRequest(freshState);
    fetchStudents({ academicYearId: null, classroomId: null, active: null });
  };

  // 📂 3. Feature 1: View Full Student Details (Combination of 2 APIs)
  const handleViewDetails = async (enrollmentId, studentId, e) => {
    e.stopPropagation();
    setActiveMenuId(null);
    setIsDetailDrawerOpen(true);
    setDetailLoading(true);
    setSelectedStudentDetail(null);
    setSelectedEnrollmentDetail(null);

    try {
      // Parallel API calls to fetch complete records
      const [studentRes, enrollmentRes] = await Promise.all([
        apiRequest(`/students/${studentId}`, 'GET'),
        apiRequest(`/student-enrollments/${enrollmentId}`, 'GET')
      ]);

      setSelectedStudentDetail(studentRes);
      setSelectedEnrollmentDetail(enrollmentRes);
    } catch (error) {
      console.error("Error loading student profile details:", error);
      alert("Failed to fetch complete profile details. Please try again.");
      setIsDetailDrawerOpen(false);
    } finally {
      setDetailLoading(false);
    }
  };

  // 📝 Aadhaar Number Redaction masking helper
  const maskAadhaar = (aadhaar) => {
    if (!aadhaar) return 'Not Provided';
    const cleaned = aadhaar.replace(/\s+/g, '');
    if (cleaned.length !== 12) return 'Invalid Number';
    return `xxxx-xxxx-${cleaned.slice(-4)}`;
  };

  return (
    <div className="space-y-6 relative">
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <div className="flex items-center gap-2">
          <ClipboardList className="text-emerald-600" size={22} />
          <h2 className="text-xl font-bold text-slate-800">Student Directory & Roster</h2>
        </div>
      </div>

      {/* 🎛️ FILTER PANEL */}
      <form onSubmit={handleSearchSubmit} className="bg-slate-50 p-4 border border-slate-200 rounded-xl shadow-sm space-y-4">
        <div className="flex items-center gap-1.5 text-xs font-bold text-slate-500 uppercase tracking-wider">
          <Filter size={14} /> Criteria Filtering Options
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Academic Year</label>
            <select
              value={searchRequest.academicYearId}
              onChange={(e) => setSearchRequest(prev => ({ ...prev, academicYearId: e.target.value }))}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white outline-none focus:border-emerald-500"
            >
              <option value="">All Academic Years (Null)</option>
              {academicYears.map(ay => <option key={ay.id} value={ay.id}>{ay.name}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Classroom</label>
            <select
              value={searchRequest.classroomId}
              onChange={(e) => setSearchRequest(prev => ({ ...prev, classroomId: e.target.value }))}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white outline-none focus:border-emerald-500"
            >
              <option value="">All Classrooms (Null)</option>
              {classrooms.map(cls => <option key={cls.id} value={cls.id}>{cls.name} - Section {cls.section}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Status (Active Mode)</label>
            <select
              value={searchRequest.active}
              onChange={(e) => setSearchRequest(prev => ({ ...prev, active: e.target.value }))}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white outline-none focus:border-emerald-500"
            >
              <option value="">Active & Inactive (Null)</option>
              <option value="true">Active Only</option>
              <option value="false">Inactive Only</option>
            </select>
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-2 border-t border-slate-200/60">
          <button
            type="button" onClick={handleReset}
            className="px-4 py-1.5 border border-slate-300 rounded-lg text-sm font-medium text-slate-600 bg-white hover:bg-slate-50 transition"
          >
            Clear Filters
          </button>
          <button
            type="submit"
            className="px-5 py-1.5 bg-emerald-600 text-white text-sm font-semibold rounded-lg hover:bg-emerald-700 transition flex items-center gap-1.5 shadow-sm"
          >
            <Search size={14} /> Query Roster
          </button>
        </div>
      </form>

      {/* 📊 ROSTER LIST DATA TABLE */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-16 text-center text-slate-500 text-sm flex flex-col items-center justify-center space-y-2">
            <RefreshCw size={28} className="animate-spin text-emerald-600" />
            <span className="font-medium animate-pulse">Running advanced Criteria database search...</span>
          </div>
        ) : students.length === 0 ? (
          <div className="p-16 text-center text-slate-400 text-sm flex flex-col items-center justify-center space-y-1">
            <ClipboardList size={32} className="text-slate-300 mb-1" />
            <span className="font-semibold text-slate-600">No Student Records Loaded</span>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 text-slate-600 text-xs uppercase border-b border-slate-200 font-mono">
                  <th className="py-3 px-4 w-28">Code</th>
                  <th className="py-3 px-4">Student Name</th>
                  <th className="py-3 px-4">Admission No.</th> {/* 👈 Header updated here */}
                  <th className="py-3 px-4">Academic Session</th>
                  <th className="py-3 px-4">Class Allocation</th>
                  <th className="py-3 px-4 text-center w-24">Roll No.</th>
                  <th className="py-3 px-4 text-center w-28">Status</th>
                  <th className="py-3 px-4 text-center w-16">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {students.map((stu) => (
                  <tr key={stu.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-700">
                      <span className="bg-slate-100 px-1.5 py-0.5 rounded text-[11px]">{stu.studentCode}</span>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-900">{stu.studentName}</div>
                      <div className="text-[11px] text-slate-400">ID Ref: #{stu.studentId}</div>
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-slate-700">
                      {stu.admissionNumber || 'N/A'} {/* 👈 Displaying Admission Number */}
                    </td>
                    <td className="py-3.5 px-4 font-medium text-slate-600">{stu.academicYear}</td>
                    <td className="py-3.5 px-4">
                      <span className="font-semibold text-slate-800 bg-emerald-50 text-emerald-800 px-2 py-0.5 rounded-md text-xs border border-emerald-100">
                        {stu.className} ({stu.section})
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-center font-bold text-slate-700">#{stu.rollNumber}</td>
                    <td className="py-3.5 px-4 text-center">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold tracking-wide border uppercase ${
                        stu.active
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : 'bg-rose-50 text-rose-700 border-rose-200'
                      }`}>
                        {stu.active ? 'ACTIVE' : 'INACTIVE'}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-center relative">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveMenuId(activeMenuId === stu.id ? null : stu.id);
                        }}
                        className="p-1 hover:bg-slate-100 rounded-full text-slate-500 hover:text-slate-800 transition"
                      >
                        <MoreVertical size={16} />
                      </button>

                      {activeMenuId === stu.id && (
                        <div className="absolute right-4 mt-1 w-48 bg-white border border-slate-200 rounded-lg shadow-lg z-20 overflow-hidden text-left py-1">
                          <button
                            type="button"
                            onClick={(e) => handleViewDetails(stu.id, stu.studentId, e)}
                            className="w-full flex items-center gap-2 px-3 py-2 text-xs text-slate-700 hover:bg-slate-50 hover:text-emerald-600 transition"
                          >
                            <Eye size={14} /> View Details
                          </button>

                          <button
                            type="button"
                            onClick={(e) => { e.stopPropagation(); alert("Feature 2 (Update) is coming in the next step!"); }}
                            className="w-full flex items-center gap-2 px-3 py-2 text-xs text-slate-700 hover:bg-slate-50 hover:text-indigo-600 transition"
                          >
                            <Edit2 size={14} /> Update Enrollment
                          </button>

                          <button
                            type="button"
                            onClick={(e) => { e.stopPropagation(); alert("Feature 3 (Toggle Status) is coming in the next step!"); }}
                            className="w-full flex items-center gap-2 px-3 py-2 text-xs text-slate-700 hover:bg-slate-50 hover:text-rose-600 transition"
                          >
                            <Power size={14} /> {stu.active ? 'Deactivate' : 'Activate'}
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* =========================================================================
          🌟 SLIDE-OUT DETAIL DRAWER (MODERN DOUBLE-PANEL PROFILE VIEWER)
          ========================================================================= */}
      {isDetailDrawerOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex justify-end transition-opacity duration-300">
          <div className="w-full max-w-5xl bg-slate-50 h-screen shadow-2xl flex flex-col animate-slide-in relative overflow-hidden">

            {/* Header section */}
            <div className="bg-slate-900 text-white p-5 flex items-center justify-between border-b border-slate-800 shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-emerald-500 flex items-center justify-center font-bold text-xl shadow-md border-2 border-white/20">
                  {selectedStudentDetail ? selectedStudentDetail.name.charAt(0).toUpperCase() : '?'}
                </div>
                <div>
                  <h3 className="font-bold text-lg leading-tight">
                    {detailLoading ? 'Loading Profile...' : selectedStudentDetail?.name}
                  </h3>
                  <span className="text-xs text-emerald-400 font-mono tracking-wider block mt-0.5">
                    STUDENT CODE: {selectedStudentDetail?.studentCode || 'N/A'}
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsDetailDrawerOpen(false)}
                className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition"
              >
                <X size={22} />
              </button>
            </div>

            {/* Content Body */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {detailLoading ? (
                <div className="h-96 flex flex-col items-center justify-center space-y-3">
                  <RefreshCw size={36} className="animate-spin text-emerald-600" />
                  <p className="text-sm font-semibold text-slate-600">Retrieving secure educational records...</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                  {/* Left Column: Photo & Primary Indicators */}
                  <div className="lg:col-span-1 space-y-4">
                    <div className="bg-white p-5 border border-slate-200 rounded-xl shadow-sm text-center flex flex-col items-center">
                      <div className="w-28 h-28 rounded-full border-4 border-slate-100 bg-slate-50 flex items-center justify-center overflow-hidden mb-3 shadow-inner">
                        {selectedStudentDetail?.photoUrl ? (
                          <img src={selectedStudentDetail.photoUrl} alt="Student" className="w-full h-full object-cover" />
                        ) : (
                          <User size={60} className="text-slate-300" />
                        )}
                      </div>
                      <h4 className="font-bold text-slate-900 text-base">{selectedStudentDetail?.name}</h4>
                      <p className="text-xs text-slate-500 font-medium mb-4">System ID Reference #{selectedStudentDetail?.id}</p>

                      {/* Active Badges */}
                      <div className="flex items-center gap-2 mb-4">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold border uppercase ${
                          selectedStudentDetail?.active
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : 'bg-rose-50 text-rose-700 border-rose-200'
                        }`}>
                          Profile: {selectedStudentDetail?.active ? 'ACTIVE' : 'INACTIVE'}
                        </span>
                        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold border uppercase ${
                          selectedEnrollmentDetail?.active
                            ? 'bg-indigo-50 text-indigo-700 border-indigo-200'
                            : 'bg-amber-50 text-amber-700 border-amber-200'
                        }`}>
                          Enrollment: {selectedEnrollmentDetail?.active ? 'ACTIVE' : 'INACTIVE'}
                        </span>
                      </div>

                      {/* Primary Parameters */}
                      <div className="w-full space-y-2.5 border-t border-slate-100 pt-3 text-xs">
                        <div className="flex justify-between">
                          <span className="text-slate-400 font-medium">Gender</span>
                          <span className="font-bold text-slate-800 uppercase">{selectedStudentDetail?.gender}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400 font-medium">Blood Group</span>
                          <span className="font-bold text-slate-800">{selectedStudentDetail?.bloodGroup || 'Not Specified'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400 font-medium">Religion</span>
                          <span className="font-bold text-slate-800 uppercase">{selectedStudentDetail?.religion || 'N/A'}</span>
                        </div>
                      </div>
                    </div>

                    {/* Quick Contact Box */}
                    <div className="bg-white p-4 border border-slate-200 rounded-xl shadow-sm space-y-3">
                      <h5 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-100 pb-1.5">
                        <Phone size={12} className="text-slate-500" /> Primary Student Contact
                      </h5>
                      <div className="space-y-2 text-xs">
                        <div className="flex justify-between">
                          <span className="text-slate-500">Phone:</span>
                          <span className="font-bold text-slate-800">{selectedStudentDetail?.phone || 'N/A'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-500">Email:</span>
                          <span className="font-medium text-slate-800 truncate max-w-[140px]">{selectedStudentDetail?.email || 'N/A'}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Right Columns: Combined Academic & Personal Details */}
                  <div className="lg:col-span-2 space-y-6">

                    {/* SECTION 1: ACADEMIC DETAILS (StudentEnrollmentResponse) */}
                    <div className="bg-white p-5 border border-slate-200 rounded-xl shadow-sm space-y-3.5">
                      <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
                        <BookOpen size={18} className="text-emerald-600" />
                        <h4 className="font-bold text-slate-800 text-sm">Classroom Enrollment Details</h4>
                      </div>

                      <div className="grid grid-cols-2 gap-x-6 gap-y-4 text-xs">
                        <div>
                          <span className="text-slate-400 block font-medium">Session Year</span>
                          <span className="font-bold text-slate-800">{selectedEnrollmentDetail?.academicYear}</span>
                        </div>
                        <div>
                          <span className="text-slate-400 block font-medium">Class (Section)</span>
                          <span className="font-bold text-slate-800">{selectedEnrollmentDetail?.className} ({selectedEnrollmentDetail?.section})</span>
                        </div>
                        <div>
                          <span className="text-slate-400 block font-medium">Roll Number</span>
                          <span className="font-bold text-slate-800">#{selectedEnrollmentDetail?.rollNumber}</span>
                        </div>
                        <div>
                          <span className="text-slate-400 block font-medium">Admission Number</span>
                          <span className="font-bold text-slate-800">{selectedEnrollmentDetail?.admissionNumber}</span>
                        </div>
                        <div>
                          <span className="text-slate-400 block font-medium">Admission Date</span>
                          <span className="font-bold text-slate-800">{selectedEnrollmentDetail?.admissionDate}</span>
                        </div>
                        <div>
                          <span className="text-slate-400 block font-medium">Roster Status</span>
                          <span className="inline-flex px-1.5 py-0.5 font-bold uppercase tracking-wide bg-emerald-50 text-emerald-700 text-[10px] rounded border border-emerald-100">
                            {selectedEnrollmentDetail?.status || 'PROVISIONAL'}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* SECTION 2: PARENT & FAMILY DETAILS (StudentResponse - COMPLETE DETAIL) */}
                    <div className="bg-white p-5 border border-slate-200 rounded-xl shadow-sm space-y-3.5">
                      <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
                        <User size={18} className="text-indigo-600" />
                        <h4 className="font-bold text-slate-800 text-sm">Family & Parent Records</h4>
                      </div>

                      <div className="space-y-4 text-xs">
                        {/* Father Record */}
                        <div className="bg-slate-50/70 p-3.5 rounded-xl border border-slate-100 space-y-2">
                          <span className="text-[10px] font-bold text-indigo-700 uppercase tracking-wider block">Father's Information</span>
                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                            <div>
                              <span className="text-slate-400 block font-medium">Name</span>
                              <span className="font-bold text-slate-900">{selectedStudentDetail?.fatherName || 'N/A'}</span>
                            </div>
                            <div>
                              <span className="text-slate-400 block font-medium">Qualification</span>
                              <span className="font-semibold text-slate-800">{selectedStudentDetail?.fatherQualification || 'N/A'}</span>
                            </div>
                            <div>
                              <span className="text-slate-400 block font-medium">Occupation</span>
                              <span className="font-semibold text-slate-800">{selectedStudentDetail?.fatherOccupation || 'N/A'}</span>
                            </div>
                            <div>
                              <span className="text-slate-400 block font-medium">Phone Number</span>
                              <span className="font-bold text-slate-900">{selectedStudentDetail?.fatherPhone || 'N/A'}</span>
                            </div>
                          </div>
                        </div>

                        {/* Mother Record */}
                        <div className="bg-slate-50/70 p-3.5 rounded-xl border border-slate-100 space-y-2">
                          <span className="text-[10px] font-bold text-indigo-700 uppercase tracking-wider block">Mother's Information</span>
                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                            <div>
                              <span className="text-slate-400 block font-medium">Name</span>
                              <span className="font-bold text-slate-900">{selectedStudentDetail?.motherName || 'N/A'}</span>
                            </div>
                            <div>
                              <span className="text-slate-400 block font-medium">Qualification</span>
                              <span className="font-semibold text-slate-800">{selectedStudentDetail?.motherQualification || 'N/A'}</span>
                            </div>
                            <div>
                              <span className="text-slate-400 block font-medium">Occupation</span>
                              <span className="font-semibold text-slate-800">{selectedStudentDetail?.motherOccupation || 'N/A'}</span>
                            </div>
                            <div>
                              <span className="text-slate-400 block font-medium">Phone Number</span>
                              <span className="font-bold text-slate-900">{selectedStudentDetail?.motherPhone || 'N/A'}</span>
                            </div>
                          </div>
                        </div>

                        {/* Guardian Record */}
                        {selectedStudentDetail?.guardianName ? (
                          <div className="bg-slate-50/70 p-3.5 rounded-xl border border-slate-100 space-y-2">
                            <span className="text-[10px] font-bold text-amber-700 uppercase tracking-wider block">Guardian's Information (Emergency/Other)</span>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                              <div>
                                <span className="text-slate-400 block font-medium">Name</span>
                                <span className="font-bold text-slate-900">{selectedStudentDetail.guardianName}</span>
                              </div>
                              <div>
                                <span className="text-slate-400 block font-medium">Relation to Student</span>
                                <span className="font-semibold text-slate-800">{selectedStudentDetail.guardianRelation || 'N/A'}</span>
                              </div>
                              <div>
                                <span className="text-slate-400 block font-medium">Phone Number</span>
                                <span className="font-bold text-slate-900">{selectedStudentDetail.guardianPhone || 'N/A'}</span>
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div className="text-center text-[11px] text-slate-400 py-1 bg-slate-50 rounded">
                            No secondary guardian required (parents are primary guardians).
                          </div>
                        )}
                      </div>
                    </div>

                    {/* SECTION 3: PERSONAL IDENTIFIERS & ADDRESS (StudentResponse) */}
                    <div className="bg-white p-5 border border-slate-200 rounded-xl shadow-sm space-y-3.5">
                      <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
                        <Shield size={18} className="text-amber-600" />
                        <h4 className="font-bold text-slate-800 text-sm">Personal Identifiers & Address</h4>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                        <div>
                          <span className="text-slate-400 block font-medium">Date of Birth</span>
                          <span className="font-bold text-slate-800">{selectedStudentDetail?.dateOfBirth || 'Not Provided'}</span>
                        </div>
                        <div>
                          <span className="text-slate-400 block font-medium">Aadhaar Number</span>
                          <span className="font-mono font-bold text-slate-850 bg-slate-100 px-2 py-0.5 rounded tracking-wider">
                            {maskAadhaar(selectedStudentDetail?.aadhaarNumber)}
                          </span>
                        </div>
                        <div className="md:col-span-2">
                          <span className="text-slate-400 block font-medium">Communication Address</span>
                          <span className="font-semibold text-slate-700 block mt-1 leading-relaxed bg-slate-50 p-3 rounded-lg border border-slate-100">
                            {selectedStudentDetail?.address || 'No permanent address recorded in the database.'}
                          </span>
                        </div>
                      </div>
                    </div>

                  </div>
                </div>
              )}
            </div>

            {/* Footer buttons */}
            <div className="bg-white border-t border-slate-200 px-6 py-4 flex justify-end shrink-0 shadow-inner">
              <button
                type="button"
                onClick={() => setIsDetailDrawerOpen(false)}
                className="px-6 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-lg shadow transition"
              >
                Close Profile
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
};

export default StudentDirectory;