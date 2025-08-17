# Pet Society Admin Dashboard

A modern, responsive admin dashboard for managing the Pet Society platform, built with React and Bootstrap.

## Features

### 🎨 **Theme System**
- **Bootstrap-based UI**: Modern, responsive design using Bootstrap 5
- **Dark/Light Mode**: Toggle between dark and light themes
- **Browser Preference Detection**: Automatically detects and applies user's browser theme preference
- **Persistent Theme**: Remembers user's theme choice across sessions
- **Theme Toggle**: Available on all pages in the navigation header

### 📱 **Responsive Design**
- **Mobile-First**: Optimized for all screen sizes
- **Bootstrap Grid**: Responsive layout system
- **Touch-Friendly**: Optimized for touch devices

### 🔐 **Authentication & Security**
- **Protected Routes**: Secure access to admin features
- **User Management**: Manage user accounts and permissions
- **Role-Based Access**: Super Admin and Admin roles

### 📊 **Dashboard Features**
- **Statistics Overview**: Real-time platform statistics
- **Quick Actions**: Easy navigation to key features
- **Interactive Cards**: Hover effects and animations

### 🗂️ **Management Pages**
- **Categories Management**: Create, edit, and manage animal categories
- **Users Management**: View, block/unblock, and manage user permissions
- **Posts Management**: Review and manage animal posts

## Technology Stack

- **Frontend**: React 19
- **UI Framework**: Bootstrap 5
- **Icons**: Bootstrap Icons
- **Routing**: React Router DOM
- **HTTP Client**: Axios
- **State Management**: React Context API

## Getting Started

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn

### Installation

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Start Development Server**
   ```bash
   npm run dev
   ```

3. **Build for Production**
   ```bash
   npm run build
   ```

## Theme System

The application features a sophisticated theme system:

### Automatic Theme Detection
- Detects user's browser theme preference on first visit
- Respects system-level dark/light mode settings
- Automatically switches when browser preference changes (if no manual preference is set)

### Manual Theme Control
- Theme toggle button available in the navigation header
- User's choice is saved to localStorage
- Persists across browser sessions

### Theme Features
- **Light Mode**: Clean, bright interface with blue accent colors
- **Dark Mode**: Easy on the eyes with dark backgrounds and proper contrast
- **Smooth Transitions**: All theme changes are animated for better UX

## Component Structure

```
src/
├── components/
│   ├── Layout.jsx          # Shared layout with navigation
│   └── LoadingScreen.jsx   # Loading state component
├── contexts/
│   ├── AuthContext.jsx     # Authentication state
│   └── ThemeContext.jsx    # Theme management
├── pages/
│   ├── Dashboard.jsx       # Main dashboard
│   ├── LoginPage.jsx       # Authentication page
│   ├── CategoriesPage.jsx  # Category management
│   ├── UsersPage.jsx       # User management
│   └── PostsPage.jsx       # Post management
└── App.jsx                 # Main application component
```

## Key Features

### 🎯 **User Experience**
- **Intuitive Navigation**: Clear, accessible navigation structure
- **Loading States**: Proper loading indicators for all async operations
- **Error Handling**: User-friendly error messages and alerts
- **Responsive Tables**: Optimized for mobile and desktop viewing

### 🔧 **Developer Experience**
- **Modular Components**: Reusable, well-structured components
- **Context API**: Clean state management without external libraries
- **Bootstrap Utilities**: Leveraging Bootstrap's utility classes
- **Custom CSS**: Minimal custom styling on top of Bootstrap

### 🎨 **Design System**
- **Consistent Spacing**: Using Bootstrap's spacing utilities
- **Color Palette**: Semantic color usage (primary, success, danger, etc.)
- **Typography**: Bootstrap's typography system
- **Shadows & Effects**: Subtle animations and hover effects

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License.
