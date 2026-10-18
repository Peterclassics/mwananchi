import { Link } from 'react-router-dom';
import {
  ArrowRight,
  MapPin,
  ClipboardList,
  CheckCircle2,
  Lightbulb,
  Droplets,
  Trash2,
  Route,
  Activity,
  ArrowUpRight,
} from 'lucide-react';
import Brand from '../../components/branding/Brand';
import { useAuth } from '../../context/AuthContext';
export default function LandingPage() {
  const { user } = useAuth();
  return (
    <div className="landing">
      <header>
        <Brand />
        <nav>
          <a href="#how-it-works">How it works</a>
          <Link to="/login">Sign in</Link>
          <Link
            className="btn btn-primary"
            to={
              user
                ? user.role === 'admin'
                  ? '/admin'
                  : '/dashboard'
                : '/register'
            }
          >
            {user ? 'Open dashboard' : 'Get started'}
            <ArrowUpRight size={16} />
          </Link>
        </nav>
      </header>
      <main id="main-content">
        <section className="landing-hero">
          <div>
            <span className="eyebrow">
              <span className="demo-dot" /> A BETTER COMMUNITY STARTS HERE
            </span>
            <h1>
              Small reports.
              <br />
              <span>Real change.</span>
            </h1>
            <p>
              A streetlight out. A leaking pipe. A road that needs repair.
              <br />
              Make your voice heard and follow every step toward a solution.
            </p>
            <div className="d-flex gap-3 flex-wrap">
              <Link
                className="btn btn-primary btn-lg"
                to={user ? '/submit' : '/register'}
              >
                Report an issue <ArrowRight size={19} />
              </Link>
              <a
                className="btn btn-outline-secondary btn-lg"
                href="#how-it-works"
              >
                See how it works
              </a>
            </div>
            <div className="hero-trust">
              <Shield />
              Simple to report. Easy to track. Built for everyone.
            </div>
          </div>
          <div
            className="community-visual"
            aria-label="Illustration of a connected community"
          >
            <div className="visual-grid" />
            <div className="visual-title">
              <span className="visual-live" />
              CONNECTED COMMUNITIES
            </div>
            <div className="city">
              <div className="building b1" />
              <div className="building b2" />
              <div className="building b3" />
              <div className="building b4" />
              <div className="tree t1" />
              <div className="tree t2" />
              <div className="city-road" />
            </div>
            <div className="floating-report">
              <span>
                <Lightbulb size={20} />
              </span>
              <div>
                <strong>A brighter way home</strong>
                <small>Streetlight repair · Resolved</small>
              </div>
              <CheckCircle2 size={19} />
            </div>
            <div className="visual-bottom">
              <MapPin size={16} />
              Local issues. Shared progress.
            </div>
          </div>
        </section>
        <section className="services-strip">
          <span>HERE FOR THE EVERYDAY ESSENTIALS</span>
          {[
            [Lightbulb, 'Street lighting'],
            [Droplets, 'Water supply'],
            [Trash2, 'Waste collection'],
            [Route, 'Roads & drainage'],
          ].map(([Icon, label]) => (
            <div key={label}>
              <Icon size={21} />
              {label}
            </div>
          ))}
        </section>
        <section className="how-section" id="how-it-works">
          <span className="eyebrow">FROM CONCERN TO CONFIDENCE</span>
          <h2>A clear path to better services.</h2>
          <div className="steps">
            {[
              [
                ClipboardList,
                '01',
                'Tell us what’s happening',
                'Choose a category, add your location and describe the issue. A photo helps tell the story.',
              ],
              [
                Activity,
                '02',
                'Stay in the loop',
                'Get a reference number and follow updates from Pending to In Progress.',
              ],
              [
                CheckCircle2,
                '03',
                'See it through',
                'Read the resolution and keep a complete history of your request.',
              ],
            ].map(([Icon, n, title, body]) => (
              <article key={n}>
                <div>
                  <Icon size={25} />
                  <span>{n}</span>
                </div>
                <h3>{title}</h3>
                <p>{body}</p>
              </article>
            ))}
          </div>
        </section>
      </main>
      <footer>
        <Brand />
        <p>
          Built for learning. Inspired by better service delivery.
          <br />
          Mwananchi is a demonstration project, not an official government
          platform.
        </p>
        <Link to="/register">
          Make your first report <ArrowRight size={16} />
        </Link>
      </footer>
    </div>
  );
}
function Shield() {
  return <CheckCircle2 size={17} />;
}
