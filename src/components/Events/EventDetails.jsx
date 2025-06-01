import { Link, Outlet, useNavigate, useParams } from 'react-router-dom';
import { useQuery, useMutation } from "@tanstack/react-query";
import { useState } from 'react';

import Header from '../Header.jsx';
import { deleteEvent, fetchEvent, queryClient } from '../util/http.js';
import ErrorBlock from '../UI/ErrorBlock.jsx';
import Modal from '../UI/Modal.jsx';
import Kanban from '../Kanban/Kanban.jsx';
import ProductsList from '../Products/ProductsList.jsx';

export default function EventDetails() {
  const [isDeleting, setIsDeleting] = useState(false);

  const param = useParams();
  const navigate = useNavigate();

  const { data, isPending, isError, error } = useQuery({
    queryKey: ["events", param.id],
    queryFn: ({ signal }) => fetchEvent({ signal, id: param.id }),
    placeholderData: () => queryClient.getQueryData(["events", param.id])
  });

  const {
    mutate,
    isPending: isPendingDeletion,
    isError: isErrorDeleting,
    error: deleteError,
  } = useMutation({
    mutationFn: deleteEvent,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["events"],
        refetchType: "none"
      });
      navigate("/events");
    }
  });

  function handleStartDelete() {
    setIsDeleting(true);
  }
  function handleStopDelete() {
    setIsDeleting(false);
  }

  function handleDelete() {
    mutate({ id: param.id });
  }

  let content;

  if (isPending) {
    content = (
      <div id="event-details-content" className="center">
        <p>Buscando os dados...</p>
      </div>
    );
  }

  if (isError) {
    content = (
      <div id="event-details-content" className='center'>
        <ErrorBlock
          title="Failed to load event"
          message={error.info?.message || "failed to fetch event data, please try again later"}
        />
      </div>
    );
  }

  const formattedDate = data?.date
    ? new Date(data.date).toLocaleDateString('pt-BR', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    })
    : "";

  const statusClass = `event-item-status ${data?.status === "A fazer"
      ? "todo" 
      : data?.status === "Pendente"
        ? "pending"
        : data?.status === "Pronto"
          ? "ready"
          : data?.status === "Entregue"
            ? "delivered"
            : data?.status === "Cancelado"
              ? "cancelled"
              : ""
    }`;

  // Extrai produtos e descrição
  const products = data?.products ? data.products.split('\n').filter(p => p.trim()) : [];
  const description = data?.description || '';

  if (data) {
    content = (
      <>
        <header>
          <h1>{data.title}</h1>
          <nav>
            <button onClick={handleStartDelete}>Deletar</button>
            <Link to="edit">Editar</Link>
          </nav>
        </header>
        <div id="event-details-content">
          <div id="event-details-info">
            <div>
              <p id="event-details-location">{data.address}</p>
              <time>{formattedDate} - {data.time}</time>
            </div>

            {/* Seção de produtos */}
            <div id="event-details-products" style={{ margin: '1.5rem 0' }}>
              <h3 style={{ 
                fontSize: '1.3rem', 
                color: '#2f82ff', 
                marginBottom: '0.5rem' 
              }}>
                Produtos:
              </h3>
              {products.length > 0 ? (
                <ProductsList products={products} />
              ) : (
                <p style={{ color: '#666', fontStyle: 'italic' }}>
                  Nenhum produto especificado
                </p>
              )}
            </div>

            {/* Seção de observações/descrição */}
            {description && (
              <div id="event-details-description" style={{ margin: '1.5rem 0' }}>
                <h3 style={{ 
                  fontSize: '1.3rem', 
                  color: '#2f82ff', 
                  marginBottom: '0.5rem' 
                }}>
                  Observações:
                </h3>
                <div style={{
                  backgroundColor: '#f8f9fa',
                  padding: '1rem',
                  borderRadius: '8px',
                  borderLeft: '4px solid #28a745',
                  whiteSpace: 'pre-line'
                }}>
                  {description}
                </div>
              </div>
            )}
            
            <p className={statusClass}>{data.status}</p>
          </div>
        </div>
        <Kanban />
      </>
    );
  }

  return (
    <>
      {isDeleting && (
        <Modal onClose={handleStopDelete}>
          <h2>Tem certeza?</h2>
          <p>Você realmente quer deletar esse pedido? Essa ação não pode ser desfeita</p>
          <div className='form-actions'>
            {isPendingDeletion && <p>Deletando....</p>}
            {!isPendingDeletion && (
              <>
                <button onClick={handleStopDelete} className='button-text'>Cancel</button>
                <button onClick={handleDelete} className='button'>Delete</button>
              </>
            )}
          </div>
          {isErrorDeleting && <ErrorBlock title="Falha ao deletar" message={deleteError.info?.message || "Algo de errado acorreu"} />}
        </Modal>
      )}
      <Outlet />
      <Header>
        <Link to="/events" className="nav-item">
          Todos os Pedidos
        </Link>
      </Header>
      <article id="event-details">
        {content}
      </article>
    </>
  );
}