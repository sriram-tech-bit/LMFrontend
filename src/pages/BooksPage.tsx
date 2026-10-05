import { useEffect, useMemo, useState } from 'react';
import { BookMarked, BookOpen, Search, SlidersHorizontal } from 'lucide-react';
import { DataTable, type DataColumn } from '../components/DataTable';
import { ErrorState, LoadingState } from '../components/States';
import { api } from '../lib/api';
import type { Book } from '../types';

function getId(book: Book): string {
  return book.id || book._id || book.isbn;
}

export function BooksPage() {
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [genre, setGenre] = useState('');

  async function loadBooks() {
    setLoading(true);
    setError(null);
    try {
      const response = await api.listBooks();
      setBooks(response.data);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { void loadBooks(); }, []);

  const genres = useMemo(() => [...new Set(books.map((book) => book.genre))].sort((a, b) => a.localeCompare(b)), [books]);
  const filteredBooks = useMemo(() => books.filter((book) => {
    const matchesTitle = book.title.toLocaleLowerCase().includes(search.trim().toLocaleLowerCase());
    return matchesTitle && (!genre || book.genre === genre);
  }), [books, search, genre]);
  const availableTitles = books.filter((book) => book.availableCopies > 0).length;
  const availableCopies = books.reduce((sum, book) => sum + book.availableCopies, 0);

  const columns: DataColumn<Book>[] = [
    {
      key: 'book', header: 'BOOK', render: (book) => (
        <div className="book-cell">
          <span className="book-cover"><BookOpen size={18} /></span>
          <span className="book-details"><strong>{book.title}</strong><small>{book.author}</small></span>
        </div>
      ),
    },
    { key: 'isbn', header: 'ISBN', render: (book) => <span className="muted-text">{book.isbn}</span> },
    { key: 'genre', header: 'GENRE', render: (book) => <span className="genre-pill">{book.genre}</span> },
    { key: 'availability', header: 'AVAILABILITY', render: (book) => (
      <span className={`availability${book.availableCopies === 0 ? ' availability--empty' : ''}`}>
        <i />{book.availableCopies > 0 ? `${book.availableCopies} of ${book.totalCopies} copies` : 'All checked out'}
      </span>
    ) },
  ];

  return (
    <>
      <div className="stats-grid">
        <div className="stat-card"><span className="stat-icon stat-icon--mint"><BookOpen size={18} /></span><div><span className="stat-label">CATALOGUE TITLES</span><strong>{books.length}</strong><small>Unique titles in collection</small></div></div>
        <div className="stat-card"><span className="stat-icon stat-icon--blue"><BookMarked size={18} /></span><div><span className="stat-label">AVAILABLE TITLES</span><strong>{availableTitles}</strong><small>{availableCopies} copies ready to borrow</small></div></div>
        <div className="stat-card stat-card--note"><span className="stat-note-mark">✳</span><div><span className="stat-label">A LITTLE REMINDER</span><strong>Stories live on</strong><small>Every borrow starts a new chapter.</small></div></div>
      </div>
      <section className="panel">
        <div className="panel-heading">
          <div><div className="panel-title">The collection <span className="count-chip">{filteredBooks.length}</span></div><p>Find your next favourite read.</p></div>
          <span className="panel-symbol"><BookOpen size={19} /></span>
        </div>
        <div className="filters">
          <label className="search-field"><Search size={17} /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search by book title…" aria-label="Search by book title" /></label>
          <label className="select-field"><SlidersHorizontal size={16} /><select value={genre} onChange={(event) => setGenre(event.target.value)} aria-label="Filter by genre"><option value="">All genres</option>{genres.map((option) => <option key={option} value={option}>{option}</option>)}</select></label>
        </div>
        {loading ? <LoadingState label="Loading the collection…" /> : error ? <ErrorState message={error} onRetry={() => void loadBooks()} /> : (
          <DataTable columns={columns} rows={filteredBooks.map((book) => ({ ...book, id: getId(book) }))} emptyMessage="No books match those filters. Try another title or genre." />
        )}
        {!loading && !error && <div className="table-foot"><span>Showing <strong>{filteredBooks.length}</strong> of <strong>{books.length}</strong> titles</span><span><i className="tiny-live" /> Catalogue up to date</span></div>}
      </section>
    </>
  );
}
