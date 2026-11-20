import React from 'react';
import { Link } from 'react-router-dom';
import { 
  ShieldCheck, CheckCircle2, FileText, BarChart3, 
  Lock, ArrowRight, Sparkles, Building2, Layers, Cpu, Award
} from 'lucide-react';

export const LandingPage = () => {
  const steps = [
    { num: '01', title: 'Register', desc: 'Create your customer account securely in seconds.' },
    { num: '02', title: 'Apply for Loan', desc: 'Select loan type, requested amount, and desired tenure.' },
    { num: '03', title: 'Financial Details', desc: 'Provide monthly income, expenses, and existing obligations.' },
    { num: '04', title: 'Submit Documents', desc: 'Upload required identity and income proofs.' },
    { num: '05', title: 'Eligibility Evaluation', desc: 'Automated evaluation against configurable active credit rules.' },
    { num: '06', title: 'Staff Review', desc: 'Loan officers verify documents and validate information.' },
    { num: '07', title: 'Decision & Status', desc: 'Reviewers record final decision with complete audit trail.' },
  ];

  const features = [
    { icon: Cpu, title: 'Configurable Rules Engine', desc: 'Dynamic rule-based eligibility calculation without hard-coded criteria.' },
    { icon: ShieldCheck, title: 'Role-Based Access Control', desc: 'Strict RBAC security tailored for Admin, Staff, Reviewers, and Customers.' },
    { icon: FileText, title: 'Document Verification', desc: 'Centralized document lifecycle tracking with officer sign-off.' },
    { icon: BarChart3, title: 'Real-time Analytics', desc: 'Live dashboard statistics, loan volume distributions, and trend reporting.' },
    { icon: Lock, title: 'Enterprise JWT Security', desc: 'Industry-standard JWT authentication and BCrypt password encryption.' },
    { icon: Layers, title: 'Complete Audit Trail', desc: 'Comprehensive logging of all logins, evaluations, and administrative changes.' },
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 transition-colors">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-16 pb-24 lg:pt-28 lg:pb-36">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <div className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full bg-blue-100 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300 text-xs sm:text-sm font-semibold mb-8">
            <Sparkles className="w-4 h-4" />
            <span>Next-Generation Banking & Credit Evaluation</span>
          </div>

          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-slate-900 dark:text-white max-w-4xl mx-auto leading-tight">
            CUSTOMER LOAN <br className="hidden sm:inline" />
            <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              ELIGIBILITY SYSTEM
            </span>
          </h1>

          <p className="mt-6 text-lg sm:text-xl text-slate-600 dark:text-slate-300 max-w-2xl mx-auto leading-relaxed">
            Evaluate loan applications faster, consistently, and securely with our configurable active rule engine and role-based underwriting workflows.
          </p>

          <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
            <Link
              to="/apply"
              className="px-7 py-3.5 rounded-xl font-bold text-white bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-500/25 transition-all transform hover:-translate-y-0.5 flex items-center space-x-2"
            >
              <span>APPLY FOR LOAN</span>
              <ArrowRight className="w-5 h-5" />
            </Link>
            <Link
              to="/dashboard/admin"
              className="px-7 py-3.5 rounded-xl font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-500/25 transition-all transform hover:-translate-y-0.5 flex items-center space-x-2"
            >
              <ShieldCheck className="w-5 h-5" />
              <span>ADMINISTRATOR PORTAL</span>
            </Link>
            <Link
              to="/login"
              className="px-7 py-3.5 rounded-xl font-bold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-750 shadow-sm transition"
            >
              LOGIN
            </Link>
            <Link
              to="/register"
              className="px-7 py-3.5 rounded-xl font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/50 hover:bg-blue-100 border border-blue-200 dark:border-blue-900 transition"
            >
              REGISTER
            </Link>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20 bg-white dark:bg-slate-800/60 border-y border-slate-200/80 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white">Enterprise Features</h2>
            <p className="mt-3 text-slate-500 dark:text-slate-400">Everything financial institutions need to streamline credit assessment.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feat, idx) => {
              const Icon = feat.icon;
              return (
                <div key={idx} className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200/70 dark:border-slate-800 hover:border-blue-500 dark:hover:border-blue-500 transition-all shadow-sm">
                  <div className="w-12 h-12 rounded-xl bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400 flex items-center justify-center mb-5">
                    <Icon className="w-6 h-6" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">{feat.title}</h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">{feat.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* How It Works (7 Steps) */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white">How It Works</h2>
            <p className="mt-3 text-slate-500 dark:text-slate-400">From customer registration to final underwriter decision in 7 transparent steps.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {steps.map((st, i) => (
              <div key={st.num} className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200/80 dark:border-slate-700/60 shadow-sm relative overflow-hidden">
                <span className="text-4xl font-black text-blue-100 dark:text-slate-700/50 absolute top-4 right-4">{st.num}</span>
                <h4 className="text-base font-bold text-slate-900 dark:text-white mt-4 mb-2">{st.title}</h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">{st.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-200 dark:border-slate-800 py-10 bg-white dark:bg-slate-900 text-center text-sm text-slate-500 dark:text-slate-400">
        <p>© 2026 Customer Loan Eligibility System. Built with React, Spring Boot, MySQL, and JWT.</p>
      </footer>
    </div>
  );
};
