export default function PageHeading({
  title,
  description,
  breadcrumb,
  children,
}) {
  return (
    <>
      {breadcrumb && (
        <div className="breadcrumb-label">
          WORKSPACE <span>/</span> {breadcrumb}
        </div>
      )}
      <div className="page-heading">
        <div>
          <h1>{title}</h1>
          {description && <p>{description}</p>}
        </div>
        {children}
      </div>
    </>
  );
}
