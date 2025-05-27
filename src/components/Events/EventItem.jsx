import { Link } from 'react-router-dom';

export default function EventItem({ event }) {
  const formattedDate = new Date(event.date).toLocaleDateString('pt-BR', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

  const statusClass = `event-item-status ${
    event.status === "A fazer"
      ? "todo"
      : event.status === "Pendente"
        ? "pending"
        : event.status === "Pronto"
          ? "ready"
          : event.status === "Entregue"
            ? "delivered"
            : event.status === "Cancelado"
              ? "cancelled"
              : ""
    }`;

  return (
    <article className="event-item">
      <div className="event-item-content">
        <div>
          <h2>{event.title}</h2>
          <p className="event-item-date">{formattedDate}</p>
          <p className="event-item-description">{event.description}</p>
        </div>
        <div>
          <p className={statusClass}>{event.status}</p>
          <Link to={`/events/${event.id}`} className="button-item">
            Detalhes
          </Link>
        </div>
      </div>
    </article>
  );
}
