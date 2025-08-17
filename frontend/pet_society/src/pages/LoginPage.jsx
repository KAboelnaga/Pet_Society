import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Card, Form, Button, Alert, Spinner } from 'react-bootstrap';
import { BsSun, BsMoon, BsLock } from 'react-icons/bs';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';

const LoginPage = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, isAuthenticated, loading: authLoading } = useAuth();
  const { mode, toggleTheme, theme } = useTheme();
  const navigate = useNavigate();

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated && !authLoading) {
      navigate('/');
    }
  }, [isAuthenticated, authLoading, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const result = await login(username, password);
    
    if (result.success) {
      navigate('/');
    } else {
      setError(result.error);
    }
    
    setLoading(false);
  };

  // Show loading if checking authentication
  if (authLoading) {
    return null; // This will be handled by the App component
  }

  // Don't render login page if already authenticated
  if (isAuthenticated) {
    return null;
  }

  return (
    <div
      className="min-vh-100 d-flex align-items-center justify-content-center p-3"
      style={{
        background: theme.gradients.background,
        position: 'relative',
      }}
    >
      {/* Theme Toggle Button */}
      <Button
        variant="outline-light"
        size="sm"
        onClick={toggleTheme}
        className="position-absolute"
        style={{
          top: '20px',
          right: '20px',
          backgroundColor: 'rgba(255, 255, 255, 0.1)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255, 255, 255, 0.3)',
        }}
      >
        {mode === 'light' ? <BsMoon /> : <BsSun />}
      </Button>

      <Container className="w-100" style={{ maxWidth: '500px' }}>
        <Card
          className="shadow-lg border-0"
          style={{
            borderRadius: '1rem',
            overflow: 'hidden',
            background: mode === 'light' ? 'rgba(255, 255, 255, 0.95)' : 'rgba(33, 37, 41, 0.95)',
            backdropFilter: 'blur(10px)',
            border: mode === 'light' ? '1px solid rgba(255, 255, 255, 0.2)' : '1px solid rgba(255, 255, 255, 0.1)',
          }}
        >
          {/* Header */}
          <div
            className="text-white text-center p-4"
            style={{
              background: mode === 'light' 
                ? 'linear-gradient(135deg, #0d6efd, #0b5ed7)'
                : 'linear-gradient(135deg, #212529, #343a40)',
            }}
          >
            <div
              className="d-flex align-items-center justify-content-center rounded-circle mx-auto mb-3"
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.2)',
                width: '80px',
                height: '80px',
                backdropFilter: 'blur(10px)',
              }}
            >
              <span style={{ fontSize: '40px' }}>
                🐾
              </span>
            </div>
            
            <h1 className="h3 fw-bold mb-2">
              Pet Society
            </h1>
            
            <p className="mb-0 opacity-75">
              Admin Dashboard
            </p>
          </div>

          {/* Login Form */}
          <Card.Body className="p-4">
            <div className="text-center mb-4">
              <div
                className="d-flex align-items-center justify-content-center rounded-circle mx-auto mb-3"
                style={{
                  backgroundColor: theme.colors.primary,
                  width: '56px',
                  height: '56px',
                }}
              >
                <BsLock className="text-white" style={{ fontSize: '28px' }} />
              </div>
              
              <h2 className="h5 fw-bold mb-2">
                Admin Login
              </h2>
              
              <p className="text-muted mb-0">
                Sign in to access the admin dashboard
              </p>
            </div>

            {error && (
              <Alert variant="danger" className="mb-3">
                {error}
              </Alert>
            )}

            <Form onSubmit={handleSubmit}>
              <Form.Group className="mb-3">
                <Form.Label>Username</Form.Label>
                <Form.Control
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  disabled={loading}
                  required
                  autoFocus
                />
              </Form.Group>

              <Form.Group className="mb-4">
                <Form.Label>Password</Form.Label>
                <Form.Control
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={loading}
                  required
                />
              </Form.Group>

              <Button
                type="submit"
                variant="primary"
                size="lg"
                className="w-100 mb-3"
                disabled={loading}
                style={{
                  height: '48px',
                  background: mode === 'light'
                    ? 'linear-gradient(135deg, #0d6efd, #0b5ed7)'
                    : 'linear-gradient(135deg, #0d6efd, #0b5ed7)',
                  border: 'none',
                }}
              >
                {loading ? (
                  <Spinner animation="border" size="sm" />
                ) : (
                  'Sign In'
                )}
              </Button>
            </Form>

            {/* Footer */}
            <div className="text-center">
              <p className="text-muted small mb-0">
                Secure access to Pet Society administration
              </p>
            </div>
          </Card.Body>
        </Card>
      </Container>
    </div>
  );
};

export default LoginPage; 