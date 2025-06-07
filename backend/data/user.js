import { hash } from 'bcryptjs';
import { v4 as generateId } from 'uuid';
import { NotFoundError } from '../util/errors.js';
import { readData, writeData } from './util.js';

// Função para adicionar um novo usuário
export async function addUser(data) {
  const storedData = await readData();
  const userId = generateId();
  const hashedPw = await hash(data.password, 12);
  if (!storedData.users) {
    storedData.users = [];
  }
  storedData.users.push({ 
    id: userId, 
    email: data.email, 
    password: hashedPw 
  });
  await writeData(storedData);
  return { id: userId, email: data.email };
}

// Função para buscar um usuário pelo e-mail
export async function getUserByEmail(email) {
  const storedData = await readData();
  if (!storedData.users || storedData.users.length === 0) {
    throw new NotFoundError('No users found.');
  }
  const user = storedData.users.find((u) => u.email === email);
  if (!user) {
    throw new NotFoundError('User not found for email: ' + email);
  }
  return user;
}