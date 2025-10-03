import { useState } from 'react';
import './RegistrationModal.css';

function RegistrationModal({ score, onSubmit, onSkip }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (isSubmitting) return; // Prevent double submission

    if (!name.trim()) {
      alert('Por favor, digite seu nome!');
      return;
    }
    if (email.trim() && !email.includes('@')) {
      alert('Por favor, digite um e-mail válido!');
      return;
    }

    setIsSubmitting(true);
    try {
      const success = await onSubmit(name.trim(), email.trim() || null);
      // Only clear form if submission was successful
      if (success) {
        setName('');
        setEmail('');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSubmit();
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal glass">
        <h2>Parabéns! 🎉</h2>
        <p className="score-text">Você fez <strong>{score}</strong> pontos!</p>
        <p className="instruction-text">Digite seus dados para entrar no ranking:</p>

        <input
          type="text"
          placeholder="Seu nome"
          className="glass-input"
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyPress={handleKeyPress}
          maxLength={50}
          disabled={isSubmitting}
        />

        <input
          type="email"
          placeholder="Seu e-mail (opcional)"
          className="glass-input"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          onKeyPress={handleKeyPress}
          maxLength={100}
          disabled={isSubmitting}
        />

        <div className="modal-buttons">
          <button
            className="glass-button"
            onClick={handleSubmit}
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Enviando...' : 'Enviar'}
          </button>
          <button
            className="glass-button secondary"
            onClick={onSkip}
            disabled={isSubmitting}
          >
            Pular
          </button>
        </div>
      </div>
    </div>
  );
}

export default RegistrationModal;
