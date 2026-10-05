import { useEffect, useMemo, useState } from 'react';
import { BookOpen, CalendarDays, CircleUserRound, History, Search } from 'lucide-react';
import { api } from '../lib/api';
import { DataTable, type DataColumn } from '../components/DataTable';
import { ErrorState, LoadingState } from '../components/States';
import type { BorrowRecord, Member, MemberHistory } from '../types';

function isOverdue(record: BorrowRecord): boolean {
  return !record.returnDate && new Date(record.dueDate).getTime() < new Date().setHours(0, 0, 0, 0);
}

function dateLabel(value: string | null): string {
  if (!value) return '—';
  return new Intl.DateTimeFormat(undefined, { day: 'numeric', month: 'short', year: 'numeric' }).format(new Date(value));
}

export function MemberHistoryPage() {
  const [members, setMembers] = useState<Member[]>([]);
  const [memberId, setMemberId] = useState('');
  const [history, setHistory] = useState<MemberHistory | null>(null);
  const [loadingMembers, setLoadingMembers] = useState(true);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [memberSearch, setMemberSearch] = useState('');
  const [historyRetry, setHistoryRetry] = useState(0);

  async function loadMembers() {
    setLoadingMembers(true);
    setError(null);
    try {
      const response = await api.listMembers();
      setMembers(response.data);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Could not load members.');
    } finally {
      setLoadingMembers(false);
    }
  }

  useEffect(() => {
    let active = true;
    api.listMembers()
      .then((response) => { if (active) setMembers(response.data); })
      .catch((cause: unknown) => { if (active) setError(cause instanceof Error ? cause.message : 'Could not load members.'); })
      .finally(() => { if (active) setLoadingMembers(false); });
    return () => { active = false; };
  }, []);

  useEffect(() => {
    if (!memberId) {
      setHistory(null);
      return;
    }
    let active = true;
    setLoadingHistory(true);
    setError(null);
    api.memberHistory(memberId)
      .then((response) => { if (active) setHistory(response.data); })
      .catch((cause: unknown) => { if (active) setError(cause instanceof Error ? cause.message : 'Could not load this member history.'); })
      .finally(() => { if (active) setLoadingHistory(false); });
    return () => { active = false; };
  }, [memberId, historyRetry]);

  const filteredMembers = useMemo(() => members.filter((member) =>
    `${member.name} ${member.membershipId} ${member.email}`.toLocaleLowerCase().includes(memberSearch.trim().toLocaleLowerCase()),
  ), [members, memberSearch]);

  const columns: DataColumn<BorrowRecord>[] = [
    { key: 'book', header: 'BOOK', render: (record) => {
      const book = typeof record.book === 'string' ? null : record.book;
      return <div className="book-cell"><span className="book-cover book-cover--small"><BookOpen size={16} /></span><span className="book-details"><strong>{book?.title ?? 'Book details unavailable'}</strong><small>{book?.author ?? '—'}</small></span></div>;
    } },
    { key: 'issued', header: 'ISSUED', render: (record) => <span className="muted-text">{dateLabel(record.issueDate)}</span> },
    { key: 'due', header: 'DUE DATE', render: (record) => <span className={isOverdue(record) ? 'due-date overdue-text' : 'due-date'}>{dateLabel(record.dueDate)}</span> },
    { key: 'returned', header: 'RETURNED', render: (record) => <span className="muted-text">{dateLabel(record.returnDate)}</span> },
    { key: 'status', header: 'STATUS', render: (record) => isOverdue(record)
      ? <span className="status-badge status-badge--overdue"><i />Overdue</span>
      : record.returnDate
        ? <span className="status-badge status-badge--returned"><i />Returned</span>
        : <span className="status-badge status-badge--active"><i />On loan</span> },
  ];

  if (loadingMembers) return <section className="panel"><LoadingState label="Finding library members…" /></section>;
  if (error && members.length === 0) return <section className="panel"><ErrorState message={error} onRetry={() => void loadMembers()} /></section>;

  return (
    <div className="history-layout">
      <aside className="panel member-picker">
        <div className="panel-heading"><div><div className="panel-title">Members</div><p>{members.length} registered readers</p></div><span className="panel-symbol"><CircleUserRound size={19} /></span></div>
        <label className="search-field member-search"><Search size={16} /><input value={memberSearch} onChange={(event) => setMemberSearch(event.target.value)} placeholder="Find a member…" aria-label="Search members" /></label>
        <div className="member-list">
          {filteredMembers.map((member) => {
            const id = member.id || member._id || '';
            return <button className={`member-option${memberId === id ? ' member-option--selected' : ''}`} key={id} onClick={() => setMemberId(id)}>
              <span className="member-avatar">{member.name.split(/\s+/).map((part) => part[0]).slice(0, 2).join('').toUpperCase()}</span>
              <span className="member-option-info"><strong>{member.name}</strong><small>{member.membershipId}</small></span>
              <span className={`member-status-dot${member.status === 'active' ? '' : ' member-status-dot--inactive'}`} />
            </button>;
          })}
          {filteredMembers.length === 0 && <div className="member-list-empty">No members found.</div>}
        </div>
      </aside>

      <div className="history-main">
        {error && !history && memberId ? <section className="panel"><ErrorState message={error} onRetry={() => setHistoryRetry((current) => current + 1)} /></section>
          : !memberId ? (
            <section className="panel history-placeholder">
              <span className="placeholder-icon"><History size={24} /></span><h2>Choose a member</h2><p>Select someone from the list to see their borrowing history.</p>
            </section>
          ) : loadingHistory ? <section className="panel"><LoadingState label="Loading borrowing history…" /></section>
            : error ? <section className="panel"><ErrorState message={error} onRetry={() => setHistoryRetry((current) => current + 1)} /></section>
              : history ? (
                <>
                  <section className="member-profile panel">
                    <div className="member-profile-avatar">{history.member.name.split(/\s+/).map((part) => part[0]).slice(0, 2).join('').toUpperCase()}</div>
                    <div className="member-profile-info"><span className="eyebrow">MEMBER PROFILE</span><h2>{history.member.name}</h2><p>{history.member.email} <span>·</span> {history.member.membershipId}</p></div>
                    <span className={`profile-status${history.member.status === 'active' ? '' : ' profile-status--inactive'}`}><i />{history.member.status}</span>
                  </section>
                  <div className="history-stats">
                    <div className="history-stat"><span className="history-stat-icon"><BookOpen size={17} /></span><span>Total loans</span><strong>{history.summary.totalBorrows}</strong></div>
                    <div className="history-stat"><span className="history-stat-icon history-stat-icon--green"><CalendarDays size={17} /></span><span>Currently out</span><strong>{history.summary.active}</strong></div>
                    <div className="history-stat"><span className="history-stat-icon history-stat-icon--rose"><History size={17} /></span><span>Overdue</span><strong className={history.summary.overdue > 0 ? 'overdue-text' : ''}>{history.summary.overdue}</strong></div>
                  </div>
                  <section className="panel">
                    <div className="panel-heading"><div><div className="panel-title">Borrowing history <span className="count-chip">{history.records.length}</span></div><p>All recorded checkouts for this member.</p></div><span className="panel-symbol"><History size={19} /></span></div>
                    <DataTable columns={columns} rows={history.records.map((record) => ({ ...record, id: record.id || record._id || `${record.issueDate}-${record.dueDate}` }))} emptyMessage="No books have been borrowed by this member yet." />
                  </section>
                </>
              ) : null}
      </div>
    </div>
  );
}
