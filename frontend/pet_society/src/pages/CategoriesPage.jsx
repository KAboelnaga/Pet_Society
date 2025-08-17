import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Container, 
  Row, 
  Col, 
  Card, 
  Button, 
  Table, 
  Modal, 
  Form, 
  Alert, 
  Badge,
  Spinner
} from 'react-bootstrap';
import { BsPlus, BsPencil, BsTrash, BsArrowLeft } from 'react-icons/bs';
import { useTheme } from '../contexts/ThemeContext';
import Layout from '../components/Layout';
import axios from 'axios';

const CategoriesPage = () => {
  const navigate = useNavigate();
  const { theme } = useTheme();
  const [categories, setCategories] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [formData, setFormData] = useState({ name: '', description: '', is_active: true });
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState({ show: false, message: '', variant: 'success' });

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/admin/categories/');
      setCategories(response.data);
    } catch (error) {
      showAlert('Error fetching categories', 'danger');
    } finally {
      setLoading(false);
    }
  };

  const handleShowModal = (category = null) => {
    if (category) {
      setEditingCategory(category);
      setFormData({
        name: category.name,
        description: category.description || '',
        is_active: category.is_active,
      });
    } else {
      setEditingCategory(null);
      setFormData({ name: '', description: '', is_active: true });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingCategory(null);
    setFormData({ name: '', description: '', is_active: true });
  };

  const handleSubmit = async () => {
    try {
      if (editingCategory) {
        await axios.put(`/admin/categories/${editingCategory.id}/`, formData);
        showAlert('Category updated successfully');
      } else {
        await axios.post('/admin/categories/', formData);
        showAlert('Category created successfully');
      }
      handleCloseModal();
      fetchCategories();
    } catch (error) {
      showAlert(error.response?.data?.error || 'Error saving category', 'danger');
    }
  };

  const handleDelete = async (categoryId) => {
    if (window.confirm('Are you sure you want to delete this category?')) {
      try {
        await axios.delete(`/admin/categories/${categoryId}/`);
        showAlert('Category deleted successfully');
        fetchCategories();
      } catch (error) {
        showAlert('Error deleting category', 'danger');
      }
    }
  };

  const showAlert = (message, variant = 'success') => {
    setAlert({ show: true, message, variant });
    setTimeout(() => setAlert({ show: false, message: '', variant: 'success' }), 3000);
  };

  return (
    <Layout title="Categories Management">
      <Container fluid className="p-4">
        {/* Header */}
        <Row className="mb-4">
          <Col>
            <div className="d-flex align-items-center mb-3">
              <Button
                variant="outline-secondary"
                size="sm"
                onClick={() => navigate('/')}
                className="me-3"
              >
                <BsArrowLeft className="me-1" />
                Back to Dashboard
              </Button>
              <h2 className="mb-0 fw-bold" style={{ color: theme.colors.text }}>
                Categories Management
              </h2>
            </div>
            <p className="text-muted mb-0">
              Manage animal categories and types
            </p>
          </Col>
          <Col xs="auto">
            <Button
              variant="primary"
              onClick={() => handleShowModal()}
              className="d-flex align-items-center"
            >
              <BsPlus className="me-1" />
              Add Category
            </Button>
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

        {/* Categories Table */}
        <Card className="border-0 shadow-sm">
          <Card.Body className="p-0">
            {loading ? (
              <div className="text-center p-5">
                <Spinner animation="border" variant="primary" />
                <p className="mt-2 text-muted">Loading categories...</p>
              </div>
            ) : (
              <Table responsive className="mb-0">
                <thead className="table-light">
                  <tr>
                    <th>Name</th>
                    <th>Description</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {categories.map((category) => (
                    <tr key={category.id}>
                      <td>
                        <strong>{category.name}</strong>
                      </td>
                      <td>
                        {category.description || (
                          <span className="text-muted">No description</span>
                        )}
                      </td>
                      <td>
                        <Badge bg={category.is_active ? 'success' : 'secondary'}>
                          {category.is_active ? 'Active' : 'Inactive'}
                        </Badge>
                      </td>
                      <td>
                        <div className="d-flex gap-2">
                          <Button
                            variant="outline-primary"
                            size="sm"
                            onClick={() => handleShowModal(category)}
                          >
                            <BsPencil />
                          </Button>
                          <Button
                            variant="outline-danger"
                            size="sm"
                            onClick={() => handleDelete(category.id)}
                          >
                            <BsTrash />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            )}
          </Card.Body>
        </Card>

        {/* Add/Edit Modal */}
        <Modal show={showModal} onHide={handleCloseModal} centered>
          <Modal.Header closeButton>
            <Modal.Title>
              {editingCategory ? 'Edit Category' : 'Add New Category'}
            </Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form>
              <Form.Group className="mb-3">
                <Form.Label>Name</Form.Label>
                <Form.Control
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Enter category name"
                  required
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Description</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Enter category description (optional)"
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Check
                  type="switch"
                  id="active-switch"
                  label="Active"
                  checked={formData.is_active}
                  onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                />
              </Form.Group>
            </Form>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={handleCloseModal}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleSubmit}>
              {editingCategory ? 'Update' : 'Create'}
            </Button>
          </Modal.Footer>
        </Modal>
      </Container>
    </Layout>
  );
};

export default CategoriesPage; 