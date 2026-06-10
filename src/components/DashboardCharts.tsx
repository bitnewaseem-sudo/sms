import React from "react";
import { BarChart, Clock, RefreshCw, Activity, ArrowUpRight, ShieldCheck } from "lucide-react";
import { AuditLog } from "../types.js";

interface DashboardChartsProps {
  metrics: {
    activeInquiries: number;
    totalStudents: number;
    totalTeachers: number;
    totalBooks: number;
    revenueSummary: {
      totalInvoiced: number;
      totalCollected: number;
      outstandingDue: number;
    };
    avgAttendance: number;
  };
  auditLogs: AuditLog[];
  onRefresh: () => void;
  loading: boolean;
}

export default function DashboardCharts({ metrics, auditLogs, onRefresh, loading }: DashboardChartsProps) {
  // SVG Calculations for simple robust bar chart: Revenue vs Collected
  const target = metrics.revenueSummary.totalInvoiced || 1000;
  const collected = metrics.revenueSummary.totalCollected || 800;
  const outstanding = metrics.revenueSummary.outstandingDue || 200;

  const targetHeight = 120;
  const collectedHeight = Math.max(10, (collected / target) * 120);
  const outstandingHeight = Math.max(10, (outstanding / target) * 120);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6" id="dashboard-analytics-grid">
      {/* Metrics Section */}
      <div className="lg:col-span-2 space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-xs hover:border-blue-100 transition-all">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Treasury Revenue</p>
                <h3 className="text-2xl font-bold font-sans text-slate-800 mt-2">
                  ${collected.toLocaleString()}
                </h3>
                <p className="text-xs text-emerald-600 font-medium flex items-center mt-2">
                  <ArrowUpRight className="w-3.5 h-3.5 mr-0.5" />
                  Collected ({((collected/target)*100).toFixed(0)}%)
                </p>
              </div>
              <div className="bg-emerald-50 text-emerald-600 p-2.5 rounded-xl">
                <span className="text-lg font-bold font-mono">$</span>
              </div>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-xs hover:border-blue-100 transition-all">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Attendance Compliance</p>
                <h3 className="text-2xl font-bold font-sans text-slate-800 mt-2">
                  {metrics.avgAttendance}%
                </h3>
                <p className="text-xs text-indigo-600 font-medium flex items-center mt-2">
                  <Activity className="w-3.5 h-3.5 mr-0.5" />
                  Daily average mark rate
                </p>
              </div>
              <div className="bg-indigo-50 text-indigo-600 p-2.5 rounded-xl">
                <span className="text-sm font-bold font-sans text-indigo-650">AVG</span>
              </div>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-xs hover:border-blue-100 transition-all">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Pending Admissions</p>
                <h3 className="text-2xl font-bold font-sans text-slate-800 mt-2">
                  {metrics.activeInquiries}
                </h3>
                <p className="text-xs text-sky-600 font-medium flex items-center mt-2">
                  <Clock className="w-3.5 h-3.5 mr-0.5" />
                  Inquiries in review
                </p>
              </div>
              <div className="bg-sky-50 text-sky-600 p-2.5 rounded-xl">
                <span className="text-sm font-bold font-sans">INQ</span>
              </div>
            </div>
          </div>
        </div>

        {/* Dynamic Responsive SVG Financial & Attendance Trends */}
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-xs">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h4 className="text-sm font-semibold text-slate-800">Operational Invoicing & Attendance Balance</h4>
              <p className="text-xs text-slate-400 mt-0.5">Live real-time ledger distributions vs check-ins</p>
            </div>
            <button
              onClick={onRefresh}
              className="p-2 text-slate-400 hover:text-slate-650 hover:bg-slate-50 rounded-lg transition-all"
              title="Sync Charts Data"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Visualizer 1: Financial Ledger Stack */}
            <div className="bg-slate-50/50 p-4 rounded-xl border border-slate-100">
              <span className="text-xs font-semibold text-slate-500 uppercase block mb-3">Finance Ledger Status (USD)</span>
              <div className="h-[150px] flex items-end justify-around pb-2 border-b border-slate-200">
                {/* Column 1: Net Targets */}
                <div className="flex flex-col items-center w-12 group">
                  <div className="text-[10px] font-bold text-slate-500 mb-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    ${target}
                  </div>
                  <div className="w-8 bg-slate-300 rounded-t-md transition-all duration-550" style={{ height: `${targetHeight}px` }}></div>
                  <span className="text-[10px] text-slate-500 font-medium mt-1.5 block leading-tight text-center">Net Invoice</span>
                </div>

                {/* Column 2: Total Collected */}
                <div className="flex flex-col items-center w-12 group">
                  <div className="text-[10px] font-bold text-emerald-650 mb-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    ${collected}
                  </div>
                  <div className="w-8 bg-emerald-500 rounded-t-md transition-all duration-550" style={{ height: `${collectedHeight}px` }}></div>
                  <span className="text-[10px] text-slate-500 font-medium mt-1.5 block leading-tight text-center">Collected</span>
                </div>

                {/* Column 3: Unpaid Balance */}
                <div className="flex flex-col items-center w-12 group">
                  <div className="text-[10px] font-bold text-red-500 mb-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    ${outstanding}
                  </div>
                  <div className="w-8 bg-red-400 rounded-t-md transition-all duration-550" style={{ height: `${outstandingHeight}px` }}></div>
                  <span className="text-[10px] text-slate-500 font-medium mt-1.5 block leading-tight text-center">Arrears</span>
                </div>
              </div>
              <div className="flex justify-between items-center text-[10px] text-slate-400 mt-2 font-mono">
                <span>Targets Met: {((collected / target) * 100).toFixed(0)}%</span>
                <span>Audit Ref: SMS-V2</span>
              </div>
            </div>

            {/* Visualizer 2: Daily Attendance Spline Curve */}
            <div className="bg-slate-50/50 p-4 rounded-xl border border-slate-100">
              <span className="text-xs font-semibold text-slate-500 uppercase block mb-3">Attendance Trends</span>
              
              <div className="relative h-[150px] border-b border-slate-200">
                {/* Embedded Gridlines */}
                <div className="absolute left-0 right-0 top-1/4 border-t border-slate-205 border-dashed"></div>
                <div className="absolute left-0 right-0 top-2/4 border-t border-slate-205 border-dashed"></div>
                <div className="absolute left-0 right-0 top-3/4 border-t border-slate-205 border-dashed"></div>

                {/* SVG Curve Plotting */}
                <svg className="w-full h-full absolute inset-0 overflow-visible" preserveAspectRatio="none" viewBox="0 0 100 100">
                  <defs>
                    <linearGradient id="curveGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#6366f1" stopOpacity="0.25" />
                      <stop offset="100%" stopColor="#6366f1" stopOpacity="0.0" />
                    </linearGradient>
                  </defs>
                  
                  {/* Fill Area representing daily checkins */}
                  <path
                    d={`M 0,100 L 0,25 Q 30,15 50,40 T 100,20 L 100,100 Z`}
                    fill="url(#curveGrad)"
                  />
                  {/* Stroke Spline */}
                  <path
                    d={`M 0,25 Q 30,15 50,40 T 100,20`}
                    fill="none"
                    stroke="#4f46e5"
                    strokeWidth="3.5"
                    strokeLinecap="round"
                  />

                  {/* Nodes */}
                  <circle cx="0" cy="25" r="4" fill="#4f46e5" stroke="#ffffff" strokeWidth="1.5" />
                  <circle cx="50" cy="40" r="4" fill="#4f46e5" stroke="#ffffff" strokeWidth="1.5" />
                  <circle cx="100" cy="20" r="4" fill="#4f46e5" stroke="#ffffff" strokeWidth="1.5" />
                </svg>

                <div className="absolute left-1 top-2 bg-indigo-600 text-white text-[9px] font-mono rounded px-1 scale-90">
                  Peak: 96%
                </div>
              </div>
              <div className="flex justify-between text-[10px] text-slate-400 mt-2 font-sans">
                <span>Mon</span>
                <span>Wed</span>
                <span>Fri</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Corporate Audit Trails Logging Panel */}
      <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-xs flex flex-col h-full max-h-[380px] overflow-hidden">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
          <div>
            <h4 className="text-sm font-semibold text-slate-800 flex items-center">
              <ShieldCheck className="w-4 h-4 text-slate-500 mr-1.5" />
              Security Audit Trails
            </h4>
            <p className="text-[11px] text-slate-400 mt-0.5">Enterprise active tracking logger</p>
          </div>
          <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full font-mono font-medium uppercase">Live</span>
        </div>

        <div className="space-y-3.5 overflow-y-auto pr-1 flex-1 text-left scrollbar-thin">
          {auditLogs.length === 0 ? (
            <p className="text-xs text-slate-400 italic text-center py-8">No active security transactions logged.</p>
          ) : (
            auditLogs.map((log) => (
              <div key={log.id} className="text-xs border-b border-slate-50 pb-2.5 last:border-0 hover:bg-slate-50/50 p-1.5 rounded-lg transition-all">
                <div className="flex justify-between items-start">
                  <span className="font-semibold text-slate-700">{log.userName}</span>
                  <span className="text-[9px] text-slate-400 font-mono">
                    {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <div className="flex justify-between items-center mt-1">
                  <span className="bg-slate-100 text-[9px] text-slate-600 px-1.5 py-0.2 rounded font-mono uppercase font-bold scale-90 -translate-x-1">
                    {log.action}
                  </span>
                  <span className="text-[9px] text-slate-400 font-mono">
                    IP: {log.ipAddress || "127.0.0.1"}
                  </span>
                </div>
                <p className="text-slate-400 text-[10.5px] mt-1 italic leading-snug">
                  {log.details}
                </p>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
