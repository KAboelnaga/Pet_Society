# Troubleshooting Guide

## Common Issues and Solutions

### 🚨 **Build Errors**

#### Issue: `react-icons/bs` import error
**Error**: `Rollup failed to resolve import "react-icons/bs"`
**Solution**: Install react-icons package
```bash
npm install react-icons
```

#### Issue: Bootstrap JavaScript not working
**Error**: Dropdowns, modals, or other Bootstrap JS features not working
**Solution**: Ensure Bootstrap JS is properly imported
- Check that `./utils/bootstrap.js` is imported in `main.jsx`
- Verify `@popperjs/core` is installed

### 🎨 **Theme Issues**

#### Issue: Theme toggle not working
**Check**:
1. Open browser console (F12) and look for errors
2. Verify `ThemeContext.jsx` is properly imported
3. Check if `data-bs-theme` attribute is being set on `<html>` element

#### Issue: Dark mode not applying correctly
**Check**:
1. Verify CSS variables are defined in `index.css`
2. Check if Bootstrap dark mode CSS is loaded
3. Ensure `[data-bs-theme="dark"]` selectors are working

### 📱 **Responsive Issues**

#### Issue: Layout not responsive on mobile
**Check**:
1. Verify Bootstrap CSS is loaded
2. Check if viewport meta tag is present in `index.html`
3. Ensure Bootstrap classes are used correctly

### 🔧 **Development Server Issues**

#### Issue: `npm run dev` not working
**Solutions**:
1. Make sure you're in the correct directory: `frontend/pet_society`
2. Clear node_modules and reinstall:
   ```bash
   rm -rf node_modules package-lock.json
   npm install
   ```
3. Check if port 5173 is available

#### Issue: Hot reload not working
**Solutions**:
1. Check if Vite is running properly
2. Clear browser cache
3. Restart the development server

### 🐛 **Runtime Errors**

#### Issue: Components not rendering
**Check**:
1. Open browser console (F12) for JavaScript errors
2. Verify all imports are correct
3. Check if all required dependencies are installed

#### Issue: API calls failing
**Check**:
1. Verify backend server is running
2. Check API endpoints in browser network tab
3. Verify CORS settings on backend

### 🎯 **Quick Fixes**

#### Reset everything and start fresh:
```bash
# Stop any running processes
# Clear everything
rm -rf node_modules package-lock.json dist

# Reinstall dependencies
npm install

# Start development server
npm run dev
```

#### Check if all dependencies are installed:
```bash
npm list --depth=0
```

#### Verify Bootstrap is working:
1. Open browser console
2. Type: `document.documentElement.getAttribute('data-bs-theme')`
3. Should return 'light' or 'dark'

### 📋 **Checklist for Working Application**

- [ ] All dependencies installed (`npm install` completed successfully)
- [ ] Development server starts without errors (`npm run dev`)
- [ ] Application loads in browser without console errors
- [ ] Theme toggle button appears in navigation
- [ ] Theme switching works (check `data-bs-theme` attribute)
- [ ] Bootstrap components render correctly
- [ ] Responsive design works on different screen sizes
- [ ] All pages load without errors
- [ ] Navigation between pages works
- [ ] Forms and modals work properly

### 🔍 **Debugging Steps**

1. **Check Console**: Always check browser console (F12) for errors
2. **Check Network**: Look at Network tab for failed requests
3. **Check Elements**: Inspect HTML to see if Bootstrap classes are applied
4. **Check Sources**: Verify all files are loading correctly
5. **Test Components**: Test each component individually

### 📞 **Still Having Issues?**

If you're still experiencing problems:

1. **Check the console**: What specific error messages are you seeing?
2. **Describe the issue**: What exactly isn't working?
3. **Check the checklist**: Which items are failing?
4. **Try the quick fixes**: Did the reset help?

### 🛠️ **Useful Commands**

```bash
# Check if all dependencies are installed
npm list --depth=0

# Check for outdated packages
npm outdated

# Clear npm cache
npm cache clean --force

# Check Vite configuration
npm run build

# Start development server
npm run dev
```

