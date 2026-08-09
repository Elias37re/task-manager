import React, { useState } from 'react';
import { Mail, Lock, User, LogIn, UserPlus } from 'lucide-react';

export default function AuthForm({ onAuthSuccess, showToast }) {
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email || !password || (!isLogin && !username)) {
      showToast('Por favor, preencha todos os campos.', 'warning');
      return;
    }

    if (password.length < 6) {
      showToast('A senha deve ter pelo menos 6 caracteres.', 'warning');
      return;
    }

    setLoading(true);
    const endpoint = isLogin ? '/api/auth/login' : '/api/auth/register';
    const payload = isLogin 
      ? { email, password } 
      : { username, email, password };

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Erro ao realizar autenticação');
      }

      showToast(
        isLogin ? `Bem-vindo de volta, ${data.user.username}!` : 'Cadastro realizado com sucesso!',
        'success'
      );
      
      // Pass token and user details to parent App component
      onAuthSuccess(data.token, data.user);
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const toggleMode = () => {
    setIsLogin(!isLogin);
    // Reset fields when switching
    setUsername('');
    setEmail('');
    setPassword('');
  };

  return (
    <div className="auth-container">
      <div className={`auth-card ${!isLogin ? 'register-mode' : ''}`}>
        <div className="auth-header">
          <div className="logo-badge">
            <span className="logo-check">✓</span>
          </div>
          <h1>{isLogin ? 'Gestor de Tarefas' : 'Criar Conta'}</h1>
          <p className="auth-subtitle">
            {isLogin ? 'Faça login para gerenciar suas atividades' : 'Cadastre-se para começar a organizar seu dia'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          {!isLogin && (
            <div className="form-group">
              <label htmlFor="username">Nome de Usuário</label>
              <div className="input-icon-wrapper">
                <User className="input-icon" size={18} />
                <input
                  type="text"
                  id="username"
                  placeholder="Seu nome"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  disabled={loading}
                  required={!isLogin}
                />
              </div>
            </div>
          )}

          <div className="form-group">
            <label htmlFor="email">E-mail</label>
            <div className="input-icon-wrapper">
              <Mail className="input-icon" size={18} />
              <input
                type="email"
                id="email"
                placeholder="exemplo@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="password">Senha</label>
            <div className="input-icon-wrapper">
              <Lock className="input-icon" size={18} />
              <input
                type="password"
                id="password"
                placeholder="Sua senha"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
                required
              />
            </div>
          </div>

          <button type="submit" className="submit-btn" disabled={loading}>
            {loading ? (
              <span className="spinner"></span>
            ) : isLogin ? (
              <>
                <LogIn size={18} />
                <span>Entrar</span>
              </>
            ) : (
              <>
                <UserPlus size={18} />
                <span>Cadastrar</span>
              </>
            )}
          </button>
        </form>

        <div className="auth-footer">
          <span>
            {isLogin ? 'Não tem uma conta?' : 'Já possui uma conta?'}
          </span>
          <button onClick={toggleMode} className="toggle-auth-btn" disabled={loading}>
            {isLogin ? 'Criar nova conta' : 'Entrar na minha conta'}
          </button>
        </div>
      </div>
    </div>
  );
}
