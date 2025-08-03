# Pet Society Admin Dashboard

A comprehensive admin dashboard for managing a pet adoption/sale/mating platform built with Django (Backend) and React (Frontend).

## Features

### Backend (Django)
- **Authentication**: JWT-based authentication for admin access
- **User Management**: Block/unblock users, promote to admin
- **Category Management**: CRUD operations for animal categories
- **Post Management**: View and delete inappropriate posts
- **Role-based Permissions**: Superuser and admin roles with different privileges
- **RESTful API**: Clean API endpoints following Django REST framework standards

### Frontend (React)
- **Modern UI**: Material-UI components with responsive design
- **Protected Routes**: Authentication guards for admin access
- **Dashboard**: Overview with statistics and navigation
- **User Management**: Search, block, and promote users
- **Category Management**: Add, edit, and delete categories
- **Post Management**: View and delete posts with detailed information

## Project Structure

```
Pet_Society/
├── backend/
│   └── pet_society/
│       ├── admins/          # Admin app with models, views, serializers
│       ├── posts/           # Posts app for animal listings
│       ├── users/           # User management and authentication
│       └── pet_society/     # Main Django project settings
└── frontend/
    └── pet_society/
        └── src/
            ├── contexts/    # Authentication context
            ├── pages/       # React components for different pages
            └── App.jsx      # Main application component
```

## Setup Instructions

### Backend Setup

1. **Navigate to backend directory:**
   ```bash
   cd backend/pet_society
   ```

2. **Create and activate virtual environment:**
   ```bash
   python3 -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. **Install dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

4. **Run migrations:**
   ```bash
   python manage.py makemigrations
   python manage.py migrate
   ```

5. **Create superuser:**
   ```bash
   python manage.py createsuperuser
   ```

6. **Start the development server:**
   ```bash
   python manage.py runserver
   ```

The backend will be available at `http://localhost:8000`

### Frontend Setup

1. **Navigate to frontend directory:**
   ```bash
   cd frontend/pet_society
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start the development server:**
   ```bash
   npm run dev
   ```

The frontend will be available at `http://localhost:5173`

## API Endpoints

### Authentication
- `POST /api/auth/login/` - Admin login
- `GET /api/auth/profile/` - Get admin profile
- `POST /api/auth/logout/` - Admin logout

### Dashboard
- `GET /api/admin/dashboard/stats/` - Get dashboard statistics

### Categories
- `GET /api/admin/categories/` - List all categories
- `POST /api/admin/categories/` - Create new category
- `GET /api/admin/categories/{id}/` - Get category details
- `PUT /api/admin/categories/{id}/` - Update category
- `DELETE /api/admin/categories/{id}/` - Delete category

### Users
- `GET /api/admin/users/` - List all users
- `GET /api/admin/users/{id}/` - Get user details
- `PATCH /api/admin/users/{id}/update/` - Update user (block/promote)

### Posts
- `GET /api/admin/posts/` - List all posts
- `GET /api/admin/posts/{id}/` - Get post details
- `DELETE /api/admin/posts/{id}/delete/` - Delete post

## Usage

### Admin Login
1. Open `http://localhost:5173/login`
2. Use the superuser credentials created during setup
3. You'll be redirected to the dashboard upon successful login

### Dashboard Overview
- View platform statistics (users, posts, categories, blocked users)
- Navigate to different management sections using the cards

### User Management
- View all users with their roles and status
- Search users by name, email, or username
- Block/unblock users
- Promote users to admin (superuser only can demote other admins)

### Category Management
- Add new animal categories (e.g., Cats, Dogs, Birds)
- Edit existing categories
- Delete categories
- Toggle category active status

### Post Management
- View all animal posts with details
- Search posts by title, user, or category
- View detailed post information
- Delete inappropriate posts

## Security Features

- **JWT Authentication**: Secure token-based authentication
- **Role-based Access**: Different permissions for admin and superuser
- **Protected Routes**: Frontend routes are protected with authentication guards
- **Permission Checks**: Backend validates permissions before allowing operations

## Admin Roles

### Superuser
- Can perform all operations
- Can modify other admins
- Can delete other admins
- Full system access

### Admin
- Can manage regular users
- Can manage categories and posts
- Cannot modify other admins
- Cannot delete other admins

## Technologies Used

### Backend
- Django 5.2.4
- Django REST Framework 3.16.0
- Django CORS Headers 4.7.0
- Django REST Framework Simple JWT 5.3.1
- Pillow 11.3.0 (for image handling)

### Frontend
- React 19.1.0
- React Router DOM 6.x
- Material-UI 5.x
- Axios (for API calls)

## Development

### Adding New Features
1. Create models in the appropriate Django app
2. Add serializers for API responses
3. Create views with proper permissions
4. Add URL patterns
5. Create React components for the frontend
6. Update routing in App.jsx

### Database Changes
1. Modify models in Django apps
2. Create migrations: `python manage.py makemigrations`
3. Apply migrations: `python manage.py migrate`

### Frontend Changes
1. Modify React components
2. The development server will automatically reload changes

## Troubleshooting

### Common Issues

1. **CORS Errors**: Ensure the backend CORS settings include the frontend URL
2. **Authentication Issues**: Check that JWT tokens are being sent correctly
3. **Database Errors**: Run migrations after model changes
4. **Port Conflicts**: Change ports in settings if needed

### Logs
- Backend logs are displayed in the terminal running the Django server
- Frontend logs are available in the browser console

## Contributing

1. Follow the existing code structure
2. Add proper error handling
3. Include appropriate permissions
4. Test all functionality before submitting

## License

This project is for educational purposes and can be extended for commercial use.
