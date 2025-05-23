import { Link, useNavigate } from 'react-router-dom';
import { useMutation } from "@tanstack/react-query";

import Modal from '../UI/Modal.jsx';
import EventForm from './EventForm.jsx';
import { createNewEvent } from '../util/http.js';
import ErrorBlock from '../UI/ErrorBlock.jsx';
import { queryClient } from '../util/http.js';

export default function NewEvent() {
  const navigate = useNavigate();

  const { mutate, isPending, isError, error } = useMutation({
    mutationFn: createNewEvent,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["events"] }); //marca como não updated e depoi faz o refetch
      navigate("/events");
    }
  });

  function handleSubmit(formData) {
    mutate(formData);
  }


  return (
    <Modal onClose={() => navigate('../')}>
      {isError && (
        <ErrorBlock
          title="falha ao criar o evento"
          message={error.info?.message || "Falha ao criar o evento. Porfavor verificar se todas as caixas estão preenchidas"}
        />
      )}
      <EventForm onSubmit={handleSubmit}>
        {isPending && "Submitting.."}
        {!isPending && (
          <>
            <Link to="../" className="button-text">
              Cancel
            </Link>
            <button type="submit" className="button">
              Create
            </button>
          </>
        )}
      </EventForm>

    </Modal>
  );
}
