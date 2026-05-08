import React, { useState, useRef, useEffect } from 'react';
import { User, Mail, Lock, Save, Eye, EyeOff, CheckCircle, Camera, Trash2, ChevronDown, Search } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useAuth, friendlyError } from '../context/AuthContext';
import { useAppTheme } from '../context/AppThemeContext';

const API_BASE_URL = process.env.REACT_APP_API_URL || '/api';

/* ─── country codes ─────────────────────────────────────────────── */
const COUNTRY_CODES = [
  { code: '+1',   flag: '🇺🇸', name: 'United States' },
  { code: '+1',   flag: '🇨🇦', name: 'Canada' },
  { code: '+7',   flag: '🇷🇺', name: 'Russia' },
  { code: '+20',  flag: '🇪🇬', name: 'Egypt' },
  { code: '+27',  flag: '🇿🇦', name: 'South Africa' },
  { code: '+30',  flag: '🇬🇷', name: 'Greece' },
  { code: '+31',  flag: '🇳🇱', name: 'Netherlands' },
  { code: '+32',  flag: '🇧🇪', name: 'Belgium' },
  { code: '+33',  flag: '🇫🇷', name: 'France' },
  { code: '+34',  flag: '🇪🇸', name: 'Spain' },
  { code: '+36',  flag: '🇭🇺', name: 'Hungary' },
  { code: '+39',  flag: '🇮🇹', name: 'Italy' },
  { code: '+40',  flag: '🇷🇴', name: 'Romania' },
  { code: '+41',  flag: '🇨🇭', name: 'Switzerland' },
  { code: '+43',  flag: '🇦🇹', name: 'Austria' },
  { code: '+44',  flag: '🇬🇧', name: 'United Kingdom' },
  { code: '+45',  flag: '🇩🇰', name: 'Denmark' },
  { code: '+46',  flag: '🇸🇪', name: 'Sweden' },
  { code: '+47',  flag: '🇳🇴', name: 'Norway' },
  { code: '+48',  flag: '🇵🇱', name: 'Poland' },
  { code: '+49',  flag: '🇩🇪', name: 'Germany' },
  { code: '+51',  flag: '🇵🇪', name: 'Peru' },
  { code: '+52',  flag: '🇲🇽', name: 'Mexico' },
  { code: '+54',  flag: '🇦🇷', name: 'Argentina' },
  { code: '+55',  flag: '🇧🇷', name: 'Brazil' },
  { code: '+56',  flag: '🇨🇱', name: 'Chile' },
  { code: '+57',  flag: '🇨🇴', name: 'Colombia' },
  { code: '+60',  flag: '🇲🇾', name: 'Malaysia' },
  { code: '+61',  flag: '🇦🇺', name: 'Australia' },
  { code: '+62',  flag: '🇮🇩', name: 'Indonesia' },
  { code: '+63',  flag: '🇵🇭', name: 'Philippines' },
  { code: '+64',  flag: '🇳🇿', name: 'New Zealand' },
  { code: '+65',  flag: '🇸🇬', name: 'Singapore' },
  { code: '+66',  flag: '🇹🇭', name: 'Thailand' },
  { code: '+81',  flag: '🇯🇵', name: 'Japan' },
  { code: '+82',  flag: '🇰🇷', name: 'South Korea' },
  { code: '+84',  flag: '🇻🇳', name: 'Vietnam' },
  { code: '+86',  flag: '🇨🇳', name: 'China' },
  { code: '+90',  flag: '🇹🇷', name: 'Turkey' },
  { code: '+91',  flag: '🇮🇳', name: 'India' },
  { code: '+92',  flag: '🇵🇰', name: 'Pakistan' },
  { code: '+93',  flag: '🇦🇫', name: 'Afghanistan' },
  { code: '+94',  flag: '🇱🇰', name: 'Sri Lanka' },
  { code: '+95',  flag: '🇲🇲', name: 'Myanmar' },
  { code: '+98',  flag: '🇮🇷', name: 'Iran' },
  { code: '+212', flag: '🇲🇦', name: 'Morocco' },
  { code: '+213', flag: '🇩🇿', name: 'Algeria' },
  { code: '+216', flag: '🇹🇳', name: 'Tunisia' },
  { code: '+218', flag: '🇱🇾', name: 'Libya' },
  { code: '+220', flag: '🇬🇲', name: 'Gambia' },
  { code: '+221', flag: '🇸🇳', name: 'Senegal' },
  { code: '+234', flag: '🇳🇬', name: 'Nigeria' },
  { code: '+254', flag: '🇰🇪', name: 'Kenya' },
  { code: '+255', flag: '🇹🇿', name: 'Tanzania' },
  { code: '+256', flag: '🇺🇬', name: 'Uganda' },
  { code: '+260', flag: '🇿🇲', name: 'Zambia' },
  { code: '+263', flag: '🇿🇼', name: 'Zimbabwe' },
  { code: '+351', flag: '🇵🇹', name: 'Portugal' },
  { code: '+352', flag: '🇱🇺', name: 'Luxembourg' },
  { code: '+353', flag: '🇮🇪', name: 'Ireland' },
  { code: '+354', flag: '🇮🇸', name: 'Iceland' },
  { code: '+358', flag: '🇫🇮', name: 'Finland' },
  { code: '+370', flag: '🇱🇹', name: 'Lithuania' },
  { code: '+371', flag: '🇱🇻', name: 'Latvia' },
  { code: '+372', flag: '🇪🇪', name: 'Estonia' },
  { code: '+380', flag: '🇺🇦', name: 'Ukraine' },
  { code: '+381', flag: '🇷🇸', name: 'Serbia' },
  { code: '+385', flag: '🇭🇷', name: 'Croatia' },
  { code: '+386', flag: '🇸🇮', name: 'Slovenia' },
  { code: '+387', flag: '🇧🇦', name: 'Bosnia & Herzegovina' },
  { code: '+420', flag: '🇨🇿', name: 'Czech Republic' },
  { code: '+421', flag: '🇸🇰', name: 'Slovakia' },
  { code: '+880', flag: '🇧🇩', name: 'Bangladesh' },
  { code: '+886', flag: '🇹🇼', name: 'Taiwan' },
  { code: '+960', flag: '🇲🇻', name: 'Maldives' },
  { code: '+961', flag: '🇱🇧', name: 'Lebanon' },
  { code: '+962', flag: '🇯🇴', name: 'Jordan' },
  { code: '+963', flag: '🇸🇾', name: 'Syria' },
  { code: '+964', flag: '🇮🇶', name: 'Iraq' },
  { code: '+965', flag: '🇰🇼', name: 'Kuwait' },
  { code: '+966', flag: '🇸🇦', name: 'Saudi Arabia' },
  { code: '+967', flag: '🇾🇪', name: 'Yemen' },
  { code: '+968', flag: '🇴🇲', name: 'Oman' },
  { code: '+970', flag: '🇵🇸', name: 'Palestine' },
  { code: '+971', flag: '🇦🇪', name: 'UAE' },
  { code: '+972', flag: '🇮🇱', name: 'Israel' },
  { code: '+973', flag: '🇧🇭', name: 'Bahrain' },
  { code: '+974', flag: '🇶🇦', name: 'Qatar' },
  { code: '+975', flag: '🇧🇹', name: 'Bhutan' },
  { code: '+976', flag: '🇲🇳', name: 'Mongolia' },
  { code: '+977', flag: '🇳🇵', name: 'Nepal' },
  { code: '+992', flag: '🇹🇯', name: 'Tajikistan' },
  { code: '+993', flag: '🇹🇲', name: 'Turkmenistan' },
  { code: '+994', flag: '🇦🇿', name: 'Azerbaijan' },
  { code: '+995', flag: '🇬🇪', name: 'Georgia' },
  { code: '+996', flag: '🇰🇬', name: 'Kyrgyzstan' },
  { code: '+998', flag: '🇺🇿', name: 'Uzbekistan' },
];

