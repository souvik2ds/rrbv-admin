import React, { useState, useEffect } from 'react';
import { apiRequest } from '../api';
import { UserPlus, Shield, Mail, Phone, Image, User, CheckCircle, AlertCircle, RefreshCw, Power, PowerOff, Users } from 'lucide-react';

const ManageStaff = () => {
  // Form State
  const [formData, setFormData] = useState({
    role: 'CASHIER',
    name: '',
    phone: '',
    email: '',
    photoUrl: ''
  });

  // UI & Data States
  const [activeTab, setActiveTab] = useState('ADMIN'); // 'ADMIN' or 'CASHIER'
  const [staffList, setStaffList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(false);
  const [toggleLoadingId, setToggleLoadingId] = useState(null);
  const [message, setMessage] = useState({ type: '', text: '' });

  // 🔄 Fetch Staff List based on active tab
  const fetchStaff = async (role) => {
    setFetchLoading(true);
    try {
      const endpoint = role === 'ADMIN' ? '/staff/admins' : '/staff/cashiers';
      const data = await apiRequest(endpoint, 'GET');
      setStaffList(Array.isArray(data) ? data : []);
    } catch (err) {
      setMessage({ type: 'error', text: err.message || 'failed to load staffs details' });
    } finally {
      setFetchLoading(false);
    }
  };

  useEffect(() => {
    fetchStaff(activeTab);
  }, [activeTab]);

  // Handle Form Inputs
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // 🔄 POST /staff (Create New Staff)
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      const response = await apiRequest('/staff', 'POST', formData);
      setMessage({
        type: 'success',
        text: `new staff ${response?.name || formData.name} has been created successfully`
      });
      setFormData({
        role: 'CASHIER',
        name: '',
        phone: '',
        email: '',
        photoUrl: ''
      });

      if (formData.role === activeTab) {
        fetchStaff(formData.role);
      }
    } catch (err) {
      setMessage({ type: 'error', text: err.message || 'Failed to create new staff' });
    } finally {
      setLoading(false);
    }
  };

  // 🔄 Toggle Status (Activate / Deactivate)
  const handleToggleStatus = async (staffId, isCurrentlyActive) => {
    setToggleLoadingId(staffId);
    setMessage({ type: '', text: '' });

    const action = isCurrentlyActive ? 'deactivate' : 'activate';

    try {
      await apiRequest(`/staff/${staffId}/${action}`, 'PATCH');

      setMessage({
        type: 'success',
        text: `Staff ${isCurrentlyActive ? 'Deactivated' : 'Activated'} successfully`
      });

      // সার্ভার থেকে সর্বশেষ আপডেটকৃত লিস্ট রিফ্রেশ করা
      await fetchStaff(activeTab);

    } catch (err) {
      // ব্যাকএন্ড JSON না পাঠিয়ে Plain Text পাঠালে তৈরি হওয়া এরর হ্যান্ডলিং
      if (err.message && (err.message.includes('is not valid JSON') || err.message.includes('Unexpected token'))) {
        setMessage({
          type: 'success',
          text: `Staff ${isCurrentlyActive ? 'Deactivated' : 'Activated'} successfully`
        });
        await fetchStaff(activeTab);
      } else {
        setMessage({ type: 'error', text: err.message || 'Failed to change status' });
      }
    } finally {
      setToggleLoadingId(null);
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="flex items-center gap-3.5 border-b border-slate-200 pb-5">
        <div className="p-3 bg-gradient-to-tr from-emerald-600 to-teal-500 text-white rounded-2xl shadow-lg shadow-emerald-100">
          <Shield size={28} />
        </div>
        <div>
          <h1 className="text-2xl font-black text-slate-800 tracking-tight">Staff Management</h1>
          <p className="text-xs text-slate-500 font-semibold mt-0.5">
            Create new staff members and manage existing Admins and Cashiers.
          </p>
        </div>
      </div>

      {/* Alert Notifications */}
      {message.text && (
        <div
          className={`p-4 rounded-2xl flex items-center gap-3 text-xs font-bold border transition-all ${
            message.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
              : 'bg-rose-50 border-rose-200 text-rose-800'
          }`}
        >
          {message.type === 'success' ? (
            <CheckCircle size={18} className="text-emerald-600 shrink-0" />
          ) : (
            <AlertCircle size={18} className="text-rose-600 shrink-0" />
          )}
          <span>{message.text}</span>
        </div>
      )}

      {/* Form Card */}
      <div className="bg-white/80 backdrop-blur-md rounded-3xl border border-slate-200/80 shadow-xl shadow-slate-100 p-8">
        <h2 className="text-base font-black text-slate-800 uppercase tracking-wider mb-6 flex items-center gap-2">
          <UserPlus size={20} className="text-emerald-600" /> Create New Staff
        </h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

            {/* Role Field */}
            <div>
              <label className="block text-xs font-black text-slate-700 uppercase tracking-wider mb-2">
                Role <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <select
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  required
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-3.5 text-xs text-slate-800 font-bold focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 focus:outline-none transition-all appearance-none cursor-pointer"
                >
                  <option value="ADMIN">ADMIN</option>
                  <option value="CASHIER">CASHIER</option>
                </select>
                <Shield className="absolute right-3.5 top-3.5 text-slate-400 pointer-events-none" size={18} />
              </div>
            </div>

            {/* Name Field */}
            <div>
              <label className="block text-xs font-black text-slate-700 uppercase tracking-wider mb-2">
                Full Name <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  name="name"
                  maxLength={100}
                  required
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="e.g. John Doe"
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-3.5 pr-10 text-xs text-slate-800 font-bold focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 focus:outline-none transition-all"
                />
                <User className="absolute right-3.5 top-3.5 text-slate-400 pointer-events-none" size={18} />
              </div>
            </div>

            {/* Phone Field */}
            <div>
              <label className="block text-xs font-black text-slate-700 uppercase tracking-wider mb-2">
                Phone
              </label>
              <div className="relative">
                <input
                  type="text"
                  name="phone"
                  maxLength={15}
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="e.g. +1234567890"
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-3.5 pr-10 text-xs text-slate-800 font-bold focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 focus:outline-none transition-all"
                />
                <Phone className="absolute right-3.5 top-3.5 text-slate-400 pointer-events-none" size={18} />
              </div>
            </div>

            {/* Email Field */}
            <div>
              <label className="block text-xs font-black text-slate-700 uppercase tracking-wider mb-2">
                Email Address
              </label>
              <div className="relative">
                <input
                  type="email"
                  name="email"
                  maxLength={100}
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="e.g. john@example.com"
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-3.5 pr-10 text-xs text-slate-800 font-bold focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 focus:outline-none transition-all"
                />
                <Mail className="absolute right-3.5 top-3.5 text-slate-400 pointer-events-none" size={18} />
              </div>
            </div>

            {/* Photo URL Field */}
            <div className="md:col-span-2">
              <label className="block text-xs font-black text-slate-700 uppercase tracking-wider mb-2">
                Photo URL
              </label>
              <div className="relative">
                <input
                  type="url"
                  name="photoUrl"
                  maxLength={500}
                  value={formData.photoUrl}
                  onChange={handleChange}
                  placeholder="https://example.com/photo.jpg"
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-3.5 pr-10 text-xs text-slate-800 font-bold focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 focus:outline-none transition-all"
                />
                <Image className="absolute right-3.5 top-3.5 text-slate-400 pointer-events-none" size={18} />
              </div>
            </div>

          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white text-xs font-black px-7 py-3.5 rounded-2xl transition-all shadow-lg shadow-emerald-200 active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <RefreshCw size={16} className="animate-spin" /> Saving...
                </>
              ) : (
                <>
                  <UserPlus size={16} /> Save Staff
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Staff List View Tabs & Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        {/* Tab Headers */}
        <div className="flex border-b border-slate-100 bg-slate-50/50 p-2 gap-2">
          <button
            onClick={() => setActiveTab('ADMIN')}
            className={`flex-1 py-3 px-4 rounded-xl text-xs font-black tracking-wider transition-all flex items-center justify-center gap-2 ${
              activeTab === 'ADMIN'
                ? 'bg-white text-emerald-700 shadow-md shadow-slate-200/50'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Shield size={16} /> ADMINS
          </button>
          <button
            onClick={() => setActiveTab('CASHIER')}
            className={`flex-1 py-3 px-4 rounded-xl text-xs font-black tracking-wider transition-all flex items-center justify-center gap-2 ${
              activeTab === 'CASHIER'
                ? 'bg-white text-emerald-700 shadow-md shadow-slate-200/50'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Users size={16} /> CASHIERS
          </button>
        </div>

        {/* Staff Table Content */}
        {fetchLoading ? (
          <div className="p-12 text-center text-slate-400 text-xs font-bold flex items-center justify-center gap-2">
            <RefreshCw className="animate-spin" size={18} /> Loading {activeTab.toLowerCase()}s...
          </div>
        ) : staffList.length === 0 ? (
          <div className="p-12 text-center text-slate-400 text-xs font-bold">
            কোনো {activeTab === 'ADMIN' ? 'Admin' : 'Cashier'} পাওয়া যায়নি।
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/80 text-slate-400 text-[10px] uppercase font-black tracking-wider border-b border-slate-100">
                  <th className="py-4 px-6">Staff</th>
                  <th className="py-4 px-6">Staff Code</th>
                  <th className="py-4 px-6">Contact Info</th>
                  <th className="py-4 px-6">Status</th>
                  <th className="py-4 px-6 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs font-semibold text-slate-700">
                {staffList.map((staff) => {
                  // Boolean চেক (string "true"/true উভয় ক্ষেত্রই সাপোর্ট করবে)
                  const isActive = staff.active === true || staff.active === 'true';

                  return (
                    <tr key={staff.id} className="hover:bg-slate-50/60 transition-all">
                      {/* User Info */}
                      <td className="py-4 px-6 flex items-center gap-3">
                        {staff.photoUrl ? (
                          <img
                            src={staff.photoUrl}
                            alt={staff.name}
                            className="w-10 h-10 rounded-2xl object-cover border border-slate-200"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-black text-sm">
                            {staff.name ? staff.name.charAt(0).toUpperCase() : 'S'}
                          </div>
                        )}
                        <div>
                          <div className="font-bold text-slate-900">{staff.name}</div>
                          <div className="text-[10px] text-slate-400 font-mono">
                            User ID: #{staff.userId || staff.id}
                          </div>
                        </div>
                      </td>

                      {/* Staff Code */}
                      <td className="py-4 px-6 font-mono text-slate-600">{staff.staffCode || 'N/A'}</td>

                      {/* Contact */}
                      <td className="py-4 px-6">
                        <div className="text-slate-800">{staff.email || 'N/A'}</div>
                        <div className="text-[10px] text-slate-400">{staff.phone || 'N/A'}</div>
                      </td>

                      {/* Status */}
                      <td className="py-4 px-6">
                        {isActive ? (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black bg-emerald-100 text-emerald-700">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> Active
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black bg-slate-100 text-slate-500">
                            <span className="w-1.5 h-1.5 rounded-full bg-slate-400"></span> Inactive
                          </span>
                        )}
                      </td>

                      {/* Action Button */}
                      <td className="py-4 px-6 text-right">
                        <button
                          onClick={() => handleToggleStatus(staff.id, isActive)}
                          disabled={toggleLoadingId === staff.id}
                          className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                            isActive
                              ? 'bg-rose-50 text-rose-600 hover:bg-rose-100'
                              : 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100'
                          } disabled:opacity-50`}
                        >
                          {toggleLoadingId === staff.id ? (
                            <RefreshCw size={14} className="animate-spin" />
                          ) : isActive ? (
                            <>
                              <PowerOff size={14} /> Deactivate
                            </>
                          ) : (
                            <>
                              <Power size={14} /> Activate
                            </>
                          )}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default ManageStaff;