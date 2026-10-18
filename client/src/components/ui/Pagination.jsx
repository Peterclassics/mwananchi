export default function Pagination({ meta, onPage }) {
  if (!meta || !meta.total) return null;
  return (
    <div className="pagination-bar">
      <span>
        {meta.total} requests · Page {meta.page} of {meta.total_pages}
      </span>
      <div>
        <button
          className="btn btn-sm btn-outline-secondary"
          disabled={meta.page === 1}
          onClick={() => onPage(meta.page - 1)}
        >
          Previous
        </button>
        <button
          className="btn btn-sm btn-outline-secondary ms-2"
          disabled={meta.page >= meta.total_pages}
          onClick={() => onPage(meta.page + 1)}
        >
          Next
        </button>
      </div>
    </div>
  );
}
