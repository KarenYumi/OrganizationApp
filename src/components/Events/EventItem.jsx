import { Link } from 'react-router-dom';
import ProductsList from '../Products/ProductsList.jsx';

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

  // Extrai produtos e descrição
  const products = event.products ? event.products.split('\n').filter(p => p.trim()) : [];
  const description = event.description || '';

  // Para preview resumido
  const productsPreview = products.length > 0 ? products.join(', ') : '';
  const shortPreview = productsPreview.length > 40 
    ? productsPreview.substring(0, 40) + '...' 
    : productsPreview;

  return (
    <article className="event-item">
      <div className="event-item-content">
        <div>
          <h2>{event.title}</h2>
          <p className="event-item-date">{formattedDate}</p>
          
          {/* Produtos */}
          {products.length > 0 && (
            <div className="event-item-products">
              {products.length <= 0 ? (
                <ProductsList products={products} />
              ) : (
                <p className="event-item-description">
                  <strong>Produtos:</strong> {shortPreview}
                </p>
              )}
            </div>
          )}

          {/* Observações/Descrição */}
          {description && (
            <div className="event-item-description" style={{ marginTop: '0.5rem', paddingBottom: "0.5rem" }}>
              <strong>Obs:</strong> {description.length > 60 ? description.substring(0, 60) + '...' : description}
            </div>
          )}
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