import { Link } from 'react-router-dom';

export default function EventItem({ event }) {
  // Debug para ver os dados
  console.log('EventItem - Dados do evento:', {
    id: event.id,
    title: event.title,
    produto: event.produto,
    peso: event.peso,
    products: event.products,
    bolosDetalhados: event.bolosDetalhados
  });

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

  // EXTRAÇÃO DE BOLOS - VERSÃO ROBUSTA
  let bolos = [];
  
  // 1. Primeiro tenta bolosDetalhados (JSON com todos os detalhes)
  if (event.bolosDetalhados && event.bolosDetalhados.trim() !== '' && event.bolosDetalhados !== '[]') {
    try {
      const bolosDetalhados = JSON.parse(event.bolosDetalhados);
      console.log('Parsed bolosDetalhados:', bolosDetalhados);
      
      if (Array.isArray(bolosDetalhados) && bolosDetalhados.length > 0) {
        bolos = bolosDetalhados
          .filter(bolo => bolo && (bolo.nome || bolo.produto)) // Filtra bolos válidos
          .map(bolo => ({
            nome: bolo.nome || bolo.produto || 'Produto sem nome',
            peso: bolo.peso || '',
            descricao: bolo.descricao || ''
          }));
      }
    } catch (error) {
      console.error('Erro ao parsear bolosDetalhados:', error);
      console.error('String problemática:', event.bolosDetalhados);
    }
  }
  
  // 2. Se não tem bolosDetalhados, tenta campos individuais (produto, peso, descricao)
  if (bolos.length === 0 && event.produto && event.produto.trim()) {
    bolos = [{
      nome: event.produto.trim(),
      peso: event.peso || '',
      descricao: event.descricao || ''
    }];
    console.log('Usando campos individuais:', bolos);
  }
  
  // 3. Se não tem nada, tenta o campo products original (formato antigo)
  if (bolos.length === 0 && event.products && event.products.trim()) {
    const productList = event.products
      .split('\n')
      .map(p => p.trim())
      .filter(p => p.length > 0);
      
    if (productList.length > 0) {
      bolos = productList.map(produto => ({
        nome: produto,
        peso: '',
        descricao: ''
      }));
      console.log('Usando campo products:', bolos);
    }
  }

  // Filtra bolos válidos e adiciona debug
  const bolosValidos = bolos.filter(bolo => bolo.nome && bolo.nome.trim());
  console.log('Bolos válidos encontrados:', bolosValidos.length, bolosValidos);
  
  const description = event.description || '';

  return (
    <article className="event-item">
      <div className="event-item-content">
        <div>
          <h2>{event.title}</h2>
          <p className="event-item-date">{formattedDate}</p>
          
          {/* SEÇÃO DE BOLOS */}
          {bolosValidos.length > 0 ? (
            <div className="event-item-products" style={{ 
              margin: '0.75rem 0',
              padding: '0.75rem',
              backgroundColor: '#f8f9ff',
              borderRadius: '6px',
              borderLeft: '3px solid #2f82ff'
            }}>
              <div style={{ 
                fontWeight: 'bold', 
                color: '#2f82ff', 
                marginBottom: '0.75rem',
                fontSize: '0.9rem'
              }}>
                Bolos do Pedido ({bolosValidos.length}):
              </div>
              
              {bolosValidos.map((bolo, index) => (
                <div 
                  key={`bolo-${index}`}
                  style={{ 
                    marginBottom: index === bolosValidos.length - 1 ? '0' : '0.75rem',
                    padding: '0.5rem',
                    backgroundColor: '#ffffff',
                    borderRadius: '4px',
                    border: '1px solid #e9ecef',
                    fontSize: '0.9rem',
                    lineHeight: '1.4'
                  }}
                >
                  <div style={{ 
                    fontWeight: '600', 
                    color: '#2f82ff',
                    marginBottom: '0.3rem',
                    fontSize: '0.85rem'
                  }}>
                    Bolo {index + 1}:
                  </div>
                  
                  {/* Nome do bolo */}
                  <div style={{ marginBottom: (bolo.peso || bolo.descricao) ? '0.2rem' : '0' }}>
                    <span style={{ fontWeight: '600', color: '#333' }}>
                      {bolo.nome}
                    </span>
                    
                    {/* Peso */}
                    {bolo.peso && bolo.peso.trim() && (
                      <span style={{ 
                        color: '#007bff',
                        fontWeight: '500',
                        marginLeft: '0.5rem',
                        backgroundColor: '#e7f3ff',
                        padding: '0.1rem 0.4rem',
                        borderRadius: '12px',
                        fontSize: '0.8rem'
                      }}>
                        {bolo.peso}
                      </span>
                    )}
                  </div>
                  
                  {/* Descrição */}
                  {bolo.descricao && bolo.descricao.trim() && (
                    <div style={{ 
                      color: '#666',
                      fontSize: '0.85rem',
                      marginTop: '0.3rem',
                      lineHeight: '1.3'
                    }}>
                      {bolo.descricao}
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            // Debug: Mostra quando não encontra bolos
            <div style={{
              margin: '0.75rem 0',
              padding: '0.5rem',
              backgroundColor: '#fff3cd',
              border: '1px solid #ffeaa7',
              borderRadius: '4px',
              fontSize: '0.85rem',
              color: '#856404'
            }}>
              Nenhum bolo encontrado para este pedido.
              <br />
              <small>
                Debug: products="{event.products || 'vazio'}", 
                produto="{event.produto || 'vazio'}", 
                bolosDetalhados="{event.bolosDetalhados || 'vazio'}"
              </small>
            </div>
          )}

          {/* Observações/Descrição */}
          {description && (
            <div style={{ 
              marginTop: '0.5rem', 
              fontSize: '0.9rem',
              color: '#555',
              backgroundColor: '#f8f9fa',
              padding: '0.5rem',
              borderRadius: '4px',
              borderLeft: '3px solid #28a745'
            }}>
              <strong style={{ color: '#28a745' }}>Observações:</strong> {
                description.length > 100 
                  ? description.substring(0, 100) + '...' 
                  : description
              }
            </div>
          )}

          {/* Endereço resumido */}
          {event.address && (
            <div style={{ 
              fontSize: '0.85rem',
              color: '#666',
              marginTop: '0.5rem',
              backgroundColor: '#fff8e1',
              padding: '0.3rem 0.5rem',
              borderRadius: '4px',
              borderLeft: '2px solid #ff9800'
            }}>
              <strong>Endereço:</strong> {event.address.length > 50 
                ? event.address.substring(0, 50) + '...' 
                : event.address
              }
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