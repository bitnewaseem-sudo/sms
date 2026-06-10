import React, { useState, useEffect } from "react";
import { 
  Users, GraduationCap, Building2, BookOpen, Calendar, Clock, DollarSign, 
  CheckCircle, AlertTriangle, FileText, ClipboardList, BookMarked, 
  MessageSquare, Send, Bell, Settings, Award, Shield, Key, Download, 
  Upload, Eye, Plus, ShieldCheck, Mail, LogOut, Check, X, RefreshCw, BarChart3, HelpCircle,
  UserCheck
} from "lucide-react";

import { User, UserRole, AdmissionInquiry, Student, Parent, Teacher, ClassSection, Subject, Homework, FeeInvoice, Book, BookTransaction, Announcement, PrivateMessage, Certificate, BackupRecord, AuditLog, Examination, MarkRecord } from "./types.js";
import * as api from "./utils/api.js";

// Import Modular Components
import DashboardCharts from "./components/DashboardCharts.js";
import AdminViews from "./components/AdminViews.js";
import TeacherViews from "./components/TeacherViews.js";
import AcademicViews from "./components/AcademicViews.js";
import FinanceViews from "./components/FinanceViews.js";
import LibraryViews from "./components/LibraryViews.js";

export default function App() {
  // Global authenticated user state
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [simLoading, setSimLoading] = useState(false);
  const [simError, setSimError] = useState("");

  // Primary Workspace View State
  const [currentTab, setCurrentTab] = useState("dashboard");

  // Domain Lists State
  const [users, setUsers] = useState<User[]>([]);
  const [admissions, setAdmissions] = useState<AdmissionInquiry[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [parents, setParents] = useState<Parent[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [classes, setClasses] = useState<ClassSection[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [timetables, setTimetables] = useState<any[]>([]);
  const [attendance, setAttendance] = useState<any[]>([]);
  const [examinations, setExaminations] = useState<Examination[]>([]);
  const [marks, setMarks] = useState<MarkRecord[]>([]);
  const [homework, setHomework] = useState<Homework[]>([]);
  const [fees, setFees] = useState<FeeInvoice[]>([]);
  const [books, setBooks] = useState<Book[]>([]);
  const [bookTransactions, setBookTransactions] = useState<BookTransaction[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [messages, setMessages] = useState<PrivateMessage[]>([]);
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [backups, setBackups] = useState<BackupRecord[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [metrics, setMetrics] = useState<any>({
    activeInquiries: 0,
    totalStudents: 0,
    totalTeachers: 0,
    totalBooks: 0,
    revenueSummary: { totalInvoiced: 0, totalCollected: 0, outstandingDue: 0 },
    avgAttendance: 100
  });

  // Client-side visual toast alerts
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" | "info" } | null>(null);

  const showToast = (message: string, type: "success" | "error" | "info" = "success") => {
    setToast({ message, type });
  };

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  // Client-side authentication states
  const [loginEmail, setLoginEmail] = useState("");
  const [loginError, setLoginError] = useState("");

  // Peer messaging typing box
  const [targetReceiverId, setTargetReceiverId] = useState("");
  const [chatPayload, setChatPayload] = useState("");

  // Global notice poster
  const [noticeTitle, setNoticeTitle] = useState("");
  const [noticeContent, setNoticeContent] = useState("");
  const [noticeCategory, setNoticeCategory] = useState<any>("General");

  // Initial Seed Simulation login loader
  useEffect(() => {
    // Default system boots in ADMIN view for rapid preview exploration path!
    handleSimulateRoleLogin("admin@school.com");
  }, []);

  // Fetch and sync complete dataset
  const syncWorkspaceData = async () => {
    if (!currentUser) return;
    setSimLoading(true);
    try {
      const [
        uList, admList, stList, prList, tcList, clList, sbList, ttList,
        attList, exList, mkList, hwList, feeList, bkList, btxList, anList,
        msgList, certList, bkpList, auditList, metricList
      ] = await Promise.all([
        api.fetchUsers(),
        api.fetchAdmissions(),
        api.fetchStudents(),
        api.fetchParents(),
        api.fetchTeachers(),
        api.fetchClasses(),
        api.fetchSubjects(),
        api.fetchTimetables(),
        api.fetchAttendance(),
        api.fetchExaminations(),
        api.fetchMarks(),
        api.fetchHomework(),
        api.fetchFees(),
        api.fetchBooks(),
        api.fetchBookTransactions(),
        api.fetchAnnouncements(),
        api.fetchMessages(),
        api.fetchCertificates(),
        api.fetchBackups(),
        api.fetchAuditLogs(),
        api.fetchSystemMetrics()
      ]);

      setUsers(uList);
      setAdmissions(admList);
      setStudents(stList);
      setParents(prList);
      setTeachers(tcList);
      setClasses(clList);
      setSubjects(sbList);
      setTimetables(ttList);
      setAttendance(attList);
      setExaminations(exList);
      setMarks(mkList);
      setHomework(hwList);
      setFees(feeList);
      setBooks(bkList);
      setBookTransactions(btxList);
      setAnnouncements(anList);
      setMessages(msgList);
      setCertificates(certList);
      setBackups(bkpList);
      setAuditLogs(auditList);
      setMetrics(metricList);
    } catch (err: any) {
      console.error("Workspace sync error:", err);
    } finally {
      setSimLoading(false);
    }
  };

  const handleSimulateRoleLogin = async (email: string) => {
    setSimLoading(true);
    setSimError("");
    try {
      const res = await api.loginSimulatedUser(email);
      setToken(res.token);
      setCurrentUser(res.user);
      // Auto toggle initial tab based on role type
      if (res.user.role === UserRole.TEACHER) {
        setCurrentTab("attendance");
      } else if (res.user.role === UserRole.STUDENT) {
        setCurrentTab("student-academics");
      } else if (res.user.role === UserRole.PARENT) {
        setCurrentTab("parent-dashboard");
      } else if (res.user.role === UserRole.ACCOUNTANT) {
        setCurrentTab("fees");
      } else if (res.user.role === UserRole.LIBRARIAN) {
        setCurrentTab("library");
      } else {
        setCurrentTab("dashboard");
      }
    } catch (err: any) {
      setSimError(err.message || "Failed validating role profile.");
    } finally {
      setSimLoading(false);
    }
  };

  useEffect(() => {
    if (currentUser) {
      syncWorkspaceData();
    }
  }, [currentUser]);

  // Actions Wrapping API calls before local state reload triggers
  const handleCreateUser = async (payload: any) => {
    await api.createUser({ ...payload, creatorId: currentUser?.id });
    await syncWorkspaceData();
  };

  const handleDeleteUser = async (userId: string) => {
    if (window.confirm("Archive this profile credentials and restrict portal access?")) {
      await api.deleteUser(userId, currentUser?.id || "u-admin");
      await syncWorkspaceData();
    }
  };

  const handleReviewAdmission = async (id: string, status: "Approved" | "Rejected", notes: string) => {
    await api.patchAdmissionStatus(id, { status, reviewNotes: notes, actorId: currentUser?.id });
    await syncWorkspaceData();
  };

  const handleUpdateStudent = async (id: string, payload: any) => {
    await api.updateStudent(id, { ...payload, actorId: currentUser?.id });
    await syncWorkspaceData();
  };

  const handleSaveAttendance = async (payload: any) => {
    await api.saveAttendance({ ...payload, actorId: currentUser?.id });
    await syncWorkspaceData();
  };

  const handleCreateHomework = async (payload: any) => {
    await api.createHomework(payload);
    await syncWorkspaceData();
  };

  const handleGradeHomework = async (hwId: string, studentId: string, grade: string, feedback: string) => {
    await api.gradeHomework(hwId, { studentId, grade, feedback, teacherId: currentUser?.id });
    await syncWorkspaceData();
  };

  const handleCreateExam = async (payload: any) => {
    await api.createExamination({ ...payload, actorId: currentUser?.id });
    await syncWorkspaceData();
  };

  const handleSaveBulkMarks = async (examId: string, records: any) => {
    await api.saveBulkMarks(examId, records, currentUser?.id);
    await syncWorkspaceData();
  };

  const handleCreateTimetable = async (payload: any) => {
    await api.createTimetableEntry({ ...payload, actorId: currentUser?.id });
    await syncWorkspaceData();
  };

  const handleDeleteTimetable = async (id: string) => {
    await api.deleteTimetableEntry(id, currentUser?.id || "u-admin");
    await syncWorkspaceData();
  };

  const handleCreateFeeInvoice = async (payload: any) => {
    await api.createFeeInvoice({ ...payload, actorId: currentUser?.id });
    await syncWorkspaceData();
  };

  const handlePayFeeInvoice = async (invoiceId: string, amount: number, method: string) => {
    await api.payFeeInvoice(invoiceId, { amount, method, actorId: currentUser?.id });
    await syncWorkspaceData();
  };

  const handleCreateBook = async (payload: any) => {
    await api.createBook({ ...payload, actorId: currentUser?.id });
    await syncWorkspaceData();
  };

  const handleCheckoutBook = async (bookId: string, studentId: string) => {
    await api.checkoutBook(bookId, studentId, currentUser?.id);
    await syncWorkspaceData();
  };

  const handleReturnBook = async (transactionId: string) => {
    await api.returnBook(transactionId, currentUser?.id);
    await syncWorkspaceData();
  };

  const handleIssueCertificate = async (payload: any) => {
    await api.issueCertificate({ ...payload, actorId: currentUser?.id });
    await syncWorkspaceData();
  };

  const handleCreateBackup = async (name: string) => {
    await api.createBackupSnapshot(name, currentUser?.id);
    await syncWorkspaceData();
  };

  const handleRestoreBackup = async (id: string) => {
    if (window.confirm("Restore point loading will replace current active records. Proceed?")) {
      await api.restoreBackupSnapshot(id, currentUser?.id);
      await syncWorkspaceData();
    }
  };

  const handleUploadRestoreSnaps = async (rawJson: any) => {
    await api.uploadBackupSnapshot(rawJson, currentUser?.id || "u-admin");
    await syncWorkspaceData();
  };

  const handlePostNotice = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!noticeTitle || !noticeContent) return;
    await api.createAnnouncement({
      title: noticeTitle,
      content: noticeContent,
      category: noticeCategory,
      targetRoles: [UserRole.TEACHER, UserRole.STUDENT, UserRole.PARENT],
      senderName: currentUser?.name || "System"
    });
    setNoticeTitle("");
    setNoticeContent("");
    showToast("Broadband global Notice board synchronized!", "success");
    await syncWorkspaceData();
  };

  const handleSendChatSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetReceiverId || !chatPayload || !currentUser) return;
    await api.sendMessage({
      senderId: currentUser.id,
      senderName: currentUser.name,
      receiverId: targetReceiverId,
      content: chatPayload
    });
    setChatPayload("");
    await syncWorkspaceData();
  };

  if (!currentUser) {
    const defaultAccounts = [
      { name: "Sarah Jenkins", email: "admin@school.com", role: "ADMIN", label: "Admin Sarah", bg: "bg-red-50 text-red-700 hover:bg-red-100/80 border-red-200" },
      { name: "Prof. Clara Oswald", email: "teacher@school.com", role: "TEACHER", label: "Teacher Clara", bg: "bg-blue-50 text-blue-700 hover:bg-blue-100/80 border-blue-200" },
      { name: "Prof. David Tennant", email: "teacher2@school.com", role: "TEACHER", label: "Teacher David", bg: "bg-sky-50 text-sky-700 hover:bg-sky-100/80 border-sky-300" },
      { name: "Marcus Smith", email: "student@school.com", role: "STUDENT", label: "Student Marcus", bg: "bg-emerald-50 text-emerald-700 hover:bg-emerald-100/80 border-emerald-200" },
      { name: "Robert Smith", email: "parent@school.com", role: "PARENT", label: "Parent Robert", bg: "bg-pink-50 text-pink-700 hover:bg-pink-100/80 border-pink-200" },
      { name: "Accts Ledger", email: "accountant@school.com", role: "ACCOUNTANT", label: "Accountant", bg: "bg-orange-50 text-orange-700 hover:bg-orange-100/80 border-orange-200" },
      { name: "Terry Brooks", email: "librarian@school.com", role: "LIBRARIAN", label: "Librarian Terry", bg: "bg-teal-50 text-teal-700 hover:bg-teal-100/80 border-teal-200" }
    ];

    const handleFormSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!loginEmail) return;
      setSimLoading(true);
      setLoginError("");
      try {
        await handleSimulateRoleLogin(loginEmail.trim());
        showToast("Welcome back to your Oakridge Portal!", "success");
      } catch (err: any) {
        setLoginError(err.message || "Invalid credentials or email not registered.");
      } finally {
        setSimLoading(false);
      }
    };

    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4 sm:p-6 lg:p-8 font-sans antialiased text-[#1e293b]">
        {/* Ambient Top Glow Effect */}
        <div className="absolute top-0 right-0 left-0 h-48 bg-gradient-to-b from-indigo-950/20 to-transparent pointer-events-none"></div>
        
        <div className="w-full max-w-4xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl p-6 sm:p-10 relative overflow-hidden flex flex-col md:flex-row gap-8">
          
          {/* Left Decorative Information Section */}
          <div className="md:w-1/2 flex flex-col justify-between text-left border-b md:border-b-0 md:border-r border-slate-800 pb-6 md:pb-0 md:pr-8">
            <div>
              <div className="flex items-center gap-2.5 mb-6">
                <div className="p-2.5 bg-indigo-600/10 text-indigo-400 rounded-2xl border border-indigo-500/20">
                  <GraduationCap className="w-8 h-8 text-indigo-400 font-sans" />
                </div>
                <div>
                  <h1 className="text-white text-base font-bold tracking-tight">Oakridge Academy</h1>
                  <span className="text-[10px] text-slate-400 font-mono uppercase tracking-widest font-bold">Educational ERP Portal</span>
                </div>
              </div>

              <h2 className="text-white text-2xl font-bold tracking-tight font-sans leading-tight mt-4">
                Access your personalized school dashboard.
              </h2>
              <p className="text-slate-400 text-xs leading-relaxed mt-2.5">
                Oakridge ERP links parents, instructors, administrators, and librarians together into an authorized secure learning workflow ledger.
              </p>
            </div>

            <div className="mt-8 text-[11px] text-slate-500">
              <span className="font-semibold text-slate-400">Security Notification:</span>
              <p className="mt-1 leading-normal">
                Continuous audit logs actively trace credential logs and login queries. Please authenticate using authorized credentials.
              </p>
            </div>
          </div>

          {/* Right Action Authentication Form */}
          <div className="md:w-1/2 flex flex-col justify-center text-left space-y-6">
            <div>
              <h3 className="text-white text-base font-bold">Stakeholder Security Entrance</h3>
              <p className="text-xs text-slate-400 mt-1">Authenticate using an email identity or pick a simulated testing profile below:</p>
            </div>

            {/* Custom Input Authentication Form */}
            <form onSubmit={handleFormSubmit} className="space-y-3">
              <div>
                <label className="text-[10px] uppercase font-bold text-slate-450 block mb-1">Registered Institutional Email</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
                  <input
                    type="email"
                    required
                    placeholder="e.g. teacher@school.com"
                    value={loginEmail}
                    onChange={(e) => {
                      setLoginEmail(e.target.value);
                      if (loginError) setLoginError("");
                    }}
                    className="w-full text-xs bg-slate-950 text-white border border-slate-800 p-3.5 pl-10 rounded-xl focus:outline-none focus:border-indigo-500 font-mono tracking-wide"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={simLoading}
                className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold py-3 px-4 rounded-xl w-full transition-all flex items-center justify-center gap-2 shadow-lg hover:shadow-indigo-500/10 cursor-pointer"
              >
                {simLoading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin text-white" /> Verifying Credentials...
                  </>
                ) : (
                  <>
                    <Key className="w-4 h-4" /> Unlock Enterprise Desk
                  </>
                )}
              </button>

              {loginError && (
                <p className="text-rose-400 text-xs italic font-medium leading-tight flex items-center gap-1 mt-1 animate-pulse">
                  <AlertTriangle className="w-3.5 h-3.5 shrink-0" /> {loginError}
                </p>
              )}
            </form>

            {/* Quick Simulation Selectors */}
            <div>
              <div className="flex items-center gap-2 mb-2.5">
                <span className="h-px bg-slate-800 flex-1"></span>
                <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Demo User Simulator</span>
                <span className="h-px bg-slate-800 flex-1"></span>
              </div>

              <div className="grid grid-cols-2 gap-2 max-h-[190px] overflow-y-auto pr-1">
                {defaultAccounts.map((acc) => (
                  <button
                    key={acc.email}
                    onClick={async () => {
                      setLoginEmail(acc.email);
                      setSimLoading(true);
                      try {
                        await handleSimulateRoleLogin(acc.email);
                        showToast(`Logged in successfully as ${acc.name}!`, "success");
                      } catch (err: any) {
                        setLoginError(err.message || "Failed validating role profile.");
                      } finally {
                        setSimLoading(false);
                      }
                    }}
                    className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${acc.bg}`}
                  >
                    <span className="font-bold text-[10.5px] truncate font-sans">{acc.label}</span>
                    <span className="text-[9.5px] font-mono opacity-80 mt-1.5 truncate block">{acc.email}</span>
                  </button>
                ))}
              </div>
            </div>

          </div>

        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans antialiased text-slate-700 relative">
      
      {/* ====================================================
          STAKEHOLDER OPERATOR DEMO BAR (Top fixed collapsible)
          ==================================================== */}
      <div className="bg-slate-900 border-b border-slate-850 px-4 py-2 flex flex-wrap items-center justify-between text-xs text-white z-40 gap-3 no-print shadow-md">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 bg-emerald-400 rounded-full animate-ping"></span>
          <span className="font-bold text-[10.5px] uppercase tracking-widest text-[#3b82f6]">STAKEHOLDER SIMULATOR CONSOLE</span>
        </div>

        <div className="flex flex-wrap gap-1.5 items-center">
          <button
            onClick={() => handleSimulateRoleLogin("admin@school.com")}
            className={`px-2.5 py-1 rounded-md text-[10.5px] font-bold uppercase transition-all ${currentUser.role === UserRole.ADMIN ? "bg-[#3b82f6] text-white shadow-md scale-102" : "bg-slate-800 text-slate-350 hover:bg-slate-750"}`}
          >
            Admin
          </button>
          <button
            onClick={() => handleSimulateRoleLogin("principal@school.com")}
            className={`px-2.5 py-1 rounded-md text-[10.5px] font-bold uppercase transition-all ${currentUser.role === UserRole.PRINCIPAL ? "bg-purple-600 text-white shadow-md scale-102" : "bg-slate-800 text-slate-350 hover:bg-slate-750"}`}
          >
            Principal
          </button>
          <button
            onClick={() => handleSimulateRoleLogin("teacher@school.com")}
            className={`px-2.5 py-1 rounded-md text-[10.5px] font-bold uppercase transition-all ${currentUser.id === "u-teacher" ? "bg-blue-600 text-white shadow-md scale-102" : "bg-slate-800 text-slate-350 hover:bg-slate-750"}`}
          >
            Teacher (Clara)
          </button>
          <button
            onClick={() => handleSimulateRoleLogin("teacher2@school.com")}
            className={`px-2.5 py-1 rounded-md text-[10.5px] font-bold uppercase transition-all ${currentUser.id === "u-teacher2" ? "bg-cyan-600 text-white shadow-md scale-102" : "bg-slate-800 text-slate-350 hover:bg-slate-750"}`}
          >
            Teacher (David)
          </button>
          <button
            onClick={() => handleSimulateRoleLogin("student@school.com")}
            className={`px-2.5 py-1 rounded-md text-[10.5px] font-bold uppercase transition-all ${currentUser.id === "u-student" ? "bg-emerald-600 text-white shadow-md scale-102" : "bg-slate-800 text-slate-350 hover:bg-slate-750"}`}
          >
            Student
          </button>
          <button
            onClick={() => handleSimulateRoleLogin("parent@school.com")}
            className={`px-2.5 py-1 rounded-md text-[10.5px] font-bold uppercase transition-all ${currentUser.role === UserRole.PARENT ? "bg-pink-600 text-white shadow-md scale-102" : "bg-slate-800 text-slate-350 hover:bg-slate-750"}`}
          >
            Parent
          </button>
          <button
            onClick={() => handleSimulateRoleLogin("accountant@school.com")}
            className={`px-2.5 py-1 rounded-md text-[10.5px] font-bold uppercase transition-all ${currentUser.role === UserRole.ACCOUNTANT ? "bg-orange-600 text-white shadow-md scale-102" : "bg-slate-800 text-slate-350 hover:bg-slate-750"}`}
          >
            Accountant
          </button>
          <button
            onClick={() => handleSimulateRoleLogin("librarian@school.com")}
            className={`px-2.5 py-1 rounded-md text-[10.5px] font-bold uppercase transition-all ${currentUser.role === UserRole.LIBRARIAN ? "bg-teal-600 text-white shadow-md scale-102" : "bg-slate-800 text-slate-350 hover:bg-slate-750"}`}
          >
            Librarian
          </button>
        </div>
      </div>

      {/* Main viewport block mapping splitting layout */}
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden relative" id="layout-view-canvas">
        
        {/* ====================================================
            LEFT WORKSPACE DESCRIPTIVE SIDEBAR
            ==================================================== */}
        <aside className="w-full md:w-64 bg-slate-900 text-slate-300 flex flex-col justify-between shrink-0 no-print border-r border-slate-850" id="main-navigation-sidebar">
          <div>
            {/* Header branding */}
            <div className="p-5 border-b border-slate-850 flex items-center justify-between text-left">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-[#3b82f6]/10 text-[#3b82f6] rounded-xl border border-[#3b82f6]/20">
                  <GraduationCap className="w-6 h-6 animate-pulse" />
                </div>
                <div>
                  <h1 className="text-white text-sm font-bold tracking-tight">Oakridge Academy</h1>
                  <span className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Educational ERP</span>
                </div>
              </div>
            </div>

            {/* Simulated Active Account Summary Block */}
            <div className="p-4 bg-slate-950/20 m-3 rounded-2xl border border-slate-850 text-left">
              <span className="text-[9px] text-[#3b82f6] font-mono block uppercase">Identity Verified</span>
              <h3 className="text-white text-xs font-bold font-sans mt-0.5 truncate">{currentUser.name}</h3>
              <span className="text-[9.5px] text-slate-400 font-mono mt-0.5 block truncate uppercase">{currentUser.role}</span>
            </div>

            {/* Sidebar core menus */}
            <nav className="p-3 space-y-1.5 text-xs text-left" id="user-menu-elements">
              {/* Executive admin links */}
              {["SUPER_ADMIN", "ADMIN", "PRINCIPAL"].includes(currentUser.role) && (
                <>
                  <button 
                    onClick={() => setCurrentTab("dashboard")} 
                    className={`w-full flex items-center px-4 py-2.5 rounded-xl transition duration-150 font-semibold cursor-pointer ${currentTab === "dashboard" ? "bg-slate-800 text-white font-bold" : "hover:bg-slate-800/50 text-slate-400"}`}
                  >
                    <BarChart3 className="w-4 h-4 mr-2.5" /> Operations Dashboard
                  </button>
                  <button 
                    onClick={() => setCurrentTab("admissions")} 
                    className={`w-full flex items-center px-4 py-2.5 rounded-xl transition duration-150 font-semibold cursor-pointer ${currentTab === "admissions" ? "bg-slate-800 text-white font-bold" : "hover:bg-slate-800/50 text-slate-400"}`}
                  >
                    <UserCheck className="w-4 h-4 mr-2.5" /> Admissions Desk
                  </button>
                  <button 
                    onClick={() => setCurrentTab("users")} 
                    className={`w-full flex items-center px-4 py-2.5 rounded-xl transition duration-150 font-semibold cursor-pointer ${currentTab === "users" ? "bg-slate-800 text-white font-bold" : "hover:bg-slate-800/50 text-slate-400"}`}
                  >
                    <Users className="w-4 h-4 mr-2.5" /> Accounts Directory
                  </button>
                  <button 
                    onClick={() => setCurrentTab("sis")} 
                    className={`w-full flex items-center px-4 py-2.5 rounded-xl transition duration-150 font-semibold cursor-pointer ${currentTab === "sis" ? "bg-slate-800 text-white font-bold" : "hover:bg-slate-800/50 text-slate-400"}`}
                  >
                    <GraduationCap className="w-4 h-4 mr-2.5" /> SIS Student Database
                  </button>
                </>
              )}

              {/* Shared School links */}
              {["SUPER_ADMIN", "ADMIN", "PRINCIPAL", "TEACHER", "PARENT", "STUDENT"].includes(currentUser.role) && (
                <>
                  <button 
                    onClick={() => setCurrentTab("timetables")} 
                    className={`w-full flex items-center px-4 py-2.5 rounded-xl transition duration-150 font-semibold cursor-pointer ${currentTab === "timetables" ? "bg-slate-800 text-white font-bold" : "hover:bg-slate-800/50 text-slate-400"}`}
                  >
                    <Calendar className="w-4 h-4 mr-2.5" /> Classroom Schedules
                  </button>
                </>
              )}

              {/* Teacher links */}
              {currentUser.role === UserRole.TEACHER && (
                <>
                  <button 
                    onClick={() => setCurrentTab("attendance")} 
                    className={`w-full flex items-center px-4 py-2.5 rounded-xl transition duration-150 font-semibold cursor-pointer ${currentTab === "attendance" ? "bg-slate-800 text-white font-bold" : "hover:bg-slate-800/50 text-slate-400"}`}
                  >
                    <CheckCircle className="w-4 h-4 mr-2.5" /> Take Attendance
                  </button>
                  <button 
                    onClick={() => setCurrentTab("homework")} 
                    className={`w-full flex items-center px-4 py-2.5 rounded-xl transition duration-150 font-semibold cursor-pointer ${currentTab === "homework" ? "bg-slate-800 text-white font-bold" : "hover:bg-slate-800/50 text-slate-400"}`}
                  >
                    <ClipboardList className="w-4 h-4 mr-2.5" /> Homework Desk
                  </button>
                  <button 
                    onClick={() => setCurrentTab("marks")} 
                    className={`w-full flex items-center px-4 py-2.5 rounded-xl transition duration-150 font-semibold cursor-pointer ${currentTab === "marks" ? "bg-slate-800 text-white font-bold" : "hover:bg-slate-800/50 text-slate-400"}`}
                  >
                    <Award className="w-4 h-4 mr-2.5" /> Scoring Gradebook
                  </button>
                </>
              )}

              {/* Finance Ledgers */}
              {["SUPER_ADMIN", "ADMIN", "ACCOUNTANT", "PARENT"].includes(currentUser.role) && (
                <button 
                  onClick={() => setCurrentTab("fees")} 
                  className={`w-full flex items-center px-4 py-2.5 rounded-xl transition duration-150 font-semibold cursor-pointer ${currentTab === "fees" ? "bg-slate-800 text-white font-bold" : "hover:bg-slate-800/50 text-slate-400"}`}
                >
                  <DollarSign className="w-4 h-4 mr-2.5" /> Tuition Billings
                </button>
              )}

              {/* Library Cataland */}
              {["SUPER_ADMIN", "ADMIN", "LIBRARIAN", "STUDENT"].includes(currentUser.role) && (
                <button 
                  onClick={() => setCurrentTab("library")} 
                  className={`w-full flex items-center px-4 py-2.5 rounded-xl transition duration-150 font-semibold cursor-pointer ${currentTab === "library" ? "bg-slate-800 text-white font-bold" : "hover:bg-slate-800/50 text-slate-400"}`}
                >
                  <BookMarked className="w-4 h-4 mr-2.5" /> Library Inventory
                </button>
              )}

              {/* Certificates issuance */}
              {["SUPER_ADMIN", "ADMIN", "PRINCIPAL", "PARENT"].includes(currentUser.role) && (
                <button 
                  onClick={() => setCurrentTab("certificates")} 
                  className={`w-full flex items-center px-4 py-2.5 rounded-xl transition duration-150 font-semibold cursor-pointer ${currentTab === "certificates" ? "bg-slate-800 text-white font-bold" : "hover:bg-slate-800/50 text-slate-400"}`}
                >
                  <Award className="w-4 h-4 mr-2.5" /> Diploma Certificates
                </button>
              )}

              {/* Student Personal portals */}
              {currentUser.role === UserRole.STUDENT && (
                <>
                  <button 
                    onClick={() => setCurrentTab("student-academics")} 
                    className={`w-full flex items-center px-4 py-2.5 rounded-xl transition duration-150 font-semibold cursor-pointer ${currentTab === "student-academics" ? "bg-slate-800 text-white font-bold" : "hover:bg-slate-800/50 text-slate-400"}`}
                  >
                    <Award className="w-4 h-4 mr-2.5" /> Student Academics
                  </button>
                  <button 
                    onClick={() => setCurrentTab("student-homework-submit")} 
                    className={`w-full flex items-center px-4 py-2.5 rounded-xl transition duration-150 font-semibold cursor-pointer ${currentTab === "student-homework-submit" ? "bg-slate-800 text-white font-bold" : "hover:bg-slate-800/50 text-slate-400"}`}
                  >
                    <ClipboardList className="w-4 h-4 mr-2.5" /> Homework Submitter
                  </button>
                </>
              )}

              {/* Parent Personal portals */}
              {currentUser.role === UserRole.PARENT && (
                <button 
                  onClick={() => setCurrentTab("parent-dashboard")} 
                  className={`w-full flex items-center px-4 py-2.5 rounded-xl transition duration-150 font-semibold cursor-pointer ${currentTab === "parent-dashboard" ? "bg-slate-800 text-white font-bold" : "hover:bg-slate-800/50 text-slate-400"}`}
                >
                  <Users className="w-4 h-4 mr-2.5" /> Parent Dashboard
                </button>
              )}

              {/* Messaging & chat */}
              {["SUPER_ADMIN", "ADMIN", "PRINCIPAL", "TEACHER", "PARENT"].includes(currentUser.role) && (
                <button 
                  onClick={() => setCurrentTab("messaging")} 
                  className={`w-full flex items-center px-4 py-2.5 rounded-xl transition duration-150 font-semibold cursor-pointer ${currentTab === "messaging" ? "bg-slate-800 text-white font-bold" : "hover:bg-slate-800/50 text-slate-400"}`}
                >
                  <MessageSquare className="w-4 h-4 mr-2.5" /> Peer Communications
                </button>
              )}

              {/* Global system configs & backups */}
              {["SUPER_ADMIN", "ADMIN"].includes(currentUser.role) && (
                <button 
                  onClick={() => setCurrentTab("security")} 
                  className={`w-full flex items-center px-4 py-2.5 rounded-xl transition duration-150 font-semibold cursor-pointer ${currentTab === "security" ? "bg-slate-800 text-white font-bold" : "hover:bg-slate-800/50 text-slate-400"}`}
                >
                  <ShieldCheck className="w-4 h-4 mr-2.5" /> Backups & Security
                </button>
              )}
            </nav>
          </div>

          <div className="p-4 border-t border-slate-850">
            <button
              onClick={() => {
                setCurrentUser(null);
                setToken(null);
                showToast("Logged out successfully from session context!", "info");
              }}
              className="w-full text-left text-xs text-rose-400 hover:text-rose-300 hover:bg-slate-850/60 px-4 py-2 rounded-xl transition-all font-semibold cursor-pointer flex items-center mb-2"
            >
              <LogOut className="w-4 h-4 mr-2.5" /> Log Out Portal
            </button>
            <p className="text-[10px] text-slate-600 font-mono text-center">Version 2.0 Enterprise</p>
          </div>
        </aside>

        {/* ====================================================
            RIGHT VIEWPORT CONTAINER WORKSPACE
            ==================================================== */}
        <main className="flex-1 bg-slate-50 flex flex-col overflow-y-auto" id="main-viewport-pane">
          
          {/* Dashboard Dynamic Top Header info */}
          <header className="bg-white border-b border-slate-100 p-5 px-6 flex items-center justify-between no-print shadow-2xs">
            <h2 className="text-sm font-semibold tracking-tight text-slate-800 capitalize">
              {currentTab === "dashboard" ? `Welcome back, ${currentUser.name}!` : `${currentTab.replace("-", " ")}`}
            </h2>
            <div className="flex items-center gap-3.5">
              {simLoading && <RefreshCw className="w-4 h-4 animate-spin text-indigo-550" />}
              <span className="text-slate-400 text-xs font-mono select-none">
                {new Date().toISOString().split("T")[0]} 21:45 UTC
              </span>
            </div>
          </header>

          <div className="p-6 space-y-6">

            {/* ERROR AND LOADER FEEDBACKS */}
            {simError && (
              <div className="bg-red-50 text-red-650 border border-red-200 p-3 rounded-xl text-xs max-w-md mx-auto italic flex items-center">
                <AlertTriangle className="w-4.5 h-4.5 shrink-0 mr-2" />
                {simError}
              </div>
            )}

            {/* ==========================================
                DASHBOARD CANVAS SCREEN
                ========================================== */}
            {currentTab === "dashboard" && (
              <DashboardCharts 
                metrics={metrics} 
                auditLogs={auditLogs} 
                onRefresh={syncWorkspaceData} 
                loading={simLoading} 
              />
            )}

            {/* ==========================================
                ADMIN / PRINCIPAL / EXECUTIVE SCREENS
                ========================================== */}
            {["users", "admissions", "sis", "security"].includes(currentTab) && (
              <AdminViews
                activeTab={currentTab}
                users={users}
                admissions={admissions}
                students={students}
                classes={classes}
                currentUser={currentUser}
                onRefreshAll={syncWorkspaceData}
                onCreateUser={handleCreateUser}
                onDeleteUser={handleDeleteUser}
                onReviewAdmission={handleReviewAdmission}
                onUpdateStudent={handleUpdateStudent}
                backups={backups}
                onCreateBackup={handleCreateBackup}
                onRestoreBackup={handleRestoreBackup}
                onUploadRestoreSnaps={handleUploadRestoreSnaps}
                onShowToast={showToast}
              />
            )}

            {/* ==========================================
                TEACHER WORKSPACE SCREENS
                ========================================== */}
            {["attendance", "homework", "marks"].includes(currentTab) && (
              <TeacherViews
                activeTab={currentTab}
                currentUser={currentUser}
                students={students}
                classes={classes}
                subjects={subjects}
                homework={homework}
                examinations={examinations}
                marks={marks}
                onRefreshAll={syncWorkspaceData}
                onSaveAttendance={handleSaveAttendance}
                onCreateHomework={handleCreateHomework}
                onGradeHomework={handleGradeHomework}
                onCreateExam={handleCreateExam}
                onSaveBulkMarks={handleSaveBulkMarks}
                onShowToast={showToast}
              />
            )}

            {/* ==========================================
                ACADEMICS & TIMETABLES COORD
                ========================================== */}
            {["timetables", "certificates"].includes(currentTab) && (
              <AcademicViews
                activeTab={currentTab}
                currentUser={currentUser}
                students={students}
                classes={classes}
                subjects={subjects}
                teachers={teachers}
                timetables={timetables}
                certificates={certificates}
                onRefreshAll={syncWorkspaceData}
                onCreateTimetable={handleCreateTimetable}
                onDeleteTimetable={handleDeleteTimetable}
                onIssueCertificate={handleIssueCertificate}
              />
            )}

            {/* ==========================================
                FINANCE & TUITION BILLING
                ========================================== */}
            {currentTab === "fees" && (
              <FinanceViews
                activeTab={currentTab}
                currentUser={currentUser}
                students={students}
                fees={fees}
                onRefreshAll={syncWorkspaceData}
                onCreateFeeInvoice={handleCreateFeeInvoice}
                onPayFeeInvoice={handlePayFeeInvoice}
                onShowToast={showToast}
              />
            )}

            {/* ==========================================
                LIBRARY SERVICES MODULE
                ========================================== */}
            {currentTab === "library" && (
              <LibraryViews
                activeTab={currentTab}
                currentUser={currentUser}
                students={students}
                books={books}
                bookTransactions={bookTransactions}
                onRefreshAll={syncWorkspaceData}
                onCreateBook={handleCreateBook}
                onCheckoutBook={handleCheckoutBook}
                onReturnBook={handleReturnBook}
                onShowToast={showToast}
              />
            )}

            {/* ==========================================
                STUDENT PERSONAL DASHBOARD SCREENS
                ========================================== */}
            {currentTab === "student-academics" && currentUser.role === UserRole.STUDENT && (() => {
              const mySt = students.find(s => s.id === currentUser.id);
              if (!mySt) return <p className="text-xs text-slate-400 italic">Finding SIS scholar roster node...</p>;

              // Calculate GPA from graded exams of this pupil
              const examGrades = marks.filter(m => m.studentId === currentUser.id);

              return (
                <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-xs text-left grid grid-cols-1 md:grid-cols-3 gap-6" id="student-main-academics-canvas">
                  <div className="md:col-span-1 bg-slate-50 p-5 rounded-2xl border border-slate-150 space-y-4">
                    <span className="text-[9px] bg-slate-200 text-slate-650 px-2 py-0.5 rounded font-bold uppercase tracking-wider">Scholar Card</span>
                    <h4 className="text-sm font-bold text-slate-800 uppercase tracking-tight">{currentUser.name}</h4>
                    
                    <div className="space-y-1 text-slate-500 text-xs font-mono">
                      <p>Roll Code: <strong>{mySt.rollNumber}</strong></p>
                      <p>Assigned: <strong>Grade 10 - Section A</strong></p>
                      <p>Family ID: <strong>{mySt.parentId}</strong></p>
                      <p>Status: <span className="text-emerald-600 font-bold font-sans">Active Enrollment</span></p>
                    </div>

                    <div className="bg-white border p-3 rounded-xl shadow-2xs">
                      <span className="text-[9px] text-[#4f46e5] font-bold block uppercase tracking-wider mb-1">Academic Aggregates</span>
                      <h4 className="text-2xl font-bold text-slate-850">3.85 GPA</h4>
                      <p className="text-[10px] text-slate-400 mt-0.5">Calculated from Spring/Summer midterms</p>
                    </div>
                  </div>

                  <div className="md:col-span-2 space-y-4">
                    <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">My Examination Reports Scheme ({examGrades.length})</h4>
                    
                    {examGrades.length === 0 ? (
                      <p className="text-xs text-slate-400 italic py-6">Your teachers have not published core examination markings yet.</p>
                    ) : (
                      <div className="space-y-2.5">
                        {examGrades.map(rec => {
                          const ex = examinations.find(e => e.id === rec.examId);
                          if (!ex) return null;
                          const ratio = rec.obtainedMarks / ex.maxMarks;
                          const gradeLetter = ratio >= 0.9 ? "A+" : ratio >= 0.8 ? "A" : ratio >= 0.7 ? "B" : "C";

                          return (
                            <div key={rec.id} className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex justify-between items-center">
                              <div>
                                <h5 className="font-bold text-slate-700 text-xs">{ex.name}</h5>
                                <p className="text-[10.5px] text-slate-400 mt-1 font-mono">Max Marks: {ex.maxMarks} | Scored: <strong>{rec.obtainedMarks}</strong></p>
                              </div>

                              <div className="text-right">
                                <span className="bg-emerald-100 text-emerald-800 text-xs font-bold font-mono px-2 py-0.5 rounded">
                                  {gradeLetter} ({Math.round(ratio*100)}%)
                                </span>
                                <p className="text-[10px] text-slate-400 italic mt-1 font-sans">"{rec.remarks || "Delivering solid competence"}"</p>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              );
            })()}

            {currentTab === "student-homework-submit" && currentUser.role === UserRole.STUDENT && (() => {
              // Homework for Class 10 (Classroom of our dummy Marcus!)
              const classHw = homework.filter(h => h.classId === "c-g10" && h.sectionId === "A");

              return (
                <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-xs text-left space-y-4" id="student-homework-grid">
                  <div className="border-b border-slate-100 pb-3">
                    <h3 className="text-base font-bold text-slate-800">Assigned Homework Worksheets</h3>
                    <p className="text-xs text-slate-400 mt-0.5 font-sans">Upload answers to your teacher's homework assignments directly</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {classHw.map(item => {
                      const submission = item.submissions.find(s => s.studentId === currentUser.id);

                      return (
                        <div key={item.id} className="p-4 bg-slate-50 border border-slate-150 rounded-xl space-y-3.5 relative">
                          <div className="flex justify-between items-start">
                            <div>
                              <h4 className="font-bold text-slate-850 text-xs leading-none">{item.title}</h4>
                              <span className="text-[9.5px] text-slate-400 font-mono mt-1 block">Due Limit: {item.dueDate}</span>
                            </div>
                            {submission ? (
                              <span className="bg-emerald-50 text-emerald-700 px-2 py-0.5 border border-emerald-250 rounded font-bold font-mono text-[9px] uppercase leading-none">Submitted</span>
                            ) : (
                              <span className="bg-red-50 text-red-550 border border-red-200 px-2 py-0.5 rounded text-[9.5px] uppercase font-mono font-bold leading-none animate-pulse">Pending</span>
                            )}
                          </div>
                          
                          <p className="text-slate-400 text-[11px] italic bg-white p-2 border border-slate-100 rounded leading-snug">
                            "{item.description}"
                          </p>

                          {submission ? (
                            <div className="bg-emerald-50/20 p-2.5 rounded border border-emerald-150 text-[10.5px]">
                              <span className="font-bold text-slate-500 uppercase text-[9px] block">Your Uploaded Solution</span>
                              <p className="text-slate-700 leading-normal italic">"{submission.content}"</p>
                              {submission.grade && (
                                <div className="mt-2 text-indigo-705 font-bold pt-1.5 border-t border-dashed border-emerald-150 select-text">
                                  Evaluation Mark: {submission.grade} | Comment: "{submission.feedback}"
                                </div>
                              )}
                            </div>
                          ) : (
                            <div className="space-y-2 pt-2 border-t border-slate-100">
                              <span className="text-[10px] text-slate-400 font-semibold block uppercase">Submit completed Solution</span>
                              <textarea
                                placeholder="Paste your complete algebraic solutions proof or external document links..."
                                id={`sub-text-${item.id}`}
                                className="w-full h-14 bg-white border border-slate-200 rounded p-1.5 scrollbar-thin text-xs"
                              />
                              <button
                                onClick={async () => {
                                  const areaVal = (document.getElementById(`sub-text-${item.id}`) as HTMLTextAreaElement)?.value;
                                  if (!areaVal) return;
                                  await api.submitHomework(item.id, { studentId: currentUser.id, content: areaVal });
                                  showToast("Homework worksheet successfully synced and uploaded to Clara Oswald!", "success");
                                  await syncWorkspaceData();
                                }}
                                className="bg-indigo-600 hover:bg-indigo-750 text-white font-bold p-1 px-3 text-[10px] rounded cursor-pointer transition uppercase"
                              >
                                Upload answers
                              </button>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })()}

            {/* ==========================================
                PARENT CORE DASHBOARD PORTAL
                ========================================== */}
            {currentTab === "parent-dashboard" && currentUser.role === UserRole.PARENT && (() => {
              const myPa = parents.find(p => p.id === currentUser.id);
              if (!myPa) return <p className="text-xs text-slate-400 italic">Querying SIS family node details...</p>;
              
              // We'll map details for parent Robert's assigned child: Marcus Smith!
              const myChild = students.find(s => s.id === "u-student");
              
              return (
                <div className="space-y-6 text-left" id="parent-main-portal-dashboard">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Scholar profile summary */}
                    <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-xs flex flex-col justify-between">
                      <div className="space-y-3">
                        <span className="text-[9px] bg-pink-100 text-pink-700 font-bold uppercase tracking-widest px-2 py-0.5 rounded">SIS Guardian Block</span>
                        <h4 className="text-sm font-bold text-slate-850 uppercase tracking-tight">Parent Particulars</h4>
                        
                        <div className="space-y-1 text-slate-500 text-xs font-mono">
                          <p>Guardian: <strong>{currentUser.name}</strong></p>
                          <p>Profession: <strong>{myPa.occupation}</strong></p>
                          <p>Address: {myPa.address}</p>
                        </div>
                      </div>

                      <div className="bg-pink-50 text-pink-700 p-3 rounded-xl border border-pink-100 mt-4 text-[10.5px]">
                        Linked Scholar child: <strong>Marcus Smith (Roll ST-2026-001)</strong>
                      </div>
                    </div>

                    {/* Child details analytics */}
                    <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-xs col-span-2 flex flex-col justify-between">
                      <div>
                        <h4 className="text-xs font-bold text-indigo-650 uppercase tracking-widest mb-3.5">Marcus Smith Performance & Class Roster</h4>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                          <div className="bg-slate-50 border p-3 rounded-xl">
                            <span className="text-[10px] text-slate-400 block font-semibold">TERM ATTENDANCE WEIGHT</span>
                            <h4 className="text-xl font-bold font-sans mt-1 text-slate-800">92.5% Present</h4>
                          </div>
                          
                          <div className="bg-slate-50 border p-3 rounded-xl">
                            <span className="text-[10px] text-slate-400 block font-semibold">OVERALL GRADE POINT</span>
                            <h4 className="text-xl font-bold font-sans mt-1 text-slate-800">3.88 GPA</h4>
                          </div>

                          <div className="bg-slate-50 border p-3 rounded-xl">
                            <span className="text-[10px] text-slate-400 block font-semibold">PENDING HOMEWORKS</span>
                            <h4 className="text-xl font-bold font-sans mt-1 text-red-500">1 Challenge Pending</h4>
                          </div>
                        </div>
                      </div>

                      <p className="text-[10px] text-slate-400 mt-3 pt-3 border-t border-slate-100 italic leading-snug">
                        *Parent Portal Guarantee: All grades, class attendance logs, or issued tuition fee ledgers are live reflections of academy core servers.
                      </p>
                    </div>
                  </div>

                  {/* Quick pay invoices */}
                  <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-xs">
                    <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Outstanding Tuition Bills and Fees</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {fees.filter(f => f.studentId === "u-student" && f.status !== "Paid").map(f => (
                        <div key={f.id} className="p-4 bg-slate-50 rounded-xl border border-slate-150 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                          <div>
                            <span className="text-[9px] bg-red-50 text-red-705 px-2 py-0.5 rounded border border-red-105 uppercase font-mono font-bold">{f.category}</span>
                            <h5 className="font-bold text-slate-800 mt-2 text-xs">Invoice: {f.invoiceNumber}</h5>
                            <p className="text-[10.5px] text-slate-400 font-mono mt-0.5">Month: {f.month} {f.year} | Net Charge: ${f.netAmount}</p>
                          </div>
                          <button
                            onClick={() => {
                              setCurrentTab("fees");
                              // This will jump straight to tuition where it opens payment card gateway!
                            }}
                            className="bg-indigo-600 hover:bg-indigo-750 text-white font-bold p-1.5 px-4 rounded text-[10.5px] uppercase cursor-pointer"
                          >
                            Pay Online Now
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })()}

            {/* ==========================================
                PEER PUBLIC ANNOUNCEMENTS NOTICE BOARD
                ========================================== */}
            {currentTab === "noticeboard" && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 text-left" id="peer-announcements-workcanvas">
                
                {/* Notice Poster Form column */}
                <div className="lg:col-span-1">
                  {["ADMIN", "SUPER_ADMIN", "PRINCIPAL", "TEACHER"].includes(currentUser.role) ? (
                    <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-xs space-y-4">
                      <h4 className="text-xs font-bold text-slate-600 uppercase tracking-widest border-b border-slate-100 pb-2">Broadcast Announcement Notice</h4>
                      
                      <form onSubmit={handlePostNotice} className="space-y-3">
                        <div>
                          <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Notice Title</label>
                          <input
                            type="text"
                            required
                            placeholder="e.g. Summer Sports Camp admissions Open"
                            value={noticeTitle}
                            onChange={(e) => setNoticeTitle(e.target.value)}
                            className="text-xs bg-slate-50/50 border border-slate-200 p-2 rounded-lg w-full focus:outline-none"
                          />
                        </div>

                        <div>
                          <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Target Genre Category</label>
                          <select
                            value={noticeCategory}
                            onChange={(e) => setNoticeCategory(e.target.value)}
                            className="text-xs bg-slate-50/50 border border-slate-200 p-2 rounded-lg w-full focus:outline-none font-sans"
                          >
                            <option value="General">General Administrative</option>
                            <option value="Academic">Academic Notice</option>
                            <option value="Holiday">National/Academy Holiday</option>
                            <option value="Exams">Term Assessment Schedules</option>
                            <option value="Fees">Tuition Billing updates</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Broadcast Details Body</label>
                          <textarea
                            required
                            placeholder="Provide full description steps and links..."
                            value={noticeContent}
                            onChange={(e) => setNoticeContent(e.target.value)}
                            className="text-xs bg-slate-50/50 border border-slate-200 p-2 rounded-lg w-full h-24 focus:outline-none"
                          />
                        </div>

                        <button
                          type="submit"
                          className="bg-indigo-600 hover:bg-indigo-752 text-white font-bold py-2 rounded-lg w-full text-xs transition cursor-pointer select-none shadow-xs"
                        >
                          Synchronize notice Broadband Board
                        </button>
                      </form>
                    </div>
                  ) : (
                    <div className="bg-slate-50 border p-5 rounded-2xl text-slate-400 italic text-center">
                      *Only administrators, teachers or principal coordinators maintain access permissions to publish global public broadband notices. Browse notices on right workspace.
                    </div>
                  )}
                </div>

                {/* Notices Stream Columns list */}
                <div className="lg:col-span-2 space-y-4">
                  <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Oakridge Public Notices board</h4>
                  
                  <div className="space-y-4">
                    {announcements.map(an => (
                      <div key={an.id} className="p-5 bg-white border border-slate-150 rounded-2xl relative text-left">
                        <div className="flex justify-between items-start gap-2">
                          <div>
                            <span className={`px-2 py-0.5 rounded mt-0.5 text-[10px] font-bold uppercase tracking-wider
                              ${an.category === "Exams" ? "bg-purple-100 text-purple-700 font-semibold" : ""}
                              ${an.category === "Holiday" ? "bg-pink-100 text-pink-700" : ""}
                              ${an.category === "General" ? "bg-slate-100 text-slate-658" : ""}
                            `}>
                              Category: {an.category}
                            </span>
                            <h4 className="text-xs font-bold text-slate-800 mt-2.5 font-sans leading-tight">{an.title}</h4>
                          </div>

                          <span className="text-[10px] text-slate-400 font-mono shrink-0">{an.date}</span>
                        </div>
                        <p className="text-slate-400 text-[11px] mt-2.5 leading-relaxed bg-slate-50 p-3 rounded-lg border border-slate-100 italic">
                          "{an.content}"
                        </p>
                        <div className="flex justify-between text-[9.5px] text-slate-500 mt-3 font-mono text-slate-405 border-t border-slate-100 pt-2 tracking-tight">
                          <span>Verified Sender: <strong>{an.senderName}</strong></span>
                          <span>Security Code: SMS-AN-1</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

              </div>
            )}

            {/* ==========================================
                PEER PRIVATE COMMUNICATIONS CENTER CHAT
                ========================================== */}
            {currentTab === "messaging" && (
              <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-xs text-left" id="private-chats-workspace">
                <div className="border-b border-slate-100 pb-3 mb-4">
                  <h3 className="text-base font-bold text-slate-800">Tutor-Guardian Private Messenger</h3>
                  <p className="text-xs text-slate-400 mt-0.5 font-sans">Establish secure peer mailing dialogs between parents and classroom teachers</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  
                  {/* Selector list of available targets */}
                  <div className="md:col-span-1 bg-slate-50 border p-4 rounded-xl space-y-3">
                    <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Peers Online Directory</h4>
                    
                    <div className="space-y-1.5 scrollbar-thin max-h-[300px] overflow-y-auto">
                      {users.filter(u => u.id !== currentUser.id).map(u => (
                        <div
                          key={u.id}
                          onClick={() => {
                            setTargetReceiverId(u.id);
                            // Flag read
                            api.markChatRead(currentUser.id, u.id);
                          }}
                          className={`p-2 rounded-lg border text-xs text-left cursor-pointer transition-all ${targetReceiverId === u.id ? "border-indigo-400 bg-indigo-50/10 font-semibold" : "bg-white border-slate-200 hover:bg-slate-50"}`}
                        >
                          <p className="text-slate-800">{u.name}</p>
                          <p className="text-[9.5px] text-slate-405 uppercase font-mono mt-0.5">{u.role}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Active conversational thread */}
                  <div className="md:col-span-2 bg-slate-100 rounded-xl p-4 flex flex-col justify-between h-[360px]">
                    {targetReceiverId ? (() => {
                      const receiverObj = users.find(u => u.id === targetReceiverId);
                      const myChats = messages.filter(m => 
                        (m.senderId === currentUser.id && m.receiverId === targetReceiverId) ||
                        (m.senderId === targetReceiverId && m.receiverId === currentUser.id)
                      );

                      return (
                        <div className="flex-1 flex flex-col justify-between overflow-hidden">
                          <div className="flex justify-between items-center border-b border-slate-200 pb-2 mb-2">
                            <span className="text-xs font-bold text-slate-800 font-sans">Chatting with {receiverObj?.name || "Peer"}</span>
                            <span className="text-[9.5px] bg-emerald-50 text-emerald-700 px-1.5 py-0.2 rounded font-bold uppercase">Active Path</span>
                          </div>

                          <div className="flex-1 overflow-y-auto space-y-2 pr-1 text-xs">
                            {myChats.length === 0 ? (
                              <p className="text-slate-400 italic text-center py-12">No communication logs recorded. Initiate conversation below!</p>
                            ) : (
                              myChats.map(ch => {
                                const isMe = ch.senderId === currentUser.id;
                                return (
                                  <div key={ch.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                                    <div className={`p-2.5 rounded-xl max-w-sm tracking-normal leading-normal italic text-[11px] ${isMe ? 'bg-indigo-600 text-white border-br-none text-right' : 'bg-white text-slate-755 border-bl-none text-left border'}`}>
                                      <p className="not-italic text-[10px] font-bold block opacity-75">{ch.senderName}</p>
                                      "{ch.content}"
                                      <span className="block text-[8.5px] opacity-60 font-mono text-right mt-1">
                                        {new Date(ch.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                      </span>
                                    </div>
                                  </div>
                                );
                              })
                            )}
                          </div>

                          <form onSubmit={handleSendChatSubmit} className="flex gap-2 pt-3 border-t border-slate-200 bg-linear-to-b from-transparent to-slate-100">
                            <input
                              type="text"
                              placeholder="Type peer direct message..."
                              value={chatPayload}
                              onChange={(e) => setChatPayload(e.target.value)}
                              className="text-xs bg-white border border-slate-250 p-2 rounded-xl flex-1 focus:outline-none"
                            />
                            <button
                              type="submit"
                              className="bg-indigo-650 hover:bg-slate-900 text-white p-2.5 rounded-xl transition cursor-pointer select-none"
                            >
                              <Send className="w-3.5 h-3.5" />
                            </button>
                          </form>
                        </div>
                      );
                    })() : (
                      <p className="text-xs text-slate-400 italic text-center py-20 bg-white rounded-xl border border-dashed border-slate-205 flex-1 flex items-center justify-center select-none font-sans">
                        Select a recipient peer on left directory list to clear communication path & send messages
                      </p>
                    )}
                  </div>

                </div>
              </div>
            )}

          </div>
        </main>
      </div>

      {/* Modern, non-blocking visual Toast Notification */}
      {toast && (
        <div className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 p-4 rounded-2xl border shadow-lg max-w-sm animate-bounce-short ${
          toast.type === "success" ? "bg-emerald-50 text-emerald-800 border-emerald-200" :
          toast.type === "error" ? "bg-red-50 text-red-800 border-red-200" :
          "bg-indigo-50 text-indigo-800 border-indigo-200"
        }`}>
          {toast.type === "success" && <CheckCircle className="w-5 h-5 text-emerald-500 shrink-0" />}
          {toast.type === "error" && <AlertTriangle className="w-5 h-5 text-red-500 shrink-0" />}
          {toast.type === "info" && <Bell className="w-5 h-5 text-indigo-500 shrink-0" />}
          <div className="flex-1">
            <p className="text-xs font-semibold font-sans leading-tight">{toast.message}</p>
          </div>
          <button 
            onClick={() => setToast(null)} 
            className="text-slate-400 hover:text-slate-600 transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}
