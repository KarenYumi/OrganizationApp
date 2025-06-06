import fs from 'node:fs/promises';

export async function readData() {
  try {
    const data = await fs.readFile('users.json', 'utf8');
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
    await fs.writeFile('users.json', JSON.stringify(initialData, null, 2));
    return [];
  }
}

export async function writeData(users) {
  // Sempre salva na estrutura {"users": [...]}
  const dataToWrite = {
    users: users
  };
  await fs.writeFile('users.json', JSON.stringify(dataToWrite, null, 2));
}