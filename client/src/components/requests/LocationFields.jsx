import locations from '../../data/kenya-locations.json';

export default function LocationFields({
  county,
  town,
  onCountyChange,
  onTownChange,
  errors,
}) {
  const towns =
    locations.find((location) => location.county === county)?.towns || [];
  return (
    <>
      <div className="col-md-6">
        <label className="form-label" htmlFor="county">
          County *
        </label>
        <select
          required
          id="county"
          name="county"
          value={county}
          onChange={(event) => onCountyChange(event.target.value)}
          className={`form-select ${errors.county ? 'is-invalid' : ''}`}
          aria-invalid={!!errors.county}
          aria-describedby="county-error"
        >
          <option value="">Select a county</option>
          {locations.map((location) => (
            <option key={location.county} value={location.county}>
              {location.county}
            </option>
          ))}
        </select>
        <small className="text-danger" id="county-error">
          {errors.county}
        </small>
      </div>
      <div className="col-md-6">
        <label className="form-label" htmlFor="town_or_area">
          Town or area *
        </label>
        <select
          required
          id="town_or_area"
          name="town_or_area"
          value={town}
          disabled={!county}
          onChange={(event) => onTownChange(event.target.value)}
          className={`form-select ${errors.town_or_area ? 'is-invalid' : ''}`}
          aria-invalid={!!errors.town_or_area}
          aria-describedby="town-help town_or_area-error"
        >
          <option value="">
            {county ? 'Select a town or area' : 'Select a county first'}
          </option>
          {towns.toSorted().map((name) => (
            <option key={name} value={name}>
              {name}
            </option>
          ))}
        </select>
        <small id="town-help" className="text-secondary d-block">
          Choose the nearest listed town or area, then give the exact location
          below.
        </small>
        <small className="text-danger" id="town_or_area-error">
          {errors.town_or_area}
        </small>
      </div>
    </>
  );
}
