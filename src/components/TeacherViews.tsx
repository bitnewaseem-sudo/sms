import React, { useState } from "react";
import { 
  Check, ClipboardList, BookOpen, Clock, FileText, ArrowUpRight, 
  Plus, Upload, ShieldAlert, CheckCircle, HelpCircle, Save 
} from "lucide-react";
import { 
  User, Student, Homework, Examination, MarkRecord, ClassSection, Subject, AttendanceState 
} from "../types.js";

interface TeacherViewsProps {
  activeTab: string;
  currentUser: User;
  students: Student[];
  classes: ClassSection[];
  subjects: Subject[];
  homework: Homework[];
  examinations: Examination[];
  marks: MarkRecord[];
  onRefreshAll: () => void;
  // Actions
  onSaveAttendance: (payload: { classId: string; sectionId: string; date: string; statuses: Record<string, string> }) => Promise<void>;
  onCreateHomework: (payload: any) => Promise<void>;
  onGradeHomework: (hwId: string, studentId: string, grade: string, feedback: string) => Promise<void>;
  onCreateExam: (payload: any) => Promise<void>;
  onSaveBulkMarks: (examId: string, records: Array<{ studentId: string; obtainedMarks: number; remarks?: string }>) => Promise<void>;
  onShowToast?: (message: string, type: "success" | "error" | "info") => void;
}

export default function TeacherViews({
  activeTab,
  currentUser,
  students,
  classes,
  subjects,
  homework,
  examinations,
  marks,
  onRefreshAll,
  onSaveAttendance,
  onCreateHomework,
  onGradeHomework,
  onCreateExam,
  onSaveBulkMarks,
  onShowToast
}: TeacherViewsProps) {
  // Common selection filters
  const [selectedClassId, setSelectedClassId] = useState("c-g10");
  const [selectedSection, setSelectedSection] = useState("A");

  // Attendance Registers State
  const [attDate, setAttDate] = useState(new Date().toISOString().split("T")[0]);
  const [attendanceMap, setAttendanceMap] = useState<Record<string, AttendanceState>>({});
  const [savingAtt, setSavingAtt] = useState(false);

  // Homework Creators State
  const [hwOpen, setHwOpen] = useState(false);
  const [hwTitle, setHwTitle] = useState("");
  const [hwDesc, setHwDesc] = useState("");
  const [hwSubject, setHwSubject] = useState("sub-math");
  const [hwDueDate, setHwDueDate] = useState("");

  // Homework Grading Drawer State
  const [selectedHwId, setSelectedHwId] = useState<string | null>(null);
  const [gradingStudentId, setGradingStudentId] = useState<string | null>(null);
  const [homeworkGrade, setHomeworkGrade] = useState("A");
  const [homeworkFeedback, setHomeworkFeedback] = useState("");

  // Exam / Result State
  const [examOpen, setExamOpen] = useState(false);
  const [examName, setExamName] = useState("");
  const [examType, setExamType] = useState<any>("MidTerm");
  const [examSubject, setExamSubject] = useState("sub-math");
  const [examMax, setExamMax] = useState(100);
  const [examVenue, setExamVenue] = useState("");

  // Marks Entry state
  const [activeMarksExamId, setActiveMarksExamId] = useState<string | null>(null);
  const [marksScratchMap, setMarksScratchMap] = useState<Record<string, { marks: number; remarks: string }>>({});

  // Trigger taking register class list mapping
  const activeClassPupils = students.filter(s => s.classId === selectedClassId && s.sectionId === selectedSection);

  // Initialize/Update default attendance checkboxes if mapping is empty
  const handleToggleAttendance = (studentId: string, status: AttendanceState) => {
    setAttendanceMap(prev => ({
      ...prev,
      [studentId]: status
    }));
  };

  const handleSaveAttendanceSubmit = async () => {
    setSavingAtt(true);
    // Fill fallback as present if not set
    const finalPayload: Record<string, string> = {};
    activeClassPupils.forEach(s => {
      finalPayload[s.id] = attendanceMap[s.id] || "Present";
    });

    try {
      await onSaveAttendance({
        classId: selectedClassId,
        sectionId: selectedSection,
        date: attDate,
        statuses: finalPayload
      });
      if (onShowToast) {
        onShowToast("Attendance Register successfully sync'd to server loggers!", "success");
      } else {
        alert("Attendance Register successfully sync'd to server loggers!");
      }
    } catch (err: any) {
      if (onShowToast) {
        onShowToast("Verification Error: " + err.message, "error");
      } else {
        alert("Verification Error: " + err.message);
      }
    } finally {
      setSavingAtt(false);
    }
  };

  const handleCreateHw = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!hwTitle || !hwDueDate) return;
    await onCreateHomework({
      title: hwTitle,
      description: hwDesc,
      classId: selectedClassId,
      sectionId: selectedSection,
      subjectId: hwSubject,
      teacherId: currentUser.id,
      dueDate: hwDueDate
    });
    setHwOpen(false);
    setHwTitle("");
    setHwDesc("");
  };

  const handleCreateExamSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!examName || !examMax) return;
    await onCreateExam({
      name: examName,
      type: examType,
      classId: selectedClassId,
      subjectId: examSubject,
      maxMarks: examMax,
      venue: examVenue
    });
    setExamOpen(false);
    setExamName("");
    setExamMax(100);
    setExamVenue("");
  };

  const handleInitMarksScratch = (examId: string) => {
    setActiveMarksExamId(examId);
    const examObj = examinations.find(e => e.id === examId);
    const targetClassId = examObj ? examObj.classId : "c-g10";
    const mapped: Record<string, { marks: number; remarks: string }> = {};

    students.forEach(st => {
      if (st.classId === targetClassId) {
        const existingRec = marks.find(m => m.examId === examId && m.studentId === st.id);
        mapped[st.id] = {
          marks: existingRec ? existingRec.obtainedMarks : 0,
          remarks: existingRec ? existingRec.remarks || "" : ""
        };
      }
    });

    setMarksScratchMap(mapped);
  };

  const handleSaveMarksSubmit = async () => {
    if (!activeMarksExamId) return;
    const records = Object.entries(marksScratchMap).map(([studentId, data]) => {
      const item = data as { marks: number; remarks: string };
      return {
        studentId,
        obtainedMarks: Number(item.marks),
        remarks: item.remarks
      };
    });

    try {
      await onSaveBulkMarks(activeMarksExamId, records);
      if (onShowToast) {
        onShowToast("Academics Scores database logs populated Successfully!", "success");
      } else {
        alert("Academics Scores database logs populated Successfully!");
      }
      setActiveMarksExamId(null);
    } catch (err: any) {
      if (onShowToast) {
        onShowToast(err.message || "Failed saving mark registries.", "error");
      } else {
        alert(err.message || "Failed saving mark registries.");
      }
    }
  };

  if (activeTab === "attendance") {
    return (
      <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-xs text-left" id="teacher-attendance-sheet">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-slate-100 pb-4 mb-6 gap-4">
          <div>
            <h3 className="text-base font-bold text-slate-800">Manual Classroom Register Sheet</h3>
            <p className="text-xs text-slate-400 mt-0.5">Filter school sectors, select class schedule, and mark daily attendances</p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <div>
              <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Target Grade</label>
              <select 
                value={selectedClassId} 
                onChange={(e) => { setSelectedClassId(e.target.value); setAttendanceMap({}); }}
                className="text-xs border border-slate-200 rounded-lg p-2 focus:outline-none focus:border-indigo-550 bg-slate-50/50 font-sans"
              >
                {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>

            <div>
              <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Section</label>
              <select 
                value={selectedSection} 
                onChange={(e) => { setSelectedSection(e.target.value); setAttendanceMap({}); }}
                className="text-xs border border-slate-200 rounded-lg p-2 focus:outline-none focus:border-indigo-550 bg-slate-50/50 font-sans"
              >
                <option value="A">Section A</option>
                <option value="B">Section B</option>
                <option value="C">Section C</option>
              </select>
            </div>

            <div>
              <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Log Date</label>
              <input 
                type="date"
                value={attDate}
                onChange={(e) => setAttDate(e.target.value)}
                className="text-xs border border-slate-200 rounded-lg p-2 focus:outline-none focus:border-indigo-550 bg-slate-50/50 font-mono"
              />
            </div>
          </div>
        </div>

        {activeClassPupils.length === 0 ? (
          <p className="text-xs text-slate-400 italic py-12 text-center bg-slate-50 border border-dashed border-slate-200 rounded-2xl">
            No active student records found enrolled under selection: Class ({selectedClassId}) Section ({selectedSection}). Use Admissions Module to enroll scholars first.
          </p>
        ) : (
          <div className="space-y-4">
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-100 text-slate-400 font-semibold bg-slate-50/50">
                    <th className="py-3 px-4">Student Roll</th>
                    <th className="py-3 px-4">Student Details</th>
                    <th className="py-3 px-4 text-center">Attendance Register Status Markers</th>
                  </tr>
                </thead>
                <tbody>
                  {activeClassPupils.map(student => {
                    const currentStatus = attendanceMap[student.id] || "Present";
                    return (
                      <tr key={student.id} className="border-b border-slate-50 transition-all hover:bg-slate-50/50">
                        <td className="py-3.5 px-4 font-mono font-bold text-slate-600">{student.rollNumber}</td>
                        <td className="py-3.5 px-4 font-semibold text-slate-800">{student.name}</td>
                        <td className="py-3.5 px-4">
                          <div className="flex justify-center items-center gap-2">
                            {(["Present", "Absent", "Late", "Leave", "Medical"] as AttendanceState[]).map(state => (
                              <button
                                key={state}
                                onClick={() => handleToggleAttendance(student.id, state)}
                                className={`px-2.5 py-1 text-[10px] font-bold rounded-lg border cursor-pointer transition-all uppercase tracking-wide
                                  ${currentStatus === state ? "opacity-100 scale-102 font-bold shadow-xs" : "opacity-40 hover:opacity-75"}
                                  ${state === "Present" ? "bg-emerald-50 text-emerald-700 border-emerald-250" : ""}
                                  ${state === "Absent" ? "bg-red-50 text-red-700 border-red-250" : ""}
                                  ${state === "Late" ? "bg-amber-50 text-amber-700 border-amber-250" : ""}
                                  ${state === "Leave" ? "bg-indigo-50 text-indigo-700 border-indigo-250" : ""}
                                  ${state === "Medical" ? "bg-blue-50 text-blue-700 border-blue-250" : ""}
                                `}
                              >
                                {state}
                              </button>
                            ))}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="flex justify-end pt-3">
              <button
                onClick={handleSaveAttendanceSubmit}
                disabled={savingAtt}
                className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold px-5 py-2 rounded-xl transition flex items-center shadow-xs cursor-pointer"
              >
                <Save className="w-4 h-4 mr-2" />
                {savingAtt ? "Saving Register..." : "Submit Roster Register"}
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  if (activeTab === "homework") {
    // Homework assigned by currently logged in teacher
    const myHw = homework.filter(h => h.teacherId === currentUser.id);

    return (
      <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-xs text-left" id="teacher-homework-panel">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-slate-100 pb-4 mb-6 gap-4">
          <div>
            <h3 className="text-base font-bold text-slate-800">Curricula Homework Assignments</h3>
            <p className="text-xs text-slate-400 mt-0.5">Publish assignment cards, inspect student uploads and reviews</p>
          </div>
          <button
            onClick={() => setHwOpen(true)}
            className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold px-4 py-2 rounded-xl transition flex items-center shrink-0 shadow-xs cursor-pointer"
          >
            <Plus className="w-4 h-4 mr-1" /> Post Task
          </button>
        </div>

        {hwOpen && (
          <div className="bg-slate-50 p-5 rounded-2xl border border-slate-150 mb-6 animate-fadeIn">
            <h4 className="text-sm font-bold text-slate-800 mb-3">Publish New Curriculum Assignment Card</h4>
            <form onSubmit={handleCreateHw} className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-[11px] font-semibold text-slate-500 mb-1">Assignment Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Polynomial Long Division Practice"
                  value={hwTitle}
                  onChange={(e) => setHwTitle(e.target.value)}
                  className="text-xs bg-white border border-slate-200 rounded-lg p-2 w-full focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-500 mb-1">Subject Assignment</label>
                <select
                  value={hwSubject}
                  onChange={(e) => setHwSubject(e.target.value)}
                  className="text-xs bg-white border border-slate-200 rounded-lg p-2 w-full focus:outline-none focus:border-indigo-500"
                >
                  {subjects.map(s => <option key={s.id} value={s.id}>{s.name} ({s.code})</option>)}
                </select>
              </div>

              <div className="sm:col-span-2">
                <label className="block text-[11px] font-semibold text-slate-500 mb-1">Description / Submissions Steps</label>
                <textarea
                  required
                  placeholder="Write clear problem lists or links..."
                  value={hwDesc}
                  onChange={(e) => setHwDesc(e.target.value)}
                  className="text-xs bg-white border border-slate-200 rounded-lg p-2.5 w-full h-18 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-500 mb-1">Due Date</label>
                <input
                  type="date"
                  required
                  value={hwDueDate}
                  onChange={(e) => setHwDueDate(e.target.value)}
                  className="text-xs bg-white border border-slate-200 rounded-lg p-2 w-full focus:outline-none"
                />
              </div>

              <div className="sm:col-span-3 flex justify-end gap-2 mt-1">
                <button
                  type="button"
                  onClick={() => setHwOpen(false)}
                  className="text-xs text-slate-500 px-3 py-1.5 hover:bg-slate-100 rounded-md"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-indigo-600 text-white text-xs font-bold px-4 py-1.5 rounded-md hover:bg-indigo-750 transition"
                >
                  Publish Homework
                </button>
              </div>
            </form>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">My Current Homework Assignments ({myHw.length})</h4>
            {myHw.length === 0 ? (
              <p className="text-xs text-slate-400 italic">You have not published any homework challenges yet.</p>
            ) : (
              myHw.map((item) => (
                <div 
                  key={item.id} 
                  className={`p-4 rounded-xl border transition-all cursor-pointer ${selectedHwId === item.id ? "border-indigo-400 bg-indigo-50/10" : "border-slate-150 bg-white hover:bg-slate-50/50"}`}
                  onClick={() => {
                    setSelectedHwId(item.id);
                    setGradingStudentId(null);
                  }}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="text-xs font-bold text-slate-800">{item.title}</h4>
                      <p className="text-[11px] text-slate-400 mt-1">Class: {item.classId} Sections {item.sectionId} | Subject: {item.subjectId}</p>
                    </div>
                    <span className="text-[10px] bg-red-50 text-red-700 px-2.5 py-0.5 rounded-full border border-red-150 font-mono font-medium">
                      Due: {item.dueDate}
                    </span>
                  </div>
                  <p className="text-slate-400 text-[11px] mt-2 bg-slate-50 p-2.5 rounded border border-slate-100 italic leading-snug">
                    {item.description}
                  </p>
                  <div className="flex justify-between text-[10px] text-slate-500 mt-3 font-mono">
                    <span>Uploaded Submissions: <strong>{item.submissions.length}</strong></span>
                    <span className="text-indigo-600 font-bold hover:underline">Inspect Submissions →</span>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Submissions grader detail drawer */}
          <div className="bg-slate-50/50 p-5 rounded-2xl border border-slate-150">
            <h4 className="text-xs font-bold text-slate-600 uppercase tracking-widest mb-4">Task Submission Reviewer</h4>
            {selectedHwId ? (() => {
              const activeHw = homework.find(h => h.id === selectedHwId);
              if (!activeHw) return null;

              return (
                <div className="space-y-4">
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-semibold">Active Review Target</span>
                    <h5 className="font-bold text-slate-800 text-xs mt-0.5 font-sans">{activeHw.title}</h5>
                  </div>

                  <div className="border-t border-slate-150 pt-3">
                    <span className="text-[10px] text-slate-400 uppercase font-semibold block mb-2">Student Submissions list ({activeHw.submissions.length})</span>
                    {activeHw.submissions.length === 0 ? (
                      <p className="text-xs text-slate-400 italic">Awaiting student homework uploads.</p>
                    ) : (
                      <div className="space-y-2">
                        {activeHw.submissions.map(sub => {
                          const pupilName = students.find(s => s.id === sub.studentId)?.name || sub.studentId;
                          return (
                            <div 
                              key={sub.studentId}
                              onClick={() => {
                                setGradingStudentId(sub.studentId);
                                setHomeworkGrade(sub.grade || "A");
                                setHomeworkFeedback(sub.feedback || "");
                              }}
                              className={`p-2.5 rounded-lg border text-xs text-left transition-all cursor-pointer bg-white ${gradingStudentId === sub.studentId ? "border-indigo-400 shadow-xs" : "border-slate-100 hover:bg-slate-50"}`}
                            >
                              <div className="flex justify-between items-center font-bold">
                                <span className="text-slate-700">{pupilName}</span>
                                {sub.grade ? (
                                  <span className="bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded font-mono font-bold scale-90">
                                    Grade: {sub.grade}
                                  </span>
                                ) : (
                                  <span className="bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded font-mono text-[9px] uppercase">Awaiting Grade</span>
                                )}
                              </div>
                              <p className="text-slate-400 text-[10px] mt-1 italic font-mono">Submitted: {new Date(sub.submittedAt).toLocaleDateString()}</p>
                              <p className="text-slate-500 font-sans mt-2 text-[11px] border-l-2 border-slate-200 pl-2 bg-slate-50/50 p-1 rounded">
                                {sub.content}
                              </p>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  {gradingStudentId && (() => {
                    const activeSub = activeHw.submissions.find(s => s.studentId === gradingStudentId);
                    if (!activeSub) return null;
                    return (
                      <div className="border-t border-slate-150 pt-3 space-y-3">
                        <span className="text-[10px] text-indigo-650 uppercase font-bold block">Submit Evaluation Gradesheet</span>
                        <div className="grid grid-cols-3 gap-2">
                          <div>
                            <label className="text-[9px] text-slate-400 uppercase font-semibold block mb-0.5">Score Grade</label>
                            <select 
                              value={homeworkGrade} 
                              onChange={(e) => setHomeworkGrade(e.target.value)}
                              className="text-xs w-full border border-slate-200 rounded-md p-1 bg-white font-mono font-bold text-slate-700"
                            >
                              <option value="A+">A+</option>
                              <option value="A">A</option>
                              <option value="B+">B+</option>
                              <option value="B">B</option>
                              <option value="C">C</option>
                              <option value="D">D</option>
                              <option value="F">F</option>
                            </select>
                          </div>
                          <div className="col-span-2">
                            <label className="text-[9px] text-slate-400 uppercase font-semibold block mb-0.5 font-sans">Teacher Evaluation comment</label>
                            <input 
                              type="text"
                              value={homeworkFeedback}
                              onChange={(e) => setHomeworkFeedback(e.target.value)}
                              placeholder="e.g. Flawless proof derivation!"
                              className="text-xs w-full bg-white border border-slate-200 rounded-md p-1"
                            />
                          </div>
                        </div>
                        <button
                          onClick={async () => {
                            await onGradeHomework(selectedHwId, gradingStudentId, homeworkGrade, homeworkFeedback);
                            setGradingStudentId(null);
                          }}
                          className="bg-indigo-600 font-bold hover:bg-indigo-750 text-white w-full py-1.5 rounded-lg text-xs transition cursor-pointer"
                        >
                          Log Marks & Notify Parent
                        </button>
                      </div>
                    );
                  })()}
                </div>
              );
            })() : (
              <p className="text-xs text-slate-400 italic text-center py-8">
                Select an assignment on left pane to list submissions and initiate grading evaluations
              </p>
            )}
          </div>
        </div>
      </div>
    );
  }

  if (activeTab === "marks") {
    return (
      <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-xs text-left" id="teacher-marks-gradesheet">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-slate-100 pb-4 mb-6 gap-4">
          <div>
            <h3 className="text-base font-bold text-slate-800">Academic Marks Entering Gradebook</h3>
            <p className="text-xs text-slate-400 mt-0.5">Draft examination structures, score student academic records, and tabulate percentages</p>
          </div>
          <button
            onClick={() => setExamOpen(true)}
            className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold px-4 py-2 rounded-xl transition flex items-center shadow-xs cursor-pointer"
          >
            <Plus className="w-4 h-4 mr-1" /> Plan Exam
          </button>
        </div>

        {examOpen && (
          <div className="bg-slate-50 p-5 rounded-2xl border border-slate-150 mb-6 animate-fadeIn">
            <h4 className="text-sm font-bold text-slate-800 mb-3">Schedule New Term Assessment Scheme</h4>
            <form onSubmit={handleCreateExamSubmit} className="grid grid-cols-1 sm:grid-cols-5 gap-4">
              <div>
                <label className="block text-[11px] font-semibold text-slate-500 mb-1">Assessment Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Mid-Term Written Examination"
                  value={examName}
                  onChange={(e) => setExamName(e.target.value)}
                  className="text-xs bg-white border border-slate-200 rounded-lg p-2 w-full focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-500 mb-1">Exam Type</label>
                <select
                  value={examType}
                  onChange={(e) => setExamType(e.target.value)}
                  className="text-xs bg-white border border-slate-200 rounded-lg p-2 w-full focus:outline-none"
                >
                  <option value="Quiz">Quiz (Minor)</option>
                  <option value="Assignment">Assignment</option>
                  <option value="Monthly">Monthly assessment</option>
                  <option value="MidTerm">Mid-Term Board</option>
                  <option value="Final">Final Term Board</option>
                  <option value="Practical">Practical Lab</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-500 mb-1">Assigned Course</label>
                <select
                  value={examSubject}
                  onChange={(e) => setExamSubject(e.target.value)}
                  className="text-xs bg-white border border-slate-200 rounded-lg p-2 w-full focus:outline-none font-sans"
                >
                  {subjects.map(s => <option key={s.id} value={s.id}>{s.name} ({s.code})</option>)}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-500 mb-1">Max Score achievable</label>
                <input
                  type="number"
                  required
                  value={examMax}
                  onChange={(e) => setExamMax(Number(e.target.value))}
                  className="text-xs bg-white border border-slate-200 rounded-lg p-2 w-full focus:outline-none font-mono"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-500 mb-1">Exam Venue / Room</label>
                <input
                  type="text"
                  placeholder="e.g. Exam Hall Alpha"
                  value={examVenue}
                  onChange={(e) => setExamVenue(e.target.value)}
                  className="text-xs bg-white border border-slate-200 rounded-lg p-2 w-full focus:outline-none font-sans"
                />
              </div>

              <div className="sm:col-span-5 flex justify-end gap-2 mt-1">
                <button
                  type="button"
                  onClick={() => setExamOpen(false)}
                  className="text-xs text-slate-500 px-3.5 py-1.5 hover:bg-slate-100 rounded-md"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-indigo-650 hover:bg-indigo-750 text-white text-xs font-bold px-4 py-1.5 rounded-md transition duration-200 cursor-pointer"
                >
                  Sync Examination Scheme
                </button>
              </div>
            </form>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Exams columns list */}
          <div className="lg:col-span-1 space-y-3.5">
            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Upcoming & Historical Exams ({examinations.length})</h4>
            {examinations.map(ex => (
              <div 
                key={ex.id}
                onClick={() => handleInitMarksScratch(ex.id)}
                className={`p-3.5 rounded-xl border text-left cursor-pointer transition-all ${activeMarksExamId === ex.id ? "border-indigo-400 bg-indigo-50/10" : "bg-white border-slate-150 hover:bg-slate-50"}`}
              >
                <div className="flex justify-between items-start">
                  <h4 className="text-xs font-bold text-slate-800">{ex.name}</h4>
                  <span className="text-[9.5px] bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded font-bold uppercase">{ex.type}</span>
                </div>
                <p className="text-[10.5px] text-slate-400 mt-2">Class: {ex.classId} | Marks Cap: {ex.maxMarks} {ex.venue && `| Venue: ${ex.venue}`}</p>
                <p className="text-[10px] text-indigo-600 font-bold mt-2 hover:underline flex items-center">Open Gradesheet Editor →</p>
              </div>
            ))}
          </div>

          {/* Gradesheet bulk entry view */}
          <div className="lg:col-span-2 bg-slate-50/50 border border-slate-150 rounded-2xl p-5">
            {activeMarksExamId ? (() => {
              const exSelected = examinations.find(e => e.id === activeMarksExamId);
              if (!exSelected) return null;
              
              // Filter students matching the target Class assigned to this exam
              const pupilsInExam = students.filter(s => s.classId === exSelected.classId);

              return (
                <div className="space-y-4">
                  <div className="flex justify-between items-center border-b border-slate-200 pb-3">
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase font-semibold">Active Gradesheet Workspace</span>
                      <h4 className="text-xs font-bold text-slate-800 mt-0.5 leading-tight">{exSelected.name} [Cap: {exSelected.maxMarks} marks]</h4>
                    </div>
                    <button 
                      onClick={handleSaveMarksSubmit}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-4 py-2 rounded-lg transition shadow-xs cursor-pointer flex items-center"
                    >
                      <CheckCircle className="w-3.5 h-3.5 mr-1" /> Log Class Marks
                    </button>
                  </div>

                  {pupilsInExam.length === 0 ? (
                    <p className="text-xs text-slate-400 italic text-center py-10 bg-white rounded-xl border border-dashed border-slate-200">
                      No active scholar rosters allocated to Class ({exSelected.classId}) associated with this assessment. Use SIS tab to enroll/transfer students.
                    </p>
                  ) : (
                    <div className="space-y-2.5 max-h-[350px] overflow-y-auto pr-1">
                      {pupilsInExam.map((st) => {
                        const scratchVal = marksScratchMap[st.id] || { marks: 0, remarks: "" };
                        return (
                          <div key={st.id} className="p-3 bg-white border border-slate-100 rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
                            <div className="text-left">
                              <span className="font-bold text-slate-755 block">{st.name}</span>
                              <span className="text-[10px] text-slate-400 font-mono">Roll: {st.rollNumber}</span>
                            </div>

                            <div className="flex items-center gap-2.5 w-full sm:w-auto">
                              <div className="flex items-center">
                                <input
                                  type="number"
                                  min="0"
                                  max={exSelected.maxMarks}
                                  value={scratchVal.marks}
                                  onChange={(e) => setMarksScratchMap(prev => ({
                                    ...prev,
                                    [st.id]: { ...prev[st.id], marks: Math.min(exSelected.maxMarks, Number(e.target.value)) }
                                  }))}
                                  className="w-18 bg-slate-50 border border-slate-250 rounded-lg p-1 text-center font-mono font-bold text-indigo-700 text-xs focus:bg-white"
                                />
                                <span className="text-[10.5px] text-slate-400 ml-1 bg-slate-100 p-1 rounded font-mono font-bold">/{exSelected.maxMarks}</span>
                              </div>

                              <input
                                type="text"
                                placeholder="Add result note..."
                                value={scratchVal.remarks}
                                onChange={(e) => setMarksScratchMap(prev => ({
                                  ...prev,
                                  [st.id]: { ...prev[st.id], remarks: e.target.value }
                                }))}
                                className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 w-32 sm:w-44 focus:bg-white focus:outline-none"
                              />

                              <span className="text-[10px] font-bold font-sans text-slate-500">
                                {scratchVal.marks / exSelected.maxMarks >= 0.9 ? "A+" : scratchVal.marks / exSelected.maxMarks >= 0.8 ? "A" : scratchVal.marks / exSelected.maxMarks >= 0.7 ? "B" : "C"}
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })() : (
              <p className="text-xs text-slate-400 italic text-center py-12">
                Select an examination entry from the left-hand index list to load, edit, and score classes records
              </p>
            )}
          </div>
        </div>
      </div>
    );
  }

  return null;
}
