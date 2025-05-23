import { useState } from "react";
import { useDrag, useDrop, DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { PlusIcon } from "./Icons.jsx";
import ColumnContainer from "./ColumnContainer.jsx"

export default function Kanban() {
  const [columns, setColumns] = useState([]);
  const [message, setMessage] = useState([]);

  function generateId() {
    return Math.floor(Math.random() * 101);
  }

  function createNewColumn() {
    const columntoAdd = {
      id: generateId(),
      title: `Column ${columns.length + 1}`
    };

    setColumns([...columns, columntoAdd]);
    setMessage("");
  }

  function deleteColumn(id) {
    const filteredColumns = columns.filter((column) => column.id !== id);
    setColumns(filteredColumns);
  }

  return (
    <div className='kanbann'>
      <p>{message}</p>
      {columns.length >= 5 ? <p>Limite máximo de 5 colunas atingido!</p> : <button className='addColumn' disabled={columns.length >= 5}
        onClick={() => {
          createNewColumn();
        }}>
        <PlusIcon />Add Column
      </button>}
      <div className='columns'>
        {columns.map(column =>
          <ColumnContainer key={column.id} column={column} deleteColumn={deleteColumn} />
        )}
      </div>
    </div>
  );
}

