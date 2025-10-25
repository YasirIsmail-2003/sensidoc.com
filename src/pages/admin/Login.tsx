// ...existing code...
import Login from '../auth/Login';

// Pre-fill default admin credentials for convenience in demo/local
// These can be overridden by user input in the Login component.
// Note: The Login component reads initial state from URL params if present.

// Admin Login simply reuses the main Login component, but you can customize as needed
export default function AdminLogin() {
  // Keep for compatibility; render same workstation login UI
  return <Login role="admin" />;
}
