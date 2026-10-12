import React, { useState } from 'react';
import { apiRequest } from '../api';
import {
  Calendar,
  Search,
  IndianRupee,
  CreditCard,
  Receipt,
  User,
  Printer,
  Loader2,
  AlertCircle
} from 'lucide-react';

const CollectionReport = () => {
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [reportData, setReportData] = useState(null);

  // ============================================================
  // Fetch Collection Report Data
  // ============================================================
  const handleFetchReport = async (e) => {
    e.preventDefault();

    if (!fromDate || !toDate) {
      setError('Please select both From Date and To Date');
      return;
    }

    if (new Date(fromDate) > new Date(toDate)) {
      setError('From Date cannot be after To Date');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const endpoint = `/fee/reports/collections?fromDate=${fromDate}&toDate=${toDate}`;
      const data = await apiRequest(endpoint, 'GET');
      setReportData(data);
    } catch (err) {
      setError(err.message || 'Failed to fetch collection report');
      setReportData(null);
    } finally {
      setLoading(false);
    }
  };

  // Trigger Print Dialog (Saves as PDF or Prints)
  const handlePrint = () => {
    window.print();
  };

  // Helper function to format date/time
  const formatDateTime = (dateTimeStr) => {
    if (!dateTimeStr) return 'N/A';
    return new Date(dateTimeStr).toLocaleString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  // Helper function to format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 2
    }).format(amount || 0);
  };

  return (
    <div className="space-y-6">
      {/* PRINT STYLES */}
      <style>
        {`
          @media print {
            @page {
              size: A4 portrait;
              margin: 12mm;
            }

            html, body {
              background: white !important;
              color: black !important;
              font-size: 11pt;
            }

            /* Hide everything outside the report area */
            body * {
              visibility: hidden;
            }

            /* Show only the print section */
            #printable-report, #printable-report * {
              visibility: visible;
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
            }

            #printable-report {
              position: absolute;
              left: 0;
              top: 0;
              width: 100%;
              margin: 0;
              padding: 0;
            }

            .print\\:hidden {
              display: none !important;
            }

            /* Optimize table layout for PDF */
            table {
              width: 100% !important;
              border-collapse: collapse !important;
            }

            tr, td, th {
              page-break-inside: avoid;
            }
          }
        `}
      </style>

      {/* Top Header (Screen Only) */}
      <div className="print:hidden flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Fee Collection Report</h1>
          <p className="text-sm text-slate-500 mt-1">
            View detailed day-book entries and payment mode summaries for a selected date range.
          </p>
        </div>

        {reportData && (
          <button
            onClick={handlePrint}
            className="px-5 py-2.5 bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs rounded-xl shadow-sm transition-all flex items-center gap-2 active:scale-95 shrink-0"
          >
            <Printer size={16} />
            Print / Save PDF
          </button>
        )}
      </div>

      {/* Date Filter Card (Screen Only) */}
      <div className="print:hidden bg-slate-50 border border-slate-200/80 rounded-2xl p-5 shadow-xs">
        <form onSubmit={handleFetchReport} className="flex flex-col md:flex-row items-end gap-4">
          <div className="flex-1 w-full space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
              <Calendar size={14} className="text-emerald-600" /> From Date
            </label>
            <input
              type="date"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
              className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all shadow-xs"
              required
            />
          </div>

          <div className="flex-1 w-full space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
              <Calendar size={14} className="text-emerald-600" /> To Date
            </label>
            <input
              type="date"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
              className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all shadow-xs"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full md:w-auto bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm px-6 py-2.5 rounded-xl transition-all duration-200 shadow-sm flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                Fetching...
              </>
            ) : (
              <>
                <Search size={16} />
                Generate Report
              </>
            )}
          </button>
        </form>

        {error && (
          <div className="mt-4 p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs font-semibold flex items-center gap-2">
            <AlertCircle size={16} className="shrink-0" />
            {error}
          </div>
        )}
      </div>

      {/* REPORT DATA DISPLAY (This container will be printed) */}
      {reportData && (
        <div id="printable-report" className="space-y-6">
          {/* Printable Official Header (Only shows in Print/PDF) */}
          <div className="hidden print:block text-center border-b-2 border-slate-900 pb-3 mb-4">
            <h1 className="text-xl font-black uppercase tracking-wide text-slate-900">
              RAGHUNATHGANJ RANI BHABANI VIDYANIKETAN
            </h1>
            <p className="text-xs font-bold text-slate-700 mt-0.5">
              FEE COLLECTION REPORT (DAY BOOK)
            </p>
            <p className="text-[10px] text-slate-500 font-semibold mt-0.5">
              Period: {reportData.fromDate} to {reportData.toDate} | Generated on:{' '}
              {new Date().toLocaleDateString('en-IN')}
            </p>
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 print:grid-cols-3 gap-5 print:gap-3">
            {/* Total Collection Card */}
            <div className="bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl p-5 text-white shadow-md flex items-center justify-between print:border print:border-slate-300 print:text-slate-900 print:bg-slate-50 print:p-3">
              <div>
                <p className="text-emerald-100 print:text-slate-600 text-xs font-bold uppercase tracking-wider">
                  Total Collection
                </p>
                <h3 className="text-2xl print:text-xl font-black mt-1">
                  {formatCurrency(reportData.totalCollected)}
                </h3>
                <p className="text-[11px] print:text-[9px] text-emerald-100/80 print:text-slate-500 mt-1 font-medium">
                  {reportData.fromDate} to {reportData.toDate}
                </p>
              </div>
              <div className="w-12 h-12 print:hidden bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-xs">
                <IndianRupee size={24} className="text-white" />
              </div>
            </div>

            {/* Total Transactions */}
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs flex items-center justify-between print:border-slate-300 print:p-3">
              <div>
                <p className="text-slate-400 print:text-slate-600 text-xs font-bold uppercase tracking-wider">
                  Total Receipts
                </p>
                <h3 className="text-2xl print:text-xl font-bold text-slate-800 mt-1">
                  {reportData.entries ? reportData.entries.length : 0}
                </h3>
                <p className="text-[11px] print:text-[9px] text-slate-500 mt-1 font-medium">
                  Transactions Processed
                </p>
              </div>
              <div className="w-12 h-12 print:hidden bg-slate-100 rounded-xl flex items-center justify-center">
                <Receipt size={24} className="text-slate-600" />
              </div>
            </div>

            {/* Payment Mode Breakdown */}
            <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs print:border-slate-300 print:p-3">
              <p className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <CreditCard size={14} className="text-emerald-600 print:hidden" /> Mode Wise Collection
              </p>
              <div className="space-y-1.5 max-h-24 overflow-y-auto pr-1">
                {reportData.totalByPaymentMode &&
                Object.keys(reportData.totalByPaymentMode).length > 0 ? (
                  Object.entries(reportData.totalByPaymentMode).map(([mode, amount]) => (
                    <div key={mode} className="flex justify-between items-center text-xs print:text-[10px]">
                      <span className="font-semibold text-slate-600 uppercase">{mode}</span>
                      <span className="font-bold text-slate-800">{formatCurrency(amount)}</span>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-slate-400">No payment data available</p>
                )}
              </div>
            </div>
          </div>

          {/* Transactions Table */}
          <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs print:border-slate-300 print:rounded-lg">
            <div className="px-6 py-4 border-b border-slate-200 bg-slate-50/50 flex items-center justify-between print:px-3 print:py-2">
              <h3 className="font-bold text-slate-800 text-sm print:text-xs">
                Collection Details (Day Book)
              </h3>
              <span className="text-xs font-semibold text-slate-500 bg-slate-200/60 px-2.5 py-1 rounded-full print:text-[10px] print:px-2 print:py-0.5">
                {reportData.entries?.length || 0} Records Found
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-[11px] print:text-[9px] font-bold text-slate-500 uppercase tracking-wider">
                    <th className="py-3 px-4 print:py-1.5 print:px-2">Receipt No</th>
                    <th className="py-3 px-4 print:py-1.5 print:px-2">Date & Time</th>
                    <th className="py-3 px-4 print:py-1.5 print:px-2">Adm No</th>
                    <th className="py-3 px-4 print:py-1.5 print:px-2">Student Name</th>
                    <th className="py-3 px-4 print:py-1.5 print:px-2">Month</th>
                    <th className="py-3 px-4 print:py-1.5 print:px-2">Mode</th>
                    <th className="py-3 px-4 print:py-1.5 print:px-2">Cashier</th>
                    <th className="py-3 px-4 print:py-1.5 print:px-2 text-right">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 print:divide-slate-200 text-xs print:text-[10px] text-slate-700">
                  {reportData.entries && reportData.entries.length > 0 ? (
                    reportData.entries.map((entry, index) => (
                      <tr key={index} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3.5 px-4 print:py-1.5 print:px-2 font-bold text-emerald-700 print:text-slate-900">
                          {entry.receiptNo || 'N/A'}
                        </td>
                        <td className="py-3.5 px-4 print:py-1.5 print:px-2 font-medium text-slate-600">
                          {formatDateTime(entry.paymentDate)}
                        </td>
                        <td className="py-3.5 px-4 print:py-1.5 print:px-2 font-bold text-slate-700">
                          {entry.admissionNumber || 'N/A'}
                        </td>
                        <td className="py-3.5 px-4 print:py-1.5 print:px-2 font-bold text-slate-800">
                          {entry.studentName || 'N/A'}
                        </td>
                        <td className="py-3.5 px-4 print:py-1.5 print:px-2 font-semibold text-slate-600">
                          {entry.month ? `Month ${entry.month}` : 'N/A'}
                        </td>
                        <td className="py-3.5 px-4 print:py-1.5 print:px-2">
                          <span className="inline-block bg-slate-100 text-slate-700 font-bold px-2 py-0.5 rounded text-[10px] print:text-[8px] uppercase border border-slate-200">
                            {entry.paymentMode || 'N/A'}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 print:py-1.5 print:px-2 font-medium text-slate-600">
                          <div className="flex items-center gap-1.5">
                            <User size={12} className="text-slate-400 print:hidden" />
                            {entry.cashierName || 'N/A'}
                          </div>
                        </td>
                        <td className="py-3.5 px-4 print:py-1.5 print:px-2 text-right font-black text-slate-800">
                          {formatCurrency(entry.totalAmount)}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="8" className="py-12 text-center text-slate-400 font-medium">
                        No collection records found for the selected date range.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Printable Footer / Signatures (Only shows in Print/PDF) */}
          <div className="hidden print:grid grid-cols-2 gap-4 pt-8 text-center text-[10px] font-bold text-slate-800">
            <div>
              <div className="border-b border-slate-500 w-1/2 mx-auto mb-1"></div>
              <span>Prepared By (Cashier)</span>
            </div>
            <div>
              <div className="border-b border-slate-500 w-1/2 mx-auto mb-1"></div>
              <span>Authorized Signature</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CollectionReport;