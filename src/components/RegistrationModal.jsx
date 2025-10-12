import { useState } from 'react';
import './RegistrationModal.css';

function RegistrationModal({ score, onSubmit, onSkip }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleOk = async () => {
    if (isSubmitting) return; // Prevent double submission

    // If no name provided, just skip to home
    if (!name.trim()) {
      onSkip();
      return;
    }

    // Validate email if provided
    if (email.trim() && !email.includes('@')) {
      alert('Por favor, digite um e-mail válido!');
      return;
    }

    // Submit the score with name and optional email
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
      handleOk();
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
            onClick={handleOk}
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Enviando...' : 'OK'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default RegistrationModal;
