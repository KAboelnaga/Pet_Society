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
import { getAbsoluteImageUrl } from '../config/api';

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
    const response = await api.get('/admins/posts/?ordering=-created_at');
    console.log("📌 Initial Posts API Response:", response.data);
    console.log("📌 First post data:", response.data.results?.[0] || response.data[0]);
    setPosts(response.data.results || response.data);
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
      const response = await api.get(`/admins/posts/?search=${searchTerm}&ordering=-created_at`);
      console.log("📌 Search API Response:", response.data.results);
      setPosts(response.data.results);
    } catch (error) {
      showAlert('Error searching posts', 'danger');
    } finally {
      setLoading(false);
    }
  };

  const handleViewPost = async (postId) => {
    try {
      const response = await api.get(`/admins/posts/${postId}/`);
      console.log("📌 Post Details API Response:", response.data);
      setSelectedPost(response.data);
      setShowViewModal(true);
    } catch (error) {
      console.error("Error fetching post details:", error);
      showAlert('Error fetching post details', 'danger');
    }
  };

const handleDeletePost = async (postId) => {
  if (!window.confirm("Are you sure you want to delete this post?")) return;

  try {
    const response = await api.delete(`/admins/posts/${postId}/delete/`);
    console.log("📌 Delete Response:", response.data);

    showAlert("Post deleted successfully", "success");
    setPosts((prevPosts) => prevPosts.filter((post) => post.id !== postId));
  } catch (error) {
    console.error("Error deleting post:", error);
    showAlert(error.response?.data?.message || "Error deleting post", "danger");
  }
};




  const showAlert = (message, variant = 'success') => {
    setAlert({ show: true, message, variant });
    setTimeout(() => setAlert({ show: false, message: '', variant: 'success' }), 3000);
  };

  const getPostTypeColor = (type) => {
    switch (type?.toLowerCase()) {
      case 'adoption':
        return 'success';
      case 'lost_found':
        return 'warning';
      case 'services':
        return 'primary';
      default:
        return 'secondary';
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
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
              <Col>
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
                    <th>Post Type</th>
                    <th>Author</th>
                    <th>Category</th>
                    <th>Likes</th>
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
                                src={getAbsoluteImageUrl(post.image)}
                                alt={post.title}
                                width={50}
                                height={50}
                                className="rounded"
                                style={{ objectFit: 'cover' }}
                                onError={(e) => {
                                  console.error('Image failed to load:', post.image, 'Absolute URL:', getAbsoluteImageUrl(post.image));
                                  e.target.style.display = 'none';
                                }}
                                onLoad={() => {
                                  console.log('Image loaded successfully:', getAbsoluteImageUrl(post.image));
                                }}
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
                              {post.content?.substring(0, 50)}
                              {post.content?.length > 50 && '...'}
                            </small>
                          </div>
                        </div>
                      </td>
                      <td>
                        <Badge bg={getPostTypeColor(post.post_type)}>
                          {post.post_type || 'services'}
                        </Badge>
                      </td>
                      <td>
                        <div>
                          <strong>{post.user?.username || post.user}</strong>
                          <br />
                          <small className="text-muted">{post.user?.email}</small>
                        </div>
                      </td>
                      <td>
                        <div>
                          <strong>{post.category?.name || post.category}</strong>
                        </div>
                      </td>
                      <td>
                        <Badge bg="info">
                          {post.likes_count || 0} likes
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
                        src={getAbsoluteImageUrl(selectedPost.image)}
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
                    <p className="text-muted">{selectedPost.content}</p>

                    <div className="mb-3">
                      <strong>Post Type:</strong>
                      <Badge bg={getPostTypeColor(selectedPost.post_type)} className="ms-2">
                        {selectedPost.post_type || 'services'}
                      </Badge>
                    </div>

                    <div className="mb-3">
                      <strong>Author:</strong> {selectedPost.user?.username || selectedPost.user}
                    </div>

                    <div className="mb-3">
                      <strong>Category:</strong> {selectedPost.category?.name || selectedPost.category}
                    </div>

                    <div className="mb-3">
                      <strong>Likes:</strong> {selectedPost.likes_count || 0}
                    </div>

                    <div className="mb-3">
                      <strong>Comments:</strong> {selectedPost.comments_count || 0}
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