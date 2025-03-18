import { useQuery } from "@tanstack/react-query"

import LoadingIndicator from '../UI/LoadingIndicator.jsx';
import ErrorBlock from '../UI/ErrorBlock.jsx';
import EventItem from './EventItem.jsx';
import { fetchEvents } from "../util/http.js";

export default function NewEventsSection() {
  const {data, isPending, isError , error} = useQuery({  //faz um update continuo para atualizar
    queryKey: ["events"],
    queryFn: ({signal, queryKey}) => fetchEvents({signal, ...queryKey[1]}),
    staleTime: 5000, // Dados são considerados frescos por 5 segundos
    //gcTime: 1000
  }); 
  

  let content;

  if (isPending) {
    content = <LoadingIndicator />;
  }

  if (isError) {
    content = (
      <ErrorBlock title="An error occurred" message={error.info?.message || "Failed to show events"} />
    );
  }

  if (data) {
    content = (
      <ul className="events-list">
        {data.map((event) => (
          <li key={event.id}>
            <EventItem event={event} />
          </li>
        ))}
      </ul>
    );
  }

  return (
    <section className="content-section" id="new-events-section">
      <header>
        <h2>Todos os Pedidos:</h2>
      </header>
      {content}
    </section>
  );
}
