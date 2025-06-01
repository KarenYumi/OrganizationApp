// src/components/Products/ProductsList.jsx

/**
 * Componente para exibir lista de produtos formatada
 */
export default function ProductsList({ products, style = {} }) {
  if (!products || !Array.isArray(products)) return null;
  
  const validProducts = products.filter(p => p && p.trim());
  if (validProducts.length === 0) return null;

  const defaultStyle = { 
    margin: '0.5rem 0', 
    paddingLeft: '1.2rem',
    listStyleType: 'disc' 
  };

  const combinedStyle = { ...defaultStyle, ...style };

  return (
    <ul style={combinedStyle}>
      {validProducts.map((product, index) => (
        <li key={index} style={{ marginBottom: '0.25rem' }}>
          {product}
        </li>
      ))}
    </ul>
  );
}