import React, { useState, useEffect } from 'react';
import { BookOpen, BookMarked, Layers, CheckCircle2, XCircle, Edit3, Power, X, PlusCircle, Search } from 'lucide-react';
import { apiRequest } from '../api';

const Classroom = () => {
  // Active Tab State: 'classrooms' or 'subjects' or 'mapping'
  const [activeSubTab, setActiveSubTab] = useState('classrooms');
  const [message, setMessage] = useState({ type: '', text: '' });
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(false);

  // ================= STATES FOR CLASSROOM =================
  const [classrooms, setClassrooms] = useState([]);
  const [classForm, setClassForm] = useState({ name: '', section: '' });
  const [selectedClass, setSelectedClass] = useState(null);
  const [classUpdateData, setClassUpdateData] = useState({ name: '', section: '' });

  // ================= STATES FOR SUBJECT =================
  const [subjects, setSubjects] = useState([]);
  const [subjectForm, setSubjectForm] = useState({ name: '' });
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [subjectUpdateData, setSubjectUpdateData] = useState({ name: '' });

  // ================= STATES FOR MAPPING =================
  const [mappings, setMappings] = useState([]); // ফিল্টার হওয়া ম্যাপিংয়ের তালিকা
  const [academicYears, setAcademicYears] = useState([]);
  const [activeSubjects, setActiveSubjects] = useState([]);
  const [activeClassrooms, setActiveClassrooms] = useState([]);

  // ম্যাপিং তৈরি করার স্টেট
  const [mappingForm, setMappingForm] = useState({
    academicYearId: '',
    classroomId: '',
    subjectIds: []
  });

  // সার্চ বা ভিউ করার জন্য স্টেট (যেহেতু GET /classroom-subjects প্যারামিটার চায়)
  const [filterCriteria, setFilterCriteria] = useState({
    academicYearId: '',
    classroomId: ''
  });

  // Common UI View/Update Switcher
  const [isUpdating, setIsUpdating] = useState(false);

  // 🔄 Fetch Data based on Active Tab
  const fetchData = async () => {
    setFetchLoading(true);
    setMessage({ type: '', text: '' });
    try {
      if (activeSubTab === 'classrooms') {
        const data = await apiRequest('/classrooms', 'GET');
        setClassrooms(data || []);
        if (selectedClass) {
          const updated = data.find(c => c.id === selectedClass.id);
          if (updated) setSelectedClass(updated);
        }
      } else if (activeSubTab === 'subjects') {
        const data = await apiRequest('/subjects', 'GET');
        setSubjects(data || []);
        if (selectedSubject) {
          const updated = data.find(s => s.id === selectedSubject.id);
          if (updated) setSelectedSubject(updated);
        }
      } else if (activeSubTab === 'mapping') {
        // ম্যাপিং এর প্রয়োজনীয় ড্রপডাউন ডেটা লোড করা
        const [acadYearsData, activeClsData, activeSubjsData] = await Promise.all([
          apiRequest('/academic-years', 'GET'),
          apiRequest('/classrooms/active', 'GET'), // 👈 আপনার নতুন এপিআই এন্ডপয়েন্ট
          apiRequest('/subjects/active', 'GET')     // 👈 একটিভ সাবজেক্ট এন্ডপয়েন্ট
        ]);

        setAcademicYears(acadYearsData || []);
        setActiveClassrooms(activeClsData || []);
        setActiveSubjects(activeSubjsData || []);
      }
    } catch (error) {
      console.error(error);
      setMessage({ type: 'error', text: 'Failed to load metadata. Please try again.' });
    } finally {
      setFetchLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [activeSubTab]);

  // 🔄 নির্দিষ্ট Academic Year এবং Classroom এর ম্যাপিং ডেটা খোঁজার ফাংশন
  const handleFetchMappings = async (e) => {
    if (e) e.preventDefault();
    if (!filterCriteria.academicYearId || !filterCriteria.classroomId) {
      setMessage({ type: 'error', text: 'Please select Academic Year and Classroom first.' });
      return;
    }

    setFetchLoading(true);
    setMessage({ type: '', text: '' });
    try {
      // GET /classroom-subjects?academicYearId=...&classroomId=...
      const data = await apiRequest(
        `/classroom-subjects?academicYearId=${filterCriteria.academicYearId}&classroomId=${filterCriteria.classroomId}`,
        'GET'
      );
      setMappings(data || []);
    } catch (error) {
      console.error(error);
      setMessage({ type: 'error', text: error.message || 'No mapping data found for this selection.' });
      setMappings([]);
    } finally {
      setFetchLoading(false);
    }
  };

  // ================= HANDLERS FOR CLASSROOM =================
  const handleClassCreate = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const data = await apiRequest('/classrooms', 'POST', classForm);
      setMessage({ type: 'success', text: `Classroom "${data.name}" created!` });
      setClassForm({ name: '', section: '' });
      fetchData();
    } catch (error) {
      setMessage({ type: 'error', text: error.message });
    } finally {
      setLoading(false);
    }
  };

  const handleClassUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await apiRequest(`/classrooms/${selectedClass.id}`, 'PUT', classUpdateData);
      setMessage({ type: 'success', text: 'Classroom updated successfully!' });
      setIsUpdating(false);
      fetchData();
    } catch (error) {
      setMessage({ type: 'error', text: error.message });
    } finally {
      setLoading(false);
    }
  };

  const handleClassStatus = async (action) => {
    setLoading(true);
    try {
      await apiRequest(`/classrooms/${selectedClass.id}/${action}`, 'PUT');
      setMessage({ type: 'success', text: `Classroom ${action}d!` });
      fetchData();
    } catch (error) {
      setMessage({ type: 'error', text: error.message });
    } finally {
      setLoading(false);
    }
  };

  // ================= HANDLERS FOR SUBJECT =================
  const handleSubjectCreate = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const data = await apiRequest('/subjects', 'POST', subjectForm);
      setMessage({ type: 'success', text: `Subject "${data.name}" created!` });
      setSubjectForm({ name: '' });
      fetchData();
    } catch (error) {
      setMessage({ type: 'error', text: error.message });
    } finally {
      setLoading(false);
    }
  };

  const handleSubjectUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await apiRequest(`/subjects/${selectedSubject.id}`, 'PUT', subjectUpdateData);
      setMessage({ type: 'success', text: 'Subject updated successfully!' });
      setIsUpdating(false);
      fetchData();
    } catch (error) {
      setMessage({ type: 'error', text: error.message });
    } finally {
      setLoading(false);
    }
  };

  const handleSubjectStatus = async (action) => {
    setLoading(true);
    try {
      await apiRequest(`/subjects/${selectedSubject.id}/${action}`, 'PUT');
      setMessage({ type: 'success', text: `Subject ${action}d!` });
      fetchData();
    } catch (error) {
      setMessage({ type: 'error', text: error.message });
    } finally {
      setLoading(false);
    }
  };

  // ================= HANDLERS FOR MAPPING =================
  const handleSubjectCheckboxChange = (subjectId) => {
    setMappingForm((prev) => {
      const alreadySelected = prev.subjectIds.includes(subjectId);
      if (alreadySelected) {
        return { ...prev, subjectIds: prev.subjectIds.filter(id => id !== subjectId) };
      } else {
        return { ...prev, subjectIds: [...prev.subjectIds, subjectId] };
      }
    });
  };

  const handleMappingSubmit = async (e) => {
    e.preventDefault();

    if (mappingForm.subjectIds.length === 0) {
      setMessage({ type: 'error', text: 'Please select at least one active subject!' });
      return;
    }

    setLoading(true);
    try {
      const payload = {
        academicYearId: Number(mappingForm.academicYearId),
        classroomId: Number(mappingForm.classroomId),
        subjectIds: mappingForm.subjectIds.map(Number)
      };

      await apiRequest('/classroom-subjects', 'POST', payload);
      setMessage({ type: 'success', text: 'Classroom to Subject Mapping successfully saved!' });

      // অটোমেটিক্যালি ফিল্টার স্টেট সেট করা যাতে নতুন সেভ করা ডাটা সাথে সাথে নিচে দেখায়
      setFilterCriteria({
        academicYearId: mappingForm.academicYearId,
        classroomId: mappingForm.classroomId
      });

      // রিসেট ও রিফ্রেশ
      setMappingForm({ academicYearId: '', classroomId: '', subjectIds: [] });

      // নতুন ম্যাপিংয়ের ডেটা রিফ্রেশ করা
      const data = await apiRequest(
        `/classroom-subjects?academicYearId=${payload.academicYearId}&classroomId=${payload.classroomId}`,
        'GET'
      );
      setMappings(data || []);
    } catch (error) {
      setMessage({ type: 'error', text: error.message || 'Mapping creation failed.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Upper Navigation Tabs */}
      <div className="flex justify-between items-center border-b border-slate-200 pb-2">
        <div className="flex space-x-2">
          <button
            onClick={() => { setActiveSubTab('classrooms'); setSelectedClass(null); setSelectedSubject(null); }}
            className={`px-4 py-2 font-medium text-sm rounded-t-lg border-b-2 transition-all ${
              activeSubTab === 'classrooms' ? 'border-emerald-600 text-emerald-600 font-bold' : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Classroom Management
          </button>
          <button
            onClick={() => { setActiveSubTab('subjects'); setSelectedClass(null); setSelectedSubject(null); }}
            className={`px-4 py-2 font-medium text-sm rounded-t-lg border-b-2 transition-all ${
              activeSubTab === 'subjects' ? 'border-emerald-600 text-emerald-600 font-bold' : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Subject Management
          </button>
          <button
            onClick={() => { setActiveSubTab('mapping'); setSelectedClass(null); setSelectedSubject(null); setMappings([]); }}
            className={`px-4 py-2 font-medium text-sm rounded-t-lg border-b-2 transition-all ${
              activeSubTab === 'mapping' ? 'border-emerald-600 text-emerald-600 font-bold' : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Class-Subject Mapping
          </button>
        </div>
      </div>

      {/* Message Alerts */}
      {message.text && (
        <div className={`p-4 rounded-lg text-sm font-medium border ${
          message.type === 'success' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-rose-50 text-rose-700 border-rose-200'
        }`}>
          {message.text}
        </div>
      )}

      {/* ================= TAB 1: CLASSROOMS ================= */}
      {activeSubTab === 'classrooms' && (
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          {/* Form */}
          <div className="bg-white p-6 border border-slate-200 rounded-xl shadow-sm h-fit">
            <h3 className="text-md font-semibold text-slate-700 mb-4 flex items-center gap-2"><BookOpen size={16} /> Add Classroom</h3>
            <form onSubmit={handleClassCreate} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Class Name *</label>
                <input type="text" maxLength={30} required value={classForm.name} onChange={(e) => setClassForm({...classForm, name: e.target.value})} placeholder="e.g., Class 10" className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 outline-none" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Section *</label>
                <input type="text" maxLength={5} required value={classForm.section} onChange={(e) => setClassForm({...classForm, section: e.target.value})} placeholder="e.g., A" className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 outline-none" />
              </div>
              <button type="submit" disabled={loading} className="w-full bg-slate-900 text-white font-medium py-2 rounded-lg text-sm hover:bg-slate-800">{loading ? 'Saving...' : 'Save Classroom'}</button>
            </form>
          </div>
          {/* Table */}
          <div className="xl:col-span-2 bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
            {fetchLoading ? <div className="p-8 text-center text-sm text-slate-400">Loading...</div> : (
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 text-slate-600 text-xs uppercase border-b border-slate-200"><th className="py-3 px-4">ID</th><th className="py-3 px-4">Class Name</th><th className="py-3 px-4">Section</th><th className="py-3 px-4 text-center">Status</th></tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-sm">
                  {classrooms.map(c => (
                    <tr key={c.id} onClick={() => { setSelectedClass(c); setClassUpdateData({name: c.name, section: c.section}); setIsUpdating(false); }} className={`cursor-pointer hover:bg-slate-50 ${!c.active ? 'text-slate-400' : ''}`}>
                      <td className="py-3 px-4 font-mono">#{c.id}</td><td className="py-3 px-4 font-semibold text-slate-900">{c.name}</td><td className="py-3 px-4"><span className="bg-slate-100 px-2 py-0.5 rounded text-xs">{c.section}</span></td>
                      <td className="py-3 px-4 text-center">{c.active ? <span className="bg-emerald-100 text-emerald-700 px-2 rounded-full text-xs">Active</span> : <span className="bg-rose-100 text-rose-700 px-2 rounded-full text-xs">Inactive</span>}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}

      {/* ================= TAB 2: SUBJECTS ================= */}
      {activeSubTab === 'subjects' && (
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          {/* Form */}
          <div className="bg-white p-6 border border-slate-200 rounded-xl shadow-sm h-fit">
            <h3 className="text-md font-semibold text-slate-700 mb-4 flex items-center gap-2"><BookMarked size={16} /> Add Subject</h3>
            <form onSubmit={handleSubjectCreate} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Subject Name *</label>
                <input type="text" maxLength={100} required value={subjectForm.name} onChange={(e) => setSubjectForm({name: e.target.value})} placeholder="e.g., Mathematics" className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 outline-none" />
              </div>
              <button type="submit" disabled={loading} className="w-full bg-slate-900 text-white font-medium py-2 rounded-lg text-sm hover:bg-slate-800">{loading ? 'Saving...' : 'Save Subject'}</button>
            </form>
          </div>
          {/* Table */}
          <div className="xl:col-span-2 bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
            {fetchLoading ? <div className="p-8 text-center text-sm text-slate-400">Loading...</div> : (
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 text-slate-600 text-xs uppercase border-b border-slate-200"><th className="py-3 px-4">ID</th><th className="py-3 px-4">Subject Name</th><th className="py-3 px-4 text-center">Status</th></tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-sm">
                  {subjects.map(s => (
                    <tr key={s.id} onClick={() => { setSelectedSubject(s); setSubjectUpdateData({name: s.name}); setIsUpdating(false); }} className={`cursor-pointer hover:bg-slate-50 ${!s.active ? 'text-slate-400' : ''}`}>
                      <td className="py-3 px-4 font-mono">#{s.id}</td><td className="py-3 px-4 font-semibold text-slate-900">{s.name}</td>
                      <td className="py-3 px-4 text-center">{s.active ? <span className="bg-emerald-100 text-emerald-700 px-2 rounded-full text-xs">Active</span> : <span className="bg-rose-100 text-rose-700 px-2 rounded-full text-xs">Inactive</span>}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}

      {/* ================= TAB 3: MAPPING ================= */}
      {activeSubTab === 'mapping' && (
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">

          {/* Mapping Add Form */}
          <div className="bg-white p-6 border border-slate-200 rounded-xl shadow-sm h-fit space-y-6">
            <div>
              <h3 className="text-md font-semibold text-slate-700 mb-4 flex items-center gap-2">
                <PlusCircle size={16} className="text-emerald-600" /> Map Subjects to Class
              </h3>
              <form onSubmit={handleMappingSubmit} className="space-y-4">

                {/* Academic Year Dropdown */}
                <div>
                  <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Academic Year *</label>
                  <select
                    required
                    value={mappingForm.academicYearId}
                    onChange={(e) => setMappingForm({ ...mappingForm, academicYearId: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-emerald-500 outline-none"
                  >
                    <option value="">Select Academic Year</option>
                    {academicYears.map(ay => (
                      <option key={ay.id} value={ay.id}>{ay.name} {ay.active ? '(Active)' : ''}</option>
                    ))}
                  </select>
                </div>

                {/* Classroom Dropdown */}
                <div>
                  <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Classroom *</label>
                  <select
                    required
                    value={mappingForm.classroomId}
                    onChange={(e) => setMappingForm({ ...mappingForm, classroomId: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-emerald-500 outline-none"
                  >
                    <option value="">Select Classroom</option>
                    {activeClassrooms.map(cls => (
                      <option key={cls.id} value={cls.id}>{cls.name} (Sec: {cls.section})</option>
                    ))}
                  </select>
                </div>

                {/* Active Subjects Checkbox List */}
                <div>
                  <label className="block text-xs font-semibold text-slate-600 uppercase mb-2">Select Active Subjects *</label>
                  <div className="border border-slate-200 rounded-lg p-3 max-h-48 overflow-y-auto space-y-2.5">
                    {activeSubjects.length === 0 ? (
                      <p className="text-xs text-slate-400">No active subjects available.</p>
                    ) : (
                      activeSubjects.map(sub => (
                        <label key={sub.id} className="flex items-center gap-2 text-sm text-slate-700 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={mappingForm.subjectIds.includes(sub.id)}
                            onChange={() => handleSubjectCheckboxChange(sub.id)}
                            className="rounded text-emerald-600 focus:ring-emerald-500 h-4 w-4 border-slate-300"
                          />
                          <span>{sub.name}</span>
                        </label>
                      ))
                    )}
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-slate-900 text-white font-medium py-2 rounded-lg text-sm hover:bg-slate-800 transition"
                >
                  {loading ? 'Mapping...' : 'Save Mapping'}
                </button>
              </form>
            </div>
          </div>

          {/* Mapping Finder & List Table */}
          <div className="xl:col-span-2 bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden flex flex-col">

            {/* 🔍 FILTER BOX: নির্দিষ্ট ক্লাসের সাবজেক্ট লোড করতে */}
            <div className="p-5 border-b border-slate-200 bg-slate-50 space-y-4">
              <h3 className="font-semibold text-slate-700">Filter & View Mappings</h3>

              <form onSubmit={handleFetchMappings} className="grid grid-cols-1 md:grid-cols-3 gap-3 items-end">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Academic Year</label>
                  <select
                    required
                    value={filterCriteria.academicYearId}
                    onChange={(e) => setFilterCriteria({ ...filterCriteria, academicYearId: e.target.value })}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-xs bg-white outline-none"
                  >
                    <option value="">Select Year</option>
                    {academicYears.map(ay => (
                      <option key={ay.id} value={ay.id}>{ay.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Classroom</label>
                  <select
                    required
                    value={filterCriteria.classroomId}
                    onChange={(e) => setFilterCriteria({ ...filterCriteria, classroomId: e.target.value })}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-xs bg-white outline-none"
                  >
                    <option value="">Select Classroom</option>
                    {activeClassrooms.map(cls => (
                      <option key={cls.id} value={cls.id}>{cls.name} (Sec: {cls.section})</option>
                    ))}
                  </select>
                </div>

                <button
                  type="submit"
                  disabled={fetchLoading}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-medium py-1.5 px-4 rounded-lg text-xs transition flex items-center justify-center gap-1.5 h-fit"
                >
                  <Search size={14} /> Search Subjects
                </button>
              </form>
            </div>

            {/* List Table container */}
            <div className="flex-1">
              {fetchLoading ? (
                <div className="p-8 text-center text-sm text-slate-400">Loading mapped subjects...</div>
              ) : mappings.length === 0 ? (
                <div className="p-8 text-center text-sm text-slate-400">
                  Select Academic Year & Classroom above and click "Search" to view active mappings.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-100 text-slate-600 text-xs uppercase border-b border-slate-200">
                        <th className="py-3 px-4">Academic Year</th>
                        <th className="py-3 px-4">Classroom</th>
                        <th className="py-3 px-4">Mapped Subject</th>
                        <th className="py-3 px-4 text-center">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-sm">
                      {mappings.map(mapItem => (
                        <tr key={mapItem.id} className="hover:bg-slate-50 transition-colors">
                          <td className="py-3 px-4 font-semibold text-slate-800">{mapItem.academicYear}</td>
                          <td className="py-3 px-4 text-slate-950 font-medium">{mapItem.classroom}</td>
                          <td className="py-3 px-4 text-slate-700 font-medium">{mapItem.subject}</td>
                          <td className="py-3 px-4 text-center">
                            {mapItem.active ? (
                              <span className="inline-flex text-[11px] font-semibold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">Active</span>
                            ) : (
                              <span className="inline-flex text-[11px] font-semibold text-rose-700 bg-rose-100 px-2 py-0.5 rounded-full">Inactive</span>
                            )}
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

      {/* ================= DETAILS DRAWER FOR CLASSROOM ================= */}
      {selectedClass && activeSubTab === 'classrooms' && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex justify-end">
          <div className="w-full max-w-md bg-white h-screen shadow-2xl p-6 flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-center border-b pb-4 mb-4">
                <h3 className="font-bold text-slate-800">Classroom Details</h3>
                <button onClick={() => setSelectedClass(null)}><X size={20} /></button>
              </div>
              {!isUpdating ? (
                <div className="bg-slate-50 p-4 rounded-xl space-y-2">
                  <div className="text-xs text-slate-400 font-mono">ID: #{selectedClass.id}</div>
                  <div className="text-lg font-bold text-slate-900">{selectedClass.name} (Section: {selectedClass.section})</div>
                  <div>{selectedClass.active ? <span className="text-emerald-600 text-xs font-bold">● Active</span> : <span className="text-rose-600 text-xs font-bold">● Inactive</span>}</div>
                </div>
              ) : (
                <form onSubmit={handleClassUpdate} className="space-y-3">
                  <input type="text" required value={classUpdateData.name} onChange={(e) => setClassUpdateData({...classUpdateData, name: e.target.value})} className="w-full px-3 py-2 border rounded-lg text-sm" />
                  <input type="text" required value={classUpdateData.section} onChange={(e) => setClassUpdateData({...classUpdateData, section: e.target.value})} className="w-full px-3 py-2 border rounded-lg text-sm" />
                  <div className="flex gap-2"><button type="button" onClick={() => setIsUpdating(false)} className="flex-1 bg-slate-100 py-1.5 rounded-lg text-sm">Cancel</button><button type="submit" className="flex-1 bg-emerald-600 text-white py-1.5 rounded-lg text-sm">Save</button></div>
                </form>
              )}
            </div>
            {!isUpdating && (
              <div className="space-y-2 border-t pt-4">
                <button onClick={() => handleClassStatus(selectedClass.active ? 'deactivate' : 'activate')} className={`w-full py-2 rounded-lg text-white text-sm flex justify-center gap-2 items-center ${selectedClass.active ? 'bg-rose-600' : 'bg-emerald-600'}`}><Power size={14}/> {selectedClass.active ? 'Deactivate' : 'Activate'}</button>
                <button onClick={() => setIsUpdating(true)} className="w-full bg-slate-900 text-white py-2 rounded-lg text-sm flex justify-center gap-2 items-center"><Edit3 size={14}/> Update Details</button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ================= DETAILS DRAWER FOR SUBJECT ================= */}
      {selectedSubject && activeSubTab === 'subjects' && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex justify-end">
          <div className="w-full max-w-md bg-white h-screen shadow-2xl p-6 flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-center border-b pb-4 mb-4">
                <h3 className="font-bold text-slate-800">Subject Details</h3>
                <button onClick={() => setSelectedSubject(null)}><X size={20} /></button>
              </div>
              {!isUpdating ? (
                <div className="bg-slate-50 p-4 rounded-xl space-y-2">
                  <div className="text-xs text-slate-400 font-mono">ID: #{selectedSubject.id}</div>
                  <div className="text-lg font-bold text-slate-900">{selectedSubject.name}</div>
                  <div>{selectedSubject.active ? <span className="text-emerald-600 text-xs font-bold">● Active</span> : <span className="text-rose-600 text-xs font-bold">● Inactive</span>}</div>
                </div>
              ) : (
                <form onSubmit={handleSubjectUpdate} className="space-y-3">
                  <input type="text" maxLength={100} required value={subjectUpdateData.name} onChange={(e) => setSubjectUpdateData({name: e.target.value})} className="w-full px-3 py-2 border rounded-lg text-sm" />
                  <div className="flex gap-2"><button type="button" onClick={() => setIsUpdating(false)} className="flex-1 bg-slate-100 py-1.5 rounded-lg text-sm">Cancel</button><button type="submit" className="flex-1 bg-emerald-600 text-white py-1.5 rounded-lg text-sm">Save</button></div>
                </form>
              )}
            </div>
            {!isUpdating && (
              <div className="space-y-2 border-t pt-4">
                <button onClick={() => handleSubjectStatus(selectedSubject.active ? 'deactivate' : 'activate')} className={`w-full py-2 rounded-lg text-white text-sm flex justify-center gap-2 items-center ${selectedSubject.active ? 'bg-rose-600' : 'bg-emerald-600'}`}><Power size={14}/> {selectedSubject.active ? 'Deactivate' : 'Activate'}</button>
                <button onClick={() => setIsUpdating(true)} className="w-full bg-slate-900 text-white py-2 rounded-lg text-sm flex justify-center gap-2 items-center"><Edit3 size={14}/> Update Details</button>
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
};

export default Classroom;