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
    if (columns.length >= 6) {
      setMessage("Limite máximo de 6 colunas atingido!");
      return;
    }
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
      <button className='addColumn' disabled={columns.length >= 6}
        onClick={() => {
          createNewColumn();
        }}>
        <PlusIcon />Add Column
      </button>
      <div className='columns'>
        {columns.map(column =>
          <ColumnContainer key={column.id} column={column} deleteColumn={deleteColumn} />
        )}
      </div>
    </div>
  );
}

