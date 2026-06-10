/**
 * SCHOOL MANAGEMENT SYSTEM (SMS)
 * Shared TypeScript Domain Models
 */

export enum UserRole {
  SUPER_ADMIN = "SUPER_ADMIN",
  ADMIN = "ADMIN",
  PRINCIPAL = "PRINCIPAL",
  TEACHER = "TEACHER",
  STUDENT = "STUDENT",
  PARENT = "PARENT",
  ACCOUNTANT = "ACCOUNTANT",
  LIBRARIAN = "LIBRARIAN"
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  phone?: string;
  avatar?: string;
  status: "Active" | "Inactive";
  createdAt: string;
}

export interface AuditLog {
  id: string;
  userId: string;
  userName: string;
  userRole: string;
  action: string;
  details: string;
  timestamp: string;
  ipAddress?: string;
}

export interface AdmissionInquiry {
  id: string;
  applicantName: string;
  gradeClass: string;
  parentName: string;
  email: string;
  phone: string;
  birthCertUploaded: boolean;
  parentCnicUploaded: boolean;
  marksSheetUploaded: boolean;
  status: "Pending" | "Approved" | "Rejected";
  reviewNotes?: string;
  date: string;
}

export interface Student {
  id: string;
  rollNumber: string;
  name: string;
  email: string;
  classId: string;
  sectionId: string;
  parentId: string; // references Parent's User ID
  dob: string;
  phone?: string;
  address?: string;
  medicalInfo?: string;
  status: "Active" | "Graduated" | "Transferred" | "Archived";
  enrollmentDate: string;
}

export interface Parent {
  id: string; // matches user id
  name: string;
  email: string;
  phone: string;
  address: string;
  occupation: string;
  childrenIds: string[]; // references Student IDs
}

export interface Teacher {
  id: string; // matches user id
  name: string;
  email: string;
  phone: string;
  qualification: string;
  experienceYears: number;
  salary: number;
  status: "Active" | "Inactive";
  rating: number;
  classesAssigned: Array<{
    classId: string;
    sectionId: string;
    subjectId: string;
  }>;
}

export interface ClassSection {
  id: string; // e.g., "class-1"
  name: string; // e.g., "Grade 10"
  sections: string[]; // e.g., ["A", "B"]
  subjects: string[]; // e.g., ["sub-1", "sub-2"]
}

export interface Subject {
  id: string;
  name: string;
  code: string;
  creditHours: number;
}

export type AttendanceState = "Present" | "Absent" | "Late" | "Leave" | "Medical" | "Official";

export interface AttendanceRecord {
  id: string; // classId_sectionId_date
  classId: string;
  sectionId: string;
  date: string;
  statuses: Record<string, AttendanceState>; // studentId -> State
}

export interface TimetableEntry {
  id: string;
  classId: string;
  sectionId: string;
  subjectId: string;
  teacherId: string;
  room: string;
  dayOfWeek: "Monday" | "Tuesday" | "Wednesday" | "Thursday" | "Friday";
  startTime: string; // e.g. "08:30"
  endTime: string; // e.g. "09:15"
}

export interface Examination {
  id: string;
  name: string;
  type: "Quiz" | "Assignment" | "Monthly" | "MidTerm" | "Final" | "Practical";
  classId: string;
  subjectId: string;
  date: string;
  maxMarks: number;
  venue?: string;
}

export interface MarkRecord {
  id: string; // examId_studentId
  examId: string;
  studentId: string;
  obtainedMarks: number;
  remarks?: string;
}

export interface Homework {
  id: string;
  title: string;
  description: string;
  classId: string;
  sectionId: string;
  subjectId: string;
  teacherId: string;
  dueDate: string;
  fileAttachment?: string;
  submissions: Array<{
    studentId: string;
    submittedAt: string;
    content: string;
    feedback?: string;
    grade?: string;
  }>;
}

export interface FeeInvoice {
  id: string;
  invoiceNumber: string;
  studentId: string;
  month: string;
  year: number;
  category: "Admission" | "Monthly" | "Annual" | "Exam" | "Library" | "Activity" | "Transport" | "Fine";
  amount: number;
  discount: number;
  fine: number;
  netAmount: number;
  paidAmount: number;
  status: "Paid" | "Unpaid" | "Partial";
  dueDate: string;
  payments: Array<{
    date: string;
    amount: number;
    method: string;
  }>;
}

export interface Book {
  id: string;
  title: string;
  author: string;
  isbn: string;
  category: string;
  totalCopies: number;
  availableCopies: number;
  rackNo: string;
}

export interface BookTransaction {
  id: string;
  bookId: string;
  studentId: string;
  issueDate: string;
  dueDate: string;
  returnDate?: string;
  fineAmount: number;
  status: "Issued" | "Returned";
}

export interface Announcement {
  id: string;
  title: string;
  content: string;
  category: "Academic" | "General" | "Holiday" | "Exams" | "Fees";
  targetRoles: UserRole[];
  senderName: string;
  date: string;
}

export interface PrivateMessage {
  id: string;
  senderId: string;
  senderName: string;
  receiverId: string;
  content: string;
  timestamp: string;
  read: boolean;
}

export interface Certificate {
  id: string;
  studentId: string;
  studentName: string;
  certificateType: "Character" | "Bonafide" | "Leaving" | "Achievement" | "Completion";
  dateIssued: string;
  uniqueValidationCode: string;
  notes?: string;
}

export interface BackupRecord {
  id: string;
  name: string;
  timestamp: string;
  size: string;
  recordCount: number;
}
