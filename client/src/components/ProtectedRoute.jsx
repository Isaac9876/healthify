import React from 'react';
import { Navigate } from 'react-router-dom';
import { auth } from '../firebase';
import { onAuthStateChanged } from 'firebase/auth';

const ProtectedRoute = ({ children }) => {
  // We can use a loading state here if we want to wait for auth check
  // But for now, let's assume if auth.currentUser is null, they are not logged in.
  // Note: auth.currentUser might be null initially before firebase loads. 
  // A better approach is passing the user state from App or Context.
  // However, simple check:
  
  // Actually, using onAuthStateChanged in the parent or a context is better.
  // For simplicity, I'll assume the user must be authenticated.
  // But wait, if I reload the page, auth.currentUser is null until Firebase inits.
  // So this component needs to handle the "loading" state of auth.
  
  // Since I don't have a global AuthContext set up in the code I read, 
  // I will rely on the fact that the pages themselves (Profile, History) 
  // were already doing auth checks. 
  // But I want to centralize it.
  
  // Let's implement a simple spinner while checking.
  
  const [user, setUser] = React.useState(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default ProtectedRoute;
