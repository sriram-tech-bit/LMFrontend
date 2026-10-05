import { useEffect, useState, type FormEvent } from 'react';
import { ArrowRight, BookOpen, Check, CircleUserRound, Info } from 'lucide-react';
import { Link } from 'react-router-dom';
import { api } from '../lib/api';
import { useToast } from '../components/Toast';
import { LoadingState } from '../components/States';
import type { Book, Member } from '../types';

export function IssueBookPage() {
  const [books, setBooks] = useState<Book[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [bookId, setBookId] = useState('');
  const [memberId, setMemberId] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const { showToast } = useToast();

  async function loadChoices() {
    setLoading(true);
    setLoadError(null);
    try {
      const [bookResponse, memberResponse] = await Promise.all([
        api.listBooks({ available: true }),
        api.listMembers({ status: 'active' }),
      ]);
      setBooks(bookResponse.data.filter((book) => book.availableCopies > 0));
      setMembers(memberResponse.data.filter((member) => member.status === 'active'));
    } catch (cause) {
      setLoadError(cause instanceof Error ? cause.message : 'Could not load books and members.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { void loadChoices(); }, []);

  const selectedBook = books.find((book) => (book.id || book._id) === bookId);
  const selectedMember = members.find((member) => (member.id || member._id) === memberId);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!bookId || !memberId || submitting) return;
    setSubmitting(true);
    try {
      const result = await api.issueBook({ book: bookId, member: memberId });
      showToast(result.message || `“${selectedBook?.title ?? 'Book'}” issued successfully.`);
      setBooks((current) => current
        .map((book) => (book.id || book._id) === bookId ? { ...book, availableCopies: Math.max(0, book.availableCopies - 1) } : book)
        .filter((book) => book.availableCopies > 0));
      setBookId('');
      setMemberId('');
    } catch (cause) {
      showToast(cause instanceof Error ? cause.message : 'The book could not be issued.', 'error');
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) return <section className="panel"><LoadingState label="Preparing your issue form…" /></section>;
  if (loadError) return <section className="panel"><div className="form-error" role="alert">{loadError}<button className="button button-secondary" onClick={() => void loadChoices()}>Try again</button></div></section>;

  return (
    <div className="issue-layout">
      <section className="panel issue-panel">
        <div className="panel-heading">
          <div><div className="panel-title">New loan</div><p>Choose a member and a title to get started.</p></div>
          <span className="panel-symbol"><BookOpen size={19} /></span>
        </div>
        {books.length === 0 && <div className="inline-notice"><Info size={17} /><span>There are no available copies to issue right now.</span></div>}
        {members.length === 0 && <div className="inline-notice"><Info size={17} /><span>No active members are available to borrow.</span></div>}
        <form className="issue-form" onSubmit={submit}>
          <label className="form-label" htmlFor="member">MEMBER</label>
          <div className="input-with-icon"><CircleUserRound size={18} /><select id="member" value={memberId} onChange={(event) => setMemberId(event.target.value)} required>
            <option value="">Select a member</option>
            {members.map((member) => <option key={member.id || member._id} value={member.id || member._id}>{member.name} · {member.membershipId}</option>)}
          </select></div>
          <span className="field-hint">Only active library members can check out books.</span>

          <label className="form-label form-label--spaced" htmlFor="book">BOOK</label>
          <div className="input-with-icon"><BookOpen size={18} /><select id="book" value={bookId} onChange={(event) => setBookId(event.target.value)} required>
            <option value="">Select a book</option>
            {books.map((book) => <option key={book.id || book._id} value={book.id || book._id}>{book.title} · {book.availableCopies} available</option>)}
          </select></div>
          <span className="field-hint">The due date is set automatically based on library loan policy.</span>

          <div className="issue-summary">
            <div className="summary-heading"><span>LOAN SUMMARY</span><span className="summary-step">01 / 01</span></div>
            <div className="summary-row"><span>Borrower</span><strong>{selectedMember?.name ?? 'Choose a member'}</strong></div>
            <div className="summary-row"><span>Selected book</span><strong>{selectedBook?.title ?? 'Choose a title'}</strong></div>
            <div className="summary-row"><span>Copies remaining</span><strong>{selectedBook ? `${selectedBook.availableCopies} available` : '—'}</strong></div>
          </div>
          <button className="button button-primary issue-submit" type="submit" disabled={submitting || !bookId || !memberId || books.length === 0 || members.length === 0}>
            {submitting ? <><span className="button-spinner" /> Issuing book…</> : <><Check size={17} /> Confirm issue <ArrowRight size={17} /></>}
          </button>
        </form>
      </section>
      <aside className="issue-aside">
        <div className="aside-card aside-card--green">
          <span className="aside-icon"><Check size={18} /></span>
          <div className="aside-eyebrow">QUICK CHECK</div>
          <h2>Before it goes home</h2>
          <p>Make sure the selected copy is in good condition and the member is ready for a new read.</p>
        </div>
        <div className="aside-card aside-card--cream">
          <span className="aside-quote">“</span>
          <p>Books are a uniquely portable magic.</p>
          <span className="quote-credit">STEPHEN KING</span>
          <Link to="/books" className="text-link">Browse the collection <ArrowRight size={15} /></Link>
        </div>
      </aside>
    </div>
  );
}
