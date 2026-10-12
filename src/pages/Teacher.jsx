import React, { useState, useEffect } from 'react';
import { UserPlus, Users, CheckCircle2, XCircle, Edit3, Power, X, Briefcase, Phone, Mail, Calendar, MapPin, PlusCircle, Link, Filter, BookOpen, Shield, Image } from 'lucide-react';
import { apiRequest } from '../api';

const Teacher = () => {
  // Active Tab: 'enrollment' or 'assignments'
  const [activeSubTab, setActiveSubTab] = useState('enrollment');
  const [message, setMessage] = useState({ type: '', text: '' });
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(false);
  const [viewLoading, setViewLoading] = useState(false);

  // ================= STATES FOR TEACHER ENROLLMENT =================
  const [teachers, setTeachers] = useState([]);
  const [formData, setFormData] = useState({
    name: '', gender: 'MALE', dateOfBirth: '', phone: '', email: '',
    aadhaarNumber: '', panNumber: '', qualification: '', designation: '',
    joiningDate: '', address: '', photoUrl: ''
  });
  const [selectedTeacher, setSelectedTeacher] = useState(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [updateData, setUpdateData] = useState({});

  // ================= STATES FOR TEACHER ASSIGNMENTS =================
  const [academicYears, setAcademicYears] = useState([]);
  const [activeTeachers, setActiveTeachers] = useState([]);
  const [allTeachersForFilter, setAllTeachersForFilter] = useState([]);
  const [activeClassroomSubjects, setActiveClassroomSubjects] = useState([]);

  // View Assignments States (Aligned with TeacherAssignmentResponse)
  const [viewAssignments, setViewAssignments] = useState([]);
  const [filterAcademicYearId, setFilterAcademicYearId] = useState('');
  const [filterTeacherId, setFilterTeacherId] = useState('');

  const [assignmentForm, setAssignmentForm] = useState({
    teacherId: '',
    academicYearId: '',
    classroomSubjectIds: []
  });

  // 🔄 Fetch Data based on Tab
  const fetchData = async () => {
    setFetchLoading(true);
    setMessage({ type: '', text: '' });
    try {
      if (activeSubTab === 'enrollment') {
        const data = await apiRequest('/teachers', 'GET');
        setTeachers(data || []);
        if (selectedTeacher) {
          const updated = data.find(t => t.id === selectedTeacher.id);
          if (updated) {
            setSelectedTeacher(updated);
            // যদি এডিট মোড চালু না থাকে, তবে আপডেট ডাটা সিঙ্ক করে নেওয়া ভালো
            if (!isUpdating) setUpdateData({ ...updated });
          }
        }
      } else if (activeSubTab === 'assignments') {
        const [yearsData, activeTchData, allTchData, activeClsSubData] = await Promise.all([
          apiRequest('/academic-years', 'GET'),
          apiRequest('/teachers/active', 'GET'),
          apiRequest('/teachers', 'GET'),
          apiRequest('/classroom-subjects/academic-year', 'GET')
        ]);

        setAcademicYears(yearsData || []);
        setActiveTeachers(activeTchData || []);
        setAllTeachersForFilter(allTchData || []);
        setActiveClassroomSubjects(activeClsSubData || []);
      }
    } catch (error) {
      console.error(error);
      setMessage({ type: 'error', text: 'Failed to load metadata from backend.' });
    } finally {
      setFetchLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [activeSubTab]);

  // 🔄 Triggered when filters change or assignment is updated
  const fetchFilteredAssignments = async () => {
    if (!filterTeacherId || !filterAcademicYearId) {
      setViewAssignments([]);
      return;
    }
    setViewLoading(true);
    try {
      const data = await apiRequest(`/teacher-assignments?filterTeacherId=${filterTeacherId}&academicYearId=${filterAcademicYearId}`, 'GET');
      setViewAssignments(data || []);
    } catch (error) {
      console.error(error);
      setViewAssignments([]);
    } finally {
      setViewLoading(false);
    }
  };

  useEffect(() => {
    fetchFilteredAssignments();
  }, [filterTeacherId, filterAcademicYearId]);

  // ================= HANDLERS FOR TEACHER =================
  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = { ...formData };
      if (!payload.email) payload.email = '';
      if (!payload.aadhaarNumber) payload.aadhaarNumber = '';
      if (!payload.panNumber) payload.panNumber = '';

      const data = await apiRequest('/teachers', 'POST', payload);
      setMessage({ type: 'success', text: `Teacher "${data.name}" enrolled successfully!` });
      setFormData({
        name: '', gender: 'MALE', dateOfBirth: '', phone: '', email: '',
        aadhaarNumber: '', panNumber: '', qualification: '', designation: '',
        joiningDate: '', address: '', photoUrl: ''
      });
      fetchData();
    } catch (error) {
      setMessage({ type: 'error', text: error.message });
    } finally {
      setLoading(false);
    }
  };

  // 🔄 **শিক্ষকের সমস্ত ফিল্ড আপডেট করার জন্য সাবমিট হ্যান্ডলার**
  const handleUpdateSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = { ...updateData };
      // ব্যাকএন্ড ভ্যালিডেশন প্যাটার্ন অনুযায়ী ফাঁকা ফিল্ড হ্যান্ডেল করা
      if (!payload.email) payload.email = '';
      if (!payload.aadhaarNumber) payload.aadhaarNumber = '';
      if (!payload.panNumber) payload.panNumber = '';
      if (!payload.dateOfBirth) payload.dateOfBirth = null;

      await apiRequest(`/teachers/${selectedTeacher.id}`, 'PUT', payload);
      setMessage({ type: 'success', text: 'Teacher profile updated successfully!' });
      setIsUpdating(false);
      fetchData();
    } catch (error) {
      setMessage({ type: 'error', text: error.message });
    } finally {
      setLoading(false);
    }
  };

  // 🔄 Status Toggle মেথড (Activate / Deactivate)
  const handleStatusToggle = async (action) => {
    setLoading(true);
    try {
      await apiRequest(`/teachers/${selectedTeacher.id}/${action}`, 'PUT');
      setMessage({ type: 'success', text: `Teacher profile ${action}d successfully!` });
      fetchData();
    } catch (error) {
      setMessage({ type: 'error', text: error.message });
    } finally {
      setLoading(false);
    }
  };

  // ================= HANDLERS FOR ASSIGNMENT =================
  const handleCheckboxChange = (id) => {
    setAssignmentForm((prev) => {
      const alreadySelected = prev.classroomSubjectIds.includes(id);
      if (alreadySelected) {
        return { ...prev, classroomSubjectIds: prev.classroomSubjectIds.filter(item => item !== id) };
      } else {
        return { ...prev, classroomSubjectIds: [...prev.classroomSubjectIds, id] };
      }
    });
  };

  const handleAssignmentSubmit = async (e) => {
    e.preventDefault();
    if (assignmentForm.classroomSubjectIds.length === 0) {
      setMessage({ type: 'error', text: 'Please select at least one classroom subject!' });
      return;
    }

    setLoading(true);
    try {
      const payload = {
        teacherId: Number(assignmentForm.teacherId),
        academicYearId: Number(assignmentForm.academicYearId),
        classroomSubjectIds: assignmentForm.classroomSubjectIds.map(Number)
      };

      await apiRequest('/teacher-assignments', 'POST', payload);
      setMessage({ type: 'success', text: 'Teacher assignments successfully saved!' });

      setFilterAcademicYearId(assignmentForm.academicYearId);
      setFilterTeacherId(assignmentForm.teacherId);

      if (String(filterTeacherId) === String(assignmentForm.teacherId) && String(filterAcademicYearId) === String(assignmentForm.academicYearId)) {
        fetchFilteredAssignments();
      }

      setAssignmentForm({ teacherId: '', academicYearId: '', classroomSubjectIds: [] });
      fetchData();
    } catch (error) {
      setMessage({ type: 'error', text: error.message || 'Assignment creation failed.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Sub Navigation Tabs */}
      <div className="flex justify-between items-center border-b border-slate-200 pb-2">
        <div className="flex space-x-2">
          <button
            onClick={() => { setActiveSubTab('enrollment'); setSelectedTeacher(null); }}
            className={`px-4 py-2 font-medium text-sm rounded-t-lg border-b-2 transition-all ${
              activeSubTab === 'enrollment' ? 'border-emerald-600 text-emerald-600 font-bold' : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Teacher Enrollment
          </button>
          <button
            onClick={() => { setActiveSubTab('assignments'); setSelectedTeacher(null); }}
            className={`px-4 py-2 font-medium text-sm rounded-t-lg border-b-2 transition-all ${
              activeSubTab === 'assignments' ? 'border-emerald-600 text-emerald-600 font-bold' : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Teacher Assignments
          </button>
        </div>
      </div>

      {/* Messages */}
      {message.text && (
        <div className={`p-4 rounded-lg text-sm font-medium border ${
          message.type === 'success' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-rose-50 text-rose-700 border-rose-200'
        }`}>
          {message.text}
        </div>
      )}

      {/* ================= TAB 1: TEACHER ENROLLMENT ================= */}
      {activeSubTab === 'enrollment' && (
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          {/* Form */}
          <div className="bg-white p-6 border border-slate-200 rounded-xl shadow-sm h-fit">
            <h3 className="text-md font-semibold text-slate-700 mb-4 flex items-center gap-2">
              <UserPlus size={16} /> Enroll Teacher
            </h3>
            <form onSubmit={handleCreateSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Full Name *</label>
                <input type="text" maxLength={100} required value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} placeholder="e.g., John Doe" className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-emerald-500" />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Gender *</label>
                  <select value={formData.gender} onChange={(e) => setFormData({...formData, gender: e.target.value})} className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-sm bg-white outline-none">
                    <option value="MALE">Male</option>
                    <option value="FEMALE">Female</option>
                    <option value="OTHER">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Date of Birth</label>
                  <input type="date" value={formData.dateOfBirth} onChange={(e) => setFormData({...formData, dateOfBirth: e.target.value})} className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-sm outline-none" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Phone *</label>
                  <input type="text" required pattern="^[6-9]\d{9}$" value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} placeholder="10 digits" className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-sm outline-none" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Email</label>
                  <input type="email" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} placeholder="email@school.com" className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-sm outline-none" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Qualification *</label>
                  <input type="text" required value={formData.qualification} onChange={(e) => setFormData({...formData, qualification: e.target.value})} placeholder="B.Ed, MCA" className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-sm outline-none" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Designation</label>
                  <input type="text" value={formData.designation} onChange={(e) => setFormData({...formData, designation: e.target.value})} placeholder="Senior Lecturer" className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-sm outline-none" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Joining Date *</label>
                <input type="date" required value={formData.joiningDate} onChange={(e) => setFormData({...formData, joiningDate: e.target.value})} className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-sm outline-none" />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Address</label>
                <textarea rows={2} value={formData.address} onChange={(e) => setFormData({...formData, address: e.target.value})} placeholder="Postal Address" className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-sm outline-none resize-none" />
              </div>

              <button type="submit" disabled={loading} className="w-full bg-slate-900 text-white font-medium py-2 rounded-lg text-sm hover:bg-slate-800">{loading ? 'Saving...' : 'Enroll Teacher'}</button>
            </form>
          </div>

          {/* Table */}
          <div className="xl:col-span-2 bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
            {fetchLoading ? <div className="p-8 text-center text-sm text-slate-400">Loading...</div> : (
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 text-slate-600 text-xs uppercase border-b border-slate-200">
                    <th className="py-3 px-4">Code / Username</th>
                    <th className="py-3 px-4">Name</th>
                    <th className="py-3 px-4">Designation</th>
                    <th className="py-3 px-4 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-sm">
                  {teachers.map(t => (
                    <tr key={t.id} onClick={() => { setSelectedTeacher(t); setUpdateData({...t}); setIsUpdating(false); }} className={`cursor-pointer hover:bg-slate-50/80 transition-all ${!t.active ? 'bg-slate-50/40 text-slate-400' : ''}`}>
                      <td className="py-3 px-4 font-mono text-xs">
                        <div className="font-bold text-slate-900">{t.teacherCode}</div>
                        <div className="text-slate-400">@{t.username}</div>
                      </td>
                      <td className="py-3 px-4 font-semibold text-slate-900">{t.name}</td>
                      <td className="py-3 px-4">{t.designation || <span className="text-slate-300 italic">Not set</span>}</td>
                      <td className="py-3 px-4 text-center">
                        {t.active ? <span className="bg-emerald-100 text-emerald-700 px-2.5 py-0.5 rounded-full text-xs font-medium">Active</span> : <span className="bg-rose-100 text-rose-700 px-2.5 py-0.5 rounded-full text-xs font-medium">Inactive</span>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}

      {/* ================= TAB 2: TEACHER ASSIGNMENTS ================= */}
      {activeSubTab === 'assignments' && (
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          {/* Left Column: Form */}
          <div className="bg-white p-6 border border-slate-200 rounded-xl shadow-sm h-fit xl:col-span-1">
            <h3 className="text-md font-semibold text-slate-700 mb-4 flex items-center gap-2">
              <PlusCircle size={16} className="text-emerald-600" /> Assign Class & Subjects
            </h3>
            <form onSubmit={handleAssignmentSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Academic Year *</label>
                <select required value={assignmentForm.academicYearId} onChange={(e) => setAssignmentForm({ ...assignmentForm, academicYearId: e.target.value })} className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white outline-none">
                  <option value="">Select Academic Year</option>
                  {academicYears.map(ay => <option key={ay.id} value={ay.id}>{ay.name} {ay.active ? '(Active)' : ''}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Select Active Teacher *</label>
                <select required value={assignmentForm.teacherId} onChange={(e) => setAssignmentForm({ ...assignmentForm, teacherId: e.target.value })} className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white outline-none">
                  <option value="">Select Teacher</option>
                  {activeTeachers.map(teacher => <option key={teacher.id} value={teacher.id}>{teacher.name} ({teacher.teacherCode})</option>)}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 uppercase mb-2">Classroom Subjects *</label>
                <div className="border border-slate-200 rounded-lg p-3 max-h-56 overflow-y-auto space-y-2.5">
                  {activeClassroomSubjects.length === 0 ? (
                    <p className="text-xs text-slate-400">No active classroom-subjects found.</p>
                  ) : (
                    activeClassroomSubjects.map(clsSub => (
                      <label key={clsSub.id} className="flex items-start gap-2 text-sm text-slate-700 cursor-pointer">
                        <input type="checkbox" checked={assignmentForm.classroomSubjectIds.includes(clsSub.id)} onChange={() => handleCheckboxChange(clsSub.id)} className="rounded text-emerald-600 h-4 w-4 mt-0.5 border-slate-300" />
                        <div className="leading-tight">
                          <span className="font-semibold text-slate-900">{clsSub.classroom}</span>
                          <span className="text-xs text-slate-500"> - {clsSub.subject}</span>
                          <p className="text-[10px] text-slate-400 font-mono">Year: {clsSub.academicYear}</p>
                        </div>
                      </label>
                    ))
                  )}
                </div>
              </div>

              <button type="submit" disabled={loading} className="w-full bg-slate-900 text-white font-medium py-2 rounded-lg text-sm hover:bg-slate-800 transition">{loading ? 'Assigning...' : 'Save Assignments'}</button>
            </form>
          </div>

          {/* Right Column: Viewer */}
          <div className="xl:col-span-2 space-y-4">
            <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-5 space-y-4">
              <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                <Filter size={18} className="text-slate-500" />
                <h3 className="font-bold text-slate-700 text-sm uppercase tracking-wider">View Assignments by Faculty</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Academic Year</label>
                  <select value={filterAcademicYearId} onChange={(e) => setFilterAcademicYearId(e.target.value)} className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-sm bg-white outline-none">
                    <option value="">Choose Year</option>
                    {academicYears.map(ay => <option key={ay.id} value={ay.id}>{ay.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Select Teacher (All Roster)</label>
                  <select value={filterTeacherId} onChange={(e) => setFilterTeacherId(e.target.value)} className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-sm bg-white outline-none font-medium">
                    <option value="">Choose Teacher</option>
                    {allTeachersForFilter.map(t => (
                      <option key={t.id} value={t.id} className={!t.active ? 'text-slate-400 bg-slate-50' : ''}>
                        {t.name} ({t.teacherCode}) — {t.active ? '● Active' : '○ Inactive'}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
              {viewLoading ? (
                <div className="p-8 text-center text-sm text-slate-400">Querying backend logs...</div>
              ) : (!filterTeacherId || !filterAcademicYearId) ? (
                <div className="p-10 text-center text-sm text-slate-400 flex flex-col items-center gap-2">
                  <Link size={24} className="text-slate-300" />
                  <span>Select both Academic Year and a Teacher above to view live assignments.</span>
                </div>
              ) : viewAssignments.length === 0 ? (
                <div className="p-10 text-center text-sm text-rose-500 font-medium">No classroom mappings assigned for this teacher.</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-50 text-slate-600 text-xs uppercase border-b border-slate-200">
                        <th className="py-3 px-4">Classroom Name / Sec</th>
                        <th className="py-3 px-4">Mapped Subject</th>
                        <th className="py-3 px-4 text-center">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-sm">
                      {viewAssignments.map(item => (
                        <tr key={item.id} className={`hover:bg-slate-50/80 ${!item.active ? 'text-slate-400 bg-slate-50/20' : ''}`}>
                          <td className="py-3 px-4 font-semibold text-slate-900">{item.className} <span className="text-xs text-slate-500 font-normal ml-2">(Section: {item.section})</span></td>
                          <td className="py-3 px-4 text-slate-700 font-semibold">{item.subjectName}</td>
                          <td className="py-3 px-4 text-center">
                            {item.active ? <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md">Live Assignment</span> : <span className="text-[10px] font-bold text-rose-700 bg-rose-50 border border-rose-200 px-2 py-0.5 rounded-md">Suspended</span>}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ================= DETAILS DRAWER FOR TEACHER ================= */}
      {selectedTeacher && activeSubTab === 'enrollment' && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex justify-end">
          <div className="w-full max-w-xl bg-white h-screen shadow-2xl p-6 flex flex-col justify-between overflow-y-auto transition-all">
            <div>
              <div className="flex justify-between items-center border-b border-slate-100 pb-4 mb-5">
                <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                  <Users size={18} className="text-emerald-600" /> Faculty Information Profile
                </h3>
                <button onClick={() => setSelectedTeacher(null)} className="p-1 hover:bg-slate-100 rounded-full text-slate-400">
                  <X size={20} />
                </button>
              </div>

              {!isUpdating ? (
                <div className="space-y-6 text-sm">
                  {/* Top Profile Card */}
                  <div className="flex items-center gap-4 bg-slate-50 p-4 rounded-xl border border-slate-100">
                    <div className="h-14 w-14 rounded-full bg-emerald-600 flex items-center justify-center font-bold text-white border border-emerald-700 text-lg uppercase shadow-sm">
                      {selectedTeacher.name.substring(0, 2)}
                    </div>
                    <div className="flex-1">
                      <div className="text-xs text-slate-400 font-mono">Code: {selectedTeacher.teacherCode} | @{selectedTeacher.username}</div>
                      <div className="text-lg font-bold text-slate-900">{selectedTeacher.name}</div>
                      <div className="text-xs text-slate-500 font-medium">{selectedTeacher.designation || 'Faculty Member'}</div>
                    </div>
                    <div>
                      {selectedTeacher.active ? (
                        <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider">Active</span>
                      ) : (
                        <span className="bg-rose-50 text-rose-700 border border-rose-200 px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider">Inactive</span>
                      )}
                    </div>
                  </div>

                  {/* 📂 FULL DETAILS FIELDS DISPLAY */}
                  <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-4 space-y-4">
                    <h4 className="font-bold text-slate-700 border-b pb-1.5 flex items-center gap-1.5 text-xs uppercase tracking-wider"><Briefcase size={14}/> Professional Details</h4>
                    <div className="grid grid-cols-2 gap-4 text-xs">
                      <div>
                        <span className="text-slate-400 block font-medium">Designation</span>
                        <span className="font-bold text-slate-800">{selectedTeacher.designation || 'N/A'}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block font-medium">Qualification</span>
                        <span className="font-bold text-slate-800">{selectedTeacher.qualification}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block font-medium">Joining Date</span>
                        <span className="font-bold text-slate-800 flex items-center gap-1"><Calendar size={12}/> {selectedTeacher.joiningDate || 'N/A'}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block font-medium">Gender</span>
                        <span className="font-bold text-slate-800 uppercase">{selectedTeacher.gender}</span>
                      </div>
                    </div>

                    <h4 className="font-bold text-slate-700 border-b pt-2 pb-1.5 flex items-center gap-1.5 text-xs uppercase tracking-wider"><Phone size={14}/> Communication Records</h4>
                    <div className="grid grid-cols-2 gap-4 text-xs">
                      <div>
                        <span className="text-slate-400 block font-medium">Phone Number</span>
                        <span className="font-bold text-slate-800 flex items-center gap-1"><Phone size={12}/> {selectedTeacher.phone}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block font-medium">Email Address</span>
                        <span className="font-bold text-slate-800 flex items-center gap-1 truncate"><Mail size={12}/> {selectedTeacher.email || 'N/A'}</span>
                      </div>
                      <div className="col-span-2">
                        <span className="text-slate-400 block font-medium">Residential Address</span>
                        <span className="font-medium text-slate-700 bg-slate-50 p-2 rounded border block mt-1"><MapPin size={12} className="inline mr-1 text-slate-400"/> {selectedTeacher.address || 'No permanent address recorded.'}</span>
                      </div>
                    </div>

                    <h4 className="font-bold text-slate-700 border-b pt-2 pb-1.5 flex items-center gap-1.5 text-xs uppercase tracking-wider"><Shield size={14}/> Personal Identifiers & Media</h4>
                    <div className="grid grid-cols-2 gap-4 text-xs">
                      <div>
                        <span className="text-slate-400 block font-medium">PAN Card Number</span>
                        <span className="font-mono font-bold text-slate-800 bg-slate-100 px-1.5 py-0.5 rounded">{selectedTeacher.panNumber || 'N/A'}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block font-medium">Aadhaar Reference</span>
                        <span className="font-mono font-bold text-slate-800 bg-slate-100 px-1.5 py-0.5 rounded">
                          {selectedTeacher.aadhaarNumber ? `xxxx-xxxx-${selectedTeacher.aadhaarNumber.slice(-4)}` : 'N/A'}
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-400 block font-medium">Date of Birth</span>
                        <span className="font-bold text-slate-800">{selectedTeacher.dateOfBirth || 'N/A'}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block font-medium">Photo URL</span>
                        <span className="font-bold text-slate-800 truncate block max-w-[180px]">{selectedTeacher.photoUrl || 'N/A'}</span>
                      </div>
                    </div>
                  </div>

                  {/* 🎛️ ACTIVATE / DEACTIVATE BUTTONS INTERFACE */}
                  <div className="border-t pt-4 space-y-2">
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Administrative Actions</span>
                    <div className="flex gap-2">
                      {selectedTeacher.active ? (
                        <button
                          type="button"
                          disabled={loading}
                          onClick={() => handleStatusToggle('deactivate')}
                          className="flex-1 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-bold py-2 rounded-lg text-xs flex items-center justify-center gap-1.5 transition-all"
                        >
                          <Power size={14} /> Deactivate Account
                        </button>
                      ) : (
                        <button
                          type="button"
                          disabled={loading}
                          onClick={() => handleStatusToggle('activate')}
                          className="flex-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 font-bold py-2 rounded-lg text-xs flex items-center justify-center gap-1.5 transition-all"
                        >
                          <CheckCircle2 size={14} /> Activate Account
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={() => setIsUpdating(true)}
                        className="px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-2 rounded-lg text-xs flex items-center gap-1 transition-all"
                      >
                        <Edit3 size={14} /> Edit Profile
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                /* 📝 FULL FIELD EDITING FEATURE FORM ALIGNED WITH UpdateTeacherRequest */
                <form onSubmit={handleUpdateSubmit} className="space-y-4 text-xs">
                  <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-3 max-h-[70vh] overflow-y-auto">

                    <div>
                      <label className="block font-semibold text-slate-600 uppercase mb-1">Full Name *</label>
                      <input type="text" maxLength={100} required value={updateData.name || ''} onChange={(e) => setUpdateData({...updateData, name: e.target.value})} className="w-full px-3 py-1.5 border border-slate-300 rounded-lg outline-none text-sm focus:ring-2 focus:ring-emerald-500" />
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block font-semibold text-slate-600 uppercase mb-1">Gender *</label>
                        <select value={updateData.gender || 'MALE'} onChange={(e) => setUpdateData({...updateData, gender: e.target.value})} className="w-full px-3 py-1.5 border border-slate-300 rounded-lg bg-white outline-none text-sm">
                          <option value="MALE">Male</option>
                          <option value="FEMALE">Female</option>
                          <option value="OTHER">Other</option>
                        </select>
                      </div>
                      <div>
                        <label className="block font-semibold text-slate-600 uppercase mb-1">Date of Birth</label>
                        <input type="date" value={updateData.dateOfBirth || ''} onChange={(e) => setUpdateData({...updateData, dateOfBirth: e.target.value})} className="w-full px-3 py-1.5 border border-slate-300 rounded-lg outline-none text-sm" />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block font-semibold text-slate-600 uppercase mb-1">Phone Number *</label>
                        <input type="text" required pattern="^[6-9]\d{9}$" value={updateData.phone || ''} onChange={(e) => setUpdateData({...updateData, phone: e.target.value})} className="w-full px-3 py-1.5 border border-slate-300 rounded-lg outline-none text-sm" />
                      </div>
                      <div>
                        <label className="block font-semibold text-slate-600 uppercase mb-1">Email Address</label>
                        <input type="email" value={updateData.email || ''} onChange={(e) => setUpdateData({...updateData, email: e.target.value})} className="w-full px-3 py-1.5 border border-slate-300 rounded-lg outline-none text-sm" />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block font-semibold text-slate-600 uppercase mb-1">Qualification *</label>
                        <input type="text" maxLength={100} required value={updateData.qualification || ''} onChange={(e) => setUpdateData({...updateData, qualification: e.target.value})} className="w-full px-3 py-1.5 border border-slate-300 rounded-lg outline-none text-sm" />
                      </div>
                      <div>
                        <label className="block font-semibold text-slate-600 uppercase mb-1">Designation</label>
                        <input type="text" maxLength={100} value={updateData.designation || ''} onChange={(e) => setUpdateData({...updateData, designation: e.target.value})} className="w-full px-3 py-1.5 border border-slate-300 rounded-lg outline-none text-sm" />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block font-semibold text-slate-600 uppercase mb-1">PAN Number</label>
                        <input type="text" pattern="^[A-Z]{5}[0-9]{4}[A-Z]$" placeholder="ABCDE1234F" value={updateData.panNumber || ''} onChange={(e) => setUpdateData({...updateData, panNumber: e.target.value.toUpperCase()})} className="w-full px-3 py-1.5 border border-slate-300 rounded-lg outline-none text-sm font-mono" />
                      </div>
                      <div>
                        <label className="block font-semibold text-slate-600 uppercase mb-1">Aadhaar Number</label>
                        <input type="text" pattern="^[0-9]{12}$" placeholder="12 digits ID" value={updateData.aadhaarNumber || ''} onChange={(e) => setUpdateData({...updateData, aadhaarNumber: e.target.value})} className="w-full px-3 py-1.5 border border-slate-300 rounded-lg outline-none text-sm font-mono" />
                      </div>
                    </div>

                    <div>
                      <label className="block font-semibold text-slate-600 uppercase mb-1">Joining Date *</label>
                      <input type="date" required value={updateData.joiningDate || ''} onChange={(e) => setUpdateData({...updateData, joiningDate: e.target.value})} className="w-full px-3 py-1.5 border border-slate-300 rounded-lg outline-none text-sm" />
                    </div>

                    <div>
                      <label className="block font-semibold text-slate-600 uppercase mb-1">Photo URL</label>
                      <input type="url" placeholder="https://domain.com/photo.jpg" value={updateData.photoUrl || ''} onChange={(e) => setUpdateData({...updateData, photoUrl: e.target.value})} className="w-full px-3 py-1.5 border border-slate-300 rounded-lg outline-none text-sm" />
                    </div>

                    <div>
                      <label className="block font-semibold text-slate-600 uppercase mb-1">Residential Address</label>
                      <textarea rows={2} value={updateData.address || ''} onChange={(e) => setUpdateData({...updateData, address: e.target.value})} className="w-full px-3 py-1.5 border border-slate-300 rounded-lg outline-none text-sm resize-none" />
                    </div>

                  </div>

                  <div className="flex gap-2 pt-2 text-sm">
                    <button type="button" onClick={() => setIsUpdating(false)} className="flex-1 bg-slate-100 py-2 rounded-lg font-medium transition-all">Cancel</button>
                    <button type="submit" disabled={loading} className="flex-1 bg-slate-900 hover:bg-slate-800 text-white py-2 rounded-lg font-medium transition-all">{loading ? 'Saving...' : 'Save Changes'}</button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Teacher;