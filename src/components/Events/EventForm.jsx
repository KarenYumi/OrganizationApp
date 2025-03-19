import { useState, useEffect } from 'react';

export default function EventForm({ inputData, onSubmit, children }) {
  const [status, setStatus] = useState(inputData?.status ?? '');

  useEffect(() => {
    setStatus(inputData?.status ?? '');
  }, [inputData]);

  function handleSubmit(event) {
    event.preventDefault();

    const formData = new FormData(event.target);
    const data = Object.fromEntries(formData);

    data.status = status;

    onSubmit({ event: data });
  }

  return (
    <form id="event-form" onSubmit={handleSubmit}>
      <p className="control">
        <label htmlFor="title">Titulo</label>
        <input
          type="text"
          id="title"
          name="title"
          defaultValue={inputData?.title ?? ''}
        />
      </p>

      <p className="control">
        <label htmlFor="description">Descrição</label>
        <textarea
          id="description"
          name="description"
          defaultValue={inputData?.description ?? ''}
        />
      </p>

      <div className="controls-row">
        <p className="control">
          <label htmlFor="date">Data</label>
          <input
            type="date"
            id="date"
            name="date"
            defaultValue={inputData?.date ?? ''}
          />
        </p>

        <p className="control">
          <label htmlFor="time">Horas</label>
          <input
            type="time"
            id="time"
            name="time"
            defaultValue={inputData?.time ?? ''}
          />
        </p>
      </div>

      <p className="control">
        <label htmlFor="address">Endereço</label>
        <input
          type="text"
          id="address"
          name="address"
          defaultValue={inputData?.address ?? ''}
        />
      </p>

      <label htmlFor="status">Status</label>
      <select
        name="status"
        id="status"
        value={status} 
        onChange={(e) => setStatus(e.target.value)}
      >
        <option value="A fazer">A fazer</option>
        <option value="Pendente">Pendente</option>
        <option value="Pronto">Pronto</option>
        <option value="Entregue">Entregue</option>
        <option value="Cancelado">Cancelado</option>
      </select>

      <p className="form-actions">{children}</p>
    </form>
  );
}
