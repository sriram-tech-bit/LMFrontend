import { useState, type FormEvent } from 'react';
import { ArrowRight, BookOpen, LibraryBig, LockKeyhole, Mail } from 'lucide-react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { ApiError } from '../lib/api';

export function LoginPage() {
  const { token, login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const loginState = location.state as { registered?: boolean; registrationClosed?: boolean; from?: { pathname?: string } } | null;
  const registered = loginState?.registered;
  const registrationClosed = loginState?.registrationClosed;
  const destination = loginState?.from?.pathname ?? '/books';

  if (token) return <Navigate to={destination} replace />;

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await login(email, password);
      navigate(destination, { replace: true });
    } catch (cause) {
      setError(cause instanceof ApiError ? cause.message : 'Sign in failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="login-screen">
      <section className="login-art">
        <div className="login-brand"><span className="brand-mark"><LibraryBig size={22} /></span><span>Shelf<span className="brand-light">Life</span></span></div>
        <div className="login-art-content">
          <span className="login-kicker"><span /> YOUR LIBRARY, IN GOOD HANDS</span>
          <h1>Where every<br />story finds <em>its reader.</em></h1>
          <p>A quieter, more thoughtful way to care for your collection and the people who love it.</p>
          <div className="login-art-books"><span className="art-book art-book--one" /><span className="art-book art-book--two" /><span className="art-book art-book--three" /><span className="art-book art-book--four" /><span className="art-book art-book--five" /><div className="art-sparkle">✳</div></div>
        </div>
        <span className="login-copyright">© 2025 ShelfLife Library</span>
      </section>
      <section className="login-form-side">
        <div className="login-form-wrap">
          <div className="login-mobile-brand"><span className="brand-mark"><LibraryBig size={22} /></span>ShelfLife</div>
          <div className="login-welcome"><span className="welcome-icon"><BookOpen size={20} /></span><div className="eyebrow">LIBRARIAN ACCESS</div><h2>Welcome back</h2><p>Sign in to keep your library in motion.</p></div>
          {registered && <div className="register-success" role="status">Librarian account created. Sign in with your new credentials.</div>}
          {registrationClosed && <div className="login-error" role="status">A librarian account already exists. Please sign in. Only a signed-in admin can add additional librarians.</div>}
          <form className="login-form" onSubmit={submit}>
            <label className="form-label" htmlFor="email">EMAIL ADDRESS</label>
            <div className="login-input"><Mail size={17} /><input id="email" type="email" autoComplete="username" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@yourlibrary.org" required /></div>
            <label className="form-label form-label--spaced" htmlFor="password">PASSWORD</label>
            <div className="login-input"><LockKeyhole size={17} /><input id="password" type="password" autoComplete="current-password" value={password} onChange={(event) => setPassword(event.target.value)} placeholder="Enter your password" required /></div>
            {error && <div className="login-error" role="alert">{error}</div>}
            <button className="button button-primary login-submit" type="submit" disabled={submitting}>{submitting ? 'Signing in…' : <>Sign in <ArrowRight size={17} /></>}</button>
          </form>
          <div className="first-account">
            <div><strong>First time setting up ShelfLife?</strong><span>Create your library’s first librarian account.</span></div>
            <Link to="/register">Create account <ArrowRight size={15} /></Link>
          </div>
          <p className="login-footnote"><LockKeyhole size={14} /> Your account is protected with secure authentication.</p>
        </div>
      </section>
    </main>
  );
}
