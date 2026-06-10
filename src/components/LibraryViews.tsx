import React, { useState } from "react";
import { 
  BookMarked, ClipboardList, Plus, HelpCircle, Save, CheckCircle, 
  HelpCircle as QuestionIcon, ArrowRightLeft 
} from "lucide-react";
import { User, Student, Book, BookTransaction } from "../types.js";

interface LibraryViewsProps {
  activeTab: string;
  currentUser: User;
  students: Student[];
  books: Book[];
  bookTransactions: BookTransaction[];
  onRefreshAll: () => void;
  onCreateBook: (payload: any) => Promise<void>;
  onCheckoutBook: (bookId: string, studentId: string) => Promise<void>;
  onReturnBook: (transactionId: string) => Promise<void>;
  onShowToast?: (message: string, type: "success" | "error" | "info") => void;
}

export default function LibraryViews({
  activeTab,
  currentUser,
  students,
  books,
  bookTransactions,
  onRefreshAll,
  onCreateBook,
  onCheckoutBook,
  onReturnBook,
  onShowToast
}: LibraryViewsProps) {
  // Librarian States
  const [bookOpen, setBookOpen] = useState(false);
  const [bTitle, setBTitle] = useState("");
  const [bAuthor, setBAuthor] = useState("");
  const [bIsbn, setBIsbn] = useState("");
  const [bCategory, setBCategory] = useState("Math");
  const [bCopies, setBCopies] = useState(5);
  const [bRack, setBRack] = useState("M-01");

  // Issue States
  const [issueOpen, setIssueOpen] = useState(false);
  const [issueBId, setIssueBId] = useState("");
  const [issueStId, setIssueStId] = useState("u-student");

  // Filters search
  const [bookQuery, setBookQuery] = useState("");

  const handleCreateBookSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bTitle || !bAuthor) return;
    await onCreateBook({
      title: bTitle,
      author: bAuthor,
      isbn: bIsbn || `ISBN-${Date.now().toString().slice(-4)}`,
      category: bCategory,
      totalCopies: bCopies,
      rackNo: bRack
    });
    setBookOpen(false);
    setBTitle("");
    setBAuthor("");
    setBIsbn("");
  };

  const handleCheckoutSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const bid = issueBId || (books[0] ? books[0].id : "");
    if (!bid) {
      if (onShowToast) {
        onShowToast("No available titles registered in inventory catalog.", "error");
      } else {
        alert("No available titles registered in inventory catalog.");
      }
      return;
    }
    try {
      await onCheckoutBook(bid, issueStId);
      setIssueOpen(false);
      if (onShowToast) {
        onShowToast("Book Checked out successfully from storage!", "success");
      } else {
        alert("Book Checked out successfully from storage!");
      }
    } catch (err: any) {
      if (onShowToast) {
        onShowToast("System Overload: " + err.message, "error");
      } else {
        alert("System Overload: " + err.message);
      }
    }
  };

  const filteredBooks = books.filter(b => 
    b.title.toLowerCase().includes(bookQuery.toLowerCase()) || 
    b.author.toLowerCase().includes(bookQuery.toLowerCase()) ||
    b.category.toLowerCase().includes(bookQuery.toLowerCase())
  );

  const isLibrarian = ["ADMIN", "SUPER_ADMIN", "LIBRARIAN"].includes(currentUser.role);

  if (activeTab === "library") {
    return (
      <div className="bg-white rounded-2xl border border-slate-105 p-6 shadow-xs text-left" id="library-catalog-panel">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-slate-100 pb-4 mb-6 gap-4">
          <div>
            <h3 className="text-base font-bold text-slate-800">Academy Library Catalog & Ledger</h3>
            <p className="text-xs text-slate-400 mt-0.5">Track shelf volumes, monitor active book borrow logs, and calculate late penalties</p>
          </div>
          <div className="flex items-center gap-2.5">
            <input 
              type="text"
              placeholder="Search books, author, genre..."
              value={bookQuery}
              onChange={(e) => setBookQuery(e.target.value)}
              className="text-xs border border-slate-200 rounded-xl px-3.5 py-2 w-44 sm:w-56 focus:outline-none focus:border-indigo-550 bg-slate-50/50"
            />
            {isLibrarian && (
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setIssueOpen(true);
                    if (books[0]) setIssueBId(books[0].id);
                  }}
                  className="bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-semibold px-3 py-2 rounded-xl border border-indigo-200 transition flex items-center cursor-pointer"
                >
                  <ArrowRightLeft className="w-3.5 h-3.5 mr-1" /> Checkout Item
                </button>
                <button
                  onClick={() => setBookOpen(true)}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold px-4 py-2 rounded-xl transition flex items-center shadow-xs cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5 mr-1" /> Catalog Book
                </button>
              </div>
            )}
          </div>
        </div>

        {bookOpen && (
          <div className="bg-slate-50 p-5 rounded-2xl border border-slate-150 mb-6 animate-fadeIn text-xs">
            <h4 className="text-sm font-bold text-slate-800 mb-3">Add New Volume to Library Catalog</h4>
            <form onSubmit={handleCreateBookSubmit} className="grid grid-cols-1 sm:grid-cols-4 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-[11px] font-semibold text-slate-500 mb-1">Book Title Name</label>
                <input 
                  type="text" 
                  required
                  placeholder="e.g. Thomas' Calculus (14th Edition)"
                  value={bTitle}
                  onChange={(e) => setBTitle(e.target.value)}
                  className="text-xs bg-white border border-slate-205 rounded-lg p-2 w-full focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-500 mb-1">Author Name Particulars</label>
                <input 
                  type="text" 
                  required
                  placeholder="e.g. Maurice D. Weir"
                  value={bAuthor}
                  onChange={(e) => setBAuthor(e.target.value)}
                  className="text-xs bg-white border border-slate-205 rounded-lg p-2 w-full focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-500 mb-1">International Standard Code (ISBN)</label>
                <input 
                  type="text" 
                  placeholder="978-0134438986"
                  value={bIsbn}
                  onChange={(e) => setBIsbn(e.target.value)}
                  className="text-xs bg-white border border-slate-205 rounded-lg p-2 w-full focus:outline-none font-mono"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-500 mb-1">Subject Genre Category</label>
                <select 
                  value={bCategory} 
                  onChange={(e) => setBCategory(e.target.value)}
                  className="text-xs bg-white border border-slate-205 p-2 rounded-lg font-sans w-full"
                >
                  <option value="Math">Math / Quantitative</option>
                  <option value="Physics">Physics / Sciences</option>
                  <option value="Astronomy">Astronomy / Space</option>
                  <option value="Computer">Computer Programming</option>
                  <option value="Literature">Literature / Fiction</option>
                  <option value="Research">Academic Journals / Research</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-500 mb-1">Asset Volume Count Copies</label>
                <input 
                  type="number" 
                  min="1" 
                  value={bCopies}
                  onChange={(e) => setBCopies(Number(e.target.value))}
                  className="w-full bg-white border border-slate-205 rounded-lg p-2 font-mono text-center text-slate-700"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-500 mb-1">Allocated Storage Rack Location</label>
                <input 
                  type="text" 
                  placeholder="Shelf Suite: e.g. M-12"
                  value={bRack}
                  onChange={(e) => setBRack(e.target.value)}
                  className="w-full bg-white border border-slate-205 rounded-lg p-2 font-mono"
                />
              </div>

              <div className="sm:col-span-4 flex justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setBookOpen(false)}
                  className="text-slate-500 hover:bg-slate-100 p-2 rounded-md"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-indigo-600 text-white font-bold p-2 px-4 rounded-md hover:bg-indigo-750 transition"
                >
                  Log Asset Record
                </button>
              </div>
            </form>
          </div>
        )}

        {issueOpen && (
          <div className="bg-slate-50 p-5 rounded-2xl border border-slate-150 mb-6 animate-fadeIn text-xs">
            <h4 className="text-sm font-bold text-slate-800 mb-3">Issue Book Ticket Clearance</h4>
            <form onSubmit={handleCheckoutSubmit} className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-[11px] font-semibold text-slate-500 mb-1 font-sans">Browse Target Book</label>
                <select 
                  value={issueBId} 
                  onChange={(e) => setIssueBId(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-lg p-2"
                >
                  {books.filter(b => b.availableCopies > 0).map(b => (
                    <option key={b.id} value={b.id}>{b.title} by {b.author} ({b.availableCopies} left)</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-500 mb-1 font-sans">Selected Student Scholar</label>
                <select 
                  value={issueStId} 
                  onChange={(e) => setIssueStId(e.target.value)}
                  className="w-full bg-white border border-slate-200 p-2 rounded-lg font-sans"
                >
                  {students.map(s => <option key={s.id} value={s.id}>{s.name} ({s.rollNumber})</option>)}
                </select>
              </div>

              <div className="sm:col-span-3 flex justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIssueOpen(false)}
                  className="text-slate-500 hover:bg-slate-100 p-2 rounded-md"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-indigo-650 hover:bg-indigo-750 text-white font-bold p-2 px-4 rounded-md transition"
                >
                  Approve Checker Release
                </button>
              </div>
            </form>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Books inventory list */}
          <div className="lg:col-span-2 overflow-x-auto">
            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Physical Library Inventory ({filteredBooks.length})</h4>
            <table className="w-full text-xs text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 text-slate-400 font-semibold bg-slate-50/50">
                  <th className="py-3 px-4">Book Title Particular</th>
                  <th className="py-3 px-4">Category Genre</th>
                  <th className="py-3 px-4 text-center">Available Copies</th>
                  <th className="py-3 px-4">Shelf Rack No</th>
                </tr>
              </thead>
              <tbody>
                {filteredBooks.map(b => (
                  <tr key={b.id} className="border-b border-slate-50 hover:bg-slate-50/50 transition-all text-xs">
                    <td className="py-3 px-4">
                      <span className="font-bold text-slate-755 block leading-tight font-sans">{b.title}</span>
                      <span className="text-[10px] text-slate-400 block mt-0.5">By {b.author} | ISBN {b.isbn}</span>
                    </td>
                    <td className="py-3 px-4 text-slate-500">{b.category}</td>
                    <td className="py-3 px-4 text-center font-bold">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10.5px] font-mono leading-none
                        ${b.availableCopies > 1 ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-550"}
                      `}>
                        {b.availableCopies}/{b.totalCopies}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-400 font-mono font-bold uppercase">{b.rackNo}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Active transactions checkins list */}
          <div className="bg-slate-55/40 p-5 border border-slate-150 rounded-2xl">
            <h4 className="text-xs font-bold text-slate-650 uppercase tracking-widest mb-3 flex items-center">
              <BookMarked className="w-4 h-4 text-indigo-650 mr-2 shrink-0 animate-pulse" />
              Outstanding Checked-Out Logs ({bookTransactions.filter(t => t.status === "Issued").length})
            </h4>

            <div className="space-y-3 max-h-[340px] overflow-y-auto pr-1">
              {bookTransactions.length === 0 ? (
                <p className="text-xs text-slate-400 italic text-center py-6">No textbooks currently out on checkout loans.</p>
              ) : (
                bookTransactions.map(tx => {
                  const book = books.find(b => b.id === tx.bookId);
                  const student = students.find(s => s.id === tx.studentId);
                  const isOverdue = new Date(tx.dueDate) < new Date() && tx.status === "Issued";

                  return (
                    <div key={tx.id} className="text-xs bg-white border border-slate-150 p-3 rounded-xl shadow-2xs relative text-left">
                      <div className="flex justify-between font-bold">
                        <span className="text-slate-800 leading-tight block">{book?.title || "Unknown Book Title"}</span>
                        {tx.status === "Issued" && isLibrarian && (
                          <button
                            onClick={() => onReturnBook(tx.id)}
                            className="bg-indigo-50 hover:bg-indigo-150 text-indigo-700 font-bold px-2 py-1 rounded text-[10px] uppercase cursor-pointer"
                          >
                            Return Block
                          </button>
                        )}
                      </div>
                      <p className="text-[10px] text-slate-550 mt-1">Reader scholar: <strong>{student?.name || tx.studentId}</strong></p>
                      
                      <div className="flex justify-between text-[9.5px] mt-2 font-mono border-t border-slate-100 pt-1.5 text-slate-400">
                        <span>Due Limit: {tx.dueDate}</span>
                        {tx.status === "Returned" ? (
                          <span className="text-emerald-600 font-bold">Returned</span>
                        ) : isOverdue ? (
                          <span className="text-red-550 font-bold animate-pulse">LATE CHRG</span>
                        ) : (
                          <span className="text-amber-600 font-medium font-sans">Active Loan</span>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return null;
}
