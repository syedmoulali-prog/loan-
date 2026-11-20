import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axiosConfig';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { 
  Check, ArrowRight, ArrowLeft, Upload, FileText, 
  CreditCard, DollarSign, Calendar, ShieldCheck, User 
} from 'lucide-react';

export const LoanApplicationForm = () => {
  const { user } = useAuth();
  const { success, error } = useToast();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [customer, setCustomer] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    customerId: user?.customerId || 1,
    loanType: 'Personal Loan',
    requestedAmount: 500000,
    tenure: 60,
    applicationDate: new Date().toISOString().split('T')[0],
    remarks: '',

    // Financial Step
    monthlyIncome: 85000,
    monthlyExpenses: 25000,
    existingObligations: 10000,
    creditInformation: 'EXCELLENT',

    // Document Step
    documentType: 'Identity Document',
    documentFileName: 'Identity_Proof_Passport.pdf',
  });

  const customerId = user?.customerId || 1;

  useEffect(() => {
    const fetchCustomer = async () => {
      try {
        const res = await api.get(`/customers/${customerId}`);
        setCustomer(res.data);
      } catch (err) {
        console.error('Customer fetch error', err);
      }
    };
    if (customerId) {
      fetchCustomer();
    }
  }, [customerId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      setFormData(prev => ({ ...prev, documentFileName: file.name }));
    }
  };

  const validateStep = () => {
    if (step === 1) {
      if (!formData.requestedAmount || Number(formData.requestedAmount) < 1000) {
        error('Requested loan amount must be at least ₹1,000');
        return false;
      }
      if (!formData.tenure || Number(formData.tenure) < 6) {
        error('Loan tenure must be at least 6 months');
        return false;
      }
    }
    if (step === 2) {
      if (!formData.monthlyIncome || Number(formData.monthlyIncome) <= 0) {
        error('Monthly income must be greater than zero');
        return false;
      }
    }
    return true;
  };

  const nextStep = () => {
    if (validateStep()) {
      setStep((prev) => Math.min(4, prev + 1));
    }
  };

  const prevStep = () => {
    setStep((prev) => Math.max(1, prev - 1));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = {
        customerId: customerId,
        loanType: formData.loanType,
        requestedAmount: Number(formData.requestedAmount),
        tenure: Number(formData.tenure),
        applicationDate: formData.applicationDate,
        remarks: formData.remarks || 'Application submitted via online portal',
        monthlyIncome: Number(formData.monthlyIncome),
        monthlyExpenses: Number(formData.monthlyExpenses),
        existingObligations: Number(formData.existingObligations),
        creditInformation: formData.creditInformation,
      };

      const res = await api.post('/applications', payload);
      const newAppId = res.data.applicationId;

      // Upload document if available
      try {
        const docData = new FormData();
        docData.append('documentType', formData.documentType);
        if (selectedFile) {
          docData.append('file', selectedFile);
        }
        await api.post(`/applications/${newAppId}/documents?documentType=${encodeURIComponent(formData.documentType)}`, docData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      } catch (docErr) {
        console.warn('Document attach warning', docErr);
      }

      success('Loan application submitted successfully! Status: SUBMITTED');
      navigate(`/applications/${newAppId}`);
    } catch (err) {
      error(err.response?.data?.message || 'Failed to submit loan application');
    } finally {
      setLoading(false);
    }
  };

  const stepsList = [
    'Step 1: Loan Information',
    'Step 2: Financial Information',
    'Step 3: Documents',
    'Step 4: Review & Submit',
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
          + Apply For Loan
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Complete the 4-step loan application form to request financing.
        </p>
      </div>

      {/* Stepper Progress Bar */}
      <div className="bg-white dark:bg-slate-800 p-4 sm:p-6 rounded-3xl border border-slate-200/80 dark:border-slate-700 shadow-sm">
        <div className="flex items-center justify-between">
          {stepsList.map((st, idx) => {
            const stepNum = idx + 1;
            const isCompleted = step > stepNum;
            const isCurrent = step === stepNum;
            return (
              <div key={idx} className="flex-1 flex flex-col items-center relative">
                <div
                  className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs transition-all ${
                    isCompleted
                      ? 'bg-emerald-500 text-white'
                      : isCurrent
                      ? 'bg-blue-600 text-white ring-4 ring-blue-100 dark:ring-blue-900/50'
                      : 'bg-slate-100 dark:bg-slate-700 text-slate-400'
                  }`}
                >
                  {isCompleted ? <Check className="w-4 h-4" /> : stepNum}
                </div>
                <span className="text-[11px] font-semibold text-slate-600 dark:text-slate-400 mt-2 hidden sm:block text-center">
                  {st}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Form Card */}
      <div className="bg-white dark:bg-slate-800 p-6 sm:p-10 rounded-3xl border border-slate-200/80 dark:border-slate-700 shadow-sm">
        {/* STEP 1: Loan Information */}
        {step === 1 && (
          <div className="space-y-6">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-700 pb-3 flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-blue-600" />
              Step 1 — Loan Information
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-2">Loan Type</label>
                <select
                  name="loanType"
                  value={formData.loanType}
                  onChange={handleChange}
                  className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm font-semibold"
                >
                  <option value="Personal Loan">Personal Loan</option>
                  <option value="Education Loan">Education Loan</option>
                  <option value="Home Loan">Home Loan</option>
                  <option value="Vehicle Loan">Vehicle Loan</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-2">Requested Amount (₹)</label>
                <input
                  type="number"
                  name="requestedAmount"
                  min="1000"
                  step="5000"
                  required
                  value={formData.requestedAmount}
                  onChange={handleChange}
                  className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm font-semibold font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-2">Tenure (Months)</label>
                <input
                  type="number"
                  name="tenure"
                  min="6"
                  max="360"
                  required
                  value={formData.tenure}
                  onChange={handleChange}
                  className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm font-semibold font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-2">Application Date</label>
                <input
                  type="date"
                  name="applicationDate"
                  value={formData.applicationDate}
                  onChange={handleChange}
                  className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm font-semibold"
                />
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900 text-xs text-blue-700 dark:text-blue-300">
              Note: Loan types are application categories only and are processed under uniform configurable administrative rules.
            </div>
          </div>
        )}

        {/* STEP 2: Financial Information */}
        {step === 2 && (
          <div className="space-y-6">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-700 pb-3 flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-blue-600" />
              Step 2 — Financial Information
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-2">Monthly Income (₹)</label>
                <input
                  type="number"
                  name="monthlyIncome"
                  min="1"
                  required
                  value={formData.monthlyIncome}
                  onChange={handleChange}
                  className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm font-semibold font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-2">Monthly Expenses (₹)</label>
                <input
                  type="number"
                  name="monthlyExpenses"
                  min="0"
                  required
                  value={formData.monthlyExpenses}
                  onChange={handleChange}
                  className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm font-semibold font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-2">Existing Obligations (₹)</label>
                <input
                  type="number"
                  name="existingObligations"
                  min="0"
                  required
                  value={formData.existingObligations}
                  onChange={handleChange}
                  className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm font-semibold font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-2">Credit Information</label>
                <select
                  name="creditInformation"
                  value={formData.creditInformation}
                  onChange={handleChange}
                  className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm font-semibold"
                >
                  <option value="EXCELLENT">EXCELLENT (Score 750+)</option>
                  <option value="GOOD">GOOD (Score 700 - 749)</option>
                  <option value="FAIR">FAIR (Score 650 - 699)</option>
                  <option value="POOR">POOR (Score &lt; 650)</option>
                </select>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs flex justify-between items-center">
              <div>
                <span className="font-bold text-slate-700 dark:text-slate-300">Debt-to-Income (DTI) Ratio: </span>
                <span className="text-slate-500">(Obligations + Expenses) / Income</span>
              </div>
              <span className="font-mono font-bold text-sm text-blue-600 dark:text-blue-400">
                {formData.monthlyIncome > 0
                  ? (((Number(formData.existingObligations) + Number(formData.monthlyExpenses)) / Number(formData.monthlyIncome)) * 100).toFixed(2)
                  : 0}%
              </span>
            </div>
          </div>
        )}

        {/* STEP 3: Documents */}
        {step === 3 && (
          <div className="space-y-6">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-700 pb-3 flex items-center gap-2">
              <FileText className="w-5 h-5 text-blue-600" />
              Step 3 — Documents
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-2">Document Type</label>
                <select
                  name="documentType"
                  value={formData.documentType}
                  onChange={handleChange}
                  className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm font-semibold"
                >
                  <option value="Identity Document">Identity Document (Passport / Aadhar / Driving License)</option>
                  <option value="Address Proof">Address Proof (Utility Bill / Lease)</option>
                  <option value="Income Proof">Income Proof (Salary Slips / Bank Statement)</option>
                  <option value="Other Supporting Document">Other Supporting Document</option>
                </select>
              </div>

              <div 
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-2xl p-8 text-center bg-slate-50 dark:bg-slate-900 cursor-pointer hover:border-blue-500 dark:hover:border-blue-400 transition"
              >
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handleFileChange} 
                  className="hidden" 
                  accept=".pdf,.jpg,.jpeg,.png"
                />
                <Upload className="w-10 h-10 text-blue-500 mx-auto mb-3" />
                <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                  Document file: <strong className="text-blue-600 font-mono">{formData.documentFileName}</strong>
                </p>
                <p className="text-xs text-slate-400 mt-1">PDF, JPG, PNG up to 10MB accepted</p>
                <button
                  type="button"
                  className="mt-4 px-4 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold hover:bg-slate-100 dark:hover:bg-slate-700 transition"
                >
                  {selectedFile ? 'Change File' : 'Browse Local File'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* STEP 4: Review */}
        {step === 4 && (
          <div className="space-y-6">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-700 pb-3 flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-600" />
              Step 4 — Review &amp; Submit
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 space-y-2">
                <div className="text-xs font-bold text-slate-400 uppercase">Customer Information</div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Applicant:</span>
                  <span className="font-bold text-slate-900 dark:text-white">{customer?.name || user?.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Email:</span>
                  <span className="font-semibold text-slate-900 dark:text-white">{customer?.email || user?.email}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Phone:</span>
                  <span className="font-semibold text-slate-900 dark:text-white">{customer?.phone || '9876543210'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Employment:</span>
                  <span className="font-semibold text-slate-900 dark:text-white">{customer?.employmentType || 'Salaried'}</span>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 space-y-2">
                <div className="text-xs font-bold text-slate-400 uppercase">Loan Information</div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Loan Type:</span>
                  <span className="font-bold text-slate-900 dark:text-white">{formData.loanType}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Requested Amount:</span>
                  <span className="font-mono font-bold text-blue-600 dark:text-blue-400">₹{Number(formData.requestedAmount).toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Tenure:</span>
                  <span className="font-bold text-slate-900 dark:text-white">{formData.tenure} months</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Application Date:</span>
                  <span className="font-bold text-slate-900 dark:text-white">{formData.applicationDate}</span>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 space-y-2">
                <div className="text-xs font-bold text-slate-400 uppercase">Financial Information</div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Monthly Income:</span>
                  <span className="font-mono font-bold text-slate-900 dark:text-white">₹{Number(formData.monthlyIncome).toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Monthly Expenses:</span>
                  <span className="font-mono font-bold text-slate-900 dark:text-white">₹{Number(formData.monthlyExpenses).toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Existing Obligations:</span>
                  <span className="font-mono font-bold text-slate-900 dark:text-white">₹{Number(formData.existingObligations).toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Credit Rating:</span>
                  <span className="font-bold text-emerald-600 dark:text-emerald-400">{formData.creditInformation}</span>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 space-y-2">
                <div className="text-xs font-bold text-slate-400 uppercase">Documents Attached</div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Type:</span>
                  <span className="font-bold text-slate-900 dark:text-white">{formData.documentType}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">File:</span>
                  <span className="font-mono text-xs text-blue-600 dark:text-blue-400 truncate max-w-[180px]">{formData.documentFileName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Status:</span>
                  <span className="font-semibold text-amber-600 dark:text-amber-400">PENDING_VERIFICATION</span>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-2">Remarks / Notes</label>
              <textarea
                name="remarks"
                value={formData.remarks}
                onChange={handleChange}
                rows={2}
                placeholder="Optional notes or declarations regarding loan purpose..."
                className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm"
              ></textarea>
            </div>
          </div>
        )}

        {/* Wizard Controls */}
        <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-700 flex justify-between items-center">
          {step > 1 ? (
            <button
              type="button"
              onClick={prevStep}
              className="px-5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold hover:bg-slate-50 dark:hover:bg-slate-750 transition flex items-center space-x-2"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Previous</span>
            </button>
          ) : (
            <div></div>
          )}

          {step < 4 ? (
            <button
              type="button"
              onClick={nextStep}
              className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition flex items-center space-x-2 shadow-md shadow-blue-500/20"
            >
              <span>Next Step</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleSubmit}
              disabled={loading}
              className="px-8 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold transition flex items-center space-x-2 shadow-lg shadow-emerald-500/25 disabled:opacity-50"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <>
                  <Check className="w-4 h-4" />
                  <span>SUBMIT APPLICATION</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
