import React, { useState, useEffect } from 'react';
import { Calendar, CheckCircle2, XCircle, Edit3, Power, PowerOff, X } from 'lucide-react';
import { apiRequest } from '../api';

const AcademicYear = () => {
  // Form State for Creating
  const [formData, setFormData] = useState({ name: '', startDate: '', endDate: '' });

  // Data List States
  const [academicYears, setAcademicYears] = useState([]);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(false);

  // Selected Item for View/Update/Activate
  const [selectedYear, setSelectedYear] = useState(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [updateData, setUpdateData] = useState({ name: '', startDate: '', endDate: '' });

  // 🔄 Fetch All Academic Years
  const fetchAcademicYears = async () => {
    setFetchLoading(true);
    try {
      const data = await apiRequest('/academic-years', 'GET');
      setAcademicYears(data || []);

      // যদি ড্রয়ার খোলা থাকে, তবে ড্রয়ারের ডেটাও রিয়েল-টাইমে আপডেট করে নেওয়া
      if (selectedYear) {
        const updatedSelected = data.find(y => y.id === selectedYear.id);
        if (updatedSelected) setSelectedYear(updatedSelected);
      }
    } catch (error) {
      console.error(error);
      setMessage({ type: 'error', text: 'Failed to fetch academic years.' });
    } finally {
      setFetchLoading(false);
    }
  };

  useEffect(() => {
    fetchAcademicYears();
  }, []);

  // Handle row click to view details
  const handleRowClick = (year) => {
    setSelectedYear(year);
    setUpdateData({ name: year.name, startDate: year.startDate, endDate: year.endDate });
    setIsUpdating(false); // ভিউ মোডে ওপেন হবে প্রথম
  };

  // 🔄 PUT /academic-years/{id} (Update)
  const handleUpdateSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await apiRequest(`/academic-years/${selectedYear.id}`, 'PUT', updateData);
      setMessage({ type: 'success', text: `Academic Year updated successfully!` });
      setIsUpdating(false);
      fetchAcademicYears();
    } catch (error) {
      setMessage({ type: 'error', text: error.message || 'Update failed.' });
    } finally {
      setLoading(false);
    }
  };

  // 🔄 PUT /academic-years/{id}/activate (Activate)
  const handleActivate = async () => {
    setLoading(true);
    try {
      await apiRequest(`/academic-years/${selectedYear.id}/activate`, 'PUT');
      setMessage({ type: 'success', text: `Academic Year "${selectedYear.name}" is now Active!` });
      fetchAcademicYears();
    } catch (error) {
      setMessage({ type: 'error', text: error.message || 'Activation failed.' });
    } finally {
      setLoading(false);
    }
  };

  // 🔄 PUT /academic-years/{id}/deactivate (Deactivate)
  const handleDeactivate = async () => {
    setLoading(true);
    try {
      await apiRequest(`/academic-years/${selectedYear.id}/deactivate`, 'PUT');
      setMessage({ type: 'success', text: `Academic Year "${selectedYear.name}" has been Deactivated!` });
      fetchAcademicYears();
    } catch (error) {
      setMessage({ type: 'error', text: error.message || 'Deactivation failed.' });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });
    try {
      const data = await apiRequest('/academic-years', 'POST', formData);
      setMessage({ type: 'success', text: `Academic Year "${data.name}" created successfully!` });
      setFormData({ name: '', startDate: '', endDate: '' });
      fetchAcademicYears();
    } catch (error) {
      setMessage({ type: 'error', text: error.message || 'Failed to create.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 relative overflow-hidden">
      {/* Header */}
      <div className="border-b border-slate-200 pb-4">
        <h2 className="text-2xl font-bold text-slate-800">Academic Year Management</h2>
        <p className="text-sm text-slate-500">Click on any row to view details, update, or activate the session.</p>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* Left Form */}
        <div className="xl:col-span-1">
          {message.text && (
            <div className={`p-4 mb-4 rounded-lg text-sm font-medium border ${
              message.type === 'success' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-rose-50 text-rose-700 border-rose-200'
            }`}>
              {message.text}
            </div>
          )}

          <div className="bg-white p-6 border border-slate-200 rounded-xl shadow-sm">
            <h3 className="text-lg font-semibold text-slate-700 mb-4 flex items-center gap-2">
              <Calendar size={18} className="text-emerald-600" /> Add New Session
            </h3>
            <form onSubmit={handleCreateSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Session Name *</label>
                <input type="text" name="name" required value={formData.name} onChange={handleCreateChange} placeholder="e.g., 2026-2027" className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 outline-none transition" />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Start Date *</label>
                  <input type="date" name="startDate" required value={formData.startDate} onChange={handleCreateChange} className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 outline-none transition" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">End Date *</label>
                  <input type="date" name="endDate" required value={formData.endDate} onChange={handleCreateChange} className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 outline-none transition" />
                </div>
              </div>
              <button type="submit" disabled={loading} className="w-full bg-slate-900 hover:bg-slate-800 text-white font-medium py-2 rounded-lg text-sm transition mt-2">
                {loading ? 'Saving...' : 'Save Academic Year'}
              </button>
            </form>
          </div>
        </div>

        {/* Right Table */}
        <div className="xl:col-span-2">
          <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
            <div className="p-5 border-b border-slate-200 bg-slate-50 flex justify-between items-center">
              <h3 className="font-semibold text-slate-700">All Academic Years</h3>
              <span className="text-xs bg-slate-200 text-slate-700 px-2 py-1 rounded-md font-medium">Total: {academicYears.length}</span>
            </div>

            {fetchLoading ? (
              <div className="p-8 text-center text-slate-500 text-sm">Loading sessions...</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-100 text-slate-600 text-xs uppercase border-b border-slate-200">
                      <th className="py-3 px-4">ID</th>
                      <th className="py-3 px-4">Session Name</th>
                      <th className="py-3 px-4">Start Date</th>
                      <th className="py-3 px-4">End Date</th>
                      <th className="py-3 px-4 text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-sm text-slate-700">
                    {academicYears.map((year) => (
                      <tr
                        key={year.id}
                        onClick={() => handleRowClick(year)}
                        className={`cursor-pointer hover:bg-slate-100/80 transition-all ${
                          year.active ? 'bg-emerald-50/40 hover:bg-emerald-50/70 font-medium' : ''
                        }`}
                      >
                        <td className="py-3 px-4 text-slate-500 font-mono">#{year.id}</td>
                        <td className="py-3 px-4 text-slate-950 flex items-center gap-2">
                          {year.name}
                          {year.active && <span className="text-[10px] bg-emerald-600 text-white px-1.5 py-0.5 rounded-full font-bold uppercase">Active</span>}
                        </td>
                        <td className="py-3 px-4">{year.startDate}</td>
                        <td className="py-3 px-4">{year.endDate}</td>
                        <td className="py-3 px-4 text-center">
                          {year.active ? (
                            <span className="inline-flex text-xs font-semibold text-emerald-700 bg-emerald-100 px-2 rounded-full">Active</span>
                          ) : (
                            <span className="inline-flex text-xs font-semibold text-slate-400 bg-slate-100 px-2 rounded-full">Inactive</span>
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

      {/* ================= DETAILS SIDE DRAWER ================= */}
      {selectedYear && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex justify-end transition-opacity">
          <div className="w-full max-w-md bg-white h-screen shadow-2xl p-6 flex flex-col justify-between animate-slide-left">

            {/* Drawer Header */}
            <div>
              <div className="flex justify-between items-center border-b border-slate-100 pb-4 mb-6">
                <h3 className="text-lg font-bold text-slate-800">Academic Year Details</h3>
                <button onClick={() => setSelectedYear(null)} className="p-1 hover:bg-slate-100 rounded-full text-slate-400 hover:text-slate-600">
                  <X size={20} />
                </button>
              </div>

              {/* View Status & Information */}
              {!isUpdating ? (
                <div className="space-y-6">
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                    <div className="text-xs text-slate-400 font-mono">ID: #{selectedYear.id}</div>
                    <div className="text-xl font-bold text-slate-900 mt-1">{selectedYear.name}</div>
                    <div className="mt-3">
                      {selectedYear.active ? (
                        <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700 bg-emerald-100 px-3 py-1 rounded-full">
                          <CheckCircle2 size={14} /> Current Active Session
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 bg-slate-100 px-3 py-1 rounded-full">
                          <XCircle size={14} /> Inactive Session
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="block text-xs font-semibold text-slate-400 uppercase">Start Date</span>
                      <span className="font-medium text-slate-800">{selectedYear.startDate}</span>
                    </div>
                    <div>
                      <span className="block text-xs font-semibold text-slate-400 uppercase">End Date</span>
                      <span className="font-medium text-slate-800">{selectedYear.endDate}</span>
                    </div>
                  </div>
                </div>
              ) : (
                /* Update Form Mode */
                <form onSubmit={handleUpdateSubmit} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Session Name</label>
                    <input type="text" required value={updateData.name} onChange={(e) => setUpdateData({...updateData, name: e.target.value})} className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 outline-none" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Start Date</label>
                    <input type="date" required value={updateData.startDate} onChange={(e) => setUpdateData({...updateData, startDate: e.target.value})} className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 outline-none" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">End Date</label>
                    <input type="date" required value={updateData.endDate} onChange={(e) => setUpdateData({...updateData, endDate: e.target.value})} className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 outline-none" />
                  </div>
                  <div className="flex gap-2 pt-2">
                    <button type="button" onClick={() => setIsUpdating(false)} className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium py-2 rounded-lg text-sm transition">Cancel</button>
                    <button type="submit" disabled={loading} className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-medium py-2 rounded-lg text-sm transition">
                      {loading ? 'Updating...' : 'Save Changes'}
                    </button>
                  </div>
                </form>
              )}
            </div>

            {/* Bottom Actions (Update & Activate/Deactivate Buttons) */}
            {!isUpdating && (
              <div className="space-y-2 border-t border-slate-100 pt-4">
                {/* Activate Button (Only shows if current session is INACTIVE) */}
                {!selectedYear.active ? (
                  <button
                    onClick={handleActivate}
                    disabled={loading}
                    className="w-full flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-medium py-2.5 rounded-lg text-sm transition shadow-sm"
                  >
                    <Power size={16} /> Activate This Session
                  </button>
                ) : (
                  /* Deactivate Button (Only shows if current session is ACTIVE) */
                  <button
                    onClick={handleDeactivate}
                    disabled={loading}
                    className="w-full flex items-center justify-center gap-2 bg-rose-600 hover:bg-rose-700 text-white font-medium py-2.5 rounded-lg text-sm transition shadow-sm"
                  >
                    <PowerOff size={16} /> Deactivate This Session
                  </button>
                )}

                {/* Edit Button */}
                <button
                  onClick={() => setIsUpdating(true)}
                  className="w-full flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-800 text-white font-medium py-2.5 rounded-lg text-sm transition"
                >
                  <Edit3 size={16} /> Update Details
                </button>
              </div>
            )}

          </div>
        </div>
      )}
    </div>
  );
};

export default AcademicYear;