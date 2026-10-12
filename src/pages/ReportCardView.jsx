import React, { useState, useEffect } from 'react';
import {
  FileText, Search, User, Filter, ChevronRight, AlertCircle, X, Layers
} from 'lucide-react';
import { apiRequest } from '../api';

const ReportCardView = ({ onSelectExamForReportCard }) => {
  // Dropdown Option States
  const [academicYears, setAcademicYears] = useState([]);
  const [classrooms, setClassrooms] = useState([]);

  // Search Filter States (Default null / '')
  const [selectedAcademicYear, setSelectedAcademicYear] = useState('');
  const [selectedClassroom, setSelectedClassroom] = useState('');
  const [selectedStatus, setSelectedStatus] = useState(''); // '' means null (Both)

  // Data & Loading States
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  // Selected Student Modal State
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [isExamModalOpen, setIsExamModalOpen] = useState(false);

  // 1. Initial Load for Academic Years & Classrooms
  useEffect(() => {
    const fetchMetadata = async () => {
      setFetchLoading(true);
      try {
        const [yearsData, classroomsData] = await Promise.all([
          apiRequest('/academic-years', 'GET'),
          apiRequest('/classrooms', 'GET')
        ]);

        setAcademicYears(yearsData || []);
        setClassrooms(classroomsData || []);
      } catch (error) {
        console.error(error);
        setMessage({ type: 'error', text: 'মেটাডাটা লোড করতে ব্যর্থ হয়েছে।' });
      } finally {
        setFetchLoading(false);
      }
    };

    fetchMetadata();
    // Initial search with default null filters
    handleSearchEnrollments(null, '', '', '');
  }, []);

  // 2. Search Student Enrollments (POST /student-enrollments/search)
  const handleSearchEnrollments = async (e, yearId = selectedAcademicYear, classId = selectedClassroom, status = selectedStatus) => {
    if (e) e.preventDefault();

    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      const payload = {
        academicYearId: yearId ? Number(yearId) : null,
        classroomId: classId ? Number(classId) : null,
        active: status === '' ? null : status === 'true'
      };

      const data = await apiRequest('/student-enrollments/search', 'POST', payload);
      setEnrollments(data || []);
    } catch (error) {
      console.error(error);
      setMessage({ type: 'error', text: error.message || 'শিক্ষার্থীর এনরোলমেন্ট ডাটা পেতে সমস্যা হয়েছে।' });
      setEnrollments([]);
    } finally {
      setLoading(false);
    }
  };

  // 3. Open Options Modal for Selected Student
  const handleSelectStudent = (student) => {
    setSelectedStudent(student);
    setIsExamModalOpen(true);
  };

  // 4. Handle Option Click to navigate to ReportCardDetails Page
  const handleProceedToReportCard = (reportType) => {
    if (onSelectExamForReportCard) {
      onSelectExamForReportCard({
        student: selectedStudent,
        reportType: reportType // 'FIRST_TERM', 'SECOND_TERM', or 'THIRD_TERM'
      });
    } else {
      alert(`Report Type: ${reportType} selected for Student: ${selectedStudent.studentName || selectedStudent.student?.name}`);
    }
    setIsExamModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Title Header */}
      <div className="flex justify-between items-center border-b border-slate-200 pb-3">
        <div>
          <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <FileText className="text-emerald-600" size={22} /> Report Card View & Generation
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Search student enrollments and select a term result option to view the report card.
          </p>
        </div>
      </div>

      {/* Message Alerts */}
      {message.text && (
        <div className={`p-4 rounded-lg text-sm font-medium border flex items-center justify-between ${
          message.type === 'success' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-rose-50 text-rose-700 border-rose-200'
        }`}>
          <div className="flex items-center gap-2">
            <AlertCircle size={16} />
            <span>{message.text}</span>
          </div>
          <button onClick={() => setMessage({ type: '', text: '' })}>
            <X size={16} />
          </button>
        </div>
      )}

      {/* Filter Box */}
      <div className="bg-white p-6 border border-slate-200 rounded-xl shadow-sm">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-600 mb-4 flex items-center gap-2">
          <Filter size={16} className="text-emerald-600" /> Filter Student Enrollments
        </h3>

        <form onSubmit={(e) => handleSearchEnrollments(e)} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
          {/* Academic Year Dropdown */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">
              Academic Year
            </label>
            <select
              value={selectedAcademicYear}
              onChange={(e) => setSelectedAcademicYear(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-emerald-500 outline-none"
            >
              <option value="">All Academic Years (Null)</option>
              {academicYears.map((ay) => (
                <option key={ay.id} value={ay.id}>
                  {ay.name} {ay.active ? '(Active)' : ''}
                </option>
              ))}
            </select>
          </div>

          {/* Classroom Dropdown */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">
              Classroom
            </label>
            <select
              value={selectedClassroom}
              onChange={(e) => setSelectedClassroom(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-emerald-500 outline-none"
            >
              <option value="">All Classrooms (Null)</option>
              {classrooms.map((cls) => (
                <option key={cls.id} value={cls.id}>
                  {cls.name} (Sec: {cls.section})
                </option>
              ))}
            </select>
          </div>

          {/* Active Status Dropdown */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">
              Status Filter
            </label>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-emerald-500 outline-none"
            >
              <option value="">Both Active & Inactive (Null)</option>
              <option value="true">Active Only</option>
              <option value="false">Inactive Only</option>
            </select>
          </div>

          {/* Search Button */}
          <button
            type="submit"
            disabled={loading || fetchLoading}
            className="bg-emerald-600 hover:bg-emerald-700 text-white font-medium py-2 px-4 rounded-lg text-sm transition flex items-center justify-center gap-2 h-fit"
          >
            <Search size={16} /> {loading ? 'Searching...' : 'Search Students'}
          </button>
        </form>
      </div>

      {/* Student Enrollment List Table */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-200 bg-slate-50 flex justify-between items-center">
          <h3 className="font-semibold text-slate-700 text-sm uppercase">Student Enrollments List</h3>
          <span className="text-xs bg-slate-200 text-slate-700 px-2.5 py-0.5 rounded-full font-bold">
            Total: {enrollments.length}
          </span>
        </div>

        {loading ? (
          <div className="p-8 text-center text-sm text-slate-400">Loading student enrollment data...</div>
        ) : enrollments.length === 0 ? (
          <div className="p-8 text-center text-sm text-slate-400">
            No student enrollments found matching the criteria.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-100 text-slate-600 text-xs uppercase border-b border-slate-200">
                  <th className="py-3 px-4">Roll / ID</th>
                  <th className="py-3 px-4">Student Name</th>
                  <th className="py-3 px-4">Academic Year</th>
                  <th className="py-3 px-4">Classroom</th>
                  <th className="py-3 px-4 text-center">Status</th>
                  <th className="py-3 px-4 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {enrollments.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3 px-4 font-mono font-semibold text-slate-800">
                      #{item.rollNo || item.id}
                    </td>
                    <td className="py-3 px-4 font-bold text-slate-900 flex items-center gap-2">
                      <User size={16} className="text-slate-400" />
                      {item.studentName || item.student?.name || 'N/A'}
                    </td>
                    <td className="py-3 px-4 text-slate-700">
                      {item.academicYearName || item.academicYear?.name || 'N/A'}
                    </td>
                    <td className="py-3 px-4 text-slate-700">
                      {item.classroomName || item.classroom?.name || 'N/A'}
                      {(item.section || item.classroom?.section) && ` (${item.section || item.classroom?.section})`}
                    </td>

                    {/* Status Tag */}
                    <td className="py-3 px-4 text-center">
                      {item.active ? (
                        <span className="inline-flex text-[11px] font-semibold text-emerald-700 bg-emerald-100 px-2.5 py-0.5 rounded-full">
                          Active
                        </span>
                      ) : (
                        <span className="inline-flex text-[11px] font-semibold text-rose-700 bg-rose-100 px-2.5 py-0.5 rounded-full">
                          Inactive
                        </span>
                      )}
                    </td>

                    {/* Action Button */}
                    <td className="py-3 px-4 text-center">
                      <button
                        onClick={() => handleSelectStudent(item)}
                        className="bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 font-medium px-3 py-1.5 rounded-lg text-xs transition inline-flex items-center gap-1"
                      >
                        Select Term Result <ChevronRight size={14} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* REPORT CARD TYPE SELECTION MODAL */}
      {isExamModalOpen && selectedStudent && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-md p-6 shadow-2xl space-y-5">

            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div>
                <h3 className="text-md font-bold text-slate-800 flex items-center gap-2">
                  <Layers className="text-emerald-600" size={20} /> Select Term Evaluation
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Student: <span className="font-semibold text-slate-800">{selectedStudent.studentName || selectedStudent.student?.name}</span> (Roll: #{selectedStudent.rollNo || selectedStudent.id})
                </p>
              </div>
              <button
                onClick={() => setIsExamModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100"
              >
                <X size={20} />
              </button>
            </div>

            {/* Content Body - 3 Term Options */}
            <div className="space-y-3 pt-2">
              {/* Option 1: First Term */}
              <button
                onClick={() => handleProceedToReportCard('FIRST_TERM')}
                className="w-full text-left p-4 rounded-xl border border-slate-200 bg-slate-50 hover:bg-emerald-50 hover:border-emerald-500 transition-all group flex items-center justify-between"
              >
                <div>
                  <h4 className="font-bold text-slate-800 text-sm group-hover:text-emerald-700">
                    Get First Term Result
                  </h4>
                  <p className="text-xs text-slate-500 mt-1">
                    First Evaluation / 1st Term Academic Performance Report
                  </p>
                </div>
                <ChevronRight size={18} className="text-slate-400 group-hover:text-emerald-600" />
              </button>

              {/* Option 2: Second Term */}
              <button
                onClick={() => handleProceedToReportCard('SECOND_TERM')}
                className="w-full text-left p-4 rounded-xl border border-slate-200 bg-slate-50 hover:bg-emerald-50 hover:border-emerald-500 transition-all group flex items-center justify-between"
              >
                <div>
                  <h4 className="font-bold text-slate-800 text-sm group-hover:text-emerald-700">
                    Get Second Term Result
                  </h4>
                  <p className="text-xs text-slate-500 mt-1">
                    Second Evaluation / 2nd Term Academic Performance Report
                  </p>
                </div>
                <ChevronRight size={18} className="text-slate-400 group-hover:text-emerald-600" />
              </button>

              {/* Option 3: Third Term */}
              <button
                onClick={() => handleProceedToReportCard('THIRD_TERM')}
                className="w-full text-left p-4 rounded-xl border border-slate-200 bg-slate-50 hover:bg-emerald-50 hover:border-emerald-500 transition-all group flex items-center justify-between"
              >
                <div>
                  <h4 className="font-bold text-slate-800 text-sm group-hover:text-emerald-700">
                    Get Third Term Result
                  </h4>
                  <p className="text-xs text-slate-500 mt-1">
                    Third Evaluation / Final Term Academic Performance Report
                  </p>
                </div>
                <ChevronRight size={18} className="text-slate-400 group-hover:text-emerald-600" />
              </button>
            </div>

            {/* Modal Footer */}
            <div className="pt-3 border-t border-slate-200 flex justify-end">
              <button
                type="button"
                onClick={() => setIsExamModalOpen(false)}
                className="px-4 py-2 rounded-lg text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 transition"
              >
                Cancel
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
};

export default ReportCardView;