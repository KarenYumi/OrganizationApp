import {redirect } from 'react-router-dom';

import AuthForm from './AuthForm';
import Header from './Header';

function AuthenticationPage() {
  return (
    <>
      <Header></Header>
      <AuthForm />
    </>
  );
}

export default AuthenticationPage;

export async function action({request}) {
  const searchParams = new URL(request.url).searchParams;
  const mode = searchParams.get('mode') || 'login';

  if(mode !== 'login' && mode !== 'signup'){
    throw new Error("unsuported mode.");
  }

  const data = await request.formData();
  const authData = {
    email: data.get('email'),
    password: data.get('password'),
  }

  const response = await fetch('http://localhost:3000/' + mode, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(authData)
  });

  if(response.status === 422 || response.status === 401){
    return response;
  }

  if(!response.ok){
    throw new Error('Could not authenticate user');
  }

  return redirect('/events');
}