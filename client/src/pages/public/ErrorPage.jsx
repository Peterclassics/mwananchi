import { Link } from 'react-router-dom';
export default function ErrorPage({ denied = false }) {
  return (
    <main className="standalone-message">
      <h1>{denied ? 'Access denied' : 'Page not found'}</h1>
      <p>
        {denied
          ? 'Your account does not have permission to open this page.'
          : 'This page may have moved or the address may be incorrect.'}
      </p>
      <Link className="btn btn-primary" to="/">
        Return home
      </Link>
    </main>
  );
}
