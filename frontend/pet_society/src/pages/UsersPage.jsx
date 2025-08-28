import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Container, 
  Row, 
  Col, 
  Card, 
  Button, 
  Table, 
  Form, 
  InputGroup, 
  Alert, 
  Badge,
  Spinner,
  Modal
} from 'react-bootstrap';
import { BsSearch, BsShieldX, BsShieldCheck, BsArrowLeft, BsPersonCircle } from 'react-icons/bs';
import { useAuth } from '../context/AuthContext';
import { authAPI } from '../services/api';
import { useTheme } from '../context/ThemeContext';
import Layout from '../components/Layout';
import api from '../services/api';


const UsersPage = () => {
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();
  const { theme } = useTheme();
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState({ show: false, message: '', variant: 'success' });
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [actionUser, setActionUser] = useState(null);
  const [actionType, setActionType] = useState('');


  useEffect(() => {
}, [currentUser]);

  useEffect(() => {
    fetchUsers();
  }, []);

const fetchUsers = async () => {
  try {
    setLoading(true);
    const response = await api.get('/admins/users/');
    setUsers(response.data.results);
  } catch (error) {
    console.error("❌ Error fetching users:", error);
    showAlert('Error fetching users', 'danger');
  } finally {
    setLoading(false);
  }
};



  const handleSearch = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/admins/users/?search=${searchTerm}`);
      setUsers(response.data.results);
    } catch (error) {
      showAlert('Error searching users', 'danger');
    } finally {
      setLoading(false);
    }
  };
// Toggle block status
const handleToggleBlock = async (userId, currentBlockedStatus) => {
  try {
    console.log("🔄 Updating block status for user:", userId, "to:", !currentBlockedStatus);
    const response = await authAPI.updateUser(userId, {
      is_blocked: !currentBlockedStatus,
    });

    console.log("✅ Block status update response:", response.data);
    showAlert(`User ${currentBlockedStatus ? 'unblocked' : 'blocked'} successfully`);
    fetchUsers(); // اعادة جلب اللستة بعد التعديل
  } catch (error) {
    console.error("❌ Error updating block status:", error);
    console.error("❌ Error response:", error.response?.data);
    console.error("❌ Error status:", error.response?.status);
    showAlert(error.response?.data?.error || error.response?.data?.detail || 'Error updating user', 'danger');
  }
};

// Toggle admin status
const handleToggleAdmin = async (userId, currentAdminStatus) => {
  try {
    console.log("🔄 Updating admin status for user:", userId, "to:", !currentAdminStatus);
    const response = await authAPI.updateUser(userId, {
      is_admin: !currentAdminStatus,
    });

    console.log("✅ Admin status update response:", response.data);
    showAlert(`User ${currentAdminStatus ? 'demoted' : 'promoted'} successfully`);
    fetchUsers();
  } catch (error) {
    console.error("❌ Error updating admin status:", error);
    console.error("❌ Error response:", error.response?.data);
    console.error("❌ Error status:", error.response?.status);
    showAlert(error.response?.data?.error || error.response?.data?.detail || 'Error updating user', 'danger');
  }
};

// Show alert
const showAlert = (message, variant = 'success') => {
  setAlert({ show: true, message, variant });
  setTimeout(() => setAlert({ show: false, message: '', variant: 'success' }), 3000);
};

// Permissions logic
const canModifyUser = (user) => {
  if (!currentUser) return false;
  
  if (currentUser.is_superuser) {
    // Superuser can modify anyone except themselves
    return user.id !== currentUser.id;
  }

  // Admins can only modify non-admin users
  return currentUser.is_admin && !user.is_admin && !user.is_superuser;
};

// Handle button click
const handleActionClick = (user, type) => {
  setActionUser(user);
  setActionType(type);
  setShowConfirmModal(true);
};

// Confirm action in modal
const handleConfirmAction = () => {
  if (!actionUser) return;



  if (actionType === 'block') {
    handleToggleBlock(actionUser.id, actionUser.is_blocked);
  } else if (actionType === 'admin') {
    handleToggleAdmin(actionUser.id, actionUser.is_admin);
  }

  setShowConfirmModal(false);
  setActionUser(null);
  setActionType('');
};

// Get action text for modal
const getActionText = () => {
  if (!actionUser || !actionType) return '';

  if (actionType === 'block') {
    return actionUser.is_blocked ? 'unblock' : 'block';
  } else if (actionType === 'admin') {
    return actionUser.is_admin ? 'remove admin privileges from' : 'promote to admin';
  }
  return '';
};


  return (
    <Layout title="Users Management">
      <Container fluid className="p-4" style={{ minHeight: '100vh', backgroundColor: theme.colors.background }}>
        {/* Header */}
        <Row className="mb-4">
          <Col>
            <div className="d-flex align-items-center mb-3">
              <Button
                variant="outline-secondary"
                size="sm"
                onClick={() => navigate('/dashboard')}
                className="me-3"
              >
                <BsArrowLeft className="me-1" />
                Back to Dashboard
              </Button>
              <h2 className="mb-0 fw-bold" style={{ color: theme.colors.text }}>
                Users Management
              </h2>
            </div>
            <p className="text-muted mb-0">
              Manage user accounts and permissions
            </p>
          </Col>
        </Row>

        {/* Alert */}
        {alert.show && (
          <Alert 
            variant={alert.variant} 
            dismissible 
            onClose={() => setAlert({ show: false, message: '', variant: 'success' })}
            className="mb-4"
          >
            {alert.message}
          </Alert>
        )}

        {/* Search Bar */}
        <Card className="mb-4 border-0 shadow-sm">
          <Card.Body>
            <Row>
              <Col>
                <InputGroup>
                  <Form.Control
                    type="text"
                    placeholder="Search users by username or email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  />
                  <Button 
                    variant="primary" 
                    onClick={handleSearch}
                    disabled={loading}
                  >
                    <BsSearch />
                  </Button>
                </InputGroup>
              </Col>
            </Row>
          </Card.Body>
        </Card>

        {/* Users Table */}
        <Card className="border-0 shadow-sm">
          <Card.Body className="p-0">
            {loading ? (
              <div className="text-center p-5">
                <Spinner animation="border" variant="primary" />
                <p className="mt-2 text-muted">Loading users...</p>
              </div>
            ) : (
              <Table responsive className="mb-0">
                <thead className="table-light">
                  <tr>
                    <th>User</th>
                    <th>Email</th>
                    <th>Role</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr key={user.id}>
                      <td>
                        <div className="d-flex align-items-center">
                          <div className="me-3">
                            <BsPersonCircle size={32} className="text-muted" />
                          </div>
                          <div>
                            <strong>{user.username}</strong>
                            <br />
                            <small className="text-muted">
                              Joined {new Date(user.date_joined).toLocaleDateString()}
                            </small>
                          </div>
                        </div>
                      </td>
                      <td>{user.email}</td>
                      <td>
                        {user.is_superuser ? (
                          <Badge bg="danger">Super Admin</Badge>
                        ) : user.is_admin ? (
                          <Badge bg="primary">Admin</Badge>
                        ) : (
                          <Badge bg="secondary">User</Badge>
                        )}
                      </td>
                      <td>
                        <Badge bg={user.is_blocked ? 'danger' : 'success'}>
                          {user.is_blocked ? 'Blocked' : 'Active'}
                        </Badge>
                      </td>
                      <td>
                        <div className="d-flex gap-2">
                          {canModifyUser(user) && (
                            <>
                              <Button
                                variant={user.is_blocked ? 'outline-success' : 'outline-danger'}
                                size="sm"
                                onClick={() => handleActionClick(user, 'block')}
                                title={user.is_blocked ? 'Unblock User' : 'Block User'}
                              >
                                {user.is_blocked ? <BsShieldCheck /> : <BsShieldX />}
                              </Button>
                              {currentUser?.is_superuser && (
                                <Button
                                  variant={user.is_admin ? 'outline-warning' : 'outline-primary'}
                                  size="sm"
                                  onClick={() => handleActionClick(user, 'admin')}
                                  title={user.is_admin ? 'Remove Admin' : 'Make Admin'}
                                >
                                  <BsShieldCheck />
                                </Button>
                              )}
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            )}
          </Card.Body>
        </Card>

        {/* Confirmation Modal */}
        <Modal show={showConfirmModal} onHide={() => setShowConfirmModal(false)} centered>
          <Modal.Header closeButton>
            <Modal.Title>Confirm Action</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            Are you sure you want to {getActionText()} <strong>{actionUser?.username}</strong>?
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowConfirmModal(false)}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleConfirmAction}>
              Confirm
            </Button>
          </Modal.Footer>
        </Modal>
      </Container>
    </Layout>
  );
};

export default UsersPage; 