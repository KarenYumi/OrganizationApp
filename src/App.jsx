import {
  Navigate,
  RouterProvider,
  createBrowserRouter,
} from 'react-router-dom';
import { QueryClientProvider } from '@tanstack/react-query';

import Events from './components/Events/Events.jsx';
import EventDetails from './components/Events/EventDetails.jsx';
import NewEvent from './components/Events/NewEvent.jsx';
import EditEvent, { loader as editEventLoader } from './components/Events/EditEvent.jsx';
import { queryClient } from './components/util/http.js';
import AuthenticationPage, { action as authAction } from './components/Authentication.jsx';

const router = createBrowserRouter([
  {
    path: '/',
    element: <Navigate to="/auth?mode=login" replace />, // Redireciona para a URL correta com `mode=login`
  },
  {
    path: 'auth',
    element: <AuthenticationPage />,
    action: authAction,
  },
  {
    path: '/events',
    element: <Events />,

    children: [
      {
        path: '/events/new',
        element: <NewEvent />,
      },
    ],
  },
  {
    path: '/events/:id',
    element: <EventDetails />,
    children: [
      {
        path: '/events/:id/edit',
        element: <EditEvent />,
        loader: editEventLoader,
      },
    ],
  },
]);


function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>

  )
}

export default App;
