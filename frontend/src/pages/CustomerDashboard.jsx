import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axiosConfig';
import { useAuth } from '../context/AuthContext';
import { StatCard } from '../components/StatCard';
import { StatusBadge } from '../components/StatusBadge';
import { 
  PlusCircle, User, CreditCard, UploadCloud, 
  Clock, CheckCircle2, AlertTriangle, FileText, ArrowRight,
  ShieldCheck, Calendar, DollarSign, Percent, Check, X, AlertCircle
} from 'lucide-react';

export const CustomerDashboard = () => {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [photoUrl, setPhotoUrl] = useState(null);

  const customerId = user?.customerId || 1;

  useEffect(() => {
    let active = true;
    const fetchCustomerDashboard = async () => {
      try {
        setLoading(true);
        const res = await api.get(`/dashboard/customer/${customerId}`);
        if (active) setData(res.data);
      } catch (err) {
        console.error('Failed to load customer dashboard', err);
      } finally {
        if (active) setLoading(false);
      }
    };

    const fetchPhoto = async () => {
      try {
        const res = await api.get(`/customers/${customerId}/photo`, { responseType: 'blob' });
        if (active) {
          const url = URL.createObjectURL(res.data);
          setPhotoUrl(url);
        }
      } catch (e) {}
    };

    fetchCustomerDashboard();
    fetchPhoto();

    return () => {
      active = false;
      if (photoUrl) URL.revokeObjectURL(photoUrl);
    };
  }, [customerId]);

  const latestApp = data?.recentApplications?.[0];
  const activeRepayment = data?.activeRepayment || latestApp?.repayment;

  // Timeline step statuses
  const getTimelineSteps = () => {
    const isApproved = latestApp?.status === 'APPROVED';
    const isRejected = latestApp?.status === 'NOT_ELIGIBLE' || latestApp?.status === 'REJECTED';
    const isUnderReview = latestApp?.status === 'UNDER_REVIEW' || latestApp?.status === 'REQUIRES_REVIEW';
    const isVerified = latestApp?.status === 'ELIGIBLE' || isApproved || isRejected || isUnderReview;

    return [
      {
        id: 1,
        title: 'Application Submitted',
        desc: latestApp ? `Submitted on ${latestApp.applicationDate}` : 'Submit loan application',
        completed: !!latestApp,
        current: latestApp?.status === 'SUBMITTED',
      },
      {
        id: 2,
        title: 'Information Verification',
        desc: isVerified || isUnderReview ? 'Profile & KYC verified' : 'Income & identity verification',
        completed: isVerified || isUnderReview,
        current: latestApp?.status === 'UNDER_VERIFICATION',
      },
      {
        id: 3,
        title: 'Document Verification',
        desc: (latestApp?.documentsCount || 0) > 0 ? `${latestApp.documentsCount} documents verified` : 'Awaiting document upload',
        completed: isVerified || (latestApp?.documentsCount || 0) > 0,
        current: latestApp?.status === 'UNDER_VERIFICATION',
      },
      {
        id: 4,
        title: 'Eligibility Evaluation',
        desc: latestApp?.eligibilityStatus ? `Result: ${latestApp.eligibilityStatus}` : 'Evaluation against credit rules',
        completed: !!latestApp?.eligibilityStatus,
        current: latestApp?.status === 'SUBMITTED' && !latestApp?.eligibilityStatus,
      },
      {
        id: 5,
        title: 'Staff / Admin Review',
        desc: isApproved || isRejected ? 'Underwriting assessment complete' : 'Officer & manager review',
        completed: isApproved || isRejected,
        current: isUnderReview,
      },
      {
        id: 6,
        title: isRejected ? 'Application Rejected' : 'Loan Decision',
        desc: isApproved ? 'Application Approved!' : isRejected ? (latestApp?.remarks || 'Not approved') : 'Final decision recording',
        completed: isApproved || isRejected,
        isRejection: isRejected,
        current: isApproved || isRejected,
      },
    ];
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Welcome Banner */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-blue-700 via-indigo-700 to-blue-800 text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center space-x-4 mb-3">
            <Link to="/profile" className="relative group block">
              <div className="w-14 h-14 rounded-2xl overflow-hidden border-2 border-white/40 bg-white/10 backdrop-blur-md flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform">
                {photoUrl ? (
                  <img src={photoUrl} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  <User className="w-7 h-7 text-white/80" />
                )}
              </div>
            </Link>
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold leading-tight uppercase tracking-tight">
                WELCOME BACK, {user?.name || data?.customerName || 'CUSTOMER'}!
              </h1>
              <p className="text-blue-200 text-xs font-semibold">
                Customer Profile #{customerId} • Verified Borrower Account
              </p>
            </div>
          </div>
          <p className="text-blue-100 text-sm max-w-2xl leading-relaxed">
            Apply for new loans, track application verification status, and view your approved monthly repayment schedule.
          </p>
        </div>

        {/* Primary Action Button */}
        <div className="flex flex-col sm:flex-row md:flex-col gap-3">
          <Link
            to="/apply"
            className="px-6 py-3.5 rounded-xl bg-white text-blue-700 hover:bg-blue-50 font-black text-sm shadow-lg shadow-black/10 transition flex items-center justify-center space-x-2 transform hover:-translate-y-0.5"
          >
            <PlusCircle className="w-5 h-5 text-blue-600" />
            <span>+ APPLY FOR LOAN</span>
          </Link>
          <Link
            to="/profile"
            className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs transition flex items-center justify-center space-x-1.5"
          >
            <span>Update Profile</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* Prominent APPROVED LOAN CARD (Section 9) */}
      {activeRepayment && (
        <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-emerald-600 via-teal-700 to-emerald-800 text-white shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-80 h-80 bg-white/5 rounded-full blur-3xl pointer-events-none"></div>

          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between pb-6 border-b border-white/20 gap-4">
            <div>
              <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-xs font-black uppercase tracking-wider mb-2">
                <ShieldCheck className="w-4 h-4 text-emerald-200" />
                <span>YOUR ACTIVE LOAN</span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-black tracking-tight">
                Status: APPROVED
              </h2>
            </div>
            <div className="text-left md:text-right">
              <span className="text-xs uppercase font-bold text-emerald-200">Monthly EMI Payment</span>
              <div className="text-3xl sm:text-4xl font-black font-mono mt-0.5 text-white">
                ₹{Number(activeRepayment.monthlyPayment).toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </div>
            </div>
          </div>

          <div className="relative z-10 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 pt-6 text-xs">
            <div className="p-3.5 rounded-2xl bg-white/10 backdrop-blur-md">
              <span className="text-emerald-200 uppercase font-bold block text-[11px]">Approved Amount</span>
              <span className="font-mono font-black text-base text-white mt-1 block">
                ₹{Number(activeRepayment.approvedAmount).toLocaleString()}
              </span>
            </div>

            <div className="p-3.5 rounded-2xl bg-white/10 backdrop-blur-md">
              <span className="text-emerald-200 uppercase font-bold block text-[11px]">Interest Rate</span>
              <span className="font-mono font-black text-base text-white mt-1 block">
                {activeRepayment.interestRate}% Annual
              </span>
            </div>

            <div className="p-3.5 rounded-2xl bg-white/10 backdrop-blur-md">
              <span className="text-emerald-200 uppercase font-bold block text-[11px]">Tenure</span>
              <span className="font-black text-base text-white mt-1 block">
                {activeRepayment.tenureMonths} Months
              </span>
            </div>

            <div className="p-3.5 rounded-2xl bg-white/10 backdrop-blur-md">
              <span className="text-emerald-200 uppercase font-bold block text-[11px]">Next Payment</span>
              <span className="font-mono font-black text-base text-white mt-1 block">
                {activeRepayment.nextPaymentDate || '30 days from approval'}
              </span>
            </div>

            <div className="p-3.5 rounded-2xl bg-white/10 backdrop-blur-md">
              <span className="text-emerald-200 uppercase font-bold block text-[11px]">Remaining Balance</span>
              <span className="font-mono font-black text-base text-white mt-1 block">
                ₹{Number(activeRepayment.remainingBalance).toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </span>
            </div>

            <div className="p-3.5 rounded-2xl bg-white/10 backdrop-blur-md">
              <span className="text-emerald-200 uppercase font-bold block text-[11px]">Payments Completed</span>
              <span className="font-black text-base text-white mt-1 block">
                {activeRepayment.paymentsCompleted || 0} / {activeRepayment.tenureMonths}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Aggregate Metric Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard title="Total Applications" value={data?.totalApplications || 0} icon={FileText} color="blue" />
        <StatCard title="Pending Applications" value={data?.pendingApplications || 0} icon={Clock} color="amber" />
        <StatCard title="Approved Loans" value={data?.approvedApplications || (activeRepayment ? 1 : 0)} icon={CheckCircle2} color="emerald" />
        <StatCard title="Requires Review" value={data?.requiresReviewApplications || 0} icon={AlertTriangle} color="purple" />
      </div>

      {/* Complete Application Timeline (Section 10) */}
      <div className="bg-white dark:bg-slate-800 p-6 sm:p-8 rounded-3xl border border-slate-200/80 dark:border-slate-700 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-700 pb-4">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center space-x-2">
              <Clock className="w-5 h-5 text-blue-600" />
              <span>Application Progress &amp; Underwriting Status</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Live status tracking for your latest loan application
            </p>
          </div>
          {latestApp && (
            <div className="flex items-center space-x-2">
              <span className="text-xs font-mono font-bold text-slate-400">LA-{10000 + latestApp.applicationId}</span>
              <StatusBadge status={latestApp.status} />
            </div>
          )}
        </div>

        {latestApp?.remarks && (
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs">
            <span className="font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider block mb-1">
              Officer / Underwriter Remarks:
            </span>
            <p className="text-slate-600 dark:text-slate-400 leading-relaxed font-medium">
              {latestApp.remarks}
            </p>
          </div>
        )}

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {getTimelineSteps().map((s) => (
            <div
              key={s.id}
              className={`p-4 rounded-2xl border flex flex-col items-center text-center transition ${
                s.isRejection
                  ? 'bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300'
                  : s.completed
                  ? 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200'
                  : s.current
                  ? 'bg-blue-50 dark:bg-blue-950/40 border-blue-400 dark:border-blue-600 text-blue-700 dark:text-blue-200 shadow-md ring-2 ring-blue-500/20'
                  : 'bg-slate-50 dark:bg-slate-900/60 border-slate-100 dark:border-slate-800 text-slate-400 opacity-70'
              }`}
            >
              <div
                className={`w-8 h-8 rounded-full font-black text-xs flex items-center justify-center mb-2.5 shadow-sm ${
                  s.isRejection
                    ? 'bg-rose-600 text-white'
                    : s.completed
                    ? 'bg-emerald-600 text-white'
                    : s.current
                    ? 'bg-blue-600 text-white animate-bounce'
                    : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-400'
                }`}
              >
                {s.isRejection ? <X className="w-4 h-4" /> : s.completed ? <Check className="w-4 h-4" /> : s.id}
              </div>
              <h4 className="text-xs font-bold leading-tight">{s.title}</h4>
              <p className="text-[10px] opacity-80 mt-1 leading-snug line-clamp-2">{s.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Applications List */}
      <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-200/80 dark:border-slate-700 shadow-sm p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-700 pb-3">
          <h3 className="text-base font-bold text-slate-900 dark:text-white">All Submitted Applications</h3>
          <Link to="/apply" className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline">
            + New Application
          </Link>
        </div>

        <div className="space-y-3">
          {data?.recentApplications?.length > 0 ? (
            data.recentApplications.map((app) => (
              <div
                key={app.applicationId}
                className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="font-bold text-sm text-slate-900 dark:text-white">{app.loanType}</span>
                    <span className="font-mono text-xs text-slate-400">LA-{10000 + app.applicationId}</span>
                  </div>
                  <div className="text-xs text-slate-500 mt-1">
                    Requested: <strong className="text-slate-700 dark:text-slate-300">₹{Number(app.requestedAmount).toLocaleString()}</strong> for {app.tenure} months on {app.applicationDate}
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <StatusBadge status={app.status} />
                  <Link
                    to={`/applications/${app.applicationId}`}
                    className="p-2 rounded-xl bg-blue-50 dark:bg-blue-950/50 text-blue-600 hover:bg-blue-100 transition"
                  >
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8 text-slate-400 text-sm">
              You haven't submitted any loan applications yet.{' '}
              <Link to="/apply" className="font-bold text-blue-600 underline">
                Apply now
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
