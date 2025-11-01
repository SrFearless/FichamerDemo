'use client';

import { useState } from 'react';

interface PasswordGateProps {
  onUnlock: () => void;
}

export function PasswordGate({ onUnlock }: PasswordGateProps) {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (password === '09062001') {
      onUnlock();
    } else {
      setError('Senha incorreta! Tente novamente.');
    }
  };

  const handlePortfolioClick = () => {
    window.location.href = 'https://portfolio-pessoal-mu-virid.vercel.app';
  };

  return (
    <div className="passwordGate">
      <div className="passwordContainer">
        <h2>Pronto para uma Aventura?</h2>
        <p>Para prosseguir, insira a senha:</p>
        <form onSubmit={handleSubmit}>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Digite a senha..."
            className="passwordInput"
          />
          <div className="buttonContainer">
            <button type="submit" className="passwordButton">
              🗝️ Entrar no Mundo
            </button>
            <button 
              type="button" 
              className="passwordButton1"
              onClick={handlePortfolioClick}
            >
              📂 Voltar ao Portfólio
            </button>
          </div>
        </form>
        {error && <p className="errorMessage">{error}</p>}
        <p style={{marginTop: '15px', fontSize: '0.8rem', color: '#8b4513'}}>
          Dica: Página privada, pedir senha para ADM: Tiago
        </p>
      </div>
    </div>
  );
}