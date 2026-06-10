import express from "express";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import { createServer as createViteServer } from "vite";
import { UserRole, Student, Homework } from "./src/types.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ensure data folder exists
const DATA_DIR = path.join(process.cwd(), "data");
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

const DB_PATH = path.join(DATA_DIR, "db.json");

// Helper: Seed Data Generator
function generateSeedData() {
  const users = [
    { id: "u-admin", name: "Sarah Jenkins", email: "admin@school.com", role: UserRole.ADMIN, phone: "+1 (555) 101-2020", status: "Active", createdAt: new Date().toISOString() },
    { id: "u-principal", name: "Dr. Arthur Vance", email: "principal@school.com", role: UserRole.PRINCIPAL, phone: "+1 (555) 101-3030", status: "Active", createdAt: new Date().toISOString() },
    { id: "u-teacher", name: "Prof. Clara Oswald", email: "teacher@school.com", role: UserRole.TEACHER, phone: "+1 (555) 101-4040", status: "Active", createdAt: new Date().toISOString() },
    { id: "u-teacher2", name: "David Tennant", email: "teacher2@school.com", role: UserRole.TEACHER, phone: "+1 (555) 101-4444", status: "Active", createdAt: new Date().toISOString() },
    { id: "u-student", name: "Marcus Smith", email: "student@school.com", role: UserRole.STUDENT, phone: "+1 (555) 101-5050", status: "Active", createdAt: new Date().toISOString() },
    { id: "u-student2", name: "Emma Watson", email: "student2@school.com", role: UserRole.STUDENT, phone: "+1 (555) 101-5555", status: "Active", createdAt: new Date().toISOString() },
    { id: "u-parent", name: "Robert Smith", email: "parent@school.com", role: UserRole.PARENT, phone: "+1 (555) 101-6060", status: "Active", createdAt: new Date().toISOString() },
    { id: "u-parent2", name: "Chris Watson", email: "parent2@school.com", role: UserRole.PARENT, phone: "+1 (555) 101-6666", status: "Active", createdAt: new Date().toISOString() },
    { id: "u-accountant", name: "Linda Cash", email: "accountant@school.com", role: UserRole.ACCOUNTANT, phone: "+1 (555) 101-7070", status: "Active", createdAt: new Date().toISOString() },
    { id: "u-librarian", name: "Page Turner", email: "librarian@school.com", role: UserRole.LIBRARIAN, phone: "+1 (555) 101-8080", status: "Active", createdAt: new Date().toISOString() }
  ];

  const inquiries = [
    { id: "inq-1", applicantName: "Alice Cooper", gradeClass: "Grade 9", parentName: "Thomas Cooper", email: "alice.cooper@mail.com", phone: "+1-888-999-5552", birthCertUploaded: true, parentCnicUploaded: true, marksSheetUploaded: false, status: "Pending", date: "2026-06-08" },
    { id: "inq-2", applicantName: "Bruce Banner", gradeClass: "Grade 11", parentName: "Brian Banner", email: "hulk.bruce@mail.com", phone: "+1-333-444-5555", birthCertUploaded: true, parentCnicUploaded: true, marksSheetUploaded: true, status: "Approved", reviewNotes: "All documents verified, ready for fee allocation.", date: "2026-06-05" },
    { id: "inq-3", applicantName: "Clark Kent", gradeClass: "Grade 10", parentName: "Jonathan Kent", email: "superboy@shines.com", phone: "+1-777-888-2222", birthCertUploaded: false, parentCnicUploaded: false, marksSheetUploaded: false, status: "Rejected", reviewNotes: "No documents submitted past the cutoff date.", date: "2026-05-20" }
  ];

  const classes = [
    { id: "c-g9", name: "Grade 9", sections: ["A", "B"], subjects: ["sub-math", "sub-sci", "sub-hist"] },
    { id: "c-g10", name: "Grade 10", sections: ["A", "C"], subjects: ["sub-math", "sub-sci", "sub-eng"] },
    { id: "c-g11", name: "Grade 11", sections: ["A"], subjects: ["sub-math", "sub-comp", "sub-eng"] }
  ];

  const subjects = [
    { id: "sub-math", name: "Advanced Mathematics", code: "MATH-401", creditHours: 4 },
    { id: "sub-sci", name: "General Physics & Chemistry", code: "SCI-202", creditHours: 3 },
    { id: "sub-hist", name: "World History II", code: "HIST-105", creditHours: 3 },
    { id: "sub-eng", name: "English Literature", code: "ENG-310", creditHours: 3 },
    { id: "sub-comp", name: "Introduction to Computer Science", code: "COMP-101", creditHours: 4 }
  ];

  const students: Student[] = [
    { id: "u-student", rollNumber: "ST-2026-001", name: "Marcus Smith", email: "student@school.com", classId: "c-g10", sectionId: "A", parentId: "u-parent", dob: "2011-03-14", address: "44 Baker St, London", medicalInfo: "None", status: "Active", enrollmentDate: "2024-09-01" },
    { id: "u-student2", rollNumber: "ST-2026-002", name: "Emma Watson", email: "student2@school.com", classId: "c-g11", sectionId: "A", parentId: "u-parent2", dob: "2010-04-15", address: "19 Privet Drive, Surrey", medicalInfo: "Peanut allergy", status: "Active", enrollmentDate: "2024-09-01" }
  ];

  const parents = [
    { id: "u-parent", name: "Robert Smith", email: "parent@school.com", phone: "+1 (555) 101-6060", address: "44 Baker St, London", occupation: "Software Architect", childrenIds: ["u-student"] },
    { id: "u-parent2", name: "Chris Watson", email: "parent2@school.com", phone: "+1 (555) 101-6666", address: "19 Privet Drive, Surrey", occupation: "General Dentist", childrenIds: ["u-student2"] }
  ];

  const teachers = [
    { id: "u-teacher", name: "Prof. Clara Oswald", email: "teacher@school.com", phone: "+1 (555) 101-4040", qualification: "M.Sc Mathematics", experienceYears: 8, salary: 5400, status: "Active", rating: 4.8, classesAssigned: [{ classId: "c-g10", sectionId: "A", subjectId: "sub-math" }, { classId: "c-g9", sectionId: "A", subjectId: "sub-math" }] },
    { id: "u-teacher2", name: "David Tennant", email: "teacher2@school.com", phone: "+1 (555) 101-4444", qualification: "Ph.D Quantum Physics", experienceYears: 12, salary: 6500, status: "Active", rating: 4.9, classesAssigned: [{ classId: "c-g11", sectionId: "A", subjectId: "sub-comp" }, { classId: "c-g10", sectionId: "A", subjectId: "sub-sci" }] }
  ];

  const timetables = [
    { id: "tt-1", classId: "c-g10", sectionId: "A", subjectId: "sub-math", teacherId: "u-teacher", room: "Room 101", dayOfWeek: "Monday", startTime: "08:30", endTime: "09:30" },
    { id: "tt-2", classId: "c-g10", sectionId: "A", subjectId: "sub-sci", teacherId: "u-teacher2", room: "Lab B", dayOfWeek: "Monday", startTime: "09:45", endTime: "10:45" },
    { id: "tt-3", classId: "c-g10", sectionId: "A", subjectId: "sub-eng", teacherId: "u-teacher", room: "Room 101", dayOfWeek: "Tuesday", startTime: "08:30", endTime: "09:30" },
    { id: "tt-4", classId: "c-g11", sectionId: "A", subjectId: "sub-comp", teacherId: "u-teacher2", room: "Computer Suite", dayOfWeek: "Wednesday", startTime: "11:00", endTime: "12:30" }
  ];

  const attendance = [
    { id: "att-1", classId: "c-g10", sectionId: "A", date: "2026-06-08", statuses: { "u-student": "Present" } },
    { id: "att-2", classId: "c-g10", sectionId: "A", date: "2026-06-09", statuses: { "u-student": "Late" } },
    { id: "att-3", classId: "c-g11", sectionId: "A", date: "2026-06-09", statuses: { "u-student2": "Present" } },
    { id: "att-4", classId: "c-g10", sectionId: "A", date: "2026-06-10", statuses: { "u-student": "Present" } },
    { id: "att-5", classId: "c-g11", sectionId: "A", date: "2026-06-10", statuses: { "u-student2": "Present" } }
  ];

  const examinations = [
    { id: "ex-1", name: "Mid-Term Examination", type: "MidTerm", classId: "c-g10", subjectId: "sub-math", date: "2026-05-15", maxMarks: 100 },
    { id: "ex-2", name: "Monthly Assessment", type: "Monthly", classId: "c-g10", subjectId: "sub-sci", date: "2026-05-20", maxMarks: 50 },
    { id: "ex-3", name: "Final Term Mathematics", type: "Final", classId: "c-g10", subjectId: "sub-math", date: "2026-06-18", maxMarks: 100 }
  ];

  const marks = [
    { id: "mk-1", examId: "ex-1", studentId: "u-student", obtainedMarks: 88, remarks: "Excellent problem solving" },
    { id: "mk-2", examId: "ex-2", studentId: "u-student", obtainedMarks: 42, remarks: "Well detailed experiments" }
  ];

  const homework: Homework[] = [
    {
      id: "hw-1",
      title: "Algebraic Equations Chapter 4",
      description: "Answer questions 1 through 15 on page 112. Show your complete proof paths.",
      classId: "c-g10",
      sectionId: "A",
      subjectId: "sub-math",
      teacherId: "u-teacher",
      dueDate: "2026-06-15",
      submissions: [
        { studentId: "u-student", submittedAt: "2026-06-09T14:32:00Z", content: "Completed algebraic tasks on shared document link. Answers: x=42, y=17...", grade: "A", feedback: "Pristine execution structure!" }
      ]
    },
    {
      id: "hw-2",
      title: "Gravitational Acceleration Experiment",
      description: "Perform the free-fall ball drop experiment, log velocities, and calculate standard G deviations.",
      classId: "c-g10",
      sectionId: "A",
      subjectId: "sub-sci",
      teacherId: "u-teacher2",
      dueDate: "2026-06-12",
      submissions: []
    }
  ];

  const fees = [
    { id: "f-1", invoiceNumber: "INV-2026-101", studentId: "u-student", month: "June", year: 2026, category: "Monthly Fee", amount: 450, discount: 50, fine: 0, netAmount: 400, paidAmount: 400, status: "Paid", dueDate: "2026-06-10", payments: [{ date: "2026-06-03", amount: 400, method: "Bank Transfer" }] },
    { id: "f-2", invoiceNumber: "INV-2026-102", studentId: "u-student2", month: "June", year: 2026, category: "Monthly Fee", amount: 450, discount: 0, fine: 10, netAmount: 460, paidAmount: 0, status: "Unpaid", dueDate: "2026-06-10", payments: [] },
    { id: "f-3", invoiceNumber: "INV-2026-089", studentId: "u-student", month: "May", year: 2026, category: "Monthly Fee", amount: 450, discount: 50, fine: 0, netAmount: 400, paidAmount: 400, status: "Paid", dueDate: "2026-05-10", payments: [{ date: "2026-05-02", amount: 400, method: "Cash" }] }
  ];

  const books = [
    { id: "bk-1", title: "Introduction to Classical Mechanics", author: "H. Goldstein", isbn: "978-0201657029", category: "Physics", totalCopies: 5, availableCopies: 4, rackNo: "P-04" },
    { id: "bk-2", title: "Thomas' Calculus (14th Edition)", author: "J. Hass", isbn: "978-0134438986", category: "Math", totalCopies: 8, availableCopies: 7, rackNo: "M-12" },
    { id: "bk-3", title: "A Brief History of Time", author: "S. Hawking", isbn: "978-0553380163", category: "Astronomy", totalCopies: 4, availableCopies: 4, rackNo: "A-01" },
    { id: "bk-4", title: "To Kill a Mockingbird", author: "H. Lee", isbn: "978-0446310789", category: "Literature", totalCopies: 6, availableCopies: 5, rackNo: "L-03" }
  ];

  const bookTransactions = [
    { id: "btx-1", bookId: "bk-1", studentId: "u-student", issueDate: "2026-06-01", dueDate: "2026-06-15", fineAmount: 0, status: "Issued" },
    { id: "btx-2", bookId: "bk-4", studentId: "u-student2", issueDate: "2026-05-15", dueDate: "2026-05-29", returnDate: "2026-05-28", fineAmount: 0, status: "Returned" }
  ];

  const announcements = [
    { id: "an-1", title: "Final Examinations Schedule Released", content: "Standard academic assessments of Spring/Summer session start June 18th. Ensure all accounts have fine clearance before exams begin.", category: "Exams", targetRoles: [UserRole.TEACHER, UserRole.STUDENT, UserRole.PARENT], senderName: "Arthur Vance, Principal", date: "2026-06-09" },
    { id: "an-2", title: "Summer Sports Camp Enrollment", content: "Adademic office is welcoming registrations for the annual soccer, badminton, and archery camp running all of July. Cost is $120.", category: "General", targetRoles: [UserRole.STUDENT, UserRole.PARENT], senderName: "Admissions Office", date: "2026-06-04" },
    { id: "an-3", title: "National Summer Day Holiday", content: "The school campus will remain closed on Sunday June 21st, 2026. Online library files remain active.", category: "Holiday", targetRoles: [UserRole.TEACHER, UserRole.STUDENT, UserRole.PARENT, UserRole.ADMIN], senderName: "Sarah Jenkins, Admin", date: "2026-06-10" }
  ];

  const messages = [
    { id: "msg-1", senderId: "u-parent", senderName: "Robert Smith", receiverId: "u-teacher", content: "Hello Prof. Oswald, I saw the progress card for Marcus. Could we schedule a brief video feedback session on his polynomial division?", timestamp: "2026-06-09T18:00:00Z", read: false },
    { id: "msg-2", senderId: "u-teacher", senderName: "Prof. Clara Oswald", receiverId: "u-parent", content: "Of course, Robert! Marcus is doing extremely well. Let's talk during Monday's office hours at 14:00.", timestamp: "2026-06-09T19:15:00Z", read: true }
  ];

  const certificates = [
    { id: "cf-1", studentId: "u-student", studentName: "Marcus Smith", certificateType: "Achievement", dateIssued: "2026-05-10", uniqueValidationCode: "CERT-990-2026-MA", notes: "First position in Regional Math Olympiad 2026." }
  ];

  const auditLogs = [
    { id: "lg-1", userId: "u-admin", userName: "Sarah Jenkins", userRole: "ADMIN", action: "SYSTEM_START", details: "Oakridge Educational Suite database booted.", timestamp: new Date().toISOString() }
  ];

  const backups = [
    { id: "bkp-1", name: "System Boot Default", timestamp: new Date().toISOString(), size: "148 KB", recordCount: 120 }
  ];

  return {
    users,
    inquiries,
    classes,
    subjects,
    students,
    parents,
    teachers,
    timetables,
    attendance,
    examinations,
    marks,
    homework,
    fees,
    books,
    bookTransactions,
    announcements,
    messages,
    certificates,
    auditLogs,
    backups
  };
}

// Global Database Object
let db: ReturnType<typeof generateSeedData>;

// Initialize database
if (fs.existsSync(DB_PATH)) {
  try {
    const raw = fs.readFileSync(DB_PATH, "utf8");
    db = JSON.parse(raw);
  } catch (err) {
    console.error("Error reading db.json, generating defaults:", err);
    db = generateSeedData();
    fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2), "utf8");
  }
} else {
  db = generateSeedData();
  fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2), "utf8");
}

// Sync Database Helper
function syncDatabase() {
  fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2), "utf8");
}

// Log Auditor Helper
function writeAudit(userId: string, action: string, details: string, req: express.Request) {
  const user = db.users.find(u => u.id === userId);
  const log = {
    id: `lg-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    userId,
    userName: user ? user.name : "System / Unknown",
    userRole: user ? user.role : "UNKNOWN",
    action,
    details,
    timestamp: new Date().toISOString(),
    ipAddress: req.ip || req.headers['x-forwarded-for'] as string || "127.0.0.1"
  };
  db.auditLogs.unshift(log);
  // Cap audit logs at 200 items for space sanity
  if (db.auditLogs.length > 200) {
    db.auditLogs.pop();
  }
  syncDatabase();
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // ==========================================
  // MODULE 01: User Authentication & Simulation
  // ==========================================
  app.post("/api/auth/login", (req, res) => {
    const { email } = req.body;
    const user = db.users.find(u => u.email.toLowerCase().trim() === email.toLowerCase().trim());
    if (!user) {
      return res.status(401).json({ message: "Invalid credentials or email not registered in system." });
    }
    writeAudit(user.id, "USER_LOGIN", "Authenticated to enterprise platform.", req);
    res.json({ token: `simulated-jwt-token-for-${user.id}`, user });
  });

  app.get("/api/users", (req, res) => {
    res.json(db.users);
  });

  app.post("/api/users", (req, res) => {
    const { name, email, role, phone, creatorId } = req.body;
    if (!name || !email || !role) {
      return res.status(400).json({ message: "Missing required fields" });
    }
    const exists = db.users.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (exists) {
      return res.status(400).json({ message: "Email already exists" });
    }
    const newUser = {
      id: `u-${Date.now()}`,
      name,
      email,
      role: role as UserRole,
      phone,
      status: "Active" as const,
      createdAt: new Date().toISOString()
    };
    db.users.push(newUser);
    
    // Add secondary fields in corresponding arrays if teacher or parent
    if (role === UserRole.TEACHER) {
      db.teachers.push({
        id: newUser.id,
        name,
        email,
        phone: phone || "",
        qualification: "B.Ed",
        experienceYears: 1,
        salary: 3000,
        status: "Active",
        rating: 5.0,
        classesAssigned: []
      });
    } else if (role === UserRole.PARENT) {
      db.parents.push({
        id: newUser.id,
        name,
        email,
        phone: phone || "",
        address: "Oakridge Ave",
        occupation: "General Resident",
        childrenIds: []
      });
    }

    syncDatabase();
    writeAudit(creatorId || "u-admin", "USER_CREATE", `Registered new account ${name} with role ${role}.`, req);
    res.status(201).json(newUser);
  });

  app.delete("/api/users/:id", (req, res) => {
    const { id } = req.params;
    const { actorId } = req.query;
    db.users = db.users.filter(u => u.id !== id);
    db.students = db.students.filter(s => s.id !== id);
    db.teachers = db.teachers.filter(t => t.id !== id);
    db.parents = db.parents.filter(p => p.id !== id);
    syncDatabase();
    writeAudit((actorId as string) || "u-admin", "USER_DELETE", `De-registered user account with id: ${id}.`, req);
    res.json({ message: "User account archived successfully." });
  });

  // ==========================================
  // MODULE 02: Admission Inquiries
  // ==========================================
  app.get("/api/admissions", (req, res) => {
    res.json(db.inquiries);
  });

  app.post("/api/admissions", (req, res) => {
    const { applicantName, gradeClass, parentName, email, phone, birthCert, cnic, marks } = req.body;
    if (!applicantName || !parentName || !phone) {
      return res.status(400).json({ message: "Name, guardian details, and phone are required for registration." });
    }
    const newInq = {
      id: `inq-${Date.now()}`,
      applicantName,
      gradeClass,
      parentName,
      email,
      phone,
      birthCertUploaded: !!birthCert,
      parentCnicUploaded: !!cnic,
      marksSheetUploaded: !!marks,
      status: "Pending" as const,
      date: new Date().toISOString().split("T")[0]
    };
    db.inquiries.push(newInq);
    syncDatabase();
    res.status(201).json(newInq);
  });

  app.patch("/api/admissions/:id", (req, res) => {
    const { id } = req.params;
    const { status, reviewNotes, actorId } = req.body;
    const inq = db.inquiries.find(i => i.id === id);
    if (!inq) return res.status(404).json({ message: "Inquiry not found" });

    inq.status = status;
    if (reviewNotes) inq.reviewNotes = reviewNotes;

    // If approved, create the user profile, student, and parent shell!
    if (status === "Approved") {
      const studentUserId = `u-st-${Date.now()}`;
      const parentUserId = `u-pa-${Date.now()}`;
      const rollNoNum = Math.floor(100 + Math.random() * 900);
      const rollNumber = `ST-2026-${rollNoNum}`;

      // Create Parent Account
      const newParentUser = {
        id: parentUserId,
        name: inq.parentName,
        email: inq.email || `parent.${Date.now()}@school.com`,
        role: UserRole.PARENT,
        phone: inq.phone,
        status: "Active" as const,
        createdAt: new Date().toISOString()
      };
      db.users.push(newParentUser);

      db.parents.push({
        id: parentUserId,
        name: inq.parentName,
        email: newParentUser.email,
        phone: inq.phone,
        address: "Verified Address",
        occupation: "Guardian",
        childrenIds: [studentUserId]
      });

      // Create Student Account
      const newStUser = {
        id: studentUserId,
        name: inq.applicantName,
        email: `student.${Date.now()}@school.com`,
        role: UserRole.STUDENT,
        phone: inq.phone,
        status: "Active" as const,
        createdAt: new Date().toISOString()
      };
      db.users.push(newStUser);

      // Link Student object
      db.students.push({
        id: studentUserId,
        rollNumber,
        name: inq.applicantName,
        email: newStUser.email,
        classId: "c-g9", // Default starting grade
        sectionId: "A",
        parentId: parentUserId,
        dob: "2012-01-01",
        address: "Verified Address",
        status: "Active",
        enrollmentDate: new Date().toISOString().split("T")[0]
      });

      // Issue Welcome Admission Fee Invoice
      db.fees.push({
        id: `f-${Date.now()}`,
        invoiceNumber: `INV-${Date.now().toString().slice(-4)}`,
        studentId: studentUserId,
        month: "June",
        year: 2026,
        category: "Admission Fee",
        amount: 800,
        discount: 100,
        fine: 0,
        netAmount: 700,
        paidAmount: 0,
        status: "Unpaid",
        dueDate: new Date(Date.now() + 14*24*60*60*1000).toISOString().split("T")[0],
        payments: []
      });

      writeAudit(actorId || "u-admin", "ADMISSION_APPROVE", `Approved admission inq for ${inq.applicantName}. Registered Student Roll: ${rollNumber}`, req);
    } else {
      writeAudit(actorId || "u-admin", "ADMISSION_UPDATE", `Updated admission inq status for ${inq.applicantName} to ${status}.`, req);
    }

    syncDatabase();
    res.json(inq);
  });

  // ==========================================
  // MODULE 03 & 04 & 05: SIS / Guardians / Teachers
  // ==========================================
  app.get("/api/students", (req, res) => {
    res.json(db.students);
  });

  app.get("/api/parents", (req, res) => {
    res.json(db.parents);
  });

  app.get("/api/teachers", (req, res) => {
    res.json(db.teachers);
  });

  app.put("/api/students/:id", (req, res) => {
    const { id } = req.params;
    const { classId, sectionId, dob, address, medicalInfo, status, actorId } = req.body;
    const st = db.students.find(s => s.id === id);
    if (!st) return res.status(404).json({ message: "Student record not found." });

    if (classId) st.classId = classId;
    if (sectionId) st.sectionId = sectionId;
    if (dob) st.dob = dob;
    if (address) st.address = address;
    if (medicalInfo !== undefined) st.medicalInfo = medicalInfo;
    if (status) st.status = status;

    syncDatabase();
    writeAudit(actorId || "u-admin", "STUDENT_UPDATE", `Updated info or class promotions for student ${st.name}.`, req);
    res.json(st);
  });

  app.put("/api/teachers/:id", (req, res) => {
    const { id } = req.params;
    const { qualification, experienceYears, salary, classesAssigned, actorId } = req.body;
    const tc = db.teachers.find(t => t.id === id);
    if (!tc) return res.status(404).json({ message: "Teacher record not found" });

    if (qualification) tc.qualification = qualification;
    if (experienceYears !== undefined) tc.experienceYears = Number(experienceYears);
    if (salary !== undefined) tc.salary = Number(salary);
    if (classesAssigned) tc.classesAssigned = classesAssigned;

    syncDatabase();
    writeAudit(actorId || "u-admin", "TEACHER_UPDATE", `Updated portfolio & workload metrics for teacher ${tc.name}`, req);
    res.json(tc);
  });

  // ==========================================
  // MODULE 06 & 07: Academics & Timetables
  // ==========================================
  app.get("/api/classes", (req, res) => {
    res.json(db.classes);
  });

  app.get("/api/subjects", (req, res) => {
    res.json(db.subjects);
  });

  app.get("/api/timetables", (req, res) => {
    res.json(db.timetables);
  });

  app.post("/api/timetables", (req, res) => {
    const { classId, sectionId, subjectId, teacherId, room, dayOfWeek, startTime, endTime, actorId } = req.body;
    
    // Conflict Checker: Ensure tutor or room is not doubled-booked at same day + time period
    const overlaps = db.timetables.some(item => {
      const dayMatch = item.dayOfWeek === dayOfWeek;
      const roomOrTeacherConflict = item.room === room || item.teacherId === teacherId;
      
      if (!dayMatch || !roomOrTeacherConflict) return false;

      // Simple overlap test
      const tStart = item.startTime.replace(":", "");
      const tEnd = item.endTime.replace(":", "");
      const nStart = startTime.replace(":", "");
      const nEnd = endTime.replace(":", "");
      return (Number(nStart) >= Number(tStart) && Number(nStart) < Number(tEnd)) || 
             (Number(nEnd) > Number(tStart) && Number(nEnd) <= Number(tEnd));
    });

    if (overlaps) {
      return res.status(409).json({ message: "Schedule Conflict Detected! Teacher or target room is occupied during this time window." });
    }

    const newTT = {
      id: `tt-${Date.now()}`,
      classId,
      sectionId,
      subjectId,
      teacherId,
      room,
      dayOfWeek,
      startTime,
      endTime
    };
    db.timetables.push(newTT);
    syncDatabase();
    writeAudit(actorId || "u-admin", "TIMETABLE_CREATE", `Booked schedule in ${room} for class ${classId}.`, req);
    res.status(201).json(newTT);
  });

  app.delete("/api/timetables/:id", (req, res) => {
    const { id } = req.params;
    const { actorId } = req.query;
    db.timetables = db.timetables.filter(t => t.id !== id);
    syncDatabase();
    writeAudit((actorId as string) || "u-admin", "TIMETABLE_DELETE", `Removed timetable schedule node: ${id}`, req);
    res.json({ message: "Timetable slot freed up." });
  });

  // ==========================================
  // MODULE 08: Student Attendance Management
  // ==========================================
  app.get("/api/attendance", (req, res) => {
    res.json(db.attendance);
  });

  app.post("/api/attendance", (req, res) => {
    const { classId, sectionId, date, statuses, actorId } = req.body;
    if (!classId || !sectionId || !date || !statuses) {
      return res.status(400).json({ message: "Missing required attendance headers or payload." });
    }
    
    // Check if attendance already logged for that class section and date - if so, amend it!
    const key = `att-${classId}-${sectionId}-${date}`;
    const idx = db.attendance.findIndex(a => a.classId === classId && a.sectionId === sectionId && a.date === date);

    if (idx !== -1) {
      db.attendance[idx].statuses = statuses;
    } else {
      db.attendance.push({
        id: `att-${Date.now()}`,
        classId,
        sectionId,
        date,
        statuses
      });
    }

    syncDatabase();
    writeAudit(actorId || "u-teacher", "ATTENDANCE_LOG", `Saved class register for ${classId} [Sec ${sectionId}] on ${date}`, req);
    res.json({ message: "Attendance registers synchronized successfully." });
  });

  // ==========================================
  // MODULE 09 & 10: Exams & Result Calculations
  // ==========================================
  app.get("/api/examinations", (req, res) => {
    res.json(db.examinations);
  });

  app.get("/api/marks", (req, res) => {
    res.json(db.marks);
  });

  app.post("/api/examinations", (req, res) => {
    const { name, type, classId, subjectId, date, maxMarks, venue, actorId } = req.body;
    if (!name || !classId || !subjectId || !maxMarks) {
      return res.status(400).json({ message: "Missing assessment blueprint variables." });
    }
    const newExam = {
      id: `ex-${Date.now()}`,
      name,
      type,
      classId,
      subjectId,
      date: date || new Date().toISOString().split("T")[0],
      maxMarks: Number(maxMarks),
      venue: venue || ""
    };
    db.examinations.push(newExam);
    syncDatabase();
    writeAudit(actorId || "u-admin", "EXAM_CREATE", `Published assessment scheme: ${name} [Total marks: ${maxMarks}]`, req);
    res.status(201).json(newExam);
  });

  app.post("/api/marks/bulk", (req, res) => {
    const { examId, records, actorId } = req.body; // records: Array<{studentId, obtainedMarks, remarks}>
    if (!examId || !records) {
      return res.status(400).json({ message: "Missing bulk marks configuration." });
    }

    records.forEach((rec: any) => {
      const existingIdx = db.marks.findIndex(m => m.examId === examId && m.studentId === rec.studentId);
      if (existingIdx !== -1) {
        db.marks[existingIdx].obtainedMarks = Number(rec.obtainedMarks);
        db.marks[existingIdx].remarks = rec.remarks || "";
      } else {
        db.marks.push({
          id: `mk-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
          examId,
          studentId: rec.studentId,
          obtainedMarks: Number(rec.obtainedMarks),
          remarks: rec.remarks || ""
        });
      }
    });

    syncDatabase();
    writeAudit(actorId || "u-teacher", "MARKS_BULK_ENTRY", `Updated score registries for exam ${examId}.`, req);
    res.json({ message: "Academic marks list logged." });
  });

  // ==========================================
  // MODULE 11 & 12: Homework & Online Submissions
  // ==========================================
  app.get("/api/homework", (req, res) => {
    res.json(db.homework);
  });

  app.post("/api/homework", (req, res) => {
    const { title, description, classId, sectionId, subjectId, teacherId, dueDate, attachment } = req.body;
    const newHw = {
      id: `hw-${Date.now()}`,
      title,
      description,
      classId,
      sectionId,
      subjectId,
      teacherId,
      dueDate,
      fileAttachment: attachment || "",
      submissions: []
    };
    db.homework.push(newHw);
    syncDatabase();
    writeAudit(teacherId || "u-teacher", "HOMEWORK_CREATE", `Created homework assignment: ${title}`, req);
    res.status(201).json(newHw);
  });

  app.post("/api/homework/:id/submit", (req, res) => {
    const { id } = req.params;
    const { studentId, content } = req.body;
    const hw = db.homework.find(h => h.id === id);
    if (!hw) return res.status(404).json({ message: "Homework item not found." });

    const exists = hw.submissions.find(s => s.studentId === studentId);
    if (exists) {
      exists.submittedAt = new Date().toISOString();
      exists.content = content;
    } else {
      hw.submissions.push({
        studentId,
        submittedAt: new Date().toISOString(),
        content
      });
    }

    syncDatabase();
    writeAudit(studentId, "HOMEWORK_SUBMIT", `Subitted answers for homework task ${hw.title}`, req);
    res.json({ message: "Homework submitted successfully." });
  });

  app.post("/api/homework/:id/grade", (req, res) => {
    const { id } = req.params;
    const { studentId, grade, feedback, teacherId } = req.body;
    const hw = db.homework.find(h => h.id === id);
    if (!hw) return res.status(404).json({ message: "Homework task not found." });

    const sub = hw.submissions.find(s => s.studentId === studentId);
    if (!sub) return res.status(404).json({ message: "Submission not found for student." });

    sub.grade = grade;
    sub.feedback = feedback;

    syncDatabase();
    writeAudit(teacherId || "u-teacher", "HOMEWORK_GRADE", `Graded submission for ${studentId} on assignment ${hw.title}`, req);
    res.json({ message: "Submission evaluated successfully." });
  });

  // ==========================================
  // MODULE 13: Fee Management
  // ==========================================
  app.get("/api/fees", (req, res) => {
    res.json(db.fees);
  });

  app.post("/api/fees", (req, res) => {
    const { studentId, category, amount, discount, dueDate, actorId } = req.body;
    const netAmount = Number(amount) - Number(discount || 0);
    const code = Math.floor(1000 + Math.random() * 9000);
    
    const invoice = {
      id: `f-${Date.now()}`,
      invoiceNumber: `INV-2026-${code}`,
      studentId,
      month: new Date().toLocaleString("en-US", { month: "long" }),
      year: 2026,
      category: category || "Monthly Fee",
      amount: Number(amount),
      discount: Number(discount || 0),
      fine: 0,
      netAmount,
      paidAmount: 0,
      status: "Unpaid" as const,
      dueDate: dueDate || new Date(Date.now() + 15*24*60*60*1000).toISOString().split("T")[0],
      payments: []
    };

    db.fees.push(invoice);
    syncDatabase();
    writeAudit(actorId || "u-accountant", "FEE_ISSUED", `Issued fee invoice ${invoice.invoiceNumber} to scholar ${studentId}`, req);
    res.status(201).json(invoice);
  });

  app.post("/api/fees/:id/pay", (req, res) => {
    const { id } = req.params;
    const { amount, method, actorId } = req.body;
    const fee = db.fees.find(f => f.id === id);
    if (!fee) return res.status(404).json({ message: "Invoice not found." });

    const payVal = Number(amount);
    fee.paidAmount += payVal;

    fee.payments.push({
      date: new Date().toISOString().split("T")[0],
      amount: payVal,
      method: method || "Cash"
    });

    if (fee.paidAmount >= fee.netAmount) {
      fee.status = "Paid";
    } else if (fee.paidAmount > 0) {
      fee.status = "Partial";
    }

    syncDatabase();
    writeAudit(actorId || "u-accountant", "FEE_COLLECTION", `Collected fee ${amount} on Invoice: ${fee.invoiceNumber}`, req);
    res.json(fee);
  });

  // ==========================================
  // MODULE 14: Library Services
  // ==========================================
  app.get("/api/books", (req, res) => {
    res.json(db.books);
  });

  app.get("/api/books/transactions", (req, res) => {
    res.json(db.bookTransactions);
  });

  app.post("/api/books", (req, res) => {
    const { title, author, isbn, category, totalCopies, rackNo, actorId } = req.body;
    const newBook = {
      id: `bk-${Date.now()}`,
      title,
      author,
      isbn,
      category,
      totalCopies: Number(totalCopies),
      availableCopies: Number(totalCopies),
      rackNo
    };
    db.books.push(newBook);
    syncDatabase();
    writeAudit(actorId || "u-librarian", "BOOK_ADD", `Cataloged book: ${title} under shelf ${rackNo}`, req);
    res.status(201).json(newBook);
  });

  app.post("/api/books/issue", (req, res) => {
    const { bookId, studentId, actorId } = req.body;
    const book = db.books.find(b => b.id === bookId);
    if (!book) return res.status(404).json({ message: "Book index missing." });

    if (book.availableCopies <= 0) {
      return res.status(400).json({ message: "No available physical copies left on library shelves." });
    }

    const outstanding = db.bookTransactions.some(t => t.studentId === studentId && t.bookId === bookId && t.status === "Issued");
    if (outstanding) {
      return res.status(400).json({ message: "This student already has an active issue ticket for this textbook." });
    }

    book.availableCopies -= 1;
    const newTx = {
      id: `btx-${Date.now()}`,
      bookId,
      studentId,
      issueDate: new Date().toISOString().split("T")[0],
      dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split("T")[0], // 14 Day limit
      fineAmount: 0,
      status: "Issued" as const
    };

    db.bookTransactions.unshift(newTx);
    syncDatabase();
    writeAudit(actorId || "u-librarian", "BOOK_ISSUE", `Checked out "${book.title}" to student: ${studentId}`, req);
    res.status(201).json(newTx);
  });

  app.post("/api/books/return/:transactionId", (req, res) => {
    const { transactionId } = req.params;
    const { actorId } = req.body;
    const tx = db.bookTransactions.find(t => t.id === transactionId);
    if (!tx) return res.status(404).json({ message: "Inventory record missing." });

    if (tx.status === "Returned") {
      return res.status(400).json({ message: "This book has already been marked returned." });
    }

    const book = db.books.find(b => b.id === tx.bookId);
    if (book) {
      book.availableCopies = Math.min(book.totalCopies, book.availableCopies + 1);
    }

    tx.status = "Returned";
    tx.returnDate = new Date().toISOString().split("T")[0];

    // Compute simple fine: $1 per late day
    const dueTime = new Date(tx.dueDate).getTime();
    const returnTime = new Date().getTime();
    if (returnTime > dueTime) {
      const lateDays = Math.ceil((returnTime - dueTime) / (24 * 60 * 60 * 1000));
      tx.fineAmount = lateDays * 1;
      
      // Post fine to fee invoices
      if (tx.fineAmount > 0) {
        db.fees.push({
          id: `f-fine-${Date.now()}`,
          invoiceNumber: `INV-FINE-${Date.now().toString().slice(-3)}`,
          studentId: tx.studentId,
          month: new Date().toLocaleString("en-US", { month: "long" }),
          year: 2026,
          category: "Library Fee",
          amount: tx.fineAmount,
          discount: 0,
          fine: 0,
          netAmount: tx.fineAmount,
          paidAmount: 0,
          status: "Unpaid",
          dueDate: new Date(Date.now() + 7*24*60*60*1000).toISOString().split("T")[0],
          payments: []
        });
      }
    }

    syncDatabase();
    writeAudit(actorId || "u-librarian", "BOOK_RETURN", `Completed return checkout ticket for book ${tx.bookId}. Issued late fees: $${tx.fineAmount}`, req);
    res.json(tx);
  });

  // ==========================================
  // MODULE 15: Announcements & Peer Communication
  // ==========================================
  app.get("/api/announcements", (req, res) => {
    res.json(db.announcements);
  });

  app.post("/api/announcements", (req, res) => {
    const { title, content, category, targetRoles, senderName, actorId } = req.body;
    const announce = {
      id: `an-${Date.now()}`,
      title,
      content,
      category: category || "General",
      targetRoles: targetRoles || [UserRole.TEACHER, UserRole.STUDENT, UserRole.PARENT],
      senderName: senderName || "Academic Office",
      date: new Date().toISOString().split("T")[0]
    };
    db.announcements.unshift(announce);
    syncDatabase();
    writeAudit(actorId || "u-admin", "ANNOUNCEMENT_POST", `Broadcasted announcement: ${title}`, req);
    res.status(201).json(announce);
  });

  app.get("/api/messages", (req, res) => {
    res.json(db.messages);
  });

  app.post("/api/messages", (req, res) => {
    const { senderId, senderName, receiverId, content } = req.body;
    if (!senderId || !receiverId || !content) {
      return res.status(400).json({ message: "Incomplete mailing inputs." });
    }
    const msg = {
      id: `msg-${Date.now()}`,
      senderId,
      senderName: senderName || "Anonymous Sender",
      receiverId,
      content,
      timestamp: new Date().toISOString(),
      read: false
    };
    db.messages.push(msg);
    syncDatabase();
    res.status(201).json(msg);
  });

  app.patch("/api/messages/read", (req, res) => {
    const { userId, senderId } = req.body;
    db.messages.forEach(m => {
      if (m.receiverId === userId && m.senderId === senderId) {
        m.read = true;
      }
    });
    syncDatabase();
    res.json({ message: "Messages flagged read." });
  });

  // ==========================================
  // MODULE 16: Certificate Center
  // ==========================================
  app.get("/api/certificates", (req, res) => {
    res.json(db.certificates);
  });

  app.post("/api/certificates", (req, res) => {
    const { studentId, certificateType, notes, actorId } = req.body;
    const student = db.students.find(s => s.id === studentId);
    if (!student) return res.status(404).json({ message: "Student record absent." });

    const keyHash = Math.random().toString(36).substring(2, 6).toUpperCase();
    const verCode = `CERT-${student.rollNumber.split("-").pop()}-${new Date().getFullYear()}-${keyHash}`;
    
    const cert = {
      id: `cf-${Date.now()}`,
      studentId,
      studentName: student.name,
      certificateType,
      dateIssued: new Date().toISOString().split("T")[0],
      uniqueValidationCode: verCode,
      notes
    };

    db.certificates.unshift(cert);
    syncDatabase();
    writeAudit(actorId || "u-admin", "CERTIFICATE_ISSUED", `Generated ${certificateType} Certification Credentials under ticket ID: ${verCode}`, req);
    res.status(201).json(cert);
  });

  // ==========================================
  // MODULE 17: Backup, CSV Exports and Recovery SNAPs
  // ==========================================
  app.get("/api/backups", (req, res) => {
    res.json(db.backups);
  });

  app.post("/api/backups", (req, res) => {
    const { name, actorId } = req.body;
    const count = Object.values(db).reduce((acc, curr) => acc + (Array.isArray(curr) ? curr.length : 0), 0);
    const snap = {
      id: `bkp-${Date.now()}`,
      name: name || `Incremental Snapshot ${new Date().toLocaleDateString()}`,
      timestamp: new Date().toISOString(),
      size: `${(JSON.stringify(db).length / 1024).toFixed(1)} KB`,
      recordCount: count
    };

    db.backups.unshift(snap);
    // Write copy of snapshot metadata inside active db file
    syncDatabase();

    // Copy file to individual recovery sub-structure
    const destPath = path.join(DATA_DIR, `backup-${snap.id}.json`);
    fs.writeFileSync(destPath, JSON.stringify(db, null, 2), "utf8");

    writeAudit(actorId || "u-admin", "BACKUP_SNAPSHOT", `Generated system state recovery schema index: ${snap.name}`, req);
    res.status(201).json(snap);
  });

  // REST RESTORE DATABASE
  app.post("/api/backups/:id/restore", (req, res) => {
    const { id } = req.params;
    const { actorId } = req.body;
    const backupFile = path.join(DATA_DIR, `backup-${id}.json`);
    
    if (id === "initial-seed") {
      db = generateSeedData();
      syncDatabase();
      writeAudit(actorId || "u-admin", "RESTORE_SNAPSHOT", `Rolled system back to seeded out-of-box configs.`, req);
      return res.json({ message: "Successfully loaded initial enterprise records into workspace!" });
    }

    if (!fs.existsSync(backupFile)) {
      return res.status(404).json({ message: "Raw restoration payload is missing from data storage." });
    }

    try {
      const payload = fs.readFileSync(backupFile, "utf8");
      db = JSON.parse(payload);
      syncDatabase();
      writeAudit(actorId || "u-admin", "RESTORE_SNAPSHOT", `Restored snapshot ${id}`, req);
      res.json({ message: "System environment successfully reverted to target snapshot state!" });
    } catch (err) {
      res.status(500).json({ message: "Failed parsing restoration backup payload file." });
    }
  });

  // FULL SNAPSHOT UPLOAD
  app.post("/api/backups/restore-snapshot-upload", (req, res) => {
    const { snapshotData, actorId } = req.body;
    if (!snapshotData || typeof snapshotData !== "object") {
      return res.status(400).json({ message: "Invalid JSON snapshot data structure." });
    }
    
    try {
      // Basic validation
      if (!Array.isArray(snapshotData.users) || !Array.isArray(snapshotData.students)) {
        return res.status(400).json({ message: "Restoration rejected: Upload structure lacks principal 'users' or 'students' databases." });
      }

      // Merge and Sync
      db = {
        ...generateSeedData(), // fallback defaults
        ...snapshotData
      };
      syncDatabase();
      writeAudit(actorId || "u-admin", "RESTORE_STATE_UPLOAD", "Restored the system completely from an uploaded JSON state backup.", req);
      res.json({ message: "State records replaced with uploaded snapshot perfectly!" });
    } catch (err) {
      res.status(500).json({ message: "Integrity check failed: corrupt backup file schema." });
    }
  });

  // EXCEL COMPATIBLE CSV BACKUPS
  app.get("/api/backups/export/:module", (req, res) => {
    const { module } = req.params;
    let csvContent = "";
    let filename = `${module}_backup.csv`;

    switch (module) {
      case "students": {
        const headers = ["Student ID", "Roll Number", "Full Name", "Email Address", "Target Grade ID", "Class Section", "Parent ID", "Date of Birth", "Address Location", "Medical Records", "Status", "Enrollment Date"];
        const rows = db.students.map(s => [s.id, s.rollNumber, s.name, s.email, s.classId, s.sectionId, s.parentId, s.dob, s.address || "", s.medicalInfo || "", s.status, s.enrollmentDate]);
        csvContent = [headers, ...rows].map(row => row.map(v => `"${v.toString().replace(/"/g, '""')}"`).join(",")).join("\n");
        break;
      }
      case "teachers": {
        const headers = ["Teacher ID", "Full Name", "Email Address", "Phone Contacts", "Qualification Degree", "Experience Years", "Active Salary ($)", "Service Status", "Aggregate Rating"];
        const rows = db.teachers.map(t => [t.id, t.name, t.email, t.phone, t.qualification, t.experienceYears, t.salary, t.status, t.rating]);
        csvContent = [headers, ...rows].map(row => row.map(v => `"${v.toString().replace(/"/g, '""')}"`).join(",")).join("\n");
        break;
      }
      case "attendance": {
        const headers = ["Register ID", "Class Reference", "Section Letter", "Log Date", "Logged Registers Count"];
        const rows = db.attendance.map(a => [a.id, a.classId, a.sectionId, a.date, Object.keys(a.statuses).length]);
        csvContent = [headers, ...rows].map(row => row.map(v => `"${v.toString().replace(/"/g, '""')}"`).join(",")).join("\n");
        break;
      }
      case "fees": {
        const headers = ["Invoice ID", "Invoice Number", "Student ID Reference", "Billing Period", "Year", "Fee Category", "Base Amount ($)", "Offered Discount ($)", "Fine Surcharge ($)", "Net Charges ($)", "Paid Amount ($)", "Invoice Status", "Due Date"];
        const rows = db.fees.map(f => [f.id, f.invoiceNumber, f.studentId, f.month, f.year, f.category, f.amount, f.discount, f.fine, f.netAmount, f.paidAmount, f.status, f.dueDate]);
        csvContent = [headers, ...rows].map(row => row.map(v => `"${v.toString().replace(/"/g, '""')}"`).join(",")).join("\n");
        break;
      }
      case "results": {
        const headers = ["Log ID", "Exam ID Index", "Student ID", "Obtained Score", "Assigned Grade Notes", "Teacher Remarks Feedback"];
        const rows = db.marks.map(m => {
          const ex = db.examinations.find(e => e.id === m.examId);
          const max = ex ? ex.maxMarks : 100;
          const ratio = m.obtainedMarks / max;
          const grade = ratio >= 0.9 ? "A+" : ratio >= 0.8 ? "A" : ratio >= 0.7 ? "B" : ratio >= 0.6 ? "C" : "D";
          return [m.id, m.examId, m.studentId, m.obtainedMarks, grade, m.remarks || ""];
        });
        csvContent = [headers, ...rows].map(row => row.map(v => `"${v.toString().replace(/"/g, '""')}"`).join(",")).join("\n");
        break;
      }
      case "parents": {
        const headers = ["Parent ID Reference", "Name", "Email Address", "Verified Phone Contacts", "Home Residence Address", "Job/Occupation", "Linked Children Count"];
        const rows = db.parents.map(p => [p.id, p.name, p.email, p.phone, p.address, p.occupation, p.childrenIds.length]);
        csvContent = [headers, ...rows].map(row => row.map(v => `"${v.toString().replace(/"/g, '""')}"`).join(",")).join("\n");
        break;
      }
      default: {
        return res.status(404).json({ message: "Export parameters unrecognized." });
      }
    }

    res.setHeader("Content-Type", "text/csv");
    res.setHeader("Content-Disposition", `attachment; filename=${filename}`);
    res.send(csvContent);
  });

  // DYNAMIC SYSTEM AUDIT LOG RETRIEVAL
  app.get("/api/system/audit-logs", (req, res) => {
    res.json(db.auditLogs);
  });

  // SYSTEM METRICS & PERFORMANCE KPI DATASETS
  app.get("/api/system/metrics", (req, res) => {
    const activeInquiries = db.inquiries.length;
    const totalStudents = db.students.length;
    const totalTeachers = db.teachers.length;
    const totalBooks = db.books.reduce((acc, curr) => acc + curr.totalCopies, 0);

    // Sum financial revenue
    let billsTotal = 0;
    let collectionsTotal = 0;
    db.fees.forEach(f => {
      billsTotal += f.netAmount;
      collectionsTotal += f.paidAmount;
    });

    // Attendance compliance average of past logs
    let presentCount = 0;
    let totalAttendanceChecks = 0;
    db.attendance.forEach(a => {
      Object.values(a.statuses).forEach((st: any) => {
        totalAttendanceChecks++;
        if (st === "Present" || st === "Official" || st === "Medical" || st === "Leave") {
          presentCount++;
        }
      });
    });
    const avgAttendance = totalAttendanceChecks > 0 ? Number(((presentCount / totalAttendanceChecks) * 100).toFixed(1)) : 100;

    res.json({
      activeInquiries,
      totalStudents,
      totalTeachers,
      totalBooks,
      revenueSummary: {
        totalInvoiced: billsTotal,
        totalCollected: collectionsTotal,
        outstandingDue: billsTotal - collectionsTotal
      },
      avgAttendance
    });
  });

  // ==========================================
  // Vite Dev & SPA Client Asset Handlers
  // ==========================================
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server launched on port ${PORT}`);
  });
}

startServer();
