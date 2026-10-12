import React, { useState, useEffect } from 'react';
import {
  ArrowLeft, BookOpen, Plus, RefreshCw, AlertCircle,
  Calendar, Award, X, Check, Edit3, Trash2, FileText,
  Layers, CheckCircle2, Clock
} from 'lucide-react';

import { apiRequest } from '../api';

const ExamSubjects = ({ exam, onBack }) => {
  // Existing Exam Subjects State (Marks Based)
  const [examSubjects, setExamSubjects] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Selected Exam Subject for Actions (Row Selection - Marks)
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  // Active Classroom Subjects State (For Bulk Add)
  const [activeClassroomSubjects, setActiveClassroomSubjects] = useState([]);

  // Add Bulk Modal State (Marks)
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedSubjectIds, setSelectedSubjectIds] = useState([]);
  const [subjectConfigs, setSubjectConfigs] = useState({});
  const [submitLoading, setSubmitLoading] = useState(false);

  // Edit Single Subject Modal State (Marks)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editFormData, setEditFormData] = useState({
    examDate: '',
    writtenMaxMarks: '',
    vivaMaxMarks: '',
    practicalMaxMarks: '',
    passingMarks: ''
  });

  useEffect(() => {
    if (exam?.id) {
      fetchExamSubjects();
    }
  }, [exam]);

  // Fetch Existing Exam Subjects (Marks)
  const fetchExamSubjects = async () => {
    setLoading(true);
    setError('');

    try {
      const data = await apiRequest(
        `/exam-subjects?examId=${exam.id}`,
        'GET'
      );

      setExamSubjects(data);
      setSelectedSubject(null);
    } catch (err) {
      setError(err.message || 'Failed to fetch exam subjects.');
    } finally {
      setLoading(false);
    }
  };

  // Fetch Active Classroom Subjects
  const fetchActiveClassroomSubjects = async () => {
    if (!exam?.academicYearId || !exam?.classroomId) {
      console.error(
        'Missing required parameters: academicYearId or classroomId in exam object',
        exam
      );
      return;
    }

    try {
      const data = await apiRequest(
        `/classroom-subjects?academicYearId=${exam.academicYearId}&classroomId=${exam.classroomId}`,
        'GET'
      );

      setActiveClassroomSubjects(data);
    } catch (err) {
      console.error('Failed to fetch classroom subjects', err);
    }
  };

  // --- Helper to parse number or return null for backend DTO ---
  const parseNumOrNull = (val) => {
    if (val === '' || val === null || val === undefined) return null;
    const num = Number(val);
    return isNaN(num) ? null : num;
  };

  // --- Add Subjects Handlers (Marks) ---
  const handleOpenAddModal = () => {
    fetchActiveClassroomSubjects();
    setSelectedSubjectIds([]);
    setSubjectConfigs({});
    setIsAddModalOpen(true);
  };

  const handleToggleSubject = (subjectId) => {
    if (selectedSubjectIds.includes(subjectId)) {
      setSelectedSubjectIds(prev =>
        prev.filter(id => id !== subjectId)
      );

      setSubjectConfigs(prev => {
        const updated = { ...prev };
        delete updated[subjectId];
        return updated;
      });
    } else {
      setSelectedSubjectIds(prev => [...prev, subjectId]);

      setSubjectConfigs(prev => ({
        ...prev,
        [subjectId]: {
          classroomSubjectId: subjectId,
          examDate: '',
          writtenMaxMarks: '100',
          vivaMaxMarks: '',
          practicalMaxMarks: '',
          passingMarks: '33'
        }
      }));
    }
  };

  const handleConfigChange = (subjectId, field, value) => {
    setSubjectConfigs(prev => ({
      ...prev,
      [subjectId]: {
        ...prev[subjectId],
        [field]: value
      }
    }));
  };

  const handleAddSubjects = async (e) => {
    e.preventDefault();

    if (selectedSubjectIds.length === 0) {
      alert('Please select at least one subject.');
      return;
    }

    setSubmitLoading(true);

    const payload = {
      examId: exam.id,
      subjects: selectedSubjectIds.map(id => ({
        classroomSubjectId: Number(subjectConfigs[id].classroomSubjectId),
        examDate: subjectConfigs[id].examDate || null,
        writtenMaxMarks: parseNumOrNull(subjectConfigs[id].writtenMaxMarks),
        vivaMaxMarks: parseNumOrNull(subjectConfigs[id].vivaMaxMarks),
        practicalMaxMarks: parseNumOrNull(subjectConfigs[id].practicalMaxMarks),
        passingMarks: parseNumOrNull(subjectConfigs[id].passingMarks)
      }))
    };

    try {
      await apiRequest(
        '/exam-subjects',
        'POST',
        payload
      );

      setIsAddModalOpen(false);
      fetchExamSubjects();
    } catch (err) {
      alert(err.message || 'Failed to add subjects to exam.');
    } finally {
      setSubmitLoading(false);
    }
  };

  // --- Update Single Exam Subject Handler ---
  const handleOpenEditModal = () => {
    if (!selectedSubject) return;

    setEditFormData({
      examDate: selectedSubject.examDate || '',
      writtenMaxMarks: selectedSubject.writtenMaxMarks ?? '',
      vivaMaxMarks: selectedSubject.vivaMaxMarks ?? '',
      practicalMaxMarks: selectedSubject.practicalMaxMarks ?? '',
      passingMarks: selectedSubject.passingMarks ?? ''
    });

    setIsEditModalOpen(true);
  };

  const handleUpdateSubject = async (e) => {
    e.preventDefault();
    setActionLoading(true);

    const payload = {
      examId: exam.id,
      classroomSubjectId: selectedSubject.subjectId,
      examDate: editFormData.examDate || null,
      writtenMaxMarks: parseNumOrNull(editFormData.writtenMaxMarks),
      vivaMaxMarks: parseNumOrNull(editFormData.vivaMaxMarks),
      practicalMaxMarks: parseNumOrNull(editFormData.practicalMaxMarks),
      passingMarks: parseNumOrNull(editFormData.passingMarks)
    };

    try {
      await apiRequest(
        `/exam-subjects/${selectedSubject.id}`,
        'PUT',
        payload
      );

      setIsEditModalOpen(false);
      fetchExamSubjects();
    } catch (err) {
      alert(err.message || 'Failed to update subject configuration.');
    } finally {
      setActionLoading(false);
    }
  };

  // --- Remove Single Exam Subject Handler ---
  const handleRemoveSubject = async () => {
    if (!selectedSubject) return;

    if (
      !window.confirm(
        `Are you sure you want to remove "${selectedSubject.subjectName}" from this exam?`
      )
    ) {
      return;
    }

    setActionLoading(true);

    try {
      await apiRequest(
        `/exam-subjects/${selectedSubject.id}`,
        'DELETE'
      );

      setSelectedSubject(null);
      fetchExamSubjects();
    } catch (err) {
      alert(err.message || 'Error removing subject.');
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="space-y-6 pb-24">
      {/* 1. Header with Back Navigation */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-100 pb-5">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="p-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors"
            title="Back to Exam Schedule"
          >
            <ArrowLeft size={18} />
          </button>

          <div>
            <h1 className="text-2xl font-bold text-slate-800">
              Exam Subject Setup
            </h1>
            <p className="text-sm text-slate-500 font-medium mt-0.5">
              Manage subject schedules, written, viva, and practical mark allocations.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleOpenAddModal}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition-all shadow-md active:scale-95"
          >
            <Plus size={18} /> Add Marks Subjects
          </button>
        </div>
      </div>

      {/* 2. Top Banner: Selected Exam Overview */}
      <div className="bg-gradient-to-r from-slate-900 to-slate-800 text-white p-6 rounded-2xl shadow-lg border border-slate-700 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-700/60 pb-3">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-indigo-500/20 text-indigo-400 rounded-xl border border-indigo-500/30">
              <FileText size={22} />
            </div>

            <div>
              <span className="text-[11px] font-bold text-indigo-400 uppercase tracking-wider">
                Exam Overview
              </span>
              <h2 className="text-xl font-extrabold text-white">
                {exam.name}
              </h2>
            </div>
          </div>

          <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-slate-800 text-indigo-300 border border-indigo-500/30">
            {exam.examType || 'FORMATIVE'}
          </span>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
          <div className="bg-slate-800/60 p-3 rounded-xl border border-slate-700/50">
            <p className="text-slate-400 font-semibold mb-0.5">
              Classroom
            </p>
            <p className="font-bold text-slate-200 text-sm">
              {exam.classroomName || exam.classroom || 'N/A'}{' '}
              {exam.classroomSection
                ? `(${exam.classroomSection})`
                : ''}
            </p>
          </div>

          <div className="bg-slate-800/60 p-3 rounded-xl border border-slate-700/50">
            <p className="text-slate-400 font-semibold mb-0.5">
              Academic Year
            </p>
            <p className="font-bold text-slate-200 text-sm">
              {exam.academicYearName || exam.academicYear || 'N/A'}
            </p>
          </div>

          <div className="bg-slate-800/60 p-3 rounded-xl border border-slate-700/50">
            <p className="text-slate-400 font-semibold mb-0.5">
              Exam Duration
            </p>
            <p className="font-bold text-slate-200 text-sm">
              {exam.startDate
                ? `${exam.startDate} to ${exam.endDate}`
                : 'Dates not set'}
            </p>
          </div>

          <div className="bg-slate-800/60 p-3 rounded-xl border border-slate-700/50">
            <p className="text-slate-400 font-semibold mb-0.5">
              Result Status
            </p>

            <div className="mt-0.5">
              {exam.resultPublished ? (
                <span className="inline-flex items-center gap-1 text-emerald-400 font-bold">
                  <CheckCircle2 size={14} /> Published
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-amber-400 font-bold">
                  <Clock size={14} /> Pending
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 3. Main Exam Subjects Table (Marks Based) */}
      <div className="space-y-3">
        <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
          <Award size={20} className="text-indigo-600" /> Marks Based Subjects
        </h2>

        {loading ? (
          <div className="flex items-center justify-center p-12 text-slate-500 gap-2">
            <RefreshCw className="animate-spin" size={20} />
            <span className="text-sm font-medium">
              Fetching Exam Subjects...
            </span>
          </div>
        ) : error ? (
          <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl flex items-center gap-3 text-rose-700 text-sm">
            <AlertCircle size={20} />
            {error}
          </div>
        ) : examSubjects.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-8 text-center bg-white rounded-2xl border border-slate-200">
            <BookOpen size={40} className="text-slate-300 mb-2" />
            <h3 className="text-base font-semibold text-slate-700">
              No Marks Subjects Added
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Click on "Add Marks Subjects" above to assign marks based subjects.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 text-xs font-bold uppercase tracking-wider">
                  <th className="p-4">Subject Name</th>
                  <th className="p-4">Exam Date</th>
                  <th className="p-4">Written</th>
                  <th className="p-4">Viva</th>
                  <th className="p-4">Practical</th>
                  <th className="p-4">Total Max</th>
                  <th className="p-4">Passing</th>
                  <th className="p-4">Status</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {examSubjects.map((item) => {
                  const isSelected = selectedSubject?.id === item.id;

                  const calculatedTotal = item.maxMarks ?? (
                    (Number(item.writtenMaxMarks) || 0) +
                    (Number(item.vivaMaxMarks) || 0) +
                    (Number(item.practicalMaxMarks) || 0)
                  );

                  return (
                    <tr
                      key={item.id}
                      onClick={() => setSelectedSubject(item)}
                      className={`transition-colors cursor-pointer ${
                        isSelected
                          ? 'bg-indigo-50/80 border-l-4 border-l-indigo-600 font-medium'
                          : 'hover:bg-slate-50'
                      }`}
                    >
                      <td className="p-4 font-bold text-slate-800">
                        {item.subjectName}
                      </td>

                      <td className="p-4 text-slate-600">
                        {item.examDate ? (
                          <span className="inline-flex items-center gap-1.5">
                            <Calendar
                              size={14}
                              className="text-slate-400"
                            />
                            {item.examDate}
                          </span>
                        ) : (
                          <span className="text-slate-400 italic">
                            Not scheduled
                          </span>
                        )}
                      </td>

                      <td className="p-4 text-slate-700">
                        {item.writtenMaxMarks !== null && item.writtenMaxMarks !== undefined ? (
                          <span className="font-semibold">{item.writtenMaxMarks}</span>
                        ) : (
                          <span className="text-slate-300 font-mono">-</span>
                        )}
                      </td>

                      <td className="p-4 text-slate-700">
                        {item.vivaMaxMarks !== null && item.vivaMaxMarks !== undefined ? (
                          <span className="font-semibold">{item.vivaMaxMarks}</span>
                        ) : (
                          <span className="text-slate-300 font-mono">-</span>
                        )}
                      </td>

                      <td className="p-4 text-slate-700">
                        {item.practicalMaxMarks !== null && item.practicalMaxMarks !== undefined ? (
                          <span className="font-semibold">{item.practicalMaxMarks}</span>
                        ) : (
                          <span className="text-slate-300 font-mono">-</span>
                        )}
                      </td>

                      <td className="p-4 font-bold text-indigo-700">
                        <span className="inline-flex items-center gap-1">
                          <Award
                            size={14}
                            className="text-amber-500"
                          />
                          {calculatedTotal}
                        </span>
                      </td>

                      <td className="p-4 font-semibold text-slate-700">
                        {item.passingMarks ?? '-'}
                      </td>

                      <td className="p-4">
                        <span
                          className={`text-xs font-bold ${
                            item.active
                              ? 'text-emerald-600'
                              : 'text-rose-500'
                          }`}
                        >
                          {item.active ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* 4. Action Panel for Selected Subject (Marks) */}
      {selectedSubject && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[90%] max-w-4xl bg-slate-900 text-white p-4 rounded-2xl shadow-2xl border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 z-40 transition-all animate-in fade-in slide-in-from-bottom-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-indigo-500/20 text-indigo-400 rounded-xl border border-indigo-500/30">
              <Layers size={20} />
            </div>

            <div>
              <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">
                Selected Marks Subject
              </p>
              <h3 className="text-base font-bold text-white">
                {selectedSubject.subjectName}
              </h3>
            </div>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              onClick={handleOpenEditModal}
              disabled={actionLoading}
              className="flex-1 sm:flex-initial flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold px-4 py-2.5 rounded-xl transition-colors shadow-sm"
            >
              <Edit3 size={15} /> Edit Subject
            </button>

            <button
              onClick={handleRemoveSubject}
              disabled={actionLoading}
              className="flex-1 sm:flex-initial flex items-center justify-center gap-2 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 text-xs font-bold px-4 py-2.5 rounded-xl border border-rose-500/30 transition-colors"
            >
              <Trash2 size={15} /> Remove
            </button>

            <button
              onClick={() => setSelectedSubject(null)}
              className="p-2.5 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors"
            >
              <X size={18} />
            </button>
          </div>
        </div>
      )}

      {/* 5. Edit Subject Modal */}
      {isEditModalOpen && selectedSubject && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-100 overflow-hidden">
            <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <div>
                <h2 className="text-lg font-bold text-slate-800">
                  Update Exam Subject
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  {selectedSubject.subjectName}
                </p>
              </div>

              <button
                onClick={() => setIsEditModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 font-bold"
              >
                <X size={20} />
              </button>
            </div>

            <form
              onSubmit={handleUpdateSubject}
              className="p-6 space-y-4"
            >
              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase mb-1">
                  Exam Date
                </label>

                <input
                  type="date"
                  value={editFormData.examDate}
                  onChange={(e) =>
                    setEditFormData({
                      ...editFormData,
                      examDate: e.target.value
                    })
                  }
                  className="w-full border border-slate-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase mb-1">
                    Written
                  </label>
                  <input
                    type="number"
                    placeholder="N/A"
                    value={editFormData.writtenMaxMarks}
                    onChange={(e) =>
                      setEditFormData({
                        ...editFormData,
                        writtenMaxMarks: e.target.value
                      })
                    }
                    className="w-full border border-slate-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase mb-1">
                    Viva
                  </label>
                  <input
                    type="number"
                    placeholder="N/A"
                    value={editFormData.vivaMaxMarks}
                    onChange={(e) =>
                      setEditFormData({
                        ...editFormData,
                        vivaMaxMarks: e.target.value
                      })
                    }
                    className="w-full border border-slate-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase mb-1">
                    Practical
                  </label>
                  <input
                    type="number"
                    placeholder="N/A"
                    value={editFormData.practicalMaxMarks}
                    onChange={(e) =>
                      setEditFormData({
                        ...editFormData,
                        practicalMaxMarks: e.target.value
                      })
                    }
                    className="w-full border border-slate-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase mb-1">
                  Passing Marks
                </label>

                <input
                  type="number"
                  value={editFormData.passingMarks}
                  onChange={(e) =>
                    setEditFormData({
                      ...editFormData,
                      passingMarks: e.target.value
                    })
                  }
                  className="w-full border border-slate-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-4 py-2 rounded-lg text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-4 py-2 rounded-lg text-xs font-bold bg-indigo-600 text-white hover:bg-indigo-700 transition-colors shadow-sm disabled:opacity-50"
                >
                  {actionLoading
                    ? 'Updating...'
                    : 'Update Subject'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 6. Bulk Add Subjects Modal (Marks) */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-3xl w-full shadow-2xl border border-slate-100 max-h-[90vh] flex flex-col overflow-hidden">
            <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <div>
                <h2 className="text-lg font-bold text-slate-800">
                  Add Marks Subjects to Exam
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Select subjects and set written, viva, and practical mark configurations.
                </p>
              </div>

              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 font-bold"
              >
                <X size={20} />
              </button>
            </div>

            <form
              onSubmit={handleAddSubjects}
              className="flex-1 overflow-y-auto p-6 space-y-6"
            >
              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase mb-2">
                  Select Classroom Subjects
                </label>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto p-2 border border-slate-200 rounded-xl bg-slate-50/50">
                  {activeClassroomSubjects.length === 0 ? (
                    <p className="text-xs text-slate-400 col-span-2 p-2">
                      No active classroom subjects found.
                    </p>
                  ) : (
                    activeClassroomSubjects.map((cs) => {
                      const isSelected =
                        selectedSubjectIds.includes(cs.id);

                      return (
                        <div
                          key={cs.id}
                          onClick={() =>
                            handleToggleSubject(cs.id)
                          }
                          className={`flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-all ${
                            isSelected
                              ? 'bg-indigo-50 border-indigo-300 text-indigo-900'
                              : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100'
                          }`}
                        >
                          <span className="text-xs font-semibold">
                            {cs.subject}
                          </span>

                          <div
                            className={`w-4 h-4 rounded border flex items-center justify-center ${
                              isSelected
                                ? 'bg-indigo-600 border-indigo-600 text-white'
                                : 'border-slate-300'
                            }`}
                          >
                            {isSelected && <Check size={12} />}
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

              {selectedSubjectIds.length > 0 && (
                <div className="space-y-4 border-t border-slate-100 pt-4">
                  <h3 className="text-xs font-bold text-slate-600 uppercase tracking-wider">
                    Configure Selected Subjects (
                    {selectedSubjectIds.length})
                  </h3>

                  {selectedSubjectIds.map((subId) => {
                    const subjectObj =
                      activeClassroomSubjects.find(
                        s => s.id === subId
                      );

                    const config =
                      subjectConfigs[subId] || {};

                    return (
                      <div
                        key={subId}
                        className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3"
                      >
                        <p className="text-sm font-bold text-slate-800">
                          {subjectObj?.subject}
                        </p>

                        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                          <div className="col-span-2 sm:col-span-1">
                            <label className="block text-xs font-semibold text-slate-500 mb-1">
                              Exam Date
                            </label>

                            <input
                              type="date"
                              value={config.examDate || ''}
                              onChange={(e) =>
                                handleConfigChange(
                                  subId,
                                  'examDate',
                                  e.target.value
                                )
                              }
                              className="w-full border border-slate-300 rounded-lg p-2 text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none bg-white"
                            />
                          </div>

                          <div>
                            <label className="block text-xs font-semibold text-slate-500 mb-1">
                              Written
                            </label>

                            <input
                              type="number"
                              placeholder="N/A"
                              value={config.writtenMaxMarks ?? ''}
                              onChange={(e) =>
                                handleConfigChange(
                                  subId,
                                  'writtenMaxMarks',
                                  e.target.value
                                )
                              }
                              className="w-full border border-slate-300 rounded-lg p-2 text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none bg-white"
                            />
                          </div>

                          <div>
                            <label className="block text-xs font-semibold text-slate-500 mb-1">
                              Viva
                            </label>

                            <input
                              type="number"
                              placeholder="N/A"
                              value={config.vivaMaxMarks ?? ''}
                              onChange={(e) =>
                                handleConfigChange(
                                  subId,
                                  'vivaMaxMarks',
                                  e.target.value
                                )
                              }
                              className="w-full border border-slate-300 rounded-lg p-2 text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none bg-white"
                            />
                          </div>

                          <div>
                            <label className="block text-xs font-semibold text-slate-500 mb-1">
                              Practical
                            </label>

                            <input
                              type="number"
                              placeholder="N/A"
                              value={config.practicalMaxMarks ?? ''}
                              onChange={(e) =>
                                handleConfigChange(
                                  subId,
                                  'practicalMaxMarks',
                                  e.target.value
                                )
                              }
                              className="w-full border border-slate-300 rounded-lg p-2 text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none bg-white"
                            />
                          </div>

                          <div>
                            <label className="block text-xs font-semibold text-slate-500 mb-1">
                              Passing
                            </label>

                            <input
                              type="number"
                              placeholder="N/A"
                              value={config.passingMarks ?? ''}
                              onChange={(e) =>
                                handleConfigChange(
                                  subId,
                                  'passingMarks',
                                  e.target.value
                                )
                              }
                              className="w-full border border-slate-300 rounded-lg p-2 text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none bg-white"
                            />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-lg text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={
                    submitLoading ||
                    selectedSubjectIds.length === 0
                  }
                  className="px-4 py-2 rounded-lg text-xs font-bold bg-indigo-600 text-white hover:bg-indigo-700 transition-colors shadow-sm disabled:opacity-50"
                >
                  {submitLoading
                    ? 'Saving...'
                    : 'Save Selected Subjects'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExamSubjects;