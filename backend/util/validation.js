export function isValidText(value, minLength = 1) {
  return value && value.trim().length >= minLength;
}

export function isValidDate(value) {
  const date = new Date(value);
  return value && date !== 'Invalid Date';
}

export function isValidImageUrl(value) {
  return value && value.startsWith('http');
}

export function isValidEmail(value) {
  return value && value.includes('@');
}

