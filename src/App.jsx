import { useEffect, useState } from 'react';
import { BrowserRouter as Router, Route, Routes, Link, Navigate } from 'react-router-dom';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { auth, database } from './firebase';
import { ref, get } from 'firebase/database';
import Login from './Login';
import Signup from './Signup';
import NoticeForm from './NoticeForm';
import ApproveNotice from './ApproveNotice';
import NoticeDetails from './NoticeDetail'; // Import the NoticeDetails component

const App = () => {
  const [user, setUser] = useState(null);
  const [isHOD, setIsHOD] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        // Fetch isHOD status from the database
        get(ref(database, 'users/' + currentUser.uid)).then((snapshot) => {
          if (snapshot.exists()) {
            setIsHOD(snapshot.val().isHOD);
          } else {
            console.log('No user data available');
          }
        }).catch((error) => {
          console.error('Error fetching user data:', error);
        });
      } else {
        setIsHOD(false);
      }
    });
    return () => unsubscribe();
  }, []);

  const handleLogout = () => {
    signOut(auth)
      .then(() => {
        alert('Logged out successfully!');
      })
      .catch((error) => console.error('Logout error:', error));
  };

  return (
    <Router>
      <div className="p-4">
        <nav className="mb-4 flex justify-between">
          <Link to="/" className="text-lg font-bold">Home</Link>
          {user ? (
            <>
              {isHOD && (
                <>
                  <Link to="/submit-notice" className="ml-4 text-green-500">Submit Notice</Link>
                  <Link to="/approve-notice" className="ml-4 text-green-500">Approve Notice</Link>
                </>
              )}
              <button onClick={handleLogout} className="ml-4 text-red-500">Logout</button>
            </>
          ) : (
            <>
              <Link to="/login" className="text-blue-500">Login</Link>
              <Link to="/signup" className="ml-4 text-blue-500">Sign Up</Link>
            </>
          )}
        </nav>

        <Routes>
          <Route path="/login" element={user ? <Navigate to="/" /> : <Login />} />
          <Route path="/signup" element={user ? <Navigate to="/" /> : <Signup />} />
          <Route path="/submit-notice" element={user && isHOD ? <NoticeForm /> : <Navigate to="/" />} />
          <Route path="/approve-notice" element={user && isHOD ? <ApproveNotice /> : <Navigate to="/" />} />
          <Route path="/notice-details/:noticeId" element={<NoticeDetails />} /> {/* New route for notice details */}
          <Route path="/" element={user ? <NoticeForm /> : <p>Please log in to submit a notice.</p>} />
        </Routes>
      </div>
    </Router>
  );
};

export default App;
