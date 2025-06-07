import fs from 'node:fs/promises';
import { hash } from 'bcryptjs';

const USERS_FILE = './users.json';

export async function readData() {
  try {
    const data = await fs.readFile(USERS_FILE, 'utf8');
    const parsedData = JSON.parse(data);
    
    // Se o arquivo tem a estrutura {"users": [...]}
    if (parsedData.users && Array.isArray(parsedData.users)) {
      return parsedData.users;
    }
    
    // Se o arquivo é um array direto [...]
    if (Array.isArray(parsedData)) {
      return parsedData;
    }
    
    // Se não é nem um nem outro, retorna array vazio
    return [];
  } catch (error) {
    console.log('Erro ao ler users.json, criando novo arquivo...');
    // Se o arquivo não existe, cria um novo
    const initialData = { users: [] };
    await fs.writeFile(USERS_FILE, JSON.stringify(initialData, null, 2));
    return [];
  }
}

export async function writeData(users) {
  // Sempre salva na estrutura {"users": [...]}
  const dataToWrite = {
    users: users
  };
  await fs.writeFile(USERS_FILE, JSON.stringify(dataToWrite, null, 2));
}

export async function addUser(userData) {
  const users = await readData();
  
  // Hash da senha antes de salvar
  const hashedPassword = await hash(userData.password, 12);
  
  const newUser = {
    id: Date.now().toString(), // ID simples baseado em timestamp
    email: userData.email,
    password: hashedPassword
  };
  
  users.push(newUser);
  await writeData(users);
  
  // Retorna o usuário sem a senha
  const { password, ...userWithoutPassword } = newUser;
  return userWithoutPassword;
}

export async function getUserByEmail(email) {
  const users = await readData();
  const user = users.find(user => user.email === email);
  
  if (!user) {
    const error = new Error('User not found');
    error.code = 404;
    throw error;
  }
  
  return user;
}

export async function getAllUsers() {
  return await readData();
}