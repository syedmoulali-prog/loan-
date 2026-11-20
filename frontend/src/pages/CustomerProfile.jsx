import React, { useEffect, useState, useRef } from 'react';
import api from '../api/axiosConfig';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { 
  User, Phone, Mail, Calendar, MapPin, Briefcase, 
  Save, Edit3, X, Camera, Trash2, UploadCloud, Loader2, CheckCircle2 
} from 'lucide-react';

export const CustomerProfile = () => {
  const { user } = useAuth();
  const { success, error } = useToast();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [photoLoading, setPhotoLoading] = useState(false);
  const [photoUrl, setPhotoUrl] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({});
  const fileInputRef = useRef(null);

  const customerId = user?.customerId || 1;

  const loadPhoto = async (id) => {
    try {
      const res = await api.get(`/customers/${id}/photo`, { responseType: 'blob' });
      const objectUrl = URL.createObjectURL(res.data);
      setPhotoUrl(objectUrl);
    } catch (err) {
      setPhotoUrl(null);
    }
  };

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/customers/${customerId}`);
      setProfile(res.data);
      setFormData(res.data);
      if (res.data.profilePhoto) {
        await loadPhoto(customerId);
      }
    } catch (err) {
      console.error('Failed to load profile', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
    return () => {
      if (photoUrl) URL.revokeObjectURL(photoUrl);
    };
  }, [customerId]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      const res = await api.put(`/customers/${customerId}`, formData);
      setProfile(res.data);
      setIsEditing(false);
      success('Customer profile updated successfully!');
    } catch (err) {
      error(err.response?.data?.message || 'Failed to update profile');
    }
  };

  const handlePhotoSelect = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      error('Please select an image file (JPEG, PNG, WEBP, or GIF)');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      error('Photo size exceeds maximum 5MB limit');
      return;
    }

    const uploadPayload = new FormData();
    uploadPayload.append('file', file);

    setPhotoLoading(true);
    try {
      const res = await api.post(`/customers/${customerId}/photo`, uploadPayload, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setProfile(res.data);
      await loadPhoto(customerId);
      success('Profile photo updated successfully!');
    } catch (err) {
      error(err.response?.data?.message || 'Failed to upload photo');
    } finally {
      setPhotoLoading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handlePhotoRemove = async () => {
    if (!window.confirm('Are you sure you want to remove your profile photo?')) return;

    setPhotoLoading(true);
    try {
      const res = await api.delete(`/customers/${customerId}/photo`);
      setProfile(res.data);
      if (photoUrl) URL.revokeObjectURL(photoUrl);
      setPhotoUrl(null);
      success('Profile photo removed.');
    } catch (err) {
      error(err.response?.data?.message || 'Failed to remove photo');
    } finally {
      setPhotoLoading(false);
    }
  };

  if (loading) {
    return <div className="h-64 flex items-center justify-center text-slate-400">Loading profile...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">Customer Profile</h1>
          <p className="text-sm text-slate-500">Manage your verified customer information and profile photo</p>
        </div>
        {!isEditing ? (
          <button
            onClick={() => setIsEditing(true)}
            className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center space-x-1.5 shadow-md shadow-blue-500/20"
          >
            <Edit3 className="w-4 h-4" />
            <span>Edit Profile</span>
          </button>
        ) : (
          <button
            onClick={() => {
              setIsEditing(false);
              setFormData(profile);
            }}
            className="px-4 py-2 rounded-xl bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-xs flex items-center space-x-1.5"
          >
            <X className="w-4 h-4" />
            <span>Cancel</span>
          </button>
        )}
      </div>

      {/* Profile Photo Card */}
      <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-200/80 dark:border-slate-700 shadow-sm flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-6">
        <div className="relative group">
          <div className="w-24 h-24 rounded-2xl overflow-hidden border-2 border-blue-500 bg-slate-100 dark:bg-slate-700 flex items-center justify-center shadow-md">
            {photoLoading ? (
              <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
            ) : photoUrl ? (
              <img src={photoUrl} alt="Customer Avatar" className="w-full h-full object-cover" />
            ) : (
              <User className="w-12 h-12 text-slate-400" />
            )}
          </div>
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={photoLoading}
            className="absolute -bottom-1 -right-1 p-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white shadow-lg transition"
            title="Upload photo"
          >
            <Camera className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="flex-1 text-center sm:text-left">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center justify-center sm:justify-start space-x-2">
            <span>{profile?.name}</span>
            <span className="text-xs px-2.5 py-0.5 rounded-full font-bold bg-blue-100 text-blue-800 dark:bg-blue-900/60 dark:text-blue-300">
              Customer #{profile?.customerId}
            </span>
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Formats: JPEG, PNG, WEBP (Max 5MB). Photo is stored securely and streamed via authenticated endpoints.
          </p>

          <div className="mt-3 flex flex-wrap items-center justify-center sm:justify-start gap-2">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handlePhotoSelect}
              accept="image/jpeg,image/png,image/webp,image/gif"
              className="hidden"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={photoLoading}
              className="px-3.5 py-1.5 rounded-xl bg-blue-50 hover:bg-blue-100 dark:bg-blue-950/60 dark:hover:bg-blue-900 text-blue-700 dark:text-blue-300 font-bold text-xs flex items-center space-x-1.5 border border-blue-200 dark:border-blue-800"
            >
              <UploadCloud className="w-3.5 h-3.5" />
              <span>{profile?.profilePhoto ? 'Change Photo' : 'Upload Photo'}</span>
            </button>

            {profile?.profilePhoto && (
              <button
                type="button"
                onClick={handlePhotoRemove}
                disabled={photoLoading}
                className="px-3.5 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/40 dark:hover:bg-rose-900 text-rose-700 dark:text-rose-300 font-bold text-xs flex items-center space-x-1.5 border border-rose-200 dark:border-rose-900"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Remove</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Profile Details Form Card */}
      <div className="bg-white dark:bg-slate-800 p-8 rounded-3xl border border-slate-200/80 dark:border-slate-700 shadow-sm">
        <form onSubmit={handleSave} className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Customer ID</label>
              <div className="font-mono font-bold text-sm text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-900 p-3 rounded-xl border border-slate-200 dark:border-slate-700">
                #{profile?.customerId}
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Full Name</label>
              {isEditing ? (
                <input
                  type="text"
                  name="name"
                  value={formData.name || ''}
                  onChange={handleChange}
                  required
                  className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm font-semibold"
                />
              ) : (
                <div className="text-sm font-bold text-slate-900 dark:text-white p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800">
                  {profile?.name}
                </div>
              )}
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Date of Birth</label>
              {isEditing ? (
                <input
                  type="date"
                  name="dateOfBirth"
                  value={formData.dateOfBirth || ''}
                  onChange={handleChange}
                  required
                  className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm font-semibold"
                />
              ) : (
                <div className="text-sm font-bold text-slate-900 dark:text-white p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800">
                  {profile?.dateOfBirth} (Age: {profile?.age} years)
                </div>
              )}
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Gender</label>
              {isEditing ? (
                <select
                  name="gender"
                  value={formData.gender || 'Male'}
                  onChange={handleChange}
                  className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm font-semibold"
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              ) : (
                <div className="text-sm font-bold text-slate-900 dark:text-white p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800">
                  {profile?.gender}
                </div>
              )}
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Phone</label>
              {isEditing ? (
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone || ''}
                  onChange={handleChange}
                  required
                  className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm font-semibold"
                />
              ) : (
                <div className="text-sm font-bold text-slate-900 dark:text-white p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800">
                  {profile?.phone}
                </div>
              )}
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Email</label>
              {isEditing ? (
                <input
                  type="email"
                  name="email"
                  value={formData.email || ''}
                  onChange={handleChange}
                  required
                  className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm font-semibold"
                />
              ) : (
                <div className="text-sm font-bold text-slate-900 dark:text-white p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800">
                  {profile?.email}
                </div>
              )}
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Employment Type</label>
              {isEditing ? (
                <select
                  name="employmentType"
                  value={formData.employmentType || 'Salaried'}
                  onChange={handleChange}
                  className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm font-semibold"
                >
                  <option value="Salaried">Salaried</option>
                  <option value="Self-Employed">Self-Employed</option>
                  <option value="Business">Business</option>
                  <option value="Professional">Professional</option>
                  <option value="Student">Student</option>
                  <option value="Retired">Retired</option>
                </select>
              ) : (
                <div className="text-sm font-bold text-slate-900 dark:text-white p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800">
                  {profile?.employmentType}
                </div>
              )}
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Residential Address</label>
              {isEditing ? (
                <input
                  type="text"
                  name="address"
                  value={formData.address || ''}
                  onChange={handleChange}
                  required
                  className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm font-semibold"
                />
              ) : (
                <div className="text-sm font-bold text-slate-900 dark:text-white p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800">
                  {profile?.address}
                </div>
              )}
            </div>
          </div>

          {isEditing && (
            <div className="flex justify-end pt-4 border-t border-slate-100 dark:border-slate-700">
              <button
                type="submit"
                className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center space-x-2 shadow-lg shadow-blue-500/20"
              >
                <Save className="w-4 h-4" />
                <span>Save Profile Changes</span>
              </button>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};
