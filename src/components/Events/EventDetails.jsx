import { Link, Outlet, useNavigate, useParams } from 'react-router-dom';
import { useQuery, useMutation } from "@tanstack/react-query";
import { useState } from 'react';

import Header from '../Header.jsx';
import { deleteEvent, fetchEvent, queryClient } from '../util/http.js';
import ErrorBlock from '../UI/ErrorBlock.jsx';
import Modal from '../UI/Modal.jsx';
import Kanban from '../Kanban.jsx';

export default function EventDetails() {
  const [isDeleting, setIsDeleting] = useState(false);

  const param = useParams();
  const navigate = useNavigate();

  const { data, isPending, isError, error } = useQuery({
    queryKey: ["events", param.id],
    queryFn: ({ signal }) => fetchEvent({ signal, id: param.id })
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
        <p>Fetching event data...</p>
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
    : "Data não disponível";

  const statusClass = `event-item-status ${
    data?.status === "Pendente"
      ? "pending"
      : data?.status === "Pronto"
        ? "ready"
        : data?.status === "Entregue"
          ? "delivered"
          : data?.status === "Cancelado"
            ? "cancelled"
            : ""
    }`;

  if (data) {
    content = (
      <>
        <header>
          <h1>{data.title}</h1>
          <nav>
            <button onClick={handleStartDelete}>Delete</button>
            <Link to="edit">Edit</Link>
          </nav>
        </header>
        <div id="event-details-content">
          <div id="event-details-info">
            <div>
              <p id="event-details-location">{data.address}</p>
              <time>{formattedDate} - {data.time}</time>
            </div>
            <p id="event-details-description">{data.description}</p>
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
          <h2>Are you sure?</h2>
          <p> do you really qant to delelte? This action cannot be undone</p>
          <div className='form-actions'>
            {isPendingDeletion && <p>Deleting, please wait</p>}
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
          View all Events
        </Link>
      </Header>
      <article id="event-details">
        {content}
      </article>
    </>
  );
}
