import React, { useState } from "react";
import { 
  Users, UserCheck, Shield, Key, Download, Upload, Eye, Plus, Trash2, 
  Settings, CheckCircle, XCircle, AlertTriangle, FileSpreadsheet, ArrowRightLeft, BookOpen, UserMinus
} from "lucide-react";
import { User, AdmissionInquiry, Student, UserRole, ClassSection } from "../types.js";

interface AdminViewsProps {
  activeTab: string;
  users: User[];
  admissions: AdmissionInquiry[];
  students: Student[];
  classes: ClassSection[];
  currentUser: User;
  onRefreshAll: () => void;
  // User Management
  onCreateUser: (payload: { name: string; email: string; role: UserRole; phone?: string }) => Promise<void>;
  onDeleteUser: (userId: string) => Promise<void>;
  // Admissions Management
  onReviewAdmission: (id: string, status: "Approved" | "Rejected", notes: string) => Promise<void>;
  // Pupil SIS Promotions
  onUpdateStudent: (id: string, payload: Partial<Student>) => Promise<void>;
  // Snapshots Backups
  backups: any[];
  onCreateBackup: (name: string) => Promise<void>;
  onRestoreBackup: (id: string) => Promise<void>;
  onUploadRestoreSnaps: (jsonContent: any) => Promise<void>;
  onShowToast?: (message: string, type: "success" | "error" | "info") => void;
}

export default function AdminViews({
  activeTab,
  users,
  admissions,
  students,
  classes,
  currentUser,
  onRefreshAll,
  onCreateUser,
  onDeleteUser,
  onReviewAdmission,
  onUpdateStudent,
  backups,
  onCreateBackup,
  onRestoreBackup,
  onUploadRestoreSnaps,
  onShowToast
}: AdminViewsProps) {
  // Local form triggers
  const [newUserOpen, setNewUserOpen] = useState(false);
  const [newUserName, setNewUserName] = useState("");
  const [newUserEmail, setNewUserEmail] = useState("");
  const [newUserRole, setNewUserRole] = useState<UserRole>(UserRole.TEACHER);
  const [newUserPhone, setNewUserPhone] = useState("");
  const [processing, setProcessing] = useState(false);
  const [errorText, setErrorText] = useState("");

  // Inquiries reviews
  const [inspectInqId, setInspectInqId] = useState<string | null>(null);
  const [inqNotes, setInqNotes] = useState("");

  // Target class promotion states
  const [promotingStudentId, setPromotingStudentId] = useState<string | null>(null);
  const [targetClass, setTargetClass] = useState("");
  const [targetSection, setTargetSection] = useState("A");

  // Snapshots UI
  const [backupName, setBackupName] = useState("");
  const [importingJson, setImportingJson] = useState("");

  // Search States
  const [userSearch, setUserSearch] = useState("");
  const [studentSearch, setStudentSearch] = useState("");

  // Handle New user registration
  const handleCreateUserSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUserName || !newUserEmail) return;
    setProcessing(true);
    setErrorText("");
    try {
      await onCreateUser({ name: newUserName, email: newUserEmail, role: newUserRole, phone: newUserPhone });
      if (onShowToast) {
        onShowToast(`Successfully added institutional role account for ${newUserName}!`, "success");
      }
      setNewUserOpen(false);
      setNewUserName("");
      setNewUserEmail("");
      setNewUserPhone("");
    } catch (err: any) {
      setErrorText(err.message || "Failed registering profile.");
    } finally {
      setProcessing(false);
    }
  };

  // Run JSON backup restoration upload
  const handleUploadBackupText = async () => {
    if (!importingJson) return;
    try {
      const parsed = JSON.parse(importingJson);
      await onUploadRestoreSnaps(parsed);
      if (onShowToast) {
        onShowToast("System restored successfully from snapshot payload!", "success");
      } else {
        alert("System restored successfully from snapshot payload!");
      }
      setImportingJson("");
    } catch (err: any) {
      if (onShowToast) {
        onShowToast("Restoration rejected: " + (err.message || "Invalid JSON syntax."), "error");
      } else {
        alert("Restoration rejected: " + (err.message || "Invalid JSON syntax."));
      }
    }
  };

  if (activeTab === "users") {
    const filteredUsers = users.filter(u => 
      u.name.toLowerCase().includes(userSearch.toLowerCase()) || 
      u.email.toLowerCase().includes(userSearch.toLowerCase()) ||
      u.role.toLowerCase().includes(userSearch.toLowerCase())
    );

    return (
      <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-xs text-left" id="admin-user-management-panel">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-slate-100 pb-4 mb-6 gap-4">
          <div>
            <h3 className="text-base font-bold text-slate-800">Operational Accounts Directory</h3>
            <p className="text-xs text-slate-400 mt-0.5">Edit system participants, roles, and status locks</p>
          </div>
          <div className="flex items-center gap-2.5">
            <input
              type="text"
              placeholder="Search people, mail, role..."
              value={userSearch}
              onChange={(e) => setUserSearch(e.target.value)}
              className="text-xs border border-slate-205 rounded-xl px-3.5 py-2 w-48 sm:w-60 focus:outline-none focus:border-indigo-500 bg-slate-50/50"
            />
            <button
              onClick={() => setNewUserOpen(true)}
              className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold px-4 py-2 rounded-xl transition-all flex items-center shadow-xs"
            >
              <Plus className="w-3.5 h-3.5 mr-1" /> Add Account
            </button>
          </div>
        </div>

        {newUserOpen && (
          <div className="bg-slate-50 p-5 rounded-2xl border border-slate-150 mb-6 relative animate-fadeIn">
            <h4 className="text-sm font-semibold text-slate-800 mb-3">Register New Administrative Profile</h4>
            <form onSubmit={handleCreateUserSubmit} className="grid grid-cols-1 sm:grid-cols-4 gap-4">
              <div>
                <label className="block text-[11px] font-semibold text-slate-500 mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. David Tennant"
                  value={newUserName}
                  onChange={(e) => setNewUserName(e.target.value)}
                  className="text-xs bg-white border border-slate-200 rounded-lg px-3 py-2 w-full focus:outline-none focus:border-indigo-550"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-500 mb-1">Email Address</label>
                <input
                  type="email"
                  required
                  placeholder="e.g. tennant@school.com"
                  value={newUserEmail}
                  onChange={(e) => setNewUserEmail(e.target.value)}
                  className="text-xs bg-white border border-slate-200 rounded-lg px-3 py-2 w-full focus:outline-none focus:border-indigo-550"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-500 mb-1">Phone Number</label>
                <input
                  type="text"
                  placeholder="+1 (555) 234-5678"
                  value={newUserPhone}
                  onChange={(e) => setNewUserPhone(e.target.value)}
                  className="text-xs bg-white border border-slate-200 rounded-lg px-3 py-2 w-full focus:outline-none focus:border-indigo-550"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-500 mb-1">System Role Policy</label>
                <select
                  value={newUserRole}
                  onChange={(e) => setNewUserRole(e.target.value as UserRole)}
                  className="text-xs bg-white border border-slate-200 rounded-lg px-3 py-2 w-full focus:outline-none focus:border-indigo-550"
                >
                  <option value={UserRole.ADMIN}>Admin</option>
                  <option value={UserRole.PRINCIPAL}>Principal</option>
                  <option value={UserRole.TEACHER}>Teacher</option>
                  <option value={UserRole.PARENT}>Parent</option>
                  <option value={UserRole.ACCOUNTANT}>Accountant</option>
                  <option value={UserRole.LIBRARIAN}>Librarian</option>
                </select>
              </div>
              <div className="sm:col-span-4 flex justify-end gap-2.5 mt-2">
                <button
                  type="button"
                  onClick={() => setNewUserOpen(false)}
                  className="text-xs text-slate-500 px-3 py-2 hover:bg-slate-100 rounded-lg transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={processing}
                  className="bg-indigo-600 hover:bg-indigo-750 text-white text-xs font-semibold px-4 py-2 rounded-lg transition-all cursor-pointer"
                >
                  {processing ? "Adding..." : "Log Profile Instance"}
                </button>
              </div>
            </form>
            {errorText && <p className="text-red-500 text-xs font-medium mt-3 italic">{errorText}</p>}
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-100 text-slate-400 font-semibold bg-slate-50/50">
                <th className="py-3 px-4">Profile Name</th>
                <th className="py-3 px-4">Registered Email</th>
                <th className="py-3 px-4">Permitted Role</th>
                <th className="py-3 px-4">Contacts</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Administrative Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((user) => (
                <tr key={user.id} className="border-b border-slate-50 hover:bg-slate-50/50 transition-all">
                  <td className="py-3 px-4 font-semibold text-slate-700 flex items-center gap-2">
                    <div className="w-7 h-7 bg-indigo-50 text-indigo-650 flex items-center justify-center rounded-full font-bold text-[10px]">
                      {user.name.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase()}
                    </div>
                    {user.name}
                  </td>
                  <td className="py-3 px-4 text-slate-500 font-mono">{user.email}</td>
                  <td className="py-3 px-4">
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide
                      ${user.role === UserRole.SUPER_ADMIN || user.role === UserRole.ADMIN ? "bg-red-50 text-red-550 border border-red-200" : ""}
                      ${user.role === UserRole.PRINCIPAL ? "bg-purple-100 text-purple-700 font-semibold" : ""}
                      ${user.role === UserRole.TEACHER ? "bg-blue-100 text-blue-750" : ""}
                      ${user.role === UserRole.STUDENT ? "bg-emerald-50 text-emerald-700" : ""}
                      ${user.role === UserRole.PARENT ? "bg-pink-100 text-pink-700" : ""}
                      ${user.role === UserRole.ACCOUNTANT ? "bg-orange-100 text-orange-700" : ""}
                      ${user.role === UserRole.LIBRARIAN ? "bg-teal-100 text-teal-700" : ""}
                    `}>
                      {user.role}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-slate-500">{user.phone || "—"}</td>
                  <td className="py-3 px-4">
                    <span className="flex items-center gap-1.5 text-emerald-600 font-medium font-sans">
                      <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></span>
                      {user.status}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    {user.id === currentUser.id ? (
                      <span className="text-[10px] text-slate-400 italic">Self (Active)</span>
                    ) : (
                      <button
                        onClick={() => onDeleteUser(user.id)}
                        className="text-slate-400 hover:text-red-600 p-1 rounded-lg hover:bg-red-50 transition-all cursor-pointer"
                        title="Archive Account"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  if (activeTab === "admissions") {
    return (
      <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-xs text-left" id="admin-admissions-panel">
        <div className="border-b border-slate-100 pb-4 mb-6">
          <h3 className="text-base font-bold text-slate-800">Enrollment & Admissions Registrar</h3>
          <p className="text-xs text-slate-400 mt-0.5">Inspect incoming inquiries, verify sub-documents, and approve child placement</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Active List */}
          <div className="lg:col-span-2 overflow-x-auto">
            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Awaiting Admission Reviews ({admissions.filter(a => a.status === 'Pending').length})</h4>
            <div className="space-y-3.5">
              {admissions.map((inq) => (
                <div 
                  key={inq.id} 
                  className={`p-4 rounded-xl border transition-all cursor-pointer ${inspectInqId === inq.id ? "border-indigo-400 bg-indigo-50/20" : "border-slate-150 bg-white hover:bg-slate-50/50"}`}
                  onClick={() => {
                    setInspectInqId(inq.id);
                    setInqNotes(inq.reviewNotes || "");
                  }}
                >
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                    <div>
                      <h4 className="text-xs font-bold font-sans text-slate-800 flex items-center gap-1.5">
                        <Users className="w-3.5 h-3.5 text-slate-400" />
                        {inq.applicantName}
                      </h4>
                      <p className="text-[11px] text-slate-400 mt-0.5">Target: <strong className="text-slate-600 font-semibold">{inq.gradeClass}</strong> | Guardian: {inq.parentName}</p>
                    </div>

                    <div className="flex items-center gap-2.5">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider
                        ${inq.status === "Pending" ? "bg-amber-100 text-amber-700" : ""}
                        ${inq.status === "Approved" ? "bg-emerald-100 text-emerald-800" : ""}
                        ${inq.status === "Rejected" ? "bg-red-100 text-red-700" : ""}
                      `}>
                        {inq.status}
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono">{inq.date}</span>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-3 mt-3 items-center text-[10px] text-slate-500 font-mono bg-slate-50 p-2 rounded-lg border border-slate-100">
                    <span className="flex items-center">
                      <span className={`w-2 h-2 rounded-full mr-1.5 ${inq.birthCertUploaded ? "bg-emerald-500" : "bg-red-400"}`}></span> 
                      Birth Cert
                    </span>
                    <span className="flex items-center">
                      <span className={`w-2 h-2 rounded-full mr-1.5 ${inq.parentCnicUploaded ? "bg-emerald-500" : "bg-red-400"}`}></span> 
                      CNIC
                    </span>
                    <span className="flex items-center">
                      <span className={`w-2 h-2 rounded-full mr-1.5 ${inq.marksSheetUploaded ? "bg-emerald-500" : "bg-red-400"}`}></span> 
                      Academic Transcript
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Review Inspect Drawer */}
          <div className="bg-slate-50/50 p-5 rounded-2xl border border-slate-150">
            <h4 className="text-xs font-bold text-slate-600 uppercase tracking-widest mb-4">Inquiry File Inspector</h4>
            {inspectInqId ? (() => {
              const inqIdx = admissions.find(a => a.id === inspectInqId);
              if (!inqIdx) return <p className="text-xs text-slate-400 italic">No inquiry active.</p>;

              return (
                <div className="space-y-4 text-xs font-sans">
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-semibold">Verification Target Scholar</span>
                    <p className="text-sm font-bold text-slate-800 mt-0.5">{inqIdx.applicantName}</p>
                    <p className="text-slate-500 font-mono mt-0.5">{inqIdx.email} | {inqIdx.phone}</p>
                  </div>

                  <div className="border-t border-slate-150 pt-3">
                    <span className="text-slate-400 block text-[10px] uppercase font-semibold">Compliance Checklist Status</span>
                    <ul className="space-y-1.5 mt-2">
                      <li className="flex justify-between items-center bg-white p-2 rounded-md border border-slate-100">
                        <span>Official Birth Cert / DOB Verified</span>
                        {inqIdx.birthCertUploaded ? <CheckCircle className="w-4.5 h-4.5 text-emerald-500" /> : <XCircle className="w-4.5 h-4.5 text-red-400" />}
                      </li>
                      <li className="flex justify-between items-center bg-white p-2 rounded-md border border-slate-100">
                        <span>Parent Bio Verification CNIC</span>
                        {inqIdx.parentCnicUploaded ? <CheckCircle className="w-4.5 h-4.5 text-emerald-500" /> : <XCircle className="w-4.5 h-4.5 text-red-400" />}
                      </li>
                      <li className="flex justify-between items-center bg-white p-2 rounded-md border border-slate-100">
                        <span>Prior Academic Record Uploaded</span>
                        {inqIdx.marksSheetUploaded ? <CheckCircle className="w-4.5 h-4.5 text-emerald-500" /> : <XCircle className="w-4.5 h-4.5 text-red-00" />}
                      </li>
                    </ul>
                  </div>

                  <div className="border-t border-slate-150 pt-3">
                    <label className="block text-[10px] text-slate-400 uppercase font-semibold mb-1">Inquiry Assessment Comments</label>
                    <textarea
                      placeholder="Add review feedback, required documents, or approval terms..."
                      value={inqNotes}
                      onChange={(e) => setInqNotes(e.target.value)}
                      className="w-full text-xs bg-white border border-slate-200 rounded-lg p-2.5 h-20 focus:outline-none focus:border-indigo-500 font-sans"
                    />
                  </div>

                  {inqIdx.status === "Pending" ? (
                    <div className="grid grid-cols-2 gap-2 mt-2">
                      <button
                        onClick={async () => {
                          setProcessing(true);
                          await onReviewAdmission(inspectInqId, "Rejected", inqNotes);
                          setProcessing(false);
                          setInspectInqId(null);
                        }}
                        disabled={processing}
                        className="bg-red-50 hover:bg-red-100 text-red-650 font-bold py-2 rounded-lg transition-all border border-red-200 cursor-pointer"
                      >
                        Reject File
                      </button>
                      <button
                        onClick={async () => {
                          setProcessing(true);
                          await onReviewAdmission(inspectInqId, "Approved", inqNotes);
                          setProcessing(false);
                          setInspectInqId(null);
                        }}
                        disabled={processing}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2 rounded-lg transition-all shadow-xs cursor-pointer"
                      >
                        Approve & Enroll
                      </button>
                    </div>
                  ) : (
                    <div className="bg-slate-100 p-2.5 rounded-lg border border-slate-150 text-center font-mono text-[10.5px]">
                      Inspection Resolved: <strong>{inqIdx.status}</strong>
                    </div>
                  )}

                  <p className="text-[9.5px] text-amber-600 leading-snug p-2 bg-amber-50 rounded-lg border border-amber-100">
                    *Note: Approval auto-allocates an Admission Invoice of $700, publishes student database nodes, and compiles student credentials automatically!
                  </p>
                </div>
              );
            })() : (
              <p className="text-xs text-slate-400 italic text-center py-10 bg-white border border-dashed border-slate-200 rounded-xl">
                Select an awaiting inquiry from primary list to review files & issue enrollment approvals
              </p>
            )}
          </div>
        </div>
      </div>
    );
  }

  if (activeTab === "sis") {
    const filteredPupils = students.filter(s => 
      s.name.toLowerCase().includes(studentSearch.toLowerCase()) ||
      s.rollNumber.toLowerCase().includes(studentSearch.toLowerCase())
    );

    return (
      <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-xs text-left" id="admin-student-information-system">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-slate-100 pb-4 mb-6 gap-4">
          <div>
            <h3 className="text-base font-bold text-slate-800">Student Profile Database (SIS)</h3>
            <p className="text-xs text-slate-400 mt-0.5">Control enrollment classes, promote grades, or archive student lifecycle statuses</p>
          </div>
          <div>
            <input
              type="text"
              placeholder="Search scholar roll, name..."
              value={studentSearch}
              onChange={(e) => setStudentSearch(e.target.value)}
              className="text-xs border border-slate-205 rounded-xl px-3.5 py-2 w-full sm:w-64 focus:outline-none focus:border-indigo-550 bg-slate-50/55"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 text-slate-400 font-semibold bg-slate-50/50">
                <th className="py-3 px-4">Student Roll</th>
                <th className="py-3 px-4">Name Particulars</th>
                <th className="py-3 px-4">Assigned Grade No</th>
                <th className="py-3 px-4">Linked Guardian ID</th>
                <th className="py-3 px-4">Birth Date</th>
                <th className="py-3 px-4">Lifecycle State</th>
                <th className="py-3 px-4 text-right">Class Operations</th>
              </tr>
            </thead>
            <tbody>
              {filteredPupils.map((st) => (
                <tr key={st.id} className="border-b border-slate-5 transition-all hover:bg-slate-50/50">
                  <td className="py-3 px-4 font-bold font-mono text-indigo-650">{st.rollNumber}</td>
                  <td className="py-3 px-4 text-slate-800 font-semibold">{st.name}</td>
                  <td className="py-3 px-4 text-slate-600">
                    {classes.find(c => c.id === st.classId)?.name || st.classId} [Sec {st.sectionId}]
                  </td>
                  <td className="py-3 px-4 text-slate-400 font-mono">{st.parentId}</td>
                  <td className="py-3 px-4 text-slate-500 font-mono">{st.dob}</td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase
                      ${st.status === "Active" ? "bg-emerald-50 text-emerald-750 border border-emerald-100" : ""}
                      ${st.status === "Graduated" ? "bg-sky-50 text-sky-700 border border-sky-100" : ""}
                      ${st.status === "Archived" ? "bg-slate-100 text-slate-600" : ""}
                    `}>
                      {st.status}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <div className="flex justify-end gap-2 text-slate-400">
                      <button 
                        onClick={() => {
                          setPromotingStudentId(st.id);
                          setTargetClass(st.classId);
                          setTargetSection(st.sectionId);
                        }}
                        className="text-xs text-indigo-600 hover:text-indigo-800 hover:bg-indigo-50 px-2 py-1 rounded transition-all font-semibold flex items-center"
                        title="Promote Class"
                      >
                        <ArrowRightLeft className="w-3 h-3 mr-1" /> Promote
                      </button>
                      <button 
                        onClick={() => onUpdateStudent(st.id, { status: "Graduated" })}
                        className="text-xs text-slate-500 hover:text-emerald-700 hover:bg-emerald-50 px-2 py-1 rounded transition-all font-semibold flex items-center"
                        title="Mark Graduated"
                      >
                        Graduate
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Promotions Modal Pop */}
        {promotingStudentId && (
          <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl border border-slate-150 p-6 max-w-sm w-full shadow-2xl space-y-4">
              <h4 className="text-sm font-bold text-slate-800">Assign Grade Promotion / Section Transfer</h4>
              <p className="text-xs text-slate-400">Reallocates this student to target academics registry</p>
              
              <div className="space-y-3.5">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-500 mb-1">Target Academic Class</label>
                  <select 
                    value={targetClass} 
                    onChange={(e) => setTargetClass(e.target.value)}
                    className="text-xs w-full bg-white border border-slate-200 rounded-lg p-2 focus:outline-none focus:border-indigo-500"
                  >
                    {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-500 mb-1">Classroom Assigned Section</label>
                  <select 
                    value={targetSection} 
                    onChange={(e) => setTargetSection(e.target.value)}
                    className="text-xs w-full bg-white border border-slate-200 rounded-lg p-2 focus:outline-none focus:border-indigo-500"
                  >
                    <option value="A">Section A</option>
                    <option value="B">Section B</option>
                    <option value="C">Section C</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button 
                  onClick={() => setPromotingStudentId(null)}
                  className="text-xs text-slate-500 px-3.5 py-1.5 hover:bg-slate-50 rounded-lg transition-all"
                >
                  Cancel
                </button>
                <button 
                  onClick={async () => {
                    await onUpdateStudent(promotingStudentId, { classId: targetClass, sectionId: targetSection });
                    setPromotingStudentId(null);
                  }}
                  className="bg-indigo-600 text-white text-xs font-bold px-4 py-1.5 rounded-lg hover:bg-indigo-700 transition"
                >
                  Update Records
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  if (activeTab === "security") {
    const modulesToExport = ["students", "teachers", "results", "fees", "attendance", "parents"];

    return (
      <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-xs text-left" id="admin-security-backup-recovery">
        <div className="border-b border-slate-100 pb-4 mb-6">
          <h3 className="text-base font-bold text-slate-800">Security Control, Excel Exporter & JSON Backups</h3>
          <p className="text-xs text-slate-400 mt-0.5">Maintain system database snapshots, synchronize rollbacks, or export Excel-ready spreadsheets</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          
          {/* Module 1: Excel Backup System Exporter */}
          <div className="space-y-4">
            <div className="bg-indigo-50/30 p-4 rounded-xl border border-indigo-100">
              <span className="text-[10px] bg-indigo-100 text-indigo-750 px-2 py-0.5 rounded font-mono font-bold uppercase">Enterprise Spec</span>
              <h4 className="text-sm font-bold text-slate-800 mt-1.5">Offline Excel spreadsheet Exporter</h4>
              <p className="text-xs text-slate-500 mt-0.5">Click any module node to compile and download Excel-compatible .csv spreadsheets instantly.</p>
            </div>

            <div className="grid grid-cols-2 gap-3.5">
              {modulesToExport.map(mod => (
                <a
                  key={mod}
                  href={`/api/backups/export/${mod}`}
                  download
                  className="p-3 bg-white border border-slate-150 rounded-xl hover:border-indigo-400 hover:bg-indigo-50/10 hover:shadow-xs transition-all flex items-center gap-2.5 group cursor-pointer text-xs"
                >
                  <FileSpreadsheet className="w-5 h-5 text-emerald-500 group-hover:scale-105 transition-transform" />
                  <div>
                    <span className="font-bold text-slate-700 uppercase tracking-wide text-[10.5px] block">{mod}.xlsx</span>
                    <span className="text-[9.5px] text-slate-400">Download Sheet</span>
                  </div>
                </a>
              ))}
            </div>

            <div className="border-t border-slate-100 pt-4">
              <h4 className="text-xs font-bold text-slate-600 uppercase tracking-widest mb-3">Upload Snapshot Restoration (.json)</h4>
              <textarea
                placeholder="Paste JSON full-database recovery payload string here and click run..."
                value={importingJson}
                onChange={(e) => setImportingJson(e.target.value)}
                className="w-full h-24 bg-slate-50 border border-slate-200 rounded-lg p-2 text-[10.5px] font-mono focus:outline-none focus:bg-white text-slate-600"
              />
              <button
                onClick={handleUploadBackupText}
                className="bg-indigo-650 hover:bg-indigo-750 text-white text-xs font-bold px-4 py-2 mt-2 rounded-xl transition-all flex items-center justify-center w-full shadow-xs cursor-pointer"
              >
                <Upload className="w-4 h-4 mr-1.5" /> Execute Snapshot Injection Rollback
              </button>
            </div>
          </div>

          {/* Module 2: State Rollback Snaps */}
          <div className="space-y-4">
            <h4 className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
              <Settings className="w-4.5 h-4.5 text-slate-500" />
              Dynamic Server Restore Points
            </h4>

            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex gap-2">
              <input
                type="text"
                placeholder="Point Tag: e.g. Pre-Exam Clearance"
                value={backupName}
                onChange={(e) => setBackupName(e.target.value)}
                className="text-xs bg-white border border-slate-250 rounded-lg px-3 py-2 flex-1 focus:outline-none focus:border-indigo-500"
              />
              <button
                onClick={async () => {
                  if (!backupName) return;
                  await onCreateBackup(backupName);
                  setBackupName("");
                }}
                className="bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold px-4 py-2 rounded-lg transition shrink-0 flex items-center"
              >
                Capture Snap
              </button>
            </div>

            <div className="space-y-2.5 max-h-[290px] overflow-y-auto pr-1">
              {/* Static Seeding Rollback Option */}
              <div className="p-3 bg-indigo-50/20 border border-indigo-100 rounded-xl flex justify-between items-center">
                <div>
                  <h5 className="font-bold text-slate-700 text-xs flex items-center">
                    <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full mr-1.5"></span>
                    Primary Seed Records Rollback
                  </h5>
                  <p className="text-[10px] text-slate-500 mt-0.5">Default demo users, books, class rosters & schedule nodes</p>
                </div>
                <button
                  onClick={() => onRestoreBackup("initial-seed")}
                  className="bg-indigo-100 hover:bg-indigo-200 text-indigo-700 text-[11px] font-bold px-3 py-1.5 rounded-lg transition cursor-pointer"
                >
                  Load Seed
                </button>
              </div>

              {backups.map((bk, idx) => (
                <div key={bk.id} className="p-3 bg-white border border-slate-150 rounded-xl flex justify-between items-center">
                  <div>
                    <h5 className="font-bold text-slate-700 text-xs">{bk.name}</h5>
                    <p className="text-[10px] text-slate-400 mt-0.5 font-mono">{bk.timestamp} | {bk.size} | {bk.recordCount} entries</p>
                  </div>
                  <button
                    onClick={() => onRestoreBackup(bk.id)}
                    className="bg-slate-100 hover:bg-slate-200 text-slate-750 text-[11px] font-bold px-3 py-1.5 rounded-lg transition cursor-pointer"
                  >
                    Restore
                  </button>
                </div>
              ))}
            </div>
            
            <p className="text-[10px] text-slate-400 leading-snug">
              *Security Protection: Every manual rollback or Snapshot creation appends a transaction node to the live security logger with timestamps and IP trackers.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return null;
}
