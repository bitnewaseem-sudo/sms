import React, { useState } from "react";
import { 
  Plus, Calendar, Clock, BookOpen, UserCheck, Trash2, ShieldCheck, 
  Search, Award, Printer, ShieldAlert, BadgeCheck, FileText 
} from "lucide-react";
import { 
  User, Student, ClassSection, Subject, Teacher, TimetableEntry, Certificate 
} from "../types.js";

interface AcademicViewsProps {
  activeTab: string;
  currentUser: User;
  students: Student[];
  classes: ClassSection[];
  subjects: Subject[];
  teachers: Teacher[];
  timetables: TimetableEntry[];
  certificates: Certificate[];
  onRefreshAll: () => void;
  // Timetables
  onCreateTimetable: (payload: any) => Promise<void>;
  onDeleteTimetable: (id: string) => Promise<void>;
  // Certificates
  onIssueCertificate: (payload: { studentId: string; certificateType: string; notes?: string }) => Promise<void>;
}

export default function AcademicViews({
  activeTab,
  currentUser,
  students,
  classes,
  subjects,
  teachers,
  timetables,
  certificates,
  onRefreshAll,
  onCreateTimetable,
  onDeleteTimetable,
  onIssueCertificate
}: AcademicViewsProps) {
  // States: Timetable creator
  const [ttOpen, setTtOpen] = useState(false);
  const [ttClassId, setTtClassId] = useState("c-g10");
  const [ttSection, setTtSection] = useState("A");
  const [ttSubject, setTtSubject] = useState("sub-math");
  const [ttTeacher, setTtTeacher] = useState("u-teacher");
  const [ttRoom, setTtRoom] = useState("Room 101");
  const [ttDay, setTtDay] = useState<any>("Monday");
  const [ttStart, setTtStart] = useState("08:30");
  const [ttEnd, setTtEnd] = useState("09:30");
  const [ttErrors, setTtErrors] = useState("");

  // States: Certificate generation
  const [certStudentId, setCertStudentId] = useState("u-student");
  const [certType, setCertType] = useState<any>("Achievement");
  const [certNotes, setCertNotes] = useState("");
  const [printingCertId, setPrintingCertId] = useState<string | null>(null);

  // States: Verification panel
  const [verifyCode, setVerifyCode] = useState("");
  const [verifiedTarget, setVerifiedTarget] = useState<Certificate | null>(null);
  const [verifyChecked, setVerifyChecked] = useState(false);

  const handleCreateTimetableSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setTtErrors("");
    try {
      await onCreateTimetable({
        classId: ttClassId,
        sectionId: ttSection,
        subjectId: ttSubject,
        teacherId: ttTeacher,
        room: ttRoom,
        dayOfWeek: ttDay,
        startTime: ttStart,
        endTime: ttEnd
      });
      setTtOpen(false);
    } catch (err: any) {
      setTtErrors(err.message || "Conflict error mapping calendar node.");
    }
  };

  const handleVerifyLookup = () => {
    setVerifyChecked(true);
    const found = certificates.find(c => c.uniqueValidationCode.toLowerCase().trim() === verifyCode.toLowerCase().trim());
    setVerifiedTarget(found || null);
  };

  if (activeTab === "timetables") {
    const weekdays = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
    const isSchedulerAdmin = ["ADMIN", "SUPER_ADMIN", "PRINCIPAL"].includes(currentUser.role);

    return (
      <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-xs text-left" id="academic-timetable-panel">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-slate-100 pb-4 mb-6 gap-4 font-sans">
          <div>
            <h3 className="text-base font-bold text-slate-800">Master School Timetable & Allocation</h3>
            <p className="text-xs text-slate-400 mt-0.5">Allocate rooms, schedule subject matrices, and analyze resource conflict tracks</p>
          </div>
          {isSchedulerAdmin && (
            <button
              onClick={() => { setTtOpen(true); setTtErrors(""); }}
              className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold px-4 py-2 rounded-xl transition flex items-center shadow-xs cursor-pointer"
            >
              <Plus className="w-4 h-4 mr-1" /> Add Timetable Node
            </button>
          )}
        </div>

        {ttOpen && (
          <div className="bg-slate-50 p-5 rounded-2xl border border-slate-150 mb-6 transition animate-fadeIn text-xs">
            <h4 className="text-sm font-bold text-slate-800 mb-3">Plan New Timetable Session Node</h4>
            <form onSubmit={handleCreateTimetableSubmit} className="grid grid-cols-1 sm:grid-cols-4 gap-4">
              <div>
                <label className="block text-[11px] font-semibold text-slate-500 mb-1">Target Class Grade</label>
                <select 
                  value={ttClassId} 
                  onChange={(e) => setTtClassId(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-lg p-2 focus:outline-none"
                >
                  {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-500 mb-1">Section Letter</label>
                <select 
                  value={ttSection} 
                  onChange={(e) => setTtSection(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-lg p-2 focus:outline-none"
                >
                  <option value="A">Section A</option>
                  <option value="B">Section B</option>
                  <option value="C">Section C</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-500 mb-1">Select Course Unit</label>
                <select 
                  value={ttSubject} 
                  onChange={(e) => setTtSubject(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-lg p-2 focus:outline-none font-sans"
                >
                  {subjects.map(s => <option key={s.id} value={s.id}>{s.name} ({s.code})</option>)}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-500 mb-1">Lecturer In-charge</label>
                <select 
                  value={ttTeacher} 
                  onChange={(e) => setTtTeacher(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-lg p-2"
                >
                  {teachers.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-500 mb-1">Allocated Suite Room</label>
                <input 
                  type="text"
                  required
                  placeholder="e.g. Room 402"
                  value={ttRoom}
                  onChange={(e) => setTtRoom(e.target.value)}
                  className="w-full bg-white border border-slate-205 rounded-lg p-2"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-500 mb-1">Weekday Assignment</label>
                <select 
                  value={ttDay} 
                  onChange={(e) => setTtDay(e.target.value)}
                  className="w-full bg-white border border-slate-205 rounded-lg p-2 font-sans"
                >
                  <option value="Monday">Monday</option>
                  <option value="Tuesday">Tuesday</option>
                  <option value="Wednesday">Wednesday</option>
                  <option value="Thursday">Thursday</option>
                  <option value="Friday">Friday</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-500 mb-1">Starting Period</label>
                <input 
                  type="time" 
                  required
                  value={ttStart}
                  onChange={(e) => setTtStart(e.target.value)}
                  className="w-full bg-white border border-slate-205 p-2 font-mono"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-500 mb-1">Dismissal Period</label>
                <input 
                  type="time" 
                  required
                  value={ttEnd}
                  onChange={(e) => setTtEnd(e.target.value)}
                  className="w-full bg-white border border-slate-205 p-2 font-mono"
                />
              </div>

              <div className="sm:col-span-4 flex justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setTtOpen(false)}
                  className="text-slate-500 hover:bg-slate-100 p-2 rounded-md"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-indigo-600 text-white font-bold p-2 px-4 rounded-md hover:bg-indigo-750 transition"
                >
                  Save Schedule Slot
                </button>
              </div>
            </form>
            {ttErrors && (
              <p className="text-red-500 font-semibold italic flex items-center bg-red-50 border border-red-150 p-2.5 rounded-lg mt-3 text-left leading-normal">
                <ShieldAlert className="w-4.5 h-4.5 shrink-0 mr-1.5" />
                {ttErrors}
              </p>
            )}
          </div>
        )}

        {/* Dynamic Timetable Workgrid */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {weekdays.map(day => {
            const dayEntries = timetables.filter(t => t.dayOfWeek === day);

            return (
              <div key={day} className="bg-slate-50 p-3 rounded-xl border border-slate-100 min-h-[220px]">
                <h4 className="text-xs font-bold text-slate-600 uppercase tracking-widest border-b border-slate-200 pb-1.5 mb-2.5 text-center">
                  {day}
                </h4>
                
                <div className="space-y-2 text-[10.5px]">
                  {dayEntries.length === 0 ? (
                    <p className="text-[10px] text-slate-400 italic text-center py-6">Empty Period block</p>
                  ) : (
                    dayEntries.map(entry => {
                      const subjName = subjects.find(s => s.id === entry.subjectId)?.name || entry.subjectId;
                      const tutorName = teachers.find(t => t.id === entry.teacherId)?.name || entry.teacherId;
                      const classNameVal = classes.find(c => c.id === entry.classId)?.name || entry.classId;

                      return (
                        <div key={entry.id} className="bg-white border border-slate-200 p-2.5 rounded-lg shadow-2xs relative group text-left">
                          <div className="flex justify-between items-start">
                            <span className="font-bold text-slate-800 tracking-tight leading-tight block">{subjName}</span>
                            {isSchedulerAdmin && (
                              <button
                                onClick={() => onDeleteTimetable(entry.id)}
                                className="text-slate-300 hover:text-red-550 opacity-0 group-hover:opacity-100 transition duration-150 p-0.5"
                                title="Prune Period"
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            )}
                          </div>
                          <p className="text-slate-550 text-[10px] font-mono mt-1 mb-1.5 flex items-center">
                            <Clock className="w-3 h-3 text-slate-400 mr-1" />
                            {entry.startTime} - {entry.endTime}
                          </p>
                          <div className="flex justify-between text-[9.5px] border-t border-slate-100 pt-1 text-slate-400 uppercase tracking-tight">
                            <span>{entry.room}</span>
                            <span className="font-semibold text-slate-600">{classNameVal} {entry.sectionId}</span>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  if (activeTab === "certificates") {
    const isCertAdmin = ["ADMIN", "SUPER_ADMIN", "PRINCIPAL"].includes(currentUser.role);

    return (
      <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-xs text-left" id="academic-certificates-panel">
        <div className="border-b border-slate-100 pb-4 mb-6">
          <h3 className="text-base font-bold text-slate-800">Honor Diplomas & Character Certificates</h3>
          <p className="text-xs text-slate-400 mt-0.5">Issue certified academic awards,Leaving and character certificates with secure audit codes</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 text-xs">
          {/* Section 1: Issue certificates */}
          <div className="space-y-4">
            {isCertAdmin ? (
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-150 space-y-3.5">
                <h4 className="text-xs font-bold text-slate-600 uppercase tracking-widest">Generate Diploma Credentials</h4>
                
                <div>
                  <label className="block text-[10px] font-semibold text-slate-500 mb-1">Target Graduate Scholar</label>
                  <select 
                    value={certStudentId} 
                    onChange={(e) => setCertStudentId(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-md p-2 font-sans"
                  >
                    {students.map(s => <option key={s.id} value={s.id}>{s.name} ({s.rollNumber})</option>)}
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-semibold text-slate-500 mb-1">Certificate Template Type</label>
                  <select 
                    value={certType} 
                    onChange={(e) => setCertType(e.target.value)}
                    className="w-full bg-white border border-slate-200 p-2 rounded-md font-sans"
                  >
                    <option value="Character">Character certificate</option>
                    <option value="Bonafide">Bonafide Certificate</option>
                    <option value="Leaving">Leaving Certificate</option>
                    <option value="Achievement">Achievement Medal Diploma</option>
                    <option value="Completion">Course Completion Certification</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-semibold text-slate-500 mb-1">Official Notes / Remarks</label>
                  <textarea
                    placeholder="e.g. Exhibited superb leadership qualities..."
                    value={certNotes}
                    onChange={(e) => setCertNotes(e.target.value)}
                    className="w-full bg-white border border-slate-200 p-2 rounded-md h-16 h-18"
                  />
                </div>

                <button
                  onClick={async () => {
                    await onIssueCertificate({ studentId: certStudentId, certificateType: certType, notes: certNotes });
                    setCertNotes("");
                  }}
                  className="bg-indigo-600 hover:bg-indigo-755 text-white font-bold p-2 text-xs rounded-xl w-full transition cursor-pointer"
                >
                  Lock & Issue Certified Diploma
                </button>
              </div>
            ) : (
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-150 text-center text-slate-400 italic">
                *Only academic admins or principals hold permission protocols to issue certified diplomas. Browse Issued records on right screen.
              </div>
            )}

            {/* Validation Panel */}
            <div className="bg-indigo-50/10 border border-indigo-150 p-4 rounded-xl">
              <h4 className="text-xs font-bold text-indigo-750 uppercase tracking-widest flex items-center mb-1">
                <ShieldCheck className="w-4 h-4 mr-1.5 text-indigo-600" />
                Digital QR-Hash Validator
              </h4>
              <p className="text-[10px] text-slate-400 mb-3">Copy-Paste the validation reference code printed on diplomacy borders to check the database authenticity status.</p>
              
              <div className="flex gap-2">
                <input 
                  type="text"
                  placeholder="e.g. CERT-001-2026-X8S"
                  value={verifyCode}
                  onChange={(e) => setVerifyCode(e.target.value)}
                  className="text-xs bg-white border border-slate-200 rounded-md p-1.5 flex-1 font-mono uppercase focus:outline-none focus:border-indigo-650"
                />
                <button 
                  onClick={handleVerifyLookup}
                  className="bg-indigo-660 hover:bg-indigo-700 text-white font-bold px-3 py-1.5 rounded-md transition text-xs flex items-center select-none"
                >
                  <Search className="w-3.5 h-3.5 mr-0.5" /> Check
                </button>
              </div>

              {verifyChecked && (
                <div className="mt-3.5 text-[10.5px] border-t border-indigo-100 pt-2 text-left space-y-1 bg-white p-2.5 rounded border border-indigo-155 animate-fadeIn">
                  {verifiedTarget ? (
                    <div>
                      <div className="flex items-center text-emerald-600 font-bold font-sans">
                        <BadgeCheck className="w-4 h-4 mr-1 shrink-0" /> VALID CREDENTIAL FOUND
                      </div>
                      <p className="text-slate-700 mt-1">Scholar: <strong>{verifiedTarget.studentName}</strong></p>
                      <p className="text-slate-500">Degree: {verifiedTarget.certificateType} Diploma</p>
                      <p className="text-slate-400 font-mono text-[9.5px]">Clearance Date: {verifiedTarget.dateIssued}</p>
                    </div>
                  ) : (
                    <div className="flex items-center text-red-650 font-bold italic">
                      <ShieldAlert className="w-4 h-4 mr-1 shrink-0 bg-red-10" /> ID INVALID / SEC PROTOCOL REJECT
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* List and preview diplomas */}
          <div className="lg:col-span-2 space-y-4">
            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Issued Diplomas Registry ({certificates.length})</h4>
            
            <div className="space-y-4 overflow-y-auto max-h-[380px] pr-1">
              {certificates.map(cf => (
                <div key={cf.id} className="p-4 bg-white border border-slate-200 rounded-xl relative hover:border-slate-300 transition-all text-left">
                  <div className="flex justify-between items-start gap-2">
                    <div>
                      <span className="text-[10px] font-bold font-mono text-indigo-650 bg-indigo-50 border border-indigo-150 px-2 py-0.5 rounded uppercase">
                        {cf.certificateType} Certificate
                      </span>
                      <h4 className="text-xs font-bold text-slate-800 mt-2 font-sans flex items-center">
                        <Award className="w-4 h-4 mr-1.5 text-amber-500 shrink-0 animate-pulse" />
                        {cf.studentName}
                      </h4>
                      <p className="text-slate-400 text-[10.5px] italic mt-1 leading-normal bg-slate-50 border border-slate-100 p-2 rounded">
                        "{cf.notes || "No special commendation footnotes recorded."}"
                      </p>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="text-[10px] text-slate-400 block font-mono">Date: {cf.dateIssued}</span>
                      <span className="text-[8.5px] text-slate-400 block font-mono border border-indigo-100 rounded bg-indigo-50 p-1 font-bold mt-2 select-all select-none">
                        HASH: {cf.uniqueValidationCode}
                      </span>
                    </div>
                  </div>

                  <div className="flex justify-end pt-3">
                    <button
                      onClick={() => setPrintingCertId(cf.id)}
                      className="text-[11px] text-indigo-600 hover:text-indigo-800 font-bold flex items-center hover:underline cursor-pointer select-none"
                    >
                      <Printer className="w-3.5 h-3.5 mr-1" /> Load Print Display Template
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Certificate Display Print Modal */}
        {printingCertId && (() => {
          const printable = certificates.find(c => c.id === printingCertId);
          if (!printable) return null;

          return (
            <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
              <div className="bg-white rounded-3xl border border-slate-150 p-8 max-w-2xl w-full border-8 border-double border-indigo-350 shadow-2xl space-y-6 relative text-center">
                
                {/* Print watermark/borders */}
                <div className="absolute inset-2 border border-indigo-100 pointer-events-none rounded-2xl"></div>
                
                <span className="text-[10px] text-slate-400 uppercase tracking-widest block font-bold font-serif">OAKRIDGE EDUCATIONAL ACADEMY</span>
                <span className="text-indigo-600 font-serif font-bold text-2xl tracking-wide uppercase italic block mt-2">Diploma of Commendation</span>
                
                <div className="w-16 h-0.5 bg-indigo-200 mx-auto mt-4"></div>

                <div className="text-slate-550 italic font-serif leading-loose text-sm mt-6">
                  This certifies that distinguished scholar 
                  <p className="text-slate-800 font-bold not-italic font-sans text-xl uppercase tracking-wider mt-2.5 leading-none">{printable.studentName}</p>
                  has completed standard institutional requisites of Oakridge, and is hereby granted this official
                  <p className="text-indigo-700 font-bold not-italic font-serif text-lg py-1 select-all">{printable.certificateType} Certificate</p>
                  under verification code reference logs.
                </div>

                <p className="text-slate-500 font-sans italic text-xs max-w-md mx-auto leading-relaxed border-t border-slate-100 pt-4">
                  "{printable.notes || "Exhibited exceptional values of diligence, continuous query and character compliance."}"
                </p>

                <div className="flex justify-between items-end border-t border-slate-100 pt-6 mt-8 font-serif text-xs px-6">
                  <div className="text-left">
                    <span className="text-slate-700 block font-bold">Dr. Arthur Vance</span>
                    <span className="text-slate-400 font-sans text-[10px]">Academy Principal Registrar</span>
                  </div>

                  {/* QR Security Box Simulation */}
                  <div className="text-center font-mono">
                    <div className="w-11 h-11 bg-indigo-50 border border-indigo-200 mx-auto rounded p-0.5 flex items-center justify-center text-[10px]">
                      <ShieldCheck className="w-7 h-7 text-indigo-550" />
                    </div>
                    <span className="text-[9px] text-slate-400 font-mono block mt-1 uppercase">{printable.uniqueValidationCode}</span>
                  </div>
                </div>

                <div className="flex justify-end gap-2.5 pt-4 border-t border-slate-100 no-print">
                  <button 
                    onClick={() => setPrintingCertId(null)}
                    className="text-xs text-slate-500 px-4 py-2 hover:bg-slate-100 rounded-lg transition"
                  >
                    Close Preview
                  </button>
                  <button 
                    onClick={() => window.print()}
                    className="bg-indigo-650 hover:bg-indigo-750 text-white text-xs font-bold px-4 py-2 rounded-lg transition shadow flex items-center"
                  >
                    <Printer className="w-3.5 h-3.5 mr-1" /> Print Certificate
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
