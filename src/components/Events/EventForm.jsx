import { useState } from 'react';

export default function EventForm({ inputData, onSubmit, children }) {
  function handleSubmit(event) {
    event.preventDefault();

    const formData = new FormData(event.target);
    const data = Object.fromEntries(formData);
    const eventData = {...data, status: 'Pendente'};

    onSubmit({event: eventData});
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

      <p className="form-actions">{children}</p>
    </form>
  );
}
