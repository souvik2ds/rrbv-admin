import React, { useState, useEffect } from 'react';
import {
  Search, RefreshCw, TrendingUp, CheckCircle2, AlertTriangle,
  Filter, UserCheck, ArrowRight, Layers, Calendar, CheckSquare, Square
} from 'lucide-react';
import { apiRequest } from '../api';

const StudentPromotion = () => {
  // Dropdown Metadata lists
  const [academicYears, setAcademicYears] = useState([]);
  const [classrooms, setClassrooms] = useState([]);

  // Source Filters States (For fetching current students)
  const [searchRequest, setSearchRequest] = useState({
    academicYearId: '',
    classroomId: '',
    active: 'true' // Promotion এর জন্য সাধারণত Active ছাত্ররাই ডিফল্ট থাকে
  });

  // Table Data & Loaders
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [metaLoading, setMetaLoading] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  // Promotion Handling States
  const [selectedStudents, setSelectedStudents] = useState({}); // { enrollmentId: true/false }
  const [promotionRows, setPromotionRows] = useState({}); // { enrollmentId: { rollNumber, admissionNumber, admissionDate } }

  // Target Modal States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [targetDetails, setTargetDetails] = useState({
    nextAcademicYearId: '',
    nextClassroomId: ''
  });

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
        console.error("Error loading promotion metadata:", error);
        setMessage({ type: 'error', text: 'Failed to load Academic Years or Classrooms.' });
      } finally {
        setMetaLoading(false);
      }
    };
    loadMetadata();
  }, []);

  // 🔍 2. Fetch Source Students for Promotion
  const handleSearchSubmit = async (e) => {
    e.preventDefault();
    if (!searchRequest.academicYearId || !searchRequest.classroomId) {
      setMessage({ type: 'error', text: 'Please select both Academic Year and Classroom to load students.' });
      return;
    }

    setLoading(true);
    setMessage({ type: '', text: '' });
    setSelectedStudents({});
    setPromotionRows({});

    try {
      const payload = {
        academicYearId: Number(searchRequest.academicYearId),
        classroomId: Number(searchRequest.classroomId),
        active: searchRequest.active === 'true' ? true : searchRequest.active === 'false' ? false : null
      };
      const responseData = await apiRequest('/student-enrollments/search', 'POST', payload);
      setStudents(responseData || []);

      // প্রোমোশন রো-এর জন্য ইনিশিয়াল ডেটা প্রিপেয়ার করা (Default Values)
      const initialRows = {};
      const todayStr = new Date().toISOString().split('T')[0];
      responseData.forEach(stu => {
        initialRows[stu.id] = {
          studentId: stu.studentId,
          currentEnrollmentId: stu.id,
          rollNumber: stu.rollNumber, // ডিফল্ট কারেন্ট রোল দেওয়া হলো, অ্যাডমিন চেঞ্জ করতে পারবেন
          admissionNumber: stu.admissionNumber || '',
          admissionDate: todayStr
        };
      });
      setPromotionRows(initialRows);
    } catch (error) {
      setMessage({ type: 'error', text: error.message || 'Failed to fetch student list.' });
    } finally {
      setLoading(false);
    }
  };

  // 🟩 Selection Handlers
  const handleSelectStudent = (enrollmentId) => {
    setSelectedStudents(prev => ({
      ...prev,
      [enrollmentId]: !prev[enrollmentId]
    }));
  };

  const handleSelectAll = () => {
    const allSelected = students.length > 0 && students.every(s => selectedStudents[s.id]);
    const updatedSelections = {};
    students.forEach(s => {
      updatedSelections[s.id] = !allSelected;
    });
    setSelectedStudents(updatedSelections);
  };

  // 📝 Edit Promotion Fields Inline Function
  const handleRowChange = (enrollmentId, field, value) => {
    setPromotionRows(prev => ({
      ...prev,
      [enrollmentId]: {
        ...prev[enrollmentId],
        [field]: field === 'rollNumber' ? (value ? Number(value) : '') : value
      }
    }));
  };

  // 🚀 3. Submit Payload to Backend Endpoint `/promotions`
  const handleFinalPromotionSubmit = async (e) => {
    e.preventDefault();
    if (!targetDetails.nextAcademicYearId || !targetDetails.nextClassroomId) {
      alert("Please select both target Academic Year and Classroom.");
      return;
    }

    // ফিল্টার করে নেওয়া কেবল মাত্র সিলেক্টেড স্টুডেন্টদের ডেটা
    const payloadStudents = Object.keys(selectedStudents)
      .filter(id => selectedStudents[id])
      .map(id => promotionRows[id]);

    if (payloadStudents.length === 0) {
      alert("No students selected for promotion.");
      return;
    }

    // রোল এবং অ্যাডমিশন নাম্বার ভ্যালিডেশন
    for (let row of payloadStudents) {
      if (!row.rollNumber || !row.admissionNumber || !row.admissionDate) {
        alert("Roll number, Admission number, and Admission date are required for all selected students.");
        return;
      }
    }

    setSubmitLoading(true);
    try {
      const finalPayload = {
        nextAcademicYearId: Number(targetDetails.nextAcademicYearId),
        nextClassroomId: Number(targetDetails.nextClassroomId),
        students: payloadStudents
      };

      const response = await apiRequest('/promotions', 'POST', finalPayload);

      if (response.success) {
        setMessage({ type: 'success', text: response.message || 'All selected students promoted successfully!' });
        setIsModalOpen(false);
        setStudents([]); // টেবিল ক্লিয়ার
        setSelectedStudents({});
      } else {
        setMessage({ type: 'error', text: response.message || 'Promotion failed.' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: error.message || 'An error occurred during promotion.' });
      setIsModalOpen(false);
    } finally {
      setSubmitLoading(false);
    }
  };

  const selectedCount = Object.values(selectedStudents).filter(Boolean).length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <div className="flex items-center gap-2">
          <TrendingUp className="text-emerald-600" size={22} />
          <h2 className="text-xl font-bold text-slate-800">Student Batch Promotion</h2>
        </div>
      </div>

      {/* Messages banner */}
      {message.text && (
        <div className={`p-4 rounded-lg text-sm font-medium border flex items-center gap-2 ${
          message.type === 'success' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-rose-50 text-rose-700 border-rose-200'
        }`}>
          {message.type === 'success' ? <CheckCircle2 size={16}/> : <AlertTriangle size={16}/>}
          <span>{message.text}</span>
        </div>
      )}

      {/* 🎛️ PANEL 1: SOURCE STUDENTS CRITERIA SEARCH */}
      <form onSubmit={handleSearchSubmit} className="bg-slate-50 p-4 border border-slate-200 rounded-xl shadow-sm space-y-4">
        <div className="flex items-center gap-1.5 text-xs font-bold text-slate-500 uppercase tracking-wider">
          <Filter size={14} /> Step 1: Filter Current Enrolled Roster
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Current Academic Year *</label>
            <select
              required value={searchRequest.academicYearId}
              onChange={(e) => setSearchRequest(prev => ({ ...prev, academicYearId: e.target.value }))}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white outline-none focus:border-emerald-500"
            >
              <option value="">Select Source Year</option>
              {academicYears.map(ay => <option key={ay.id} value={ay.id}>{ay.name} {ay.active ? '(Active)' : ''}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Current Classroom *</label>
            <select
              required value={searchRequest.classroomId}
              onChange={(e) => setSearchRequest(prev => ({ ...prev, classroomId: e.target.value }))}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white outline-none focus:border-emerald-500"
            >
              <option value="">Select Source Class</option>
              {classrooms.map(cls => <option key={cls.id} value={cls.id}>{cls.name} - Sec {cls.section}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Status Mode</label>
            <select
              value={searchRequest.active}
              onChange={(e) => setSearchRequest(prev => ({ ...prev, active: e.target.value }))}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white outline-none focus:border-emerald-500"
            >
              <option value="true">Active Members Only</option>
              <option value="false">Inactive Members Only</option>
            </select>
          </div>
        </div>

        <div className="flex justify-end pt-1">
          <button
            type="submit" disabled={loading}
            className="px-5 py-2 bg-slate-900 text-white text-sm font-semibold rounded-lg hover:bg-slate-800 transition flex items-center gap-1.5 shadow-sm"
          >
            {loading ? <RefreshCw size={14} className="animate-spin"/> : <Search size={14} />} Load Roster
          </button>
        </div>
      </form>

      {/* 📊 PANEL 2: ROSTER DATA ROW DISPLAY & IN-LINE INPUTS */}
      {students.length > 0 && (
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden space-y-4 p-1">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 text-slate-600 text-xs uppercase border-b border-slate-200 font-mono">
                  <th className="py-3 px-4 w-12 text-center">
                    <button type="button" onClick={handleSelectAll} className="p-1 hover:bg-slate-200 rounded text-slate-600 transition">
                      {students.every(s => selectedStudents[s.id]) ? <CheckSquare size={18} className="text-emerald-600"/> : <Square size={18}/>}
                    </button>
                  </th>
                  <th className="py-3 px-4">Student Name</th>
                  <th className="py-3 px-4 w-28 text-center">Current Roll</th>
                  <th className="py-3 px-4 w-36">Next New Roll *</th>
                  <th className="py-3 px-4 w-48">Next Admission No. *</th>
                  <th className="py-3 px-4 w-44">New Promotion Date *</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {students.map((stu) => {
                  const isChecked = !!selectedStudents[stu.id];
                  return (
                    <tr key={stu.id} className={`transition-colors ${isChecked ? 'bg-emerald-50/30' : 'hover:bg-slate-50/50'}`}>
                      <td className="py-3 px-4 text-center">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => handleSelectStudent(stu.id)}
                          className="w-4 h-4 rounded text-emerald-600 border-slate-300 focus:ring-emerald-500 cursor-pointer"
                        />
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-bold text-slate-900">{stu.studentName}</div>
                        <div className="text-[11px] text-slate-400 font-mono">{stu.studentCode} | Curr ID: #{stu.id}</div>
                      </td>
                      <td className="py-3 px-4 text-center font-bold text-slate-400">
                        #{stu.rollNumber}
                      </td>
                      {/* NEW ROLL NUMBER INPUT */}
                      <td className="py-2 px-4">
                        <input
                          type="number"
                          required={isChecked}
                          disabled={!isChecked}
                          value={promotionRows[stu.id]?.rollNumber || ''}
                          onChange={(e) => handleRowChange(stu.id, 'rollNumber', e.target.value)}
                          placeholder="New Roll"
                          className={`w-full px-2.5 py-1.5 border border-slate-300 rounded-md text-xs font-bold outline-none transition ${
                            isChecked ? 'bg-white focus:border-emerald-600' : 'bg-slate-100 text-slate-400'
                          }`}
                        />
                      </td>
                      {/* ADMISSION NUMBER INPUT */}
                      <td className="py-2 px-4">
                        <input
                          type="text"
                          required={isChecked}
                          disabled={!isChecked}
                          value={promotionRows[stu.id]?.admissionNumber || ''}
                          onChange={(e) => handleRowChange(stu.id, 'admissionNumber', e.target.value)}
                          placeholder="e.g., ADM-2026-01"
                          className={`w-full px-2.5 py-1.5 border border-slate-300 rounded-md text-xs font-mono outline-none transition ${
                            isChecked ? 'bg-white focus:border-emerald-600' : 'bg-slate-100 text-slate-400'
                          }`}
                        />
                      </td>
                      {/* DATE INPUT */}
                      <td className="py-2 px-4">
                        <input
                          type="date"
                          required={isChecked}
                          disabled={!isChecked}
                          value={promotionRows[stu.id]?.admissionDate || ''}
                          onChange={(e) => handleRowChange(stu.id, 'admissionDate', e.target.value)}
                          className={`w-full px-2 py-1.5 border border-slate-300 rounded-md text-xs outline-none transition ${
                            isChecked ? 'bg-white focus:border-emerald-600' : 'bg-slate-100 text-slate-400'
                          }`}
                        />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Action Trigger Footer Bar */}
          <div className="bg-slate-50 px-6 py-4 border-t border-slate-100 flex justify-between items-center">
            <span className="text-xs text-slate-500 font-semibold">
              Selected <span className="text-emerald-600 text-sm font-bold">{selectedCount}</span> out of {students.length} students.
            </span>
            <button
              type="button"
              disabled={selectedCount === 0}
              onClick={() => setIsModalOpen(true)}
              className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-200 disabled:text-slate-400 text-white text-xs font-bold rounded-lg shadow-sm transition flex items-center gap-1.5"
            >
              Proceed to Promote <ArrowRight size={14}/>
            </button>
          </div>
        </div>
      )}

      {/* =========================================================================
          🌟 TARGET ACADEMIC YEAR & CLASSROOM CONFIRMATION MODAL (STEP 3)
          ========================================================================= */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-xl shadow-2xl overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95 duration-200">

            {/* Modal Header */}
            <div className="bg-slate-900 text-white p-4 flex items-center gap-2 border-b border-slate-800">
              <UserCheck size={18} className="text-emerald-400"/>
              <h3 className="font-bold text-sm uppercase tracking-wider">Set Destination Criteria</h3>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleFinalPromotionSubmit} className="p-5 space-y-4 text-xs">
              <div className="bg-emerald-50/50 p-3 rounded-lg border border-emerald-100 mb-2">
                <p className="text-slate-700 font-semibold">
                  You are batch promoting <span className="text-emerald-700 font-bold text-sm">{selectedCount}</span> students. Please choose the upcoming class mapping.
                </p>
              </div>

              <div>
                <label className="block font-bold text-slate-600 uppercase mb-1 flex items-center gap-1"><Calendar size={12}/> Target Academic Year *</label>
                <select
                  required
                  value={targetDetails.nextAcademicYearId}
                  onChange={(e) => setTargetDetails(prev => ({ ...prev, nextAcademicYearId: e.target.value }))}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white outline-none focus:border-emerald-500"
                >
                  <option value="">Select Next Year</option>
                  {academicYears.map(ay => <option key={ay.id} value={ay.id}>{ay.name}</option>)}
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-600 uppercase mb-1 flex items-center gap-1"><Layers size={12}/> Target Classroom *</label>
                <select
                  required
                  value={targetDetails.nextClassroomId}
                  onChange={(e) => setTargetDetails(prev => ({ ...prev, nextClassroomId: e.target.value }))}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white outline-none focus:border-emerald-500"
                >
                  <option value="">Select Next Class</option>
                  {classrooms.map(cls => <option key={cls.id} value={cls.id}>{cls.name} — Section {cls.section}</option>)}
                </select>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-3 border-t border-slate-100 text-sm">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 bg-slate-100 hover:bg-slate-200 py-2 rounded-lg font-medium text-slate-600 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitLoading}
                  className="flex-1 bg-slate-900 hover:bg-slate-800 text-white py-2 rounded-lg font-bold shadow transition flex items-center justify-center gap-1.5"
                >
                  {submitLoading ? <RefreshCw size={14} className="animate-spin"/> : null}
                  {submitLoading ? 'Processing...' : 'Confirm & Bulk Promote'}
                </button>
              </div>
            </form>

          </div>
        </div>
      )}
    </div>
  );
};

export default StudentPromotion;