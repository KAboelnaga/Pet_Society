# Comment and Like Features Implementation

This document describes the implementation of comment and like features for the Pet Society application.

## Backend Implementation

### Models

#### Comment Model (`comments/models.py`)

- **Fields**: content, author, post, parent_comment, created_at, updated_at
- **Features**:
  - Support for nested replies using `parent_comment` field
  - Automatic author assignment from authenticated user
  - Proper indexing for performance
  - Properties: `is_reply`, `replies_count`

#### Like Model (`posts/models.py`)

- **Fields**: user, post, is_liked, created_at, updated_at
- **Features**:
  - Composite relationship between User and Post
  - Toggle functionality (`toggle_like()` method)
  - Unique constraint per user-post combination
  - Properties: `likes_count`, `comments_count` on Post model

### API Endpoints

#### Comments API

- `GET /comments/` - List all comments (with optional post_id filter)
- `POST /comments/` - Create a new comment
- `GET /comments/{id}/` - Get comment details with nested replies
- `PUT /comments/{id}/` - Update comment (author only)
- `DELETE /comments/{id}/` - Delete comment (author or post author)
- `POST /comments/{id}/reply/` - Create a reply to a comment
- `GET /comments/post_comments/?post_id={id}` - Get all comments for a specific post

#### Posts API (Enhanced)

- `GET /posts/{id}/` - Get post details with comments
- `POST /posts/{id}/like/` - Like/unlike a post
- `GET /posts/{id}/likes/` - Get all likes for a post
- `GET /posts/{id}/user_like_status/` - Get current user's like status

### Serializers

#### CommentSerializer

- Handles comment creation and updates
- Automatic author assignment
- Support for nested replies

#### LikeSerializer

- Manages like creation and updates
- Automatic user assignment

#### PostDetailSerializer

- Enhanced post serializer with comments
- Includes likes and comments count

## Frontend Implementation

### Components

#### PostCard (Enhanced)

- Displays likes and comments count
- Clickable to navigate to post detail
- Visual indicators for post statistics

#### PostDetail (New)

- Full post display with image and content
- Like/unlike functionality
- Comments section with nested replies
- Comment form for authenticated users
- Reply functionality for comments

### Features

#### Like System

- Heart icon that toggles between outline and filled
- Real-time like count updates
- Authentication required for liking
- Visual feedback for liked state

#### Comment System

- Add new comments to posts
- Reply to existing comments (nested structure)
- Real-time comment count updates
- Proper date formatting
- User authentication required for commenting

#### Navigation

- Clickable post cards navigate to detail view
- Back button for easy navigation
- Responsive design for mobile and desktop

## Database Schema

### New Tables

1. **comments_comment**

   - id, content, author_id, post_id, parent_comment_id, created_at, updated_at

2. **posts_like**
   - id, user_id, post_id, is_liked, created_at, updated_at

### Relationships

- **Post** → **Comment** (One-to-Many)
- **Post** → **Like** (One-to-Many)
- **User** → **Comment** (One-to-Many)
- **User** → **Like** (One-to-Many)
- **Comment** → **Comment** (Self-referencing for replies)

## Usage Examples

### Liking a Post

```javascript
const handleLike = async () => {
  const response = await api.post(`posts/${postId}/like/`);
  setIsLiked(response.data.is_liked);
  setLikesCount(response.data.likes_count);
};
```

### Adding a Comment

```javascript
const handleCommentSubmit = async (e) => {
  e.preventDefault();
  const response = await api.post("comments/", {
    content: newComment,
    post: postId,
    author_username: user.username,
  });
  // Update UI with new comment
};
```

### Replying to a Comment

```javascript
const handleReplySubmit = async (e) => {
  e.preventDefault();
  const response = await api.post(`comments/${commentId}/reply/`, {
    content: replyContent,
    post: postId,
    author_username: user.username,
  });
  // Refresh comments to show new reply
};
```

## Security Features

- **Authentication Required**: Like and comment actions require user authentication
- **Authorization**: Users can only edit/delete their own comments
- **Post Authors**: Can delete any comment on their posts
- **Input Validation**: Proper validation for comment content
- **SQL Injection Protection**: Django ORM provides built-in protection

## Performance Considerations

- **Database Indexes**: Proper indexing on frequently queried fields
- **Eager Loading**: Comments are loaded efficiently with posts
- **Pagination**: Support for paginated comment lists
- **Caching**: Like counts are calculated efficiently using database queries

## Future Enhancements

1. **Real-time Updates**: WebSocket integration for live comment updates
2. **Comment Moderation**: Admin tools for comment management
3. **Rich Text**: Support for markdown or rich text in comments
4. **Comment Reactions**: Like/dislike individual comments
5. **Comment Search**: Search functionality within comments
6. **Notification System**: Notify users of replies and likes

## Testing

The implementation includes:

- Model tests for all new functionality
- API endpoint testing
- Frontend component testing
- Database migration testing

Run tests with:

```bash
python manage.py test comments
python manage.py test posts
```

## Deployment Notes

1. **Database Migrations**: Ensure all migrations are applied
2. **Static Files**: Collect static files for production
3. **Environment Variables**: Configure proper database and security settings
4. **CORS**: Ensure CORS is properly configured for frontend integration
