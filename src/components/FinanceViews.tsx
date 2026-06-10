import React, { useState } from "react";
import { 
  DollarSign, FileText, Printer, Plus, AlertTriangle, ShieldCheck, 
  CreditCard, Eye, RefreshCw, Sparkles, CheckCircle 
} from "lucide-react";
import { User, Student, FeeInvoice } from "../types.js";

interface FinanceViewsProps {
  activeTab: string;
  currentUser: User;
  students: Student[];
  fees: FeeInvoice[];
  onRefreshAll: () => void;
  onCreateFeeInvoice: (payload: { studentId: string; category?: string; amount: number; discount?: number; dueDate?: string }) => Promise<void>;
  onPayFeeInvoice: (invoiceId: string, amount: number, method: string) => Promise<void>;
  onShowToast?: (message: string, type: "success" | "error" | "info") => void;
}

export default function FinanceViews({
  activeTab,
  currentUser,
  students,
  fees,
  onRefreshAll,
  onCreateFeeInvoice,
  onPayFeeInvoice,
  onShowToast
}: FinanceViewsProps) {
  // Accountant state
  const [invoiceOpen, setInvoiceOpen] = useState(false);
  const [selectedStudentId, setSelectedStudentId] = useState("u-student");
  const [feeCategory, setFeeCategory] = useState<any>("Monthly Fee");
  const [feeAmount, setFeeAmount] = useState(450);
  const [feeDisc, setFeeDisc] = useState(0);
  const [feeDue, setFeeDue] = useState("");

  // Payment portal state
  const [payingInvcId, setPayingInvcId] = useState<string | null>(null);
  const [payingAmount, setPayingAmount] = useState(0);
  const [payMethod, setPayMethod] = useState("Credit Card");
  const [cardNumber, setCardNumber] = useState("");
  const [cardHolder, setCardHolder] = useState("");
  const [processingPay, setProcessingPay] = useState(false);

  // Printing State
  const [printingInvoiceId, setPrintingInvoiceId] = useState<string | null>(null);

  // Search filter
  const [financeSearch, setFinanceSearch] = useState("");

  const handleCreateInvoiceSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!feeAmount) return;
    await onCreateFeeInvoice({
      studentId: selectedStudentId,
      category: feeCategory,
      amount: feeAmount,
      discount: feeDisc,
      dueDate: feeDue
    });
    setInvoiceOpen(false);
    setFeeAmount(450);
    setFeeDisc(0);
  };

  const handleProcessPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!payingInvcId || !payingAmount) return;
    setProcessingPay(true);
    try {
      await onPayFeeInvoice(payingInvcId, payingAmount, payMethod);
      if (onShowToast) {
        onShowToast("Tuition Fees payment cleared and recorded into academy ledger!", "success");
      } else {
        alert("Tuition Fees payment cleared and recorded into academy ledger!");
      }
      setPayingInvcId(null);
      setCardNumber("");
      setCardHolder("");
    } catch (err: any) {
      if (onShowToast) {
        onShowToast("Payment Error: " + err.message, "error");
      } else {
        alert("Payment Error: " + err.message);
      }
    } finally {
      setProcessingPay(false);
    }
  };

  const filteredFees = fees.filter(f => {
    const studentName = students.find(s => s.id === f.studentId)?.name || f.studentId;
    return studentName.toLowerCase().includes(financeSearch.toLowerCase()) || 
           f.invoiceNumber.toLowerCase().includes(financeSearch.toLowerCase()) ||
           f.status.toLowerCase().includes(financeSearch.toLowerCase());
  });

  if (activeTab === "fees") {
    const isAccountant = ["ADMIN", "SUPER_ADMIN", "ACCOUNTANT"].includes(currentUser.role);
    const defaultersList = fees.filter(f => f.status !== "Paid" && new Date(f.dueDate) < new Date());

    return (
      <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-xs text-left" id="finance-ledger-panel">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-slate-100 pb-4 mb-6 gap-4">
          <div>
            <h3 className="text-base font-bold text-slate-800">Tuition Accounts & Finance Ledger</h3>
            <p className="text-xs text-slate-400 mt-0.5">Publish scholar billings, review outstanding balances, and clear transactions</p>
          </div>
          <div className="flex items-center gap-2.5">
            <input
              type="text"
              placeholder="Search invoice no, student name..."
              value={financeSearch}
              onChange={(e) => setFinanceSearch(e.target.value)}
              className="text-xs border border-slate-200 rounded-xl px-3.5 py-2 w-44 sm:w-56 focus:outline-none focus:border-indigo-500 bg-slate-50/50"
            />
            {isAccountant && (
              <button
                onClick={() => setInvoiceOpen(true)}
                className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold px-4 py-2 rounded-xl transition flex items-center shadow-xs cursor-pointer"
              >
                <Plus className="w-4 h-4 mr-1" /> Issue Invoice
              </button>
            )}
          </div>
        </div>

        {invoiceOpen && (
          <div className="bg-slate-50 p-5 rounded-2xl border border-slate-150 mb-6 animate-fadeIn text-xs">
            <h4 className="text-sm font-bold text-slate-800 mb-3">Publish Outstanding Student Tuition Invoice</h4>
            <form onSubmit={handleCreateInvoiceSubmit} className="grid grid-cols-1 sm:grid-cols-4 gap-4">
              <div>
                <label className="block text-[11px] font-semibold text-slate-500 mb-1">Target Scholar</label>
                <select 
                  value={selectedStudentId} 
                  onChange={(e) => setSelectedStudentId(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-lg p-2 font-sans"
                >
                  {students.map(s => <option key={s.id} value={s.id}>{s.name} ({s.rollNumber})</option>)}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-500 mb-1">Fee Category Type</label>
                <select 
                  value={feeCategory} 
                  onChange={(e) => setFeeCategory(e.target.value)}
                  className="w-full bg-white border border-slate-200 p-2 rounded-lg font-sans"
                >
                  <option value="Admission Fee">Admission Fee</option>
                  <option value="Monthly Fee">Monthly Tuition Fee</option>
                  <option value="Annual Charges">Annual Facility Fee</option>
                  <option value="Exam Fee">Term Examination Fee</option>
                  <option value="Library Fee">Library Fine Fee</option>
                  <option value="Activity Fee">Extracurricular Activity Fee</option>
                  <option value="Fine Charges">Administrative Penalties Fine</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-500 mb-1">Fee Base Amount ($)</label>
                <input 
                  type="number" 
                  required
                  value={feeAmount}
                  onChange={(e) => setFeeAmount(Number(e.target.value))}
                  className="w-full bg-white border border-slate-205 rounded-lg p-2 font-mono"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-500 mb-1">Scholarship / Discount ($)</label>
                <input 
                  type="number" 
                  value={feeDisc}
                  onChange={(e) => setFeeDisc(Number(e.target.value))}
                  className="w-full bg-white border border-slate-205 rounded-lg p-2 font-mono"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-[11px] font-semibold text-slate-500 mb-1">Invoice Due Date</label>
                <input 
                  type="date" 
                  value={feeDue}
                  onChange={(e) => setFeeDue(e.target.value)}
                  className="w-full bg-white border border-slate-205 rounded-lg p-2 font-mono"
                />
              </div>

              <div className="sm:col-span-4 flex justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setInvoiceOpen(false)}
                  className="text-slate-500 hover:bg-slate-100 p-2 rounded-md"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-indigo-600 text-white font-bold p-2 px-4 rounded-md hover:bg-indigo-750 transition"
                >
                  Publish Invoice Billings
                </button>
              </div>
            </form>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Main invoice table */}
          <div className="lg:col-span-3 overflow-x-auto">
            <table className="w-full text-xs text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 text-slate-400 font-semibold bg-slate-50/50">
                  <th className="py-3 px-4">Invoice Number</th>
                  <th className="py-3 px-4">Student Name</th>
                  <th className="py-3 px-4">Billing Month</th>
                  <th className="py-3 px-4 text-right">Net Amount</th>
                  <th className="py-3 px-4 text-center">Invoiced Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredFees.map(f => {
                  const student = students.find(s => s.id === f.studentId);
                  const stName = student ? student.name : f.studentId;
                  return (
                    <tr key={f.id} className="border-b border-slate-50 hover:bg-slate-50/50 transition-all">
                      <td className="py-3.5 px-4 font-bold font-mono text-slate-650">{f.invoiceNumber}</td>
                      <td className="py-3.5 px-4 font-semibold text-slate-800">
                        {stName}
                        <span className="block text-[10px] text-slate-400 font-normal">{f.category}</span>
                      </td>
                      <td className="py-3.5 px-4 text-slate-500 font-mono">{f.month} {f.year}</td>
                      <td className="py-3.5 px-4 text-right font-mono font-bold text-slate-800">${f.netAmount}</td>
                      <td className="py-3.5 px-4 text-center">
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider
                          ${f.status === "Paid" ? "bg-emerald-50 text-emerald-700 border border-emerald-100" : ""}
                          ${f.status === "Unpaid" ? "bg-red-50 text-red-700 border border-red-100 animate-pulse" : ""}
                          ${f.status === "Partial" ? "bg-amber-50 text-amber-700 border border-amber-100" : ""}
                        `}>
                          {f.status}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex justify-end gap-2 text-slate-400">
                          <button
                            onClick={() => {
                              setPayingInvcId(f.id);
                              setPayingAmount(f.netAmount - f.paidAmount);
                            }}
                            disabled={f.status === "Paid"}
                            className="p-1 px-2.5 bg-slate-50 hover:bg-indigo-50 hover:text-indigo-700 text-[10.5px] border border-slate-150 rounded font-semibold transition disabled:opacity-45 uppercase cursor-pointer"
                          >
                            Pay Bill
                          </button>
                          <button
                            onClick={() => setPrintingInvoiceId(f.id)}
                            className="p-1 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded transition"
                            title="Receipt Details File"
                          >
                            <Printer className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Side panel: Defaulters analytics */}
          <div className="bg-slate-50/50 p-5 rounded-2xl border border-slate-150">
            <h4 className="text-xs font-bold text-slate-600 uppercase tracking-widest mb-4 flex items-center">
              <AlertTriangle className="w-4.5 h-4.5 text-amber-500 mr-2 shrink-0 animate-bounce" />
              Overdue tuition Delinquency ({defaultersList.length})
            </h4>

            {defaultersList.length === 0 ? (
              <p className="text-xs text-slate-400 italic text-center py-6">All tuition invoices settled within active guidelines!</p>
            ) : (
              <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
                {defaultersList.map(df => {
                  const nameStr = students.find(s => s.id === df.studentId)?.name || df.studentId;
                  return (
                    <div key={df.id} className="text-xs border-b border-slate-100 pb-2 bg-white p-2.5 rounded-xl border">
                      <div className="flex justify-between font-semibold">
                        <span className="text-slate-800">{nameStr}</span>
                        <span className="text-red-500 font-mono font-bold">${df.netAmount - df.paidAmount} due</span>
                      </div>
                      <p className="text-[10px] text-slate-400 font-mono mt-1 mt-0.5">Period: {df.month} {df.year} | Invoice: {df.invoiceNumber}</p>
                      <p className="text-[10px] text-red-400 mt-1">Due Date: <strong>{df.dueDate}</strong></p>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Payment Billing Drawer modal */}
        {payingInvcId && (() => {
          const targetInvc = fees.find(f => f.id === payingInvcId);
          if (!targetInvc) return null;

          return (
            <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
              <div className="bg-white rounded-2xl border border-slate-150 p-6 max-w-md w-full shadow-2xl space-y-4 text-xs font-sans">
                <div className="flex justify-between items-center border-b border-slate-100 pb-2 mb-2">
                  <h4 className="text-sm font-bold text-slate-800 flex items-center">
                    <CreditCard className="w-4.5 h-4.5 text-indigo-600 mr-1.5" />
                    Secure Payment Gateway
                  </h4>
                  <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-mono font-bold uppercase">SSL TLS Active</span>
                </div>

                <div className="bg-slate-50 p-3 rounded-lg border border-slate-150 space-y-1 text-left font-mono text-[11px] text-slate-550">
                  <p>Settlement Invoice: <strong>{targetInvc.invoiceNumber}</strong></p>
                  <p>Accounting Categories: <strong>{targetInvc.category}</strong></p>
                  <p>Invoiced Net Charges: <strong>${targetInvc.netAmount}</strong></p>
                  <p>Current Unpaid Arrears: <strong className="text-red-500">${targetInvc.netAmount - targetInvc.paidAmount}</strong></p>
                </div>

                <form onSubmit={handleProcessPayment} className="space-y-3.5">
                  <div className="grid grid-cols-2 gap-3 text-left">
                    <div>
                      <label className="block text-[10px] font-semibold text-slate-500 mb-1">Clearing Method</label>
                      <select
                        value={payMethod}
                        onChange={(e) => setPayMethod(e.target.value)}
                        className="w-full text-xs bg-white border border-slate-205 rounded-lg p-2 font-sans focus:outline-none"
                      >
                        <option value="Credit Card">Credit Card</option>
                        <option value="Bank Transfer">Direct Bank Wire</option>
                        <option value="Cash / Hand">Cash Desk Settlement</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[10px] font-semibold text-slate-500 mb-1">Payment Amount ($)</label>
                      <input
                        type="number"
                        min="1"
                        max={targetInvc.netAmount - targetInvc.paidAmount}
                        value={payingAmount}
                        onChange={(e) => setPayingAmount(Number(e.target.value))}
                        className="w-full text-xs bg-white border border-slate-205 rounded-lg p-2 font-mono font-bold text-slate-700"
                      />
                    </div>
                  </div>

                  {payMethod !== "Cash / Hand" && (
                    <div className="space-y-2.5 text-left animate-fadeIn">
                      <div>
                        <label className="block text-[10px] font-semibold text-slate-500 mb-0.5 font-sans">Card / Account Wiring Number</label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. 4111 2222 3333 4444"
                          value={cardNumber}
                          onChange={(e) => setCardNumber(e.target.value)}
                          className="w-full border border-slate-200 rounded-lg p-2 font-mono text-xs focus:outline-none focus:border-indigo-500 text-slate-650"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-semibold text-slate-500 mb-0.5">Card Holder Master Account Name</label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. Robert Smith"
                          value={cardHolder}
                          onChange={(e) => setCardHolder(e.target.value)}
                          className="w-full border border-slate-200 rounded-lg p-2 font-sans text-xs focus:outline-none text-slate-650"
                        />
                      </div>
                    </div>
                  )}

                  <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                    <button
                      type="button"
                      onClick={() => setPayingInvcId(null)}
                      className="text-slate-500 hover:bg-slate-50 px-3.5 py-2 rounded-lg transition"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={processingPay}
                      className="bg-indigo-600 font-bold hover:bg-indigo-750 text-white px-5 py-2 rounded-lg transition shadow-xs cursor-pointer select-none"
                    >
                      {processingPay ? "Authorizing Clearing..." : "Confirm Ledger Clearance"}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          );
        })()}

        {/* Printable Receipt Window Modal */}
        {printingInvoiceId && (() => {
          const receipt = fees.find(f => f.id === printingInvoiceId);
          if (!receipt) return null;
          const studentInfo = students.find(s => s.id === receipt.studentId);

          return (
            <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
              <div className="bg-white rounded-3xl border border-slate-150 p-6 max-w-sm w-full shadow-2xl relative space-y-4 text-xs font-mono text-slate-700 bg-linear-to-b from-white to-slate-50 border-4 border-slate-200">
                <div className="text-center space-y-1 pt-3">
                  <span className="text-slate-500 font-bold block text-[10.5px]">OAKRIDGE ACADEMY REVENUE</span>
                  <p className="text-[9.5px] text-slate-400">44 Baker Street, London Office</p>
                  <p className="text-[11px] font-bold text-slate-800 border-y border-dashed border-slate-200 py-1 uppercase mt-2">TUITION CLEARANCE RECEIPT</p>
                </div>

                <div className="space-y-1.5 text-left border-b border-dashed border-slate-200 pb-3">
                  <p>InvoNo: <span className="font-bold text-slate-850">{receipt.invoiceNumber}</span></p>
                  <p>Scholar: <span>{studentInfo?.name || receipt.studentId}</span></p>
                  <p>Roll No: <span>{studentInfo?.rollNumber || "—"}</span></p>
                  <p>Date Generated: <span>{receipt.dueDate}</span></p>
                </div>

                <div className="space-y-1 bg-slate-100 p-2.5 rounded-lg text-left">
                  <div className="flex justify-between">
                    <span>Base Tuition</span>
                    <span>${receipt.amount}</span>
                  </div>
                  <div className="flex justify-between text-emerald-650">
                    <span>Discount Scholarship</span>
                    <span>-${receipt.discount}</span>
                  </div>
                  <div className="flex justify-between text-yellow-650">
                    <span>Fine Late Surcharge</span>
                    <span>+${receipt.fine}</span>
                  </div>
                  <div className="flex justify-between border-t border-slate-200 pt-1 font-bold text-slate-850 mt-1">
                    <span>Net Amount billed</span>
                    <span>${receipt.netAmount}</span>
                  </div>
                  <div className="flex justify-between border-t border-dashed border-slate-200 pt-1 font-bold text-emerald-705 mt-1.5">
                    <span>Cleared Collections</span>
                    <span>${receipt.paidAmount}</span>
                  </div>
                </div>

                <div className="text-[11px] border-y border-dashed border-slate-250 py-2 font-bold uppercase text-center text-slate-850">
                  Bill Ledger Status: <span className="text-emerald-700 font-sans tracking-wide">{receipt.status}</span>
                </div>

                <div className="text-[9px] text-slate-400 leading-snug italic text-center pb-3">
                  Thank you for your timely co-operation. System balance synchronizations established correctly.
                </div>

                <div className="flex justify-end gap-2.5 no-print">
                  <button 
                    onClick={() => setPrintingInvoiceId(null)}
                    className="text-[11px] text-slate-500 px-3 py-1.5 hover:bg-slate-100 rounded border transition"
                  >
                    Close
                  </button>
                  <button 
                    onClick={() => window.print()}
                    className="bg-slate-800 text-white font-bold px-4 py-1.5 rounded transition text-[11px]"
                  >
                    Print Receipt
                  </button>
                </div>
              </div>
            </div>
          );
        })()}
      </div>
    );
  }

  return null;
}
