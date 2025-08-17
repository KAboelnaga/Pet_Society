import { Spinner } from 'react-bootstrap';
import { useTheme } from '../contexts/ThemeContext';

const LoadingScreen = () => {
  const { theme } = useTheme();

  return (
    <div
      className="min-vh-100 d-flex flex-column align-items-center justify-content-center"
      style={{
        background: theme.gradients.background,
        gap: '1.5rem',
      }}
    >
      <div
        className="d-flex align-items-center justify-content-center rounded-circle"
        style={{
          backgroundColor: 'rgba(255, 255, 255, 0.1)',
          width: '80px',
          height: '80px',
          backdropFilter: 'blur(10px)',
        }}
      >
        <span style={{ fontSize: '40px' }}>
          🐾
        </span>
      </div>
      
      <Spinner 
        animation="border" 
        variant="light"
        style={{ 
          width: '60px', 
          height: '60px',
          borderWidth: '4px',
        }}
      />
      
      <h5 
        className="text-white fw-bold text-center mb-0"
      >
        Loading Pet Society...
      </h5>
      
      <p 
        className="text-white-50 text-center mb-0"
        style={{ opacity: 0.8 }}
      >
        Please wait while we check your session
      </p>
    </div>
  );
};

export default LoadingScreen; 