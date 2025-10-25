// ...existing code...
import Login from '../auth/Login';

// Doctor Login simply reuses the main Login component, but you can customize as needed
export default function DoctorLogin() {
  return <Login role="doctor" />;
}
