// src/pages/Dashboard.jsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Row, Col, Card } from 'react-bootstrap';
import { 
  BsPeople, 
  BsFileText, 
  BsCollection, 
  BsGraphUp 
} from 'react-icons/bs';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import Layout from '../components/Layout';
import api from '../services/api'; 

const Dashboard = () => {
  const { user } = useAuth();
  const { theme } = useTheme();
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);

useEffect(() => {
  fetchStats();
}, []);

const fetchStats = async () => {
  try {
    const response = await api.get('/admins/dashboard/stats/');
    setStats(response.data);
  } catch (error) {
    console.error(' Error fetching stats:', error);
  }
};


  // Statistics Card Component
  const StatCard = ({ title, value, icon, color, subtitle }) => (
    <Card 
      className="h-100 border-0 shadow-sm"
      style={{
        background: `linear-gradient(135deg, ${color}15, ${color}25)`,
        border: `1px solid ${color}30`,
        transition: 'all 0.3s ease',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-4px)';
        e.currentTarget.style.boxShadow = `0 8px 25px ${color}40`;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = '0 0.125rem 0.25rem rgba(0, 0, 0, 0.075)';
      }}
    >
      <Card.Body className="text-center p-4">
        {/* Icon Circle */}
        <div
          className="d-flex align-items-center justify-content-center rounded-circle mx-auto mb-3"
          style={{
            backgroundColor: color,
            width: '60px',
            height: '60px',
            boxShadow: `0 4px 12px ${color}40`,
          }}
        >
          {icon}
        </div>
        
        {/* Value Number */}
        <h3 className="fw-bold mb-2" style={{ color: theme.colors.text }}>
          {value}
        </h3>
        
        {/* Title */}
        <h6 className="text-muted mb-1">
          {title}
        </h6>
        
        {/* Subtitle */}
        {subtitle && (
          <small className="text-muted">
            {subtitle}
          </small>
        )}
      </Card.Body>
    </Card>
  );

  // Navigation Card Component
  const NavigationCard = ({ title, icon, onClick, color = theme.colors.primary }) => (
    <Card
      className="h-100 border-0 shadow-sm cursor-pointer"
      style={{
        cursor: 'pointer',
        background: `linear-gradient(135deg, ${color}08, ${color}15)`,
        border: `1px solid ${color}20`,
        transition: 'all 0.3s ease',
        height: '140px',
      }}
      onClick={onClick}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-6px)';
        e.currentTarget.style.boxShadow = `0 12px 30px ${color}30`;
        e.currentTarget.style.background = `linear-gradient(135deg, ${color}15, ${color}25)`;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = '0 0.125rem 0.25rem rgba(0, 0, 0, 0.075)';
        e.currentTarget.style.background = `linear-gradient(135deg, ${color}08, ${color}15)`;
      }}
    >
      <Card.Body className="text-center p-4">
        {/* Icon */}
        <div
          className="mb-3 d-flex justify-content-center"
          style={{ color: color, fontSize: '48px' }}
        >
          {icon}
        </div>
        
        {/* Title */}
        <h6 className="fw-bold mb-0" style={{ color: theme.colors.text }}>
          {title}
        </h6>
      </Card.Body>
    </Card>
  );

  return (
    <Layout title="Pet Society" >
      <Container fluid className="p-4" style={{ minHeight: '100vh', backgroundColor: theme.colors.background }}>
        
        {/* Welcome Banner Section */}
        <div 
          className="p-4 mb-4 text-center text-white rounded-3"
          style={{
            background: theme.mode === 'light'
              ? 'linear-gradient(135deg, #0d6efd, #0b5ed7)'
              : 'linear-gradient(135deg, #212529, #343a40)',
          }}
        >
          <h2 className="fw-bold mb-2">
            Welcome back, {user?.username}
          </h2>
          <p className="mb-0 opacity-75">
            Manage your platform from here
          </p>
        </div>

        {/* Statistics Section */}
        {stats && (
          <Card className="mb-4 border-0 shadow-sm">
            <Card.Body className="p-4">
              {/* Section Header */}
              <div className="d-flex align-items-center mb-3">
                <BsGraphUp 
                  className="me-2" 
                  style={{ color: theme.colors.primary, fontSize: '28px' }} 
                />
                <h4 className="fw-bold mb-0" style={{ color: theme.colors.text }}>
                  Platform Statistics
                </h4>
              </div>
              
              <hr className="mb-4" />
              
              {/* Statistics Grid */}
              <Row className="g-3">
                <Col xs={12} sm={6} md={3}>
                  <StatCard
                    title="Total Users"
                    value={stats.total_users}
                    icon={<BsPeople className="text-white" style={{ fontSize: '28px' }} />}
                    color="#0d6efd"
                    subtitle="Registered users"
                  />
                </Col>
                
                <Col xs={12} sm={6} md={3}>
                  <StatCard
                    title="Total Posts"
                    value={stats.total_posts}
                    icon={<BsFileText className="text-white" style={{ fontSize: '28px' }} />}
                    color="#198754"
                    subtitle="Animal listings"
                  />
                </Col>
                
                <Col xs={12} sm={6} md={3}>
                  <StatCard
                    title="Categories"
                    value={stats.total_categories}
                    icon={<BsCollection className="text-white" style={{ fontSize: '28px' }} />}
                    color="#ffc107"
                    subtitle="Animal types"
                  />
                </Col>
                
                <Col xs={12} sm={6} md={3}>
                  <StatCard
                    title="Blocked Users"
                    value={stats.blocked_users}
                    icon={<BsPeople className="text-white" style={{ fontSize: '28px' }} />}
                    color="#dc3545"
                    subtitle="Suspended accounts"
                  />
                </Col>
              </Row>
            </Card.Body>
          </Card>
        )}

        {/* Quick Actions Section */}
        <Card className="border-0 shadow-sm">
          <Card.Body className="p-4">
            <h4 className="fw-bold mb-3" style={{ color: theme.colors.text }}>
              Quick Actions
            </h4>
            
            <hr className="mb-4" />
            
            <Row className="g-3">
              <Col xs={12} sm={6} md={3}>
                <NavigationCard
                  title="Categories"
                  icon={<BsCollection />}
                  onClick={() => navigate('/categories')}
                  color="#0d6efd"
                />
              </Col>
              
              <Col xs={12} sm={6} md={3}>
                <NavigationCard
                  title="Users"
                  icon={<BsPeople />}
                  onClick={() => navigate('/users')}
                  color="#198754"
                />
              </Col>
              
              <Col xs={12} sm={6} md={3}>
                <NavigationCard
                  title="Posts"
                  icon={<BsFileText />}
                  onClick={() => navigate('/posts')}
                  color="#ffc107"
                />
              </Col>
              
              <Col xs={12} sm={6} md={3}>
                <NavigationCard
                  title="Overview"
                  icon={<BsGraphUp />}
                  color="#6f42c1"
                />
              </Col>
            </Row>
          </Card.Body>
        </Card>
      </Container>
    </Layout>
  );
};

export default Dashboard;
