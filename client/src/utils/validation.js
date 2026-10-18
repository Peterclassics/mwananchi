export function validatePersonalDetails(values) {
  const errors = {};
  const name = String(values.full_name || '').trim();
  const phone = String(values.phone || '').trim();
  if (name.length < 2 || name.length > 100)
    errors.full_name = 'Enter a full name between 2 and 100 characters.';
  const digits = phone.replace(/\D/g, '');
  if (
    phone &&
    (!/^\+?[\d\s()-]+$/.test(phone) ||
      phone.length > 25 ||
      digits.length < 7 ||
      digits.length > 15)
  )
    errors.phone = 'Enter a valid phone number with 7–15 digits.';
  return errors;
}
export function validatePasswordChange(values) {
  const errors = {};
  if (!values.current_password)
    errors.current_password = 'Enter your current password.';
  if (!values.new_password || values.new_password.length < 8)
    errors.new_password = 'Use at least 8 characters.';
  else if (new TextEncoder().encode(values.new_password).length > 72)
    errors.new_password = 'Password must fit within 72 UTF-8 bytes.';
  else if (values.new_password === values.current_password)
    errors.new_password = 'Choose a different password from your current one.';
  if (values.new_password !== values.confirm_password)
    errors.confirm_password = 'Passwords do not match.';
  return errors;
}
export function validateRequest(values, categories) {
  const errors = {};
  if (
    !categories?.some(
      (category) => String(category.id) === String(values.category_id),
    )
  )
    errors.category_id = 'Choose an available service category.';
  for (const [key, label, max] of [
    ['county', 'county', 100],
    ['town_or_area', 'town or area', 100],
    ['location_details', 'street or nearby landmark', 255],
  ]) {
    const value = String(values[key] || '').trim();
    if (value.length < 2)
      errors[key] = `Enter a ${label} with at least 2 characters.`;
    else if (value.length > max)
      errors[key] = `Use ${max} characters or fewer.`;
  }
  const description = String(values.description || '').trim();
  if (description.length < 20)
    errors.description = 'Describe the issue in at least 20 characters.';
  else if (description.length > 2000)
    errors.description = 'Use 2,000 characters or fewer.';
  return errors;
}
