import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import api from '../api/axiosConfig';
import { Users, Search, Mail, Phone, MapPin, Briefcase, User } from 'lucide-react';

const CustomerCard = ({ customer }) => {
  const [photoUrl, setPhotoUrl] = useState(null);

  useEffect(() => {
    let isMounted = true;
    if (customer.profilePhoto) {
      api.get(`/customers/${customer.customerId}/photo`, { responseType: 'blob' })
        .then((res) => {
          if (isMounted) {
            setPhotoUrl(URL.createObjectURL(res.data));
          }
        })
        .catch(() => {});
    }
    return () => {
      isMounted = false;
      if (photoUrl) URL.revokeObjectURL(photoUrl);
    };
  }, [customer.customerId, customer.profilePhoto]);

  return (
    <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-200/80 dark:border-slate-700 shadow-sm space-y-4 hover:border-blue-500 transition">
      <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-750 pb-3">
        <div className="flex items-center space-x-3">
          <div className="w-11 h-11 rounded-2xl overflow-hidden bg-slate-100 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 flex items-center justify-center flex-shrink-0">
            {photoUrl ? (
              <img src={photoUrl} alt={customer.name} className="w-full h-full object-cover" />
            ) : (
              <span className="font-extrabold text-blue-600 dark:text-blue-400 text-sm">
                {customer.name?.charAt(0) || 'C'}
              </span>
            )}
          </div>
          <div>
            <h3 className="font-bold text-base text-slate-900 dark:text-white leading-tight">{customer.name}</h3>
            <span className="text-xs text-slate-400 font-mono">ID #{customer.customerId}</span>
          </div>
        </div>
        <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300">
          {customer.employmentType}
        </span>
      </div>

      <div className="space-y-2 text-xs text-slate-600 dark:text-slate-300">
        <div className="flex items-center space-x-2">
          <Mail className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
          <span className="truncate">{customer.email}</span>
        </div>
        <div className="flex items-center space-x-2">
          <Phone className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
          <span>{customer.phone}</span>
        </div>
        <div className="flex items-center space-x-2">
          <Briefcase className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
          <span>Age: <strong>{customer.age} years</strong> (DOB: {customer.dateOfBirth})</span>
        </div>
        <div className="flex items-start space-x-2">
          <MapPin className="w-3.5 h-3.5 text-slate-400 flex-shrink-0 mt-0.5" />
          <span className="line-clamp-2">{customer.address}</span>
        </div>
      </div>
    </div>
  );
};

export const CustomersPage = () => {
  const location = useLocation();
  const queryParam = new URLSearchParams(location.search).get('q') || '';
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState(queryParam);

  useEffect(() => {
    const q = new URLSearchParams(location.search).get('q');
    if (q !== null) setSearch(q);
  }, [location.search]);

  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        setLoading(true);
        const res = await api.get('/customers');
        setCustomers(res.data);
      } catch (err) {
        console.error('Failed to load customers', err);
      } finally {
        setLoading(false);
      }
    };
    fetchCustomers();
  }, []);

  const filtered = customers.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.email.toLowerCase().includes(search.toLowerCase()) ||
      c.employmentType.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div>
        <h1 className="text-2xl font-black text-slate-900 dark:text-white flex items-center space-x-2">
          <Users className="w-6 h-6 text-blue-600" />
          <span>Customer Directory</span>
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Registered customer borrower profiles, KYC age calculation, and employment categories
        </p>
      </div>

      <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-700 shadow-sm flex items-center justify-between">
        <div className="relative w-full max-w-sm">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search customers..."
            className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-xs focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div className="text-xs font-bold text-slate-500">
          Total Customers: {customers.length}
        </div>
      </div>

      {loading ? (
        <div className="h-48 flex items-center justify-center text-slate-400 text-sm">
          Loading customer directory...
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-12 text-slate-400 text-sm">
          No customers found matching "{search}"
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((c) => (
            <CustomerCard key={c.customerId} customer={c} />
          ))}
        </div>
      )}
    </div>
  );
};
