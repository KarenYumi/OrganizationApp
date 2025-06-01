import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient();

export async function fetchEvents({ signal, searchTerm, max }) {
  let url = 'https://organizationapp-backend.onrender.com/events';

  if(searchTerm && max){
    url += "?search=" + searchTerm + "&max=" + max;
  } else if (searchTerm){
    url += "?search=" + searchTerm;
  } else if (max){
    url += "?max=" + max;
  }

  const response = await fetch(url, { signal: signal });

  if (!response.ok) {
    const error = new Error('An error occurred while fetching the events');
    error.code = response.status;
    error.info = await response.json();
    throw error;
  }

  const { events } = await response.json();

  return events;
}


export async function createNewEvent({ event }) {
  console.log("Enviando evento para o backend:", event); 

  try {
    const response = await fetch("https://organizationapp-backend.onrender.com/events", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ event }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Erro HTTP: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Erro ao criar evento:", error);
    throw new Error("Erro ao criar evento: " + error.message);
  }
}


export async function fetchEvent({ id, signal }) {
  const response = await fetch(`https://organizationapp-backend.onrender.com/events/${id}`, { signal });

  if (!response.ok) {
    const error = new Error('An error occurred while fetching the event');
    error.code = response.status;
    error.info = await response.json();
    throw error;
  }

  const { event } = await response.json();

  return event;
}


export async function deleteEvent({ id }) {
  const response = await fetch(`https://organizationapp-backend.onrender.com/events/${id}`, {
    method: 'DELETE',
  });

  if (!response.ok) {
    const error = new Error('An error occurred while deleting the event');
    error.code = response.status;
    error.info = await response.json();
    throw error;
  }

  return response.json();
}

export async function updateEvent({ id, event }) {
  const response = await fetch(`https://organizationapp-backend.onrender.com/events/${id}`, {
    method: 'PUT',
    body: JSON.stringify( event ), //perguntar se pd haver algum erro nesta parte, estava assim {event}, ai tirei pq ele tava duplicando event ai n batia com o back
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const error = new Error('An error occurred while updating the event');
    error.code = response.status;
    error.info = await response.json();
    throw error;
  }

  return response.json();
}

// FUNÇÕES DE PRODUTOS CORRIGIDAS
export async function fetchProducts({ signal }) {
  const response = await fetch("https://organizationapp-backend.onrender.com/products", { signal });

  if (!response.ok) {
    const error = new Error("Erro ao buscar produtos");
    error.code = response.status;
    error.info = await response.json();
    throw error;
  }

  const { products } = await response.json();
  return products;
}

export async function createNewProduct(productData) {
  // CORRIGIDO: Removido o 'h' extra
  const response = await fetch("https://organizationapp-backend.onrender.com/products", {
    method: "POST",
    body: JSON.stringify(productData),
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    const error = new Error("Erro ao criar produto");
    error.code = response.status;
    error.info = await response.json();
    throw error;
  }

  const { product } = await response.json();
  return product;
}