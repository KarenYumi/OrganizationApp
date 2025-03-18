import { useState } from "react";
import { useDrag, useDrop, DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";

const ItemType = "CARD";

const initialColumns = {
  "A Fazer": [
    { id: 1, title: "Recheio", description: "Chocolate com morango" },
    { id: 2, title: "Massa", description: "Chocolate" },
  ],
  "Pendente": [
    { id: 3, title: "Cobertura", description: "Pedaços de morango" },
  ],
  "Pronto": [],
};

export default function Kanban() {
  const [columns, setColumns] = useState(initialColumns);

  const moveCard = (card, toColumn) => {
    setColumns((prev) => {
      const newColumns = { ...prev };
      Object.keys(newColumns).forEach((col) => {
        newColumns[col] = newColumns[col].filter((c) => c.id !== card.id);
      });
      newColumns[toColumn].push(card);
      return newColumns;
    });
  };

  return (
    <DndProvider backend={HTML5Backend}>
      <section className="kanban">
        {Object.keys(columns).map((column) => (
          <Column key={column} title={column} cards={columns[column]} moveCard={moveCard} />
        ))}
      </section>
    </DndProvider>
  );
}

function Column({ title, cards, moveCard }) {
  const [, drop] = useDrop({
    accept: ItemType,
    drop: (item) => moveCard(item, title),
  });

  return (
    <div ref={drop} className="area">
      <h2>{title}</h2>
      <div className="cards">
        {cards.map((card) => (
          <Card key={card.id} card={card} />
        ))}
      </div>
    </div>
  );
}

function Card({ card }) {
  const [{ isDragging }, drag] = useDrag({
    type: ItemType,
    item: card,
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(),
    }),
  });

  return (
    <div ref={drag} className="card" style={{ opacity: isDragging ? 0.5 : 1 }}>
      <h3>{card.title}</h3>
      <p>{card.description}</p>
    </div>
  );
}
