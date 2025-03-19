import pkg from 'jsonwebtoken';
const { sign, verify } = pkg;
import { compare } from 'bcryptjs';
import { NotAuthError } from './errors.js';

const KEY = 'supersecret';

export function createJSONToken(email) {
  return sign({ email }, KEY, { expiresIn: '1h' });
}

export function validateJSONToken(token) {
  return verify(token, KEY);
}

export function isValidPassword(password, storedPassword) {
  return compare(password, storedPassword);
}

export function checkAuth(req, res, next) {
  if (req.method === 'OPTIONS') {
    return next();
  }
  if (!req.headers.authorization) {
    console.log('NOT AUTH. AUTH HEADER MISSING.');
    return next(new NotAuthError('Not authenticated.'));
  }
  const authFragments = req.headers.authorization.split(' ');

  if (authFragments.length !== 2) {
    console.log('NOT AUTH. AUTH HEADER INVALID.');
    return next(new NotAuthError('Not authenticated.'));
  }
  const authToken = authFragments[1];
  try {
    const validatedToken = validateJSONToken(authToken);
    req.token = validatedToken;
  } catch (error) {
    console.log('NOT AUTH. TOKEN INVALID.');
    return next(new NotAuthError('Not authenticated.'));
  }
  next();
}


