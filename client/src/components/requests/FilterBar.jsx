export default function FilterBar({ filters, setFilters, categories, admin }) {
  function change(key, value) {
    setFilters({ ...filters, [key]: value, page: 1 });
  }
  return (
    <form className="filter-bar" onSubmit={(e) => e.preventDefault()}>
      <div className="search-field">
        <label htmlFor="search">Search requests</label>
        <input
          id="search"
          type="search"
          className="form-control"
          placeholder="Reference, description or location…"
          value={filters.search || ''}
          onChange={(e) => change('search', e.target.value)}
        />
      </div>
      <div>
        <label htmlFor="status">Status</label>
        <select
          id="status"
          className="form-select"
          value={filters.status || ''}
          onChange={(e) => change('status', e.target.value)}
        >
          <option value="">All statuses</option>
          <option value="pending">Pending</option>
          <option value="in_progress">In Progress</option>
          <option value="resolved">Resolved</option>
        </select>
      </div>
      <div>
        <label htmlFor="category">Category</label>
        <select
          id="category"
          className="form-select"
          value={filters.category || ''}
          onChange={(e) => change('category', e.target.value)}
        >
          <option value="">All categories</option>
          {categories?.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label htmlFor="sort">Sort by date</label>
        <select
          id="sort"
          className="form-select"
          value={filters.sort || 'newest'}
          onChange={(e) => change('sort', e.target.value)}
        >
          <option value="newest">Newest first</option>
          <option value="oldest">Oldest first</option>
        </select>
      </div>
      {admin && (
        <>
          <div>
            <label htmlFor="from">From (UTC)</label>
            <input
              id="from"
              className="form-control"
              type="date"
              value={filters.from || ''}
              onChange={(e) => change('from', e.target.value)}
            />
          </div>
          <div>
            <label htmlFor="to">To (UTC)</label>
            <input
              id="to"
              className="form-control"
              type="date"
              value={filters.to || ''}
              onChange={(e) => change('to', e.target.value)}
            />
          </div>
        </>
      )}
      <button
        type="button"
        className="btn btn-light align-self-end"
        onClick={() => setFilters({ page: 1 })}
      >
        Reset
      </button>
    </form>
  );
}