/* parse stored phone like "+971 50 123 4567" → { countryCode, number } */
const parsePhone = (stored = '') => {
  if (!stored) return { countryCode: COUNTRY_CODES[0], number: '' };
  const match = COUNTRY_CODES.slice().sort((a, b) => b.code.length - a.code.length)
    .find(c => stored.startsWith(c.code));
  if (match) return { countryCode: match, number: stored.slice(match.code.length).trim() };
  return { countryCode: COUNTRY_CODES[0], number: stored };
};

/* ─── image compress ─────────────────────────────────────────────── */
const compressImage = (file, maxPx = 400, quality = 0.82) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const scale = Math.min(1, maxPx / Math.max(img.width, img.height));
        const canvas = document.createElement('canvas');
        canvas.width  = Math.round(img.width  * scale);
        canvas.height = Math.round(img.height * scale);
        canvas.getContext('2d').drawImage(img, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL('image/jpeg', quality));
      };
      img.onerror = reject;
      img.src = e.target.result;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

/* ─── CountryCodePicker ──────────────────────────────────────────── */
const CountryCodePicker = ({ value, onChange, isDark }) => {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const ref = useRef(null);

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const filtered = COUNTRY_CODES.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.code.includes(search)
  );

  const btn = isDark
    ? 'flex items-center gap-1.5 px-3 py-2.5 h-full rounded-l-lg border border-r-0 border-slate-700 bg-slate-800/60 text-white text-sm hover:bg-slate-700/60 transition-colors whitespace-nowrap'
    : 'flex items-center gap-1.5 px-3 py-2.5 h-full rounded-l-lg border border-r-0 border-gray-300 bg-gray-50 text-gray-900 text-sm hover:bg-gray-100 transition-colors whitespace-nowrap';
  const dropdownBg = isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200';
  const itemHover  = isDark ? 'hover:bg-slate-700/60 text-slate-300 hover:text-white' : 'hover:bg-gray-50 text-gray-700';
  const searchCls  = isDark
    ? 'w-full px-3 py-2 bg-slate-700/60 border border-slate-600 rounded-lg text-white text-xs placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-emerald-500'
    : 'w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 text-xs placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-emerald-500';

  return (
    <div ref={ref} className="relative">
      <button type="button" onClick={() => { setOpen(o => !o); setSearch(''); }} className={btn}>
        <span className="text-base">{value.flag}</span>
        <span>{value.code}</span>
        <ChevronDown className={`h-3 w-3 transition-transform ${open ? 'rotate-180' : ''} ${isDark ? 'text-slate-400' : 'text-gray-400'}`} />
      </button>

      {open && (
        <div className={`absolute left-0 top-full mt-1 w-64 rounded-xl border shadow-2xl z-50 overflow-hidden ${dropdownBg}`}>
          <div className="p-2 border-b border-inherit">
            <div className="relative">
              <Search className={`absolute left-2.5 top-1/2 -translate-y-1/2 h-3 w-3 ${isDark ? 'text-slate-500' : 'text-gray-400'}`} />
              <input
                autoFocus
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search country..."
                className={`${searchCls} pl-7`}
              />
            </div>
          </div>
          <div className="max-h-52 overflow-y-auto">
            {filtered.length === 0 && (
              <p className={`px-4 py-3 text-xs ${isDark ? 'text-slate-500' : 'text-gray-400'}`}>No results</p>
            )}
            {filtered.map((c, i) => (
              <button
                key={`${c.code}-${c.name}`}
                type="button"
                onClick={() => { onChange(c); setOpen(false); }}
                className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-colors ${itemHover} ${value.code === c.code && value.name === c.name ? 'bg-emerald-500/10 text-emerald-400' : ''}`}
              >
                <span className="text-base flex-shrink-0">{c.flag}</span>
                <span className="flex-1 text-left text-xs truncate">{c.name}</span>
                <span className={`text-xs flex-shrink-0 ${isDark ? 'text-slate-400' : 'text-gray-400'}`}>{c.code}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

/* ─── ProfilePage ────────────────────────────────────────────────── */
const ProfilePage = () => {
  const { user, updateUser } = useAuth();
  const { isDark } = useAppTheme();
  const fileInputRef = useRef(null);

  const parsed = parsePhone(user?.phone || '');
  const [name, setName]                       = useState(user?.name || '');
  const [countryCode, setCountryCode]         = useState(parsed.countryCode);
  const [phoneNumber, setPhoneNumber]         = useState(parsed.number);
  const [imagePreview, setImagePreview]       = useState(user?.profileImage || '');
  const [imageData, setImageData]             = useState(null);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword]         = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrent, setShowCurrent]         = useState(false);
  const [showNew, setShowNew]                 = useState(false);
  const [showConfirm, setShowConfirm]         = useState(false);
  const [savingInfo, setSavingInfo]           = useState(false);
  const [savingPassword, setSavingPassword]   = useState(false);

  const cardBg     = isDark ? '#161b22' : '#ffffff';
  const borderCls  = isDark ? 'border-slate-700/50' : 'border-gray-200';
  const headingCls = isDark ? 'text-white'    : 'text-gray-900';
  const subCls     = isDark ? 'text-slate-400' : 'text-gray-500';
  const labelCls   = isDark ? 'text-slate-300' : 'text-gray-700';
  const inputCls   = isDark
    ? 'w-full px-4 py-2.5 rounded-r-lg border border-slate-700 bg-slate-800/60 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-colors text-sm'
    : 'w-full px-4 py-2.5 rounded-r-lg border border-gray-300 bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors text-sm';
  const plainInputCls = isDark
    ? 'w-full px-4 py-2.5 rounded-lg border border-slate-700 bg-slate-800/60 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-colors text-sm'
    : 'w-full px-4 py-2.5 rounded-lg border border-gray-300 bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors text-sm';
  const disabledCls = isDark
    ? 'w-full px-4 py-2.5 rounded-lg border border-slate-700 bg-slate-800/30 text-slate-500 text-sm cursor-not-allowed'
    : 'w-full px-4 py-2.5 rounded-lg border border-gray-200 bg-gray-50 text-gray-400 text-sm cursor-not-allowed';

  const handleImageSelect = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) { toast.error('Please select an image file'); return; }
    if (file.size > 5 * 1024 * 1024) { toast.error('Image must be smaller than 5 MB'); return; }
    try {
      const compressed = await compressImage(file);
      setImagePreview(compressed);
      setImageData(compressed);
    } catch { toast.error('Failed to process image'); }
  };

  const handleRemoveImage = () => {
    setImagePreview('');
    setImageData('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSaveInfo = async (e) => {
    e.preventDefault();
    if (!name.trim() || name.trim().length < 2) { toast.error('Name must be at least 2 characters'); return; }
    const fullPhone = phoneNumber.trim() ? `${countryCode.code} ${phoneNumber.trim()}` : '';
    try {
      setSavingInfo(true);
      const payload = { name: name.trim(), phone: fullPhone };
      if (imageData !== null) payload.profileImage = imageData;
      const { data } = await axios.put(`${API_BASE_URL}/auth/profile`, payload);
      updateUser({ name: data.name, phone: data.phone, profileImage: data.profileImage });
      setImageData(null);
      toast.success('Profile updated');
    } catch (err) {
      toast.error(friendlyError(err));
    } finally {
      setSavingInfo(false);
    }
  };

  const handleSavePassword = async (e) => {
    e.preventDefault();
    if (!currentPassword) { toast.error('Enter your current password'); return; }
    if (newPassword.length < 6) { toast.error('New password must be at least 6 characters'); return; }
    if (newPassword !== confirmPassword) { toast.error('New passwords do not match'); return; }
    try {
      setSavingPassword(true);
      await axios.put(`${API_BASE_URL}/auth/profile`, { currentPassword, newPassword });
      toast.success('Password changed successfully');
      setCurrentPassword(''); setNewPassword(''); setConfirmPassword('');
    } catch (err) {
      toast.error(friendlyError(err));
    } finally {
      setSavingPassword(false);
    }
  };

  const initials = (user?.name || 'U').split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <h1 className={`text-2xl font-bold ${headingCls}`}>My Profile</h1>
        <p className={`text-sm mt-1 ${subCls}`}>Manage your account information and security settings.</p>
      </div>

      {/* Avatar + identity banner */}
      <div className={`rounded-xl border ${borderCls} p-6 mb-5 flex items-center gap-5`} style={{ background: cardBg }}>
        <div className="relative flex-shrink-0">
          <div className="w-20 h-20 rounded-full overflow-hidden bg-emerald-500 flex items-center justify-center shadow-lg shadow-emerald-500/30">
            {imagePreview
              ? <img src={imagePreview} alt="Profile" className="w-full h-full object-cover" />
              : <span className="text-white text-2xl font-bold">{initials}</span>
            }
          </div>
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="absolute bottom-0 right-0 w-7 h-7 rounded-full bg-emerald-500 hover:bg-emerald-600 flex items-center justify-center shadow-md transition-colors"
            title="Change photo"
          >
            <Camera className="h-3.5 w-3.5 text-white" />
          </button>
          <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleImageSelect} />
        </div>

        <div className="flex-1 min-w-0">
          <p className={`text-base font-semibold ${headingCls}`}>{user?.name}</p>
          <p className={`text-sm ${subCls}`}>{user?.email}</p>
          {user?.phone && <p className={`text-sm ${subCls}`}>{user.phone}</p>}
          <span className="inline-block mt-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/15 text-emerald-400 border border-emerald-500/25 capitalize">
            {user?.role || 'user'}
          </span>
        </div>

        {imagePreview && imageData !== null && (
          <button
            type="button"
            onClick={handleRemoveImage}
            className={`p-2 rounded-lg transition-colors flex-shrink-0 ${isDark ? 'text-slate-500 hover:text-red-400 hover:bg-slate-800' : 'text-gray-400 hover:text-red-500 hover:bg-gray-100'}`}
            title="Remove photo"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Personal info */}
      <div className={`rounded-xl border ${borderCls} p-6 mb-5`} style={{ background: cardBg }}>
        <div className="flex items-center gap-2 mb-5">
          <User className="h-4 w-4 text-emerald-400" />
          <h2 className={`text-sm font-semibold ${headingCls}`}>Personal Information</h2>
        </div>
        <form onSubmit={handleSaveInfo} className="space-y-4">
          {/* Name */}
          <div>
            <label className={`block text-xs font-medium mb-1.5 ${labelCls}`}>Full Name</label>
            <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="Your full name" className={plainInputCls} />
          </div>

          {/* Email (readonly) */}
          <div>
            <label className={`block text-xs font-medium mb-1.5 ${labelCls}`}>Email Address</label>
            <div className="relative">
              <input type="email" value={user?.email || ''} readOnly className={disabledCls} />
              <Mail className={`absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 ${isDark ? 'text-slate-600' : 'text-gray-300'}`} />
            </div>
            <p className={`text-xs mt-1 ${subCls}`}>Email address cannot be changed.</p>
          </div>

          {/* User ID (readonly) */}
          {user?.userId && (
            <div>
              <label className={`block text-xs font-medium mb-1.5 ${labelCls}`}>User ID</label>
              <div className={`flex items-center gap-2 px-4 py-2.5 rounded-lg border font-mono text-sm ${isDark ? 'border-slate-700 bg-slate-800/30 text-slate-400' : 'border-gray-200 bg-gray-50 text-gray-500'}`}>
                <span className="flex-1 tracking-wide">{user.userId}</span>
                <button
                  type="button"
                  onClick={() => { navigator.clipboard.writeText(user.userId); toast.success('User ID copied!'); }}
                  className={`text-xs px-2 py-0.5 rounded ${isDark ? 'text-slate-500 hover:text-emerald-400' : 'text-gray-400 hover:text-emerald-600'} transition-colors`}
                  title="Copy to clipboard"
                >
                  Copy
                </button>
              </div>
              <p className={`text-xs mt-1 ${subCls}`}>Your unique identifier — quote this when contacting support.</p>
            </div>
          )}

          {/* Phone with country code */}
          <div>
            <label className={`block text-xs font-medium mb-1.5 ${labelCls}`}>
              Mobile Number <span className={`font-normal ${subCls}`}>(optional)</span>
            </label>
            <div className="flex">
              <CountryCodePicker value={countryCode} onChange={setCountryCode} isDark={isDark} />
              <input
                type="tel"
                value={phoneNumber}
                onChange={e => setPhoneNumber(e.target.value)}
                placeholder="50 123 4567"
                className={inputCls}
              />
            </div>
          </div>

          {imageData !== null && (
            <p className={`flex items-center gap-1.5 text-xs ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`}>
              <Camera className="h-3.5 w-3.5" />
              New photo selected — save changes to apply
            </p>
          )}

          <div className="flex justify-end pt-1">
            <button
              type="submit"
              disabled={savingInfo}
              className="inline-flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-white text-sm font-semibold px-5 py-2.5 rounded-lg transition-colors"
            >
              {savingInfo ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Save className="h-4 w-4" />}
              Save Changes
            </button>
          </div>
        </form>
      </div>

      {/* Change password */}
      <div className={`rounded-xl border ${borderCls} p-6`} style={{ background: cardBg }}>
        <div className="flex items-center gap-2 mb-5">
          <Lock className="h-4 w-4 text-emerald-400" />
          <h2 className={`text-sm font-semibold ${headingCls}`}>Change Password</h2>
        </div>
        <form onSubmit={handleSavePassword} className="space-y-4">
          {[
            { label: 'Current Password',    value: currentPassword, set: setCurrentPassword, show: showCurrent, toggle: () => setShowCurrent(v => !v) },
            { label: 'New Password',         value: newPassword,     set: setNewPassword,     show: showNew,     toggle: () => setShowNew(v => !v) },
            { label: 'Confirm New Password', value: confirmPassword, set: setConfirmPassword, show: showConfirm, toggle: () => setShowConfirm(v => !v) },
          ].map(({ label, value, set, show, toggle }) => (
            <div key={label}>
              <label className={`block text-xs font-medium mb-1.5 ${labelCls}`}>{label}</label>
              <div className="relative">
                <input
                  type={show ? 'text' : 'password'}
                  value={value}
                  onChange={e => set(e.target.value)}
                  placeholder="••••••••"
                  className={`${plainInputCls} pr-10`}
                />
                <button type="button" onClick={toggle}
                  className={`absolute right-3 top-1/2 -translate-y-1/2 transition-colors ${isDark ? 'text-slate-500 hover:text-slate-300' : 'text-gray-400 hover:text-gray-600'}`}>
                  {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
          ))}
          {newPassword && confirmPassword && newPassword === confirmPassword && (
            <p className="flex items-center gap-1.5 text-xs text-emerald-400">
              <CheckCircle className="h-3.5 w-3.5" /> Passwords match
            </p>
          )}
          <div className="flex justify-end pt-1">
            <button
              type="submit"
              disabled={savingPassword}
              className="inline-flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-white text-sm font-semibold px-5 py-2.5 rounded-lg transition-colors"
            >
              {savingPassword ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Lock className="h-4 w-4" />}
              Change Password
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProfilePage;
