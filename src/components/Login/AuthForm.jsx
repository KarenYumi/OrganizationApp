import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import classes from './AuthForm.module.css';

// Função que faz a requisição de auth
async function authenticateUser({ email, password, mode }) {
  const response = await fetch(`https://organizationapp-backend.onrender.com/${mode}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ email, password })
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Falha na autenticação');
  }

  return response.json();
}

// Funções de validação
function validateEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  
  if (!email) {
    return 'Email é obrigatório';
  }
  
  if (!emailRegex.test(email)) {
    return 'Formato de email inválido';
  }
  
  return null; // null = sem erro
}

function validatePassword(password, isLogin = false) {
  if (!password) {
    return 'Senha é obrigatória';
  }
  
  // Para cadastro, validar tamanho mínimo
  if (!isLogin && password.length < 6) {
    return 'Senha deve ter pelo menos 6 caracteres';
  }
  
  return null;
}

function AuthForm() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const isLogin = searchParams.get("mode") === "login";

  // Estados para os valores dos campos
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  // Estados para os erros de validação
  const [validationErrors, setValidationErrors] = useState({
    email: null,
    password: null
  });

  // Estados para controlar quando mostrar erros
  const [fieldsTouched, setFieldsTouched] = useState({
    email: false,
    password: false
  });

  const { mutate, isPending, isError, error } = useMutation({
    mutationFn: authenticateUser,
    onSuccess: (data) => {
      if (data.token) {
        localStorage.setItem('token', data.token);
      }
      
      queryClient.invalidateQueries({ queryKey: ["user"] });
      navigate("/events");
    }
  });

  // Função para validar um campo específico
  function validateField(fieldName, value) {
    let errorMessage = null;

    switch (fieldName) {
      case 'email':
        errorMessage = validateEmail(value);
        break;
      case 'password':
        errorMessage = validatePassword(value, isLogin);
        break;
    }

    setValidationErrors(prev => ({
      ...prev,
      [fieldName]: errorMessage
    }));

    return errorMessage === null;
  }

  // Função para validar todos os campos
  function validateAllFields() {
    const emailValid = validateField('email', formData.email);
    const passwordValid = validateField('password', formData.password);
    
    return emailValid && passwordValid;
  }

  // Handler para mudanças nos inputs
  function handleInputChange(event) {
    const { name, value } = event.target;
    
    // Atualizar valor
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Validar apenas se o campo já foi "tocado"
    if (fieldsTouched[name]) {
      validateField(name, value);
    }
  }

  // Handler para quando o campo perde o foco
  function handleInputBlur(event) {
    const { name, value } = event.target;
    
    // Marcar campo como "tocado"
    setFieldsTouched(prev => ({
      ...prev,
      [name]: true
    }));

    // Validar o campo
    validateField(name, value);
  }

  function handleSubmit(event) {
    event.preventDefault();
    
    // Marcar todos os campos como tocados
    setFieldsTouched({
      email: true,
      password: true
    });

    // Validar todos os campos
    if (!validateAllFields()) {
      return; // Para o envio se houver erros
    }

    // Se passou na validação, enviar
    const mode = isLogin ? 'login' : 'signup';
    mutate({ 
      email: formData.email, 
      password: formData.password, 
      mode 
    });
  }

  return (
    <>
      {isError && (
        <div className={classes.error}>
          <p>{error.message || "Erro na autenticação. Verifique os dados."}</p>
        </div>
      )}
      
      <form onSubmit={handleSubmit} className={classes.form}>
        <h1>{isLogin ? 'Log in' : 'Create a new user'}</h1>
        
        <p>
          <label htmlFor="email">Email</label>
          <input 
            id="email" 
            type="email" 
            name="email" 
            value={formData.email}
            onChange={handleInputChange}
            onBlur={handleInputBlur}
            disabled={isPending}
            className={fieldsTouched.email && validationErrors.email ? classes.inputError : ''}
          />
          {fieldsTouched.email && validationErrors.email && (
            <span className={classes.errorText}>{validationErrors.email}</span>
          )}
        </p>
        
        <p>
          <label htmlFor="password">Password</label>
          <input 
            id="password" 
            type="password" 
            name="password" 
            value={formData.password}
            onChange={handleInputChange}
            onBlur={handleInputBlur}
            disabled={isPending}
            className={fieldsTouched.password && validationErrors.password ? classes.inputError : ''}
          />
          {fieldsTouched.password && validationErrors.password && (
            <span className={classes.errorText}>{validationErrors.password}</span>
          )}
        </p>
        
        <div className={classes.actions}>
          <Link to={`?mode=${isLogin ? "signup" : "login"}`}>
            {isLogin ? 'Create new user' : 'Login'}
          </Link>
          <button type="submit" disabled={isPending}>
            {isPending ? 'Carregando...' : (isLogin ? 'Login' : 'Cadastrar')}
          </button>
        </div>
      </form>
    </>
  );
}

export default AuthForm;