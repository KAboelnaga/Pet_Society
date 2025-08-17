import React from 'react';
import { Container, Navbar, Nav, Button, Badge, Dropdown } from 'react-bootstrap';
import { BsSun, BsMoon, BsBoxArrowRight, BsPersonCircle } from 'react-icons/bs';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';

const Layout = ({ children, title = 'Pet Society Admin' }) => {
  const { user, logout } = useAuth();
  const { mode, toggleTheme } = useTheme();

  const handleLogout = async () => {
    await logout();
  };

  return (
    <div className="min-vh-100 d-flex flex-column">
      {/* Navigation Bar */}
      <Navbar 
        bg="primary" 
        variant="dark" 
        expand="lg" 
        className="shadow-sm"
        style={{
          background: mode === 'light' 
            ? 'linear-gradient(135deg, #0d6efd, #0b5ed7)'
            : 'linear-gradient(135deg, #212529, #343a40)'
        }}
      >
        <Container fluid>
          <Navbar.Brand className="fw-bold">
            🐾 {title}
          </Navbar.Brand>
          
          <Navbar.Toggle aria-controls="basic-navbar-nav" />
          <Navbar.Collapse id="basic-navbar-nav">
            <Nav className="ms-auto d-flex align-items-center">
              {/* Theme Toggle Button */}
              <Button
                variant="outline-light"
                size="sm"
                onClick={toggleTheme}
                className="me-2"
                style={{
                  border: '1px solid rgba(255, 255, 255, 0.3)',
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                }}
              >
                {mode === 'light' ? <BsMoon /> : <BsSun />}
              </Button>
              
              {/* User Role Badge */}
              <Badge 
                bg={user?.is_superuser ? 'danger' : 'primary'} 
                className="me-2"
              >
                {user?.is_superuser ? 'Super Admin' : 'Admin'}
              </Badge>
              
              {/* User Menu */}
              <Dropdown>
                <Dropdown.Toggle
                  variant="outline-light"
                  size="sm"
                  className="d-flex align-items-center"
                  style={{
                    border: '1px solid rgba(255, 255, 255, 0.3)',
                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  }}
                >
                  <BsPersonCircle className="me-1" />
                  {user?.username}
                </Dropdown.Toggle>

                <Dropdown.Menu align="end">
                  <Dropdown.ItemText className="text-muted">
                    {user?.username}
                  </Dropdown.ItemText>
                  <Dropdown.Divider />
                  <Dropdown.Item onClick={handleLogout} className="d-flex align-items-center">
                    <BsBoxArrowRight className="me-2" />
                    Logout
                  </Dropdown.Item>
                </Dropdown.Menu>
              </Dropdown>
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>

      {/* Main Content */}
      <main className="flex-grow-1">
        {children}
      </main>
    </div>
  );
};

export default Layout;
