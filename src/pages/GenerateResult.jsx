import React, { useState, useEffect } from 'react';
import {
  Search, Edit3, Trash2, EyeOff, AlertCircle,
  X, RefreshCw, Award, PlayCircle
} from 'lucide-react';
import { apiRequest } from '../api';

const GenerateResult = () => {
  // Dropdown options states
  const [academicYears, setAcademicYears] = useState([]);
  const [classrooms, setClassrooms] = useState([]);

  // Selection states
  const [selectedAcademicYear, setSelectedAcademicYear] = useState('');
  const [selectedClassroom, setSelectedClassroom] = useState('');

  // Exam List & Loading states
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(false);

  // Modal & Action states for Update
  const [editingExam, setEditingExam] = useState(null);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);

  // Form state for Edit/Update
  const [updateFormData, setUpdateFormData] = useState({
    name: '',
    startDate: '',
    endDate: ''
  });

  // Message / Alert State
  const [message, setMessage] = useState({ type: '', text: '' });

  // 1. Initial Load for Academic Years & Active Classrooms
  useEffect(() => {
    const fetchDropdownData = async () => {
      setFetchLoading(true);
      setMessage({ type: '', text: '' });
      try {
        const [yearsData, classroomsData] = await Promise.all([
          apiRequest('/academic-years', 'GET'),
          apiRequest('/classrooms/active', 'GET')
        ]);

        setAcademicYears(yearsData || []);
        setClassrooms(classroomsData || []);
      } catch (error) {
        console.error(error);
        setMessage({ type: 'error', text: 'Failed to load initial metadata.' });
      } finally {
        setFetchLoading(false);
      }
    };

    fetchDropdownData();
  }, []);

  // 2. Fetch Exams when both Academic Year & Classroom are selected
  const fetchExams = async (e) => {
    if (e) e.preventDefault();
    if (!selectedAcademicYear || !selectedClassroom) {
      setMessage({ type: 'error', text: 'Please select Academic Year and Classroom first.' });
      return;
    }

    setFetchLoading(true);
    setMessage({ type: '', text: '' });
    try {
      const data = await apiRequest(
        `/exams?academicYearId=${selectedAcademicYear}&classroomId=${selectedClassroom}`,
        'GET'
      );
      setExams(data || []);
    } catch (error) {
      console.error(error);
      setMessage({ type: 'error', text: error.message || 'Failed to fetch exam list.' });
      setExams([]);
    } finally {
      setFetchLoading(false);
    }
  };

  // Helper function to reload current selected list
  const refreshExamList = async () => {
    if (selectedAcademicYear && selectedClassroom) {
      const data = await apiRequest(
        `/exams?academicYearId=${selectedAcademicYear}&classroomId=${selectedClassroom}`,
        'GET'
      );
      setExams(data || []);
    }
  };

  // Generate Single Exam Result (POST /results/exam/{examId}/generate)
  const handleGenerateResult = async (exam) => {
    if (!window.confirm(`Are you sure you want to generate result for "${exam.name}"?`)) return;

    setLoading(true);
    try {
      await apiRequest(`/results/exam/${exam.id}/generate`, 'POST');
      setMessage({ type: 'success', text: `Result generated successfully for "${exam.name}"!` });

      refreshExamList();
    } catch (error) {
      console.error(error);
      setMessage({ type: 'error', text: error.message || 'Failed to generate result.' });
    } finally {
      setLoading(false);
    }
  };

  // Handle Open Edit Modal
  const handleOpenEditModal = (exam) => {
    setEditingExam(exam);
    setUpdateFormData({
      name: exam.name || '',
      startDate: exam.startDate || '',
      endDate: exam.endDate || ''
    });
    setIsUpdateModalOpen(true);
  };

  // Submit Update Exam (PUT /exams/{examId})
  const handleUpdateExam = async (e) => {
    e.preventDefault();
    if (!editingExam) return;

    setLoading(true);
    try {
      const payload = {
        academicYearId: Number(editingExam.academicYearId),
        classroomId: Number(editingExam.classroomId),
        examType: editingExam.examType,
        name: updateFormData.name,
        startDate: updateFormData.startDate,
        endDate: updateFormData.endDate
      };

      await apiRequest(`/exams/${editingExam.id}`, 'PUT', payload);
      setMessage({ type: 'success', text: `Exam "${updateFormData.name}" updated successfully!` });
      setIsUpdateModalOpen(false);

      refreshExamList();
    } catch (error) {
      console.error(error);
      setMessage({ type: 'error', text: error.message || 'Failed to update exam.' });
    } finally {
      setLoading(false);
    }
  };

  // Deactivate Exam (DELETE /exams/{examId})
  const handleDeactivate = async (examId) => {
    if (!window.confirm('Are you sure you want to deactivate this exam?')) return;

    setLoading(true);
    try {
      await apiRequest(`/exams/${examId}`, 'DELETE');
      setMessage({ type: 'success', text: 'Exam deactivated successfully!' });

      refreshExamList();
    } catch (error) {
      console.error(error);
      setMessage({ type: 'error', text: error.message || 'Failed to deactivate exam.' });
    } finally {
      setLoading(false);
    }
  };

  // Unpublish Result (POST /exams/{examId}/unpublish)
  const handleUnpublish = async (exam) => {
    if (!window.confirm(`Are you sure you want to unpublish result for "${exam.name}"?`)) return;

    setLoading(true);
    try {
      await apiRequest(`/exams/${exam.id}/unpublish`, 'POST');
      setMessage({ type: 'success', text: `Result for "${exam.name}" unpublished successfully!` });

      refreshExamList();
    } catch (error) {
      console.error(error);
      setMessage({ type: 'error', text: error.message || 'Failed to unpublish result.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Title Header */}
      <div className="flex justify-between items-center border-b border-slate-200 pb-3">
        <div>
          <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <Award className="text-emerald-600" size={22} /> Generate & Manage Exam Results
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Select Academic Year & Classroom to manage exams, generate results, or update/unpublish exam details.
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
          <Search size={16} className="text-emerald-600" /> Filter Exams
        </h3>

        <form onSubmit={fetchExams} className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
          {/* Academic Year Dropdown */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">
              Academic Year *
            </label>
            <select
              required
              value={selectedAcademicYear}
              onChange={(e) => setSelectedAcademicYear(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-emerald-500 outline-none"
            >
              <option value="">Select Academic Year</option>
              {academicYears.map((ay) => (
                <option key={ay.id} value={ay.id}>
                  {ay.name} {ay.active ? '(Active)' : ''}
                </option>
              ))}
            </select>
          </div>

          {/* Active Classroom Dropdown */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">
              Classroom *
            </label>
            <select
              required
              value={selectedClassroom}
              onChange={(e) => setSelectedClassroom(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-emerald-500 outline-none"
            >
              <option value="">Select Classroom</option>
              {classrooms.map((cls) => (
                <option key={cls.id} value={cls.id}>
                  {cls.name} (Sec: {cls.section})
                </option>
              ))}
            </select>
          </div>

          {/* Search Button */}
          <button
            type="submit"
            disabled={fetchLoading}
            className="bg-emerald-600 hover:bg-emerald-700 text-white font-medium py-2 px-4 rounded-lg text-sm transition flex items-center justify-center gap-2 h-fit"
          >
            <Search size={16} /> {fetchLoading ? 'Searching...' : 'Search Exams'}
          </button>
        </form>
      </div>

      {/* Exam List Table */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-200 bg-slate-50 flex justify-between items-center">
          <h3 className="font-semibold text-slate-700 text-sm uppercase">Exam List</h3>
          {selectedAcademicYear && selectedClassroom && (
            <button
              onClick={fetchExams}
              className="text-xs text-slate-600 hover:text-slate-900 bg-white border border-slate-300 px-3 py-1 rounded-md flex items-center gap-1.5 transition"
            >
              <RefreshCw size={12} className={fetchLoading ? 'animate-spin' : ''} /> Refresh List
            </button>
          )}
        </div>

        {fetchLoading ? (
          <div className="p-8 text-center text-sm text-slate-400">Loading exam data...</div>
        ) : exams.length === 0 ? (
          <div className="p-8 text-center text-sm text-slate-400">
            {!selectedAcademicYear || !selectedClassroom ? (
              <p>Please select Academic Year and Classroom above to view exams.</p>
            ) : (
              <p>No exams found for the selected criteria.</p>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-100 text-slate-600 text-xs uppercase border-b border-slate-200">
                  <th className="py-3 px-4">Exam Name</th>
                  <th className="py-3 px-4">Type</th>
                  <th className="py-3 px-4">Academic Year</th>
                  <th className="py-3 px-4">Classroom</th>
                  <th className="py-3 px-4">Start Date</th>
                  <th className="py-3 px-4">End Date</th>
                  <th className="py-3 px-4 text-center">Result Status</th>
                  <th className="py-3 px-4 text-center">Active Status</th>
                  <th className="py-3 px-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {exams.map((exam) => (
                  <tr key={exam.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3 px-4 font-bold text-slate-900">{exam.name}</td>
                    <td className="py-3 px-4 text-slate-600 font-medium">
                      <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded text-xs">
                        {exam.examType || 'N/A'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-700">{exam.academicYearName}</td>
                    <td className="py-3 px-4 text-slate-700">
                      {exam.classroomName} {exam.classroomSection && `(${exam.classroomSection})`}
                    </td>
                    <td className="py-3 px-4 text-slate-600 font-mono text-xs">{exam.startDate}</td>
                    <td className="py-3 px-4 text-slate-600 font-mono text-xs">{exam.endDate}</td>

                    {/* Result Published Tag */}
                    <td className="py-3 px-4 text-center">
                      {exam.resultPublished ? (
                        <span className="inline-flex text-[11px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full">
                          Published
                        </span>
                      ) : (
                        <span className="inline-flex text-[11px] font-semibold text-amber-700 bg-amber-50 border border-amber-200 px-2.5 py-0.5 rounded-full">
                          Unpublished
                        </span>
                      )}
                    </td>

                    {/* Active Tag */}
                    <td className="py-3 px-4 text-center">
                      {exam.active ? (
                        <span className="inline-flex text-[11px] font-semibold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                          Active
                        </span>
                      ) : (
                        <span className="inline-flex text-[11px] font-semibold text-rose-700 bg-rose-100 px-2 py-0.5 rounded-full">
                          Inactive
                        </span>
                      )}
                    </td>

                    {/* Action Buttons */}
                    <td className="py-3 px-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        {/* Generate Result Button */}
                        <button
                          onClick={() => handleGenerateResult(exam)}
                          disabled={loading || !exam.active}
                          title="Generate Result"
                          className="p-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 rounded-md transition disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                          <PlayCircle size={15} />
                        </button>

                        {/* Update Button */}
                        <button
                          onClick={() => handleOpenEditModal(exam)}
                          disabled={loading}
                          title="Update Exam Details"
                          className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md transition"
                        >
                          <Edit3 size={15} />
                        </button>

                        {/* Unpublish Button (Only if published) */}
                        {exam.resultPublished && (
                          <button
                            onClick={() => handleUnpublish(exam)}
                            disabled={loading}
                            title="Unpublish Result"
                            className="p-1.5 bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-200 rounded-md transition"
                          >
                            <EyeOff size={15} />
                          </button>
                        )}

                        {/* Deactivate Button */}
                        <button
                          onClick={() => handleDeactivate(exam.id)}
                          disabled={loading || !exam.active}
                          title="Deactivate Exam"
                          className="p-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 rounded-md transition disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* UPDATE EXAM MODAL */}
      {isUpdateModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-xl w-full max-w-md p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 mb-4">
              <h3 className="text-md font-bold text-slate-800 flex items-center gap-2">
                <Edit3 className="text-emerald-600" size={18} /> Update Exam Details
              </h3>
              <button
                onClick={() => setIsUpdateModalOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleUpdateExam} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">
                  Exam Name *
                </label>
                <input
                  type="text"
                  required
                  value={updateFormData.name}
                  onChange={(e) => setUpdateFormData({ ...updateFormData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">
                  Start Date *
                </label>
                <input
                  type="date"
                  required
                  value={updateFormData.startDate}
                  onChange={(e) => setUpdateFormData({ ...updateFormData, startDate: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">
                  End Date *
                </label>
                <input
                  type="date"
                  required
                  value={updateFormData.endDate}
                  onChange={(e) => setUpdateFormData({ ...updateFormData, endDate: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                />
              </div>

              <div className="pt-4 flex items-center justify-end gap-2 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsUpdateModalOpen(false)}
                  className="px-4 py-2 rounded-lg text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 rounded-lg text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white transition disabled:opacity-50"
                >
                  {loading ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default GenerateResult;