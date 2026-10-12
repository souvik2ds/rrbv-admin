import React, { useState } from 'react';
import { apiRequest } from '../api';

const Login = ({ onLoginSuccess }) => {
  // ওল্ড কোডের লজিক ও স্টেট (username & password)
  const [credentials, setCredentials] = useState({
    username: '',
    password: '',
  });

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // state to show dev profile
  const [showDevCard, setShowDevCard] = useState(false);

  // স্কুলের ছবি এবং লোগো পাথ
  const schoolImage = "/images/school-campus.png";
  const logoImage = "/images/school-campus.png";

  const handleChange = (e) => {
    const { name, value } = e.target;
    setCredentials((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // HttpOnly cookie is set by the backend
      const data = await apiRequest('/auth/login', 'POST', credentials);

      // Frontend role validation
      if (data.role !== 'ADMIN') {
        setError(
          'Access Denied: Only administrators are authorized to access this portal.'
        );
        setLoading(false);
        return;
      }

      // Keep existing user information in localStorage.
      // JWT token is NOT stored here.
      localStorage.setItem('role', data.role);
      localStorage.setItem('username', data.username);
      localStorage.setItem('userId', data.userId);
      localStorage.setItem('passwordChanged', data.passwordChanged);

      onLoginSuccess(data);

    } catch (err) {
      setError(
        err.message ||
        'Cannot connect to authorization server. Is backend running?'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col md:flex-row bg-slate-100 font-sans relative">

      {/* 🏞️ LEFT PANEL: SCHOOL BRANDING & IMAGE SHOWCASE */}
      <div className="relative md:w-3/5 w-full bg-slate-900 flex flex-col justify-between p-8 md:p-12 overflow-hidden min-h-[40vh] md:min-h-screen">

        <div
          className="absolute inset-0 bg-cover bg-center opacity-45 mix-blend-overlay transition-all duration-1000"
          style={{ backgroundImage: `url(${schoolImage})` }}
          onError={(e) => {
            e.target.style.backgroundImage =
              "url('https://images.unsplash.com/photo-1523050854058-8df90110c9f1?q=80&w=1470')";
          }}
        />

        <div className="absolute inset-0 bg-gradient-to-tr from-slate-950 via-slate-900/75 to-transparent z-0" />

        {/* Brand Header with School Logo */}
        <div className="relative z-10 flex items-center gap-3.5">

          <div className="w-16 h-16 rounded-full bg-amber-400/20 p-0.5 border border-amber-400/40 shrink-0 shadow-lg flex items-center justify-center overflow-hidden">
            <img
              src={logoImage}
              alt="Raghunathganj Rani Bhabani Vidyaniketan Logo"
              className="w-full h-full object-contain rounded-full"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src =
                  'https://ui-avatars.com/api/?name=Rani+Bhabani&background=f59e0b&color=fff';
              }}
            />
          </div>

          <div>
            <h1 className="text-xl md:text-2xl font-black tracking-wider text-white uppercase">
              Raghunathganj Rani Bhabani Vidyaniketan(H.S.)
            </h1>

            <p className="text-[11px] font-bold text-slate-300 tracking-wider uppercase mt-1 flex items-center justify-start gap-1.5 flex-wrap">
              <strong className="text-white font-extrabold">SADARGHAT</strong>
              <span className="text-emerald-400 font-black">•</span>
              <strong className="text-white font-extrabold">RAGHUNATHGANJ</strong>
              <span className="text-emerald-400 font-black">•</span>
              <strong className="text-white font-extrabold">MURSHIDABAD</strong>
            </p>

            <p className="text-[10px] text-amber-400 font-bold tracking-widest uppercase">
              Smart Education Management System
            </p>
          </div>
        </div>

        {/* Bottom Tagline */}
        <div className="relative z-10 max-w-md mt-auto hidden md:block">
          <h2 className="text-3xl font-bold text-white leading-tight mb-2">
            Nurturing Excellence, Empowering Minds.
          </h2>

          <p className="text-sm text-slate-400">
            Access your comprehensive administrative dashboard to manage admissions, classrooms,fees,exams, academic calendars, and student portfolios effortlessly.
          </p>
        </div>
      </div>

      {/* 🔐 RIGHT PANEL: LOGIN CONTAINER */}
      <div className="md:w-2/5 w-full flex flex-col justify-center items-center md:items-end p-6 md:p-16 relative z-10">

        {/* Login Form Box */}
        <div className="w-full max-w-md bg-white border border-slate-200 rounded-2xl shadow-xl p-8 md:mt-12">

          <div className="mb-6">
            <h3 className="text-xl font-bold text-slate-900">
              Administrative Sign In
            </h3>

            <p className="text-xs text-slate-500 mt-1">
              Please enter your authorized username and password.
            </p>
          </div>

          {error && (
            <div className="mb-4 p-3.5 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs font-medium flex items-center gap-2">
              <span className="text-rose-500 font-bold">⚠️</span>
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4 text-xs">

            <div>
              <label className="block font-bold text-slate-600 uppercase mb-1.5 tracking-wider">
                Username
              </label>

              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400 font-bold">
                  👤
                </span>

                <input
                  type="text"
                  name="username"
                  required
                  value={credentials.username}
                  onChange={handleChange}
                  placeholder="Enter username"
                  className="w-full pl-8 pr-4 py-2.5 border border-slate-300 rounded-xl text-sm bg-white outline-none focus:border-emerald-500 transition"
                />
              </div>
            </div>

            <div>
              <label className="block font-bold text-slate-600 uppercase mb-1.5 tracking-wider">
                Password
              </label>

              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400 font-bold">
                  🔒
                </span>

                <input
                  type="password"
                  name="password"
                  required
                  value={credentials.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className="w-full pl-8 pr-4 py-2.5 border border-slate-300 rounded-xl text-sm bg-white outline-none focus:border-emerald-500 transition"
                />
              </div>
            </div>

            <div className="flex items-center justify-between pt-1">
              <label className="flex items-center gap-2 text-slate-500 cursor-pointer">
                <input
                  type="checkbox"
                  className="w-3.5 h-3.5 rounded text-emerald-600 border-slate-300 focus:ring-emerald-500"
                />
                <span>Keep me signed in</span>
              </label>

              <a
                href="#forgot"
                className="font-semibold text-emerald-600 hover:text-emerald-700 transition"
              >
                Forgot Password?
              </a>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-3 rounded-xl font-bold text-sm shadow-md transition flex items-center justify-center gap-2 mt-2 disabled:bg-slate-300"
            >
              {loading ? 'Verifying Credentials...' : 'Secure Sign In'}
            </button>

          </form>
        </div>

        {/* 💻 HIGH-END PROFESSIONAL DEVELOPER FOOTER */}
        <div className="mt-12 md:mt-auto w-full max-w-md border-t border-slate-200/80 pt-5 flex flex-col sm:flex-row items-center justify-between gap-4 font-sans">

          <div className="text-[11px] font-bold text-slate-400 tracking-widest uppercase text-center sm:text-left">
            © {new Date().getFullYear()} Admin Portal
          </div>

          <div className="flex flex-col items-center sm:items-end gap-0.5">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              Developer Details
            </span>

            <button
              type="button"
              onClick={() => setShowDevCard(true)}
              className="text-sm font-bold tracking-wide text-emerald-600 hover:text-emerald-700 transition-colors duration-200 focus:outline-none"
            >
              @Souvik Das
            </button>
          </div>

        </div>
      </div>

      {/* 💳 INTERACTIVE DEVELOPER CARD MODAL */}
      {showDevCard && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">

          <div className="bg-white border border-slate-100 w-full max-w-sm rounded-2xl shadow-2xl overflow-hidden relative">

            {/* Close Button */}
            <button
              type="button"
              onClick={() => setShowDevCard(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 bg-slate-100 hover:bg-slate-200 w-8 h-8 rounded-full flex items-center justify-center font-bold text-base transition-all"
            >
              ✕
            </button>

            {/* Top decorative banner */}
            <div className="h-24 bg-gradient-to-r from-emerald-500 to-teal-600" />

            {/* Profile Avatar & Info */}
            <div className="px-6 pb-6 text-center -mt-10">

              <div className="w-20 h-20 bg-gradient-to-tr from-emerald-500 to-teal-500 rounded-2xl shadow-lg border-4 border-white mx-auto flex items-center justify-center text-white text-3xl font-black">
                SD
              </div>

              <h4 className="text-xl font-bold text-slate-800 mt-3">
                Souvik Das
              </h4>

              <p className="text-xs text-emerald-600 font-bold uppercase tracking-widest mt-0.5">
                Software Engineer
              </p>

              <p className="text-sm text-slate-600 mt-4 px-2 leading-relaxed">
                Need a professional Enterprise ERP, dynamic website, or tailored custom application? Let's connect and build it together!
              </p>

              <hr className="my-5 border-slate-100" />

              {/* Direct Contacts */}
              <div className="space-y-3 text-left max-w-xs mx-auto text-sm text-slate-700">

                <a
                  href="tel:7001429779"
                  className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-slate-50 border border-transparent hover:border-slate-100 transition-all"
                >
                  <span className="text-base bg-emerald-50 p-1.5 rounded-lg">
                    📞
                  </span>

                  <span className="font-bold hover:text-emerald-600 text-slate-800">
                    +91 7001429779
                  </span>
                </a>

                <a
                  href="mailto:souvikdas00777@gmail.com"
                  className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-slate-50 border border-transparent hover:border-slate-100 transition-all"
                >
                  <span className="text-base bg-emerald-50 p-1.5 rounded-lg">
                    ✉️
                  </span>

                  <span className="font-bold hover:text-emerald-600 text-slate-800 break-all">
                    souvikdas00777@gmail.com
                  </span>
                </a>

              </div>

              {/* Social Links Buttons */}
              <div className="grid grid-cols-3 gap-2 mt-6 text-xs font-bold">

                <a
                  href="https://www.linkedin.com/in/souvik-das-13ba94163/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-slate-900 text-white text-center py-2.5 rounded-xl transition hover:bg-slate-800 shadow-sm"
                >
                  LinkedIn
                </a>

                <a
                  href="https://www.facebook.com/souvik2ds"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-blue-600 text-white text-center py-2.5 rounded-xl transition hover:bg-blue-700 shadow-sm"
                >
                  Facebook
                </a>

                <a
                  href="https://x.com/iamSVK3"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-slate-100 text-slate-800 text-center py-2 rounded-xl transition hover:bg-slate-200"
                >
                  X (Twitter)
                </a>

              </div>

            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default Login;