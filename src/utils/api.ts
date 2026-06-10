import {
  User,
  UserRole,
  AdmissionInquiry,
  Student,
  Parent,
  Teacher,
  ClassSection,
  Subject,
  AttendanceRecord,
  TimetableEntry,
  Examination,
  MarkRecord,
  Homework,
  FeeInvoice,
  Book,
  BookTransaction,
  Announcement,
  PrivateMessage,
  Certificate,
  BackupRecord,
  AuditLog
} from "../types.js";

const BASE_URL = "/api";

export async function loginSimulatedUser(email: string): Promise<{ token: string; user: User }> {
  const res = await fetch(`${BASE_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email })
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.message || "Login failed");
  }
  return res.json();
}

export async function fetchUsers(): Promise<User[]> {
  const res = await fetch(`${BASE_URL}/users`);
  return res.json();
}

export async function createUser(payload: { name: string; email: string; role: UserRole; phone?: string; creatorId?: string }): Promise<User> {
  const res = await fetch(`${BASE_URL}/users`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.message || "Failed to create user profile");
  }
  return res.json();
}

export async function deleteUser(id: string, actorId: string): Promise<any> {
  const res = await fetch(`${BASE_URL}/users/${id}?actorId=${actorId}`, {
    method: "DELETE"
  });
  return res.json();
}

export async function fetchAdmissions(): Promise<AdmissionInquiry[]> {
  const res = await fetch(`${BASE_URL}/admissions`);
  return res.json();
}

export async function submitAdmissionInquiry(payload: Partial<AdmissionInquiry>): Promise<AdmissionInquiry> {
  const res = await fetch(`${BASE_URL}/admissions`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });
  return res.json();
}

export async function patchAdmissionStatus(id: string, payload: { status: "Approved" | "Rejected"; reviewNotes?: string; actorId?: string }): Promise<AdmissionInquiry> {
  const res = await fetch(`${BASE_URL}/admissions/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.message || "Failed up updating admission file.");
  }
  return res.json();
}

export async function fetchStudents(): Promise<Student[]> {
  const res = await fetch(`${BASE_URL}/students`);
  return res.json();
}

export async function updateStudent(id: string, payload: Partial<Student> & { actorId?: string }): Promise<Student> {
  const res = await fetch(`${BASE_URL}/students/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });
  return res.json();
}

export async function fetchParents(): Promise<Parent[]> {
  const res = await fetch(`${BASE_URL}/parents`);
  return res.json();
}

export async function fetchTeachers(): Promise<Teacher[]> {
  const res = await fetch(`${BASE_URL}/teachers`);
  return res.json();
}

export async function updateTeacher(id: string, payload: Partial<Teacher> & { actorId?: string }): Promise<Teacher> {
  const res = await fetch(`${BASE_URL}/teachers/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });
  return res.json();
}

export async function fetchClasses(): Promise<ClassSection[]> {
  const res = await fetch(`${BASE_URL}/classes`);
  return res.json();
}

export async function fetchSubjects(): Promise<Subject[]> {
  const res = await fetch(`${BASE_URL}/subjects`);
  return res.json();
}

export async function fetchTimetables(): Promise<TimetableEntry[]> {
  const res = await fetch(`${BASE_URL}/timetables`);
  return res.json();
}

export async function createTimetableEntry(payload: Partial<TimetableEntry> & { actorId?: string }): Promise<TimetableEntry> {
  const res = await fetch(`${BASE_URL}/timetables`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.message || "Failed checking overlap schedules.");
  }
  return res.json();
}

export async function deleteTimetableEntry(id: string, actorId: string): Promise<any> {
  const res = await fetch(`${BASE_URL}/timetables/${id}?actorId=${actorId}`, {
    method: "DELETE"
  });
  return res.json();
}

export async function fetchAttendance(): Promise<AttendanceRecord[]> {
  const res = await fetch(`${BASE_URL}/attendance`);
  return res.json();
}

export async function saveAttendance(payload: { classId: string; sectionId: string; date: string; statuses: Record<string, string>; actorId?: string }): Promise<any> {
  const res = await fetch(`${BASE_URL}/attendance`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });
  return res.json();
}

export async function fetchExaminations(): Promise<Examination[]> {
  const res = await fetch(`${BASE_URL}/examinations`);
  return res.json();
}

export async function createExamination(payload: Partial<Examination> & { actorId?: string }): Promise<Examination> {
  const res = await fetch(`${BASE_URL}/examinations`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });
  return res.json();
}

export async function fetchMarks(): Promise<MarkRecord[]> {
  const res = await fetch(`${BASE_URL}/marks`);
  return res.json();
}

export async function saveBulkMarks(examId: string, records: Array<{ studentId: string; obtainedMarks: number; remarks?: string }>, actorId?: string): Promise<any> {
  const res = await fetch(`${BASE_URL}/marks/bulk`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ examId, records, actorId })
  });
  return res.json();
}

export async function fetchHomework(): Promise<Homework[]> {
  const res = await fetch(`${BASE_URL}/homework`);
  return res.json();
}

export async function createHomework(payload: Partial<Homework>): Promise<Homework> {
  const res = await fetch(`${BASE_URL}/homework`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });
  return res.json();
}

export async function submitHomework(hwId: string, payload: { studentId: string; content: string }): Promise<any> {
  const res = await fetch(`${BASE_URL}/homework/${hwId}/submit`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });
  return res.json();
}

export async function gradeHomework(hwId: string, payload: { studentId: string; grade: string; feedback: string; teacherId?: string }): Promise<any> {
  const res = await fetch(`${BASE_URL}/homework/${hwId}/grade`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });
  return res.json();
}

export async function fetchFees(): Promise<FeeInvoice[]> {
  const res = await fetch(`${BASE_URL}/fees`);
  return res.json();
}

export async function createFeeInvoice(payload: { studentId: string; category?: string; amount: number; discount?: number; dueDate?: string; actorId?: string }): Promise<FeeInvoice> {
  const res = await fetch(`${BASE_URL}/fees`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });
  return res.json();
}

export async function payFeeInvoice(invoiceId: string, payload: { amount: number; method: string; actorId?: string }): Promise<FeeInvoice> {
  const res = await fetch(`${BASE_URL}/fees/${invoiceId}/pay`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });
  return res.json();
}

export async function fetchBooks(): Promise<Book[]> {
  const res = await fetch(`${BASE_URL}/books`);
  return res.json();
}

export async function fetchBookTransactions(): Promise<BookTransaction[]> {
  const res = await fetch(`${BASE_URL}/books/transactions`);
  return res.json();
}

export async function createBook(payload: Partial<Book> & { actorId?: string }): Promise<Book> {
  const res = await fetch(`${BASE_URL}/books`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });
  return res.json();
}

export async function checkoutBook(bookId: string, studentId: string, actorId?: string): Promise<BookTransaction> {
  const res = await fetch(`${BASE_URL}/books/issue`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ bookId, studentId, actorId })
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.message || "Failed checking out library book.");
  }
  return res.json();
}

export async function returnBook(transactionId: string, actorId?: string): Promise<BookTransaction> {
  const res = await fetch(`${BASE_URL}/books/return/${transactionId}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ actorId })
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.message || "Failed registering return ticket.");
  }
  return res.json();
}

export async function fetchAnnouncements(): Promise<Announcement[]> {
  const res = await fetch(`${BASE_URL}/announcements`);
  return res.json();
}

export async function createAnnouncement(payload: Partial<Announcement> & { actorId?: string }): Promise<Announcement> {
  const res = await fetch(`${BASE_URL}/announcements`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });
  return res.json();
}

export async function fetchMessages(): Promise<PrivateMessage[]> {
  const res = await fetch(`${BASE_URL}/messages`);
  return res.json();
}

export async function sendMessage(payload: Partial<PrivateMessage>): Promise<PrivateMessage> {
  const res = await fetch(`${BASE_URL}/messages`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });
  return res.json();
}

export async function markChatRead(userId: string, senderId: string): Promise<any> {
  const res = await fetch(`${BASE_URL}/messages/read`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ userId, senderId })
  });
  return res.json();
}

export async function fetchCertificates(): Promise<Certificate[]> {
  const res = await fetch(`${BASE_URL}/certificates`);
  return res.json();
}

export async function issueCertificate(payload: { studentId: string; certificateType: string; notes?: string; actorId?: string }): Promise<Certificate> {
  const res = await fetch(`${BASE_URL}/certificates`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.message || "Failed generating certificate");
  }
  return res.json();
}

export async function fetchBackups(): Promise<BackupRecord[]> {
  const res = await fetch(`${BASE_URL}/backups`);
  return res.json();
}

export async function createBackupSnapshot(name: string, actorId?: string): Promise<BackupRecord> {
  const res = await fetch(`${BASE_URL}/backups`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, actorId })
  });
  return res.json();
}

export async function restoreBackupSnapshot(id: string, actorId?: string): Promise<any> {
  const res = await fetch(`${BASE_URL}/backups/${id}/restore`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ actorId })
  });
  return res.json();
}

export async function uploadBackupSnapshot(snapshotData: any, actorId: string): Promise<any> {
  const res = await fetch(`${BASE_URL}/backups/restore-snapshot-upload`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ snapshotData, actorId })
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.message || "Failed loading data restoration payload.");
  }
  return res.json();
}

export async function fetchAuditLogs(): Promise<AuditLog[]> {
  const res = await fetch(`${BASE_URL}/system/audit-logs`);
  return res.json();
}

export async function fetchSystemMetrics(): Promise<{
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
}> {
  const res = await fetch(`${BASE_URL}/system/metrics`);
  return res.json();
}
