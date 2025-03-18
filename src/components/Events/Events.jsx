import { Link, Outlet } from 'react-router-dom';

import Header from '../Header.jsx';
import EventsIntroSection from './EventsIntroSection.jsx';
import NewEventsSection from './NewEventsSection.jsx';

export default function Events() {
  return (
    <>
      <Outlet />
      <Header>
        <Link to="/events/new" className="button">
          Novo Pedido
        </Link>
      </Header>
      <main>
        <EventsIntroSection />
        <NewEventsSection />
      </main>
    </>
  );
}
