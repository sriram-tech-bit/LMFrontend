import { useState, type FormEvent } from 'react';
import { ArrowRight, BookOpen, LibraryBig, LockKeyhole, Mail, UserRound } from 'lucide-react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { ApiError, api } from '../lib/api';

export function RegisterPage() {
  const { token, user } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (token && user?.role !== 'admin') return <Navigate to="/books" replace />;
  const adminAddingAccount = token !== null && user?.role === 'admin';

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await api.registerLibrarian({ name, email, password });
      if (adminAddingAccount) {
        navigate('/books', { replace: true });
      } else {
        navigate('/login', { replace: true, state: { registered: true } });
      }
    } catch (cause) {
      if (cause instanceof ApiError && cause.status === 401) {
        if (!adminAddingAccount) {
          navigate('/login', { replace: true, state: { registrationClosed: true } });
          return;
        }
        setError('Your admin session has expired. Sign in again to add a librarian.');
      } else if (cause instanceof ApiError && cause.status === 403) {
        setError('Only an admin can add another librarian. Sign in with an admin account to continue.');
      } else {
        setError(cause instanceof ApiError ? cause.message : 'Account registration failed. Please try again.');
      }
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="login-screen">
      <section className="login-art">
        <div className="login-brand"><span className="brand-mark"><LibraryBig size={22} /></span><span>Shelf<span className="brand-light">Life</span></span></div>
        <div className="login-art-content">
          <span className="login-kicker"><span /> A LIBRARY STARTS WITH A STORY</span>
          <h1>Make room<br />for <em>every story.</em></h1>
          <p>Create a librarian account to bring your ShelfLife collection and community together.</p>
          <div className="login-art-books"><span className="art-book art-book--one" /><span className="art-book art-book--two" /><span className="art-book art-book--three" /><span className="art-book art-book--four" /><span className="art-book art-book--five" /><div className="art-sparkle">✳</div></div>
        </div>
        <span className="login-copyright">© 2025 ShelfLife Library</span>
      </section>
      <section className="login-form-side">
        <div className="login-form-wrap">
          <div className="login-mobile-brand"><span className="brand-mark"><LibraryBig size={22} /></span>ShelfLife</div>
          <div className="login-welcome"><span className="welcome-icon"><BookOpen size={20} /></span><div className="eyebrow">LIBRARIAN ACCESS</div><h2>{adminAddingAccount ? 'Add a librarian' : 'Create account'}</h2><p>{adminAddingAccount ? 'Create an account for another library administrator.' : 'The first librarian can register here. After that, an admin must sign in to add accounts.'}</p></div>
          <form className="login-form" onSubmit={submit}>
            <label className="form-label" htmlFor="name">FULL NAME</label>
            <div className="login-input"><UserRound size={17} /><input id="name" type="text" autoComplete="name" value={name} onChange={(event) => setName(event.target.value)} placeholder="Your name" minLength={2} maxLength={120} required /></div>
            <label className="form-label form-label--spaced" htmlFor="register-email">EMAIL ADDRESS</label>
            <div className="login-input"><Mail size={17} /><input id="register-email" type="email" autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@yourlibrary.org" required /></div>
            <label className="form-label form-label--spaced" htmlFor="register-password">PASSWORD</label>
            <div className="login-input"><LockKeyhole size={17} /><input id="register-password" type="password" autoComplete="new-password" value={password} onChange={(event) => setPassword(event.target.value)} placeholder="At least 8 characters" minLength={8} maxLength={128} required /></div>
            <span className="register-hint">Use at least 8 characters, including a letter and a number.</span>
            {error && <div className="login-error" role="alert">{error}</div>}
            <button className="button button-primary login-submit" type="submit" disabled={submitting}>{submitting ? 'Creating account…' : <>{adminAddingAccount ? 'Add librarian' : 'Create librarian account'} <ArrowRight size={17} /></>}</button>
          </form>
          <p className="auth-switch">{adminAddingAccount ? <>Signed in as admin. <Link to="/books">Return to library</Link></> : <>Already have an account? <Link to="/login">Sign in</Link></>}</p>
          <p className="login-footnote"><LockKeyhole size={14} /> Your account is protected with secure authentication.</p>
        </div>
      </section>
    </main>
  );
}
