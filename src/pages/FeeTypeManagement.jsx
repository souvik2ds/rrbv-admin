import React, { useState, useEffect } from 'react';
import { apiRequest } from '../api';

const FeeTypeManagement = () => {
  const [feeTypes, setFeeTypes] = useState([]);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    active: true
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Fetch all Fee Types (GET)
  const fetchFeeTypes = async () => {
    try {
      const data = await apiRequest('/fee/fee-types', 'GET');
      setFeeTypes(data);
    } catch (err) {
      console.error('Error fetching fee types:', err);
      setError(err.message || 'Failed to fetch fee types');
    }
  };

  useEffect(() => {
    fetchFeeTypes();
  }, []);

  // Handle Input Changes
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  // Submit New Fee Type (POST)
  const handleSubmit = async (e) => {
    e.preventDefault();

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      await apiRequest(
        '/fee/fee-types',
        'POST',
        formData
      );

      setSuccess('Fee Type successfully created!');

      setFormData({
        name: '',
        description: '',
        active: true
      });

      // Refresh fee types table
      fetchFeeTypes();

    } catch (err) {
      console.error('Error creating fee type:', err);
      setError(err.message || 'Failed to create Fee Type');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 md:p-8 space-y-6 max-w-7xl mx-auto">

      {/* Header section */}
      <div>
        <h2 className="text-2xl font-black text-slate-800">
          Fee Configuration
        </h2>

        <p className="text-xs text-slate-500 mt-1">
          Configure and view structural school fee categories.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* CREATE FEE TYPE FORM */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm h-fit">

          <h3 className="text-base font-bold text-slate-800 mb-4 flex items-center gap-2">
            <span className="p-1.5 bg-emerald-50 rounded-lg text-emerald-600 text-sm">
              ➕
            </span>
            Create Fee Type
          </h3>

          {error && (
            <div className="p-3 bg-rose-50 border border-rose-100 text-rose-700 text-xs rounded-xl mb-4 font-medium">
              ⚠️ {error}
            </div>
          )}

          {success && (
            <div className="p-3 bg-emerald-50 border border-emerald-100 text-emerald-700 text-xs rounded-xl mb-4 font-medium">
              ✨ {success}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                Fee Name
              </label>

              <input
                type="text"
                name="name"
                required
                value={formData.name}
                onChange={handleChange}
                placeholder="e.g. Admission Fee, Tuition Fee"
                className="w-full border border-slate-300 rounded-xl px-3.5 py-2 text-sm bg-slate-50/50 focus:bg-white focus:border-emerald-500 outline-none transition"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                Description
              </label>

              <textarea
                name="description"
                rows="3"
                value={formData.description}
                onChange={handleChange}
                placeholder="Briefly state what this fee covers..."
                className="w-full border border-slate-300 rounded-xl px-3.5 py-2 text-sm bg-slate-50/50 focus:bg-white focus:border-emerald-500 outline-none transition"
              />
            </div>

            <div className="flex items-center gap-2">

              <input
                type="checkbox"
                name="active"
                id="active"
                checked={formData.active}
                onChange={handleChange}
                className="w-4 h-4 rounded text-emerald-600 border-slate-300 focus:ring-emerald-500"
              />

              <label
                htmlFor="active"
                className="text-xs font-bold text-slate-600 uppercase tracking-wider cursor-pointer select-none"
              >
                Mark as Active
              </label>

            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-2.5 rounded-xl text-xs transition duration-200 disabled:bg-slate-200 disabled:text-slate-400 mt-2"
            >
              {loading ? 'Saving...' : 'Add Fee Category'}
            </button>

          </form>
        </div>

        {/* VIEW ALL FEE TYPES */}
        <div className="lg:col-span-2 bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">

          <div className="flex justify-between items-center mb-4">

            <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">

              <span className="p-1.5 bg-emerald-50 rounded-lg text-emerald-600 text-sm">
                📋
              </span>

              Configured Fee Types

            </h3>

            <span className="text-[10px] font-extrabold uppercase bg-slate-100 text-slate-600 px-2.5 py-1 rounded-lg">
              Total Categories: {feeTypes.length}
            </span>

          </div>

          <div className="overflow-x-auto">

            <table className="w-full text-left text-xs border-collapse">

              <thead>

                <tr className="border-b border-slate-100 bg-slate-50/50 text-slate-500 font-bold uppercase tracking-wider">

                  <th className="py-3 px-4">
                    ID
                  </th>

                  <th className="py-3 px-4">
                    Fee Category Name
                  </th>

                  <th className="py-3 px-4">
                    Description
                  </th>

                  <th className="py-3 px-4 text-center">
                    Status
                  </th>

                </tr>

              </thead>

              <tbody className="divide-y divide-slate-100">

                {feeTypes.length === 0 ? (

                  <tr>

                    <td
                      colSpan="4"
                      className="py-8 text-center text-slate-400 font-medium"
                    >
                      No fee categories configured yet.
                      Use the panel on the left to add your first.
                    </td>

                  </tr>

                ) : (

                  feeTypes.map((fee) => (

                    <tr
                      key={fee.id}
                      className="hover:bg-slate-50/50 transition-colors"
                    >

                      <td className="py-3.5 px-4 font-mono font-bold text-slate-500">
                        #{fee.id}
                      </td>

                      <td className="py-3.5 px-4 font-bold text-slate-800">
                        {fee.name}
                      </td>

                      <td
                        className="py-3.5 px-4 text-slate-500 max-w-xs truncate"
                        title={fee.description}
                      >
                        {fee.description || '—'}
                      </td>

                      <td className="py-3.5 px-4 text-center">

                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                            fee.active
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                              : 'bg-rose-50 text-rose-700 border border-rose-100'
                          }`}
                        >
                          {fee.active ? 'Active' : 'Inactive'}
                        </span>

                      </td>

                    </tr>

                  ))

                )}

              </tbody>

            </table>

          </div>

        </div>

      </div>

    </div>
  );
};

export default FeeTypeManagement;