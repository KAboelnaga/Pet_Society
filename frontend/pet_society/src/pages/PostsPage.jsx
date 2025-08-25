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
  Modal,
  Image
} from 'react-bootstrap';
import { BsSearch, BsTrash, BsEye, BsArrowLeft, BsFileImage } from 'react-icons/bs';
import { useTheme } from '../context/ThemeContext';
import Layout from '../components/Layout';
import api from '../services/api';

const PostsPage = () => {
  const navigate = useNavigate();
  const { theme } = useTheme();
  const [posts, setPosts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPost, setSelectedPost] = useState(null);
  const [showViewModal, setShowViewModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState({ show: false, message: '', variant: 'success' });

  useEffect(() => {
    fetchPosts();
  }, []);

const fetchPosts = async () => {
  try {
    setLoading(true);
    const response = await api.get('/posts/');
    console.log(" API Response:", response.data.results);
    setPosts(response.data.results);
  } catch (error) {
    console.error(" Error fetching posts:", error);
    showAlert('Error fetching posts', 'danger');
  } finally {
    setLoading(false);
  }
};

  
  const handleSearch = async () => {
    try {
      setLoading(true);
      const response = await api.get(`posts/?search=${searchTerm}`);
      setPosts(response.data);
    } catch (error) {
      showAlert('Error searching posts', 'danger');
    } finally {
      setLoading(false);
    }
  };

  const handleViewPost = async (postId) => {
    try {
      const response = await api.get(`posts/${postId}/`);
      setSelectedPost(response.data);
      setShowViewModal(true);
    } catch (error) {
      showAlert('Error fetching post details', 'danger');
    }
  };

const handleDeletePost = async (postId) => {
  const token = localStorage.getItem("token");
  if (!token) return window.alert("Not authorized");

  if (!window.confirm("Are you sure you want to delete this post?")) return;

  try {
    const response = await fetch(
      `http://localhost:8000/api/posts/${postId}/`,
      {
        method: "DELETE",
        headers: {
          "Authorization": `Token ${token}`,
          "Content-Type": "application/json"
        }
      }
    );

    if (response.ok) {
      window.alert("Post deleted successfully");
      setPosts((prevPosts) => prevPosts.filter((post) => post.id !== postId));
    } else {
      window.alert("Failed to delete post");
      console.error("Response status:", response.status, await response.text());
    }
  } catch (error) {
    console.error("Error deleting post:", error);
    window.alert("Error deleting post");
  }
};




  const showAlert = (message, variant = 'success') => {
    setAlert({ show: true, message, variant });
    setTimeout(() => setAlert({ show: false, message: '', variant: 'success' }), 3000);
  };

  const getPostTypeColor = (type) => {
    switch (type?.toLowerCase()) {
      case 'dog':
        return 'primary';
      case 'cat':
        return 'info';
      case 'bird':
        return 'warning';
      case 'fish':
        return 'success';
      default:
        return 'secondary';
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <Layout title="Posts Management">
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
                Posts Management
              </h2>
            </div>
            <p className="text-muted mb-0">
              Manage animal posts and listings
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
              <Col md={6}>
                <InputGroup>
                  <Form.Control
                    type="text"
                    placeholder="Search posts by title, description, or animal type..."
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

        {/* Posts Table */}
        <Card className="border-0 shadow-sm">
          <Card.Body className="p-0">
            {loading ? (
              <div className="text-center p-5">
                <Spinner animation="border" variant="primary" />
                <p className="mt-2 text-muted">Loading posts...</p>
              </div>
            ) : (
              <Table responsive className="mb-0">
                <thead className="table-light">
                  <tr>
                    <th>Post</th>
                    <th>Animal Type</th>
                    <th>Owner</th>
                    <th>Status</th>
                    <th>Created</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {posts.map((post) => (
                    <tr key={post.id}>
                      <td>
                        <div className="d-flex align-items-center">
                          <div className="me-3">
                            {post.image ? (
                              <Image 
                                src={post.image} 
                                alt={post.title}
                                width={50}
                                height={50}
                                className="rounded"
                                style={{ objectFit: 'cover' }}
                              />
                            ) : (
                              <div 
                                className="d-flex align-items-center justify-content-center rounded"
                                style={{
                                  width: '50px',
                                  height: '50px',
                                  backgroundColor: '#f8f9fa',
                                  color: '#6c757d'
                                }}
                              >
                                <BsFileImage size={24} />
                              </div>
                            )}
                          </div>
                          <div>
                            <strong>{post.title}</strong>
                            <br />
                            <small className="text-muted">
                              {post.description?.substring(0, 50)}
                              {post.description?.length > 50 && '...'}
                            </small>
                          </div>
                        </div>
                      </td>
                      <td>
                        <Badge bg={getPostTypeColor(post.animal_type)}>
                          {post.animal_type}
                        </Badge>
                      </td>
                      <td>
                        <div>
                          <strong>{post.owner?.username}</strong>
                          <br />
                          <small className="text-muted">{post.owner?.email}</small>
                        </div>
                      </td>
                      <td>
                        <Badge bg={post.is_active ? 'success' : 'secondary'}>
                          {post.is_active ? 'Active' : 'Inactive'}
                        </Badge>
                      </td>
                      <td>
                        <small className="text-muted">
                          {formatDate(post.created_at)}
                        </small>
                      </td>
                      <td>
                        <div className="d-flex gap-2">
                          <Button
                            variant="outline-primary"
                            size="sm"
                            onClick={() => handleViewPost(post.id)}
                            title="View Post"
                          >
                            <BsEye />
                          </Button>
                          <Button
                            variant="outline-danger"
                            size="sm"
                            onClick={() => handleDeletePost(post.id)}
                            title="Delete Post"
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

        {/* View Post Modal */}
        <Modal 
          show={showViewModal} 
          onHide={() => setShowViewModal(false)} 
          size="lg"
          centered
        >
          <Modal.Header closeButton>
            <Modal.Title>Post Details</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            {selectedPost && (
              <div>
                <Row>
                  <Col md={6}>
                    {selectedPost.image ? (
                      <Image 
                        src={selectedPost.image} 
                        alt={selectedPost.title}
                        fluid
                        className="rounded mb-3"
                      />
                    ) : (
                      <div 
                        className="d-flex align-items-center justify-content-center rounded mb-3"
                        style={{
                          height: '200px',
                          backgroundColor: '#f8f9fa',
                          color: '#6c757d'
                        }}
                      >
                        <BsFileImage size={48} />
                      </div>
                    )}
                  </Col>
                  <Col md={6}>
                    <h5>{selectedPost.title}</h5>
                    <p className="text-muted">{selectedPost.description}</p>
                    
                    <div className="mb-3">
                      <strong>Animal Type:</strong>
                      <Badge bg={getPostTypeColor(selectedPost.animal_type)} className="ms-2">
                        {selectedPost.animal_type}
                      </Badge>
                    </div>
                    
                    <div className="mb-3">
                      <strong>Owner:</strong> {selectedPost.owner?.username}
                    </div>
                    
                    <div className="mb-3">
                      <strong>Status:</strong>
                      <Badge bg={selectedPost.is_active ? 'success' : 'secondary'} className="ms-2">
                        {selectedPost.is_active ? 'Active' : 'Inactive'}
                      </Badge>
                    </div>
                    
                    <div className="mb-3">
                      <strong>Created:</strong> {formatDate(selectedPost.created_at)}
                    </div>
                    
                    {selectedPost.updated_at && (
                      <div>
                        <strong>Updated:</strong> {formatDate(selectedPost.updated_at)}
                      </div>
                    )}
                  </Col>
                </Row>
              </div>
            )}
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowViewModal(false)}>
              Close
            </Button>
          </Modal.Footer>
        </Modal>
      </Container>
    </Layout>
  );
};

export default PostsPage; 