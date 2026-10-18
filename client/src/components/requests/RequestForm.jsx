import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { UploadCloud, X, Send, Info } from 'lucide-react';
import { useApi } from '../../hooks/useApi';
import { api, message } from '../../services/api';
import DataState from '../ui/DataState';
import ErrorAlert from '../ui/ErrorAlert';
import { validateRequest } from '../../utils/validation';
export default function RequestForm() {
  const categories = useApi('/categories'),
    navigate = useNavigate();
  const [image, setImage] = useState(null),
    [preview, setPreview] = useState(''),
    [error, setError] = useState(''),
    [fields, setFields] = useState({}),
    [busy, setBusy] = useState(false);
  const [descriptionLength, setDescriptionLength] = useState(0);
  function validateField(event) {
    const input = event.target;
    if (!input.name || input.name === 'image') return;
    const values = Object.fromEntries(new FormData(input.form));
    const errors = validateRequest(values, categories.data);
    setFields((previous) => ({
      ...previous,
      [input.name]: errors[input.name],
    }));
  }
  useEffect(() => {
    if (!image) {
      setPreview('');
      return;
    }
    const url = URL.createObjectURL(image);
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [image]);
  function selectImage(event) {
    const file = event.target.files[0];
    setError('');
    if (
      file &&
      (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type) ||
        file.size > 5242880)
    ) {
      setError('Choose a JPEG, PNG or WebP image up to 5 MB.');
      event.target.value = '';
      setImage(null);
      return;
    }
    setImage(file || null);
    event.target.value = '';
  }
  async function submit(event) {
    event.preventDefault();
    if (busy) return;
    setError('');
    const form = new FormData(event.currentTarget);
    const errors = validateRequest(Object.fromEntries(form), categories.data);
    setFields(errors);
    if (Object.keys(errors).length) {
      setError('Please correct the highlighted fields before submitting.');
      event.currentTarget.elements.namedItem(Object.keys(errors)[0])?.focus();
      return;
    }
    setBusy(true);
    form.delete('image');
    if (image) form.append('image', image);
    try {
      const r = await api.post('/requests', form);
      navigate(`/requests/${r.data.data.id}`, {
        state: { success: 'Your request has been submitted successfully.' },
      });
    } catch (e) {
      setError(message(e));
      setFields(e.response?.data?.fields || {});
    } finally {
      setBusy(false);
    }
  }
  const field = (name, label, placeholder, max = 100) => (
    <div key={name}>
      <label className="form-label" htmlFor={name}>
        {label} <span aria-hidden="true">*</span>
      </label>
      <input
        required
        minLength={2}
        maxLength={max}
        id={name}
        name={name}
        placeholder={placeholder}
        className={`form-control ${fields[name] ? 'is-invalid' : ''}`}
        aria-invalid={!!fields[name]}
        aria-describedby={`${name}-error`}
      />
      <small className="text-danger" id={`${name}-error`}>
        {fields[name]}
      </small>
    </div>
  );
  return (
    <DataState loading={categories.loading} error={categories.error}>
      <form
        noValidate
        onSubmit={submit}
        onBlur={validateField}
        className="request-form"
      >
        <ErrorAlert message={error} />
        <section className="panel form-panel">
          <div className="form-section-title">
            <span>01</span>
            <div>
              <h2>Tell us about the issue</h2>
              <p>A little detail helps us understand what needs attention.</p>
            </div>
          </div>
          <label className="form-label" htmlFor="category_id">
            Service category *
          </label>
          <select
            required
            name="category_id"
            id="category_id"
            className={`form-select mb-2 ${fields.category_id ? 'is-invalid' : ''}`}
            aria-invalid={!!fields.category_id}
            aria-describedby="category-error"
          >
            <option value="">Select a service category</option>
            {categories.data?.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
          <small className="text-danger" id="category-error">
            {fields.category_id}
          </small>
          <label className="form-label mt-4" htmlFor="description">
            What’s happening? *
          </label>
          <textarea
            required
            minLength={20}
            maxLength={2000}
            rows={5}
            id="description"
            name="description"
            className={`form-control ${fields.description ? 'is-invalid' : ''}`}
            onChange={(event) => {
              setDescriptionLength(event.target.value.trim().length);
              if (fields.description) validateField(event);
            }}
            placeholder="Describe the issue, when it started, and how it affects your community…"
            aria-invalid={!!fields.description}
            aria-describedby="description-help"
          />
          <small
            id="description-help"
            className={fields.description ? 'text-danger' : 'text-secondary'}
          >
            {fields.description ||
              '20–2,000 characters. Please avoid sharing sensitive personal information.'}
          </small>
          <span className="description-counter" aria-live="polite">
            {descriptionLength.toLocaleString()} / 2,000 characters
          </span>
        </section>
        <section className="panel form-panel">
          <div className="form-section-title">
            <span>02</span>
            <div>
              <h2>Pinpoint the location</h2>
              <p>Help the service team find the right place.</p>
            </div>
          </div>
          <div className="row g-3">
            <div className="col-md-6">
              {field('county', 'County', 'e.g. Nairobi')}
            </div>
            <div className="col-md-6">
              {field('town_or_area', 'Town or area', 'e.g. Kilimani')}
            </div>
            <div className="col-12">
              {field(
                'location_details',
                'Street or nearby landmark',
                'e.g. Outside the community library, Argwings Kodhek Road',
                255,
              )}
            </div>
          </div>
        </section>
        <section className="panel form-panel">
          <div className="form-section-title">
            <span>03</span>
            <div>
              <h2>
                Add a photo <small>(optional)</small>
              </h2>
              <p>A picture can make the issue easier to understand.</p>
            </div>
          </div>
          {preview ? (
            <div className="image-preview">
              <img src={preview} alt="Selected issue preview" />
              <button
                type="button"
                className="btn btn-light"
                onClick={() => setImage(null)}
              >
                <X size={16} />
                Remove photo
              </button>
            </div>
          ) : (
            <label className="upload-zone" htmlFor="image">
              <UploadCloud size={30} />
              <strong>Choose a photo of the issue</strong>
              <span>JPEG, PNG or WebP · Maximum 5 MB</span>
              <input
                id="image"
                name="image"
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={selectImage}
                className="form-control mt-3"
              />
            </label>
          )}
        </section>
        <div className="submit-bar">
          <span>
            <Info size={16} />
            Fields marked * are required.
          </span>
          <button
            className="btn btn-primary"
            disabled={busy || !categories.data?.length}
          >
            <Send size={17} />
            {busy ? 'Submitting…' : 'Submit request'}
          </button>
        </div>
      </form>
    </DataState>
  );
}
