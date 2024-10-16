import { useState, useEffect } from 'react';
import { ref, set, get } from "firebase/database";
import { ref as storageRef, uploadBytes, getDownloadURL } from "firebase/storage";
import { database, auth, storage } from './firebase';
import { onAuthStateChanged } from "firebase/auth";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const NoticeForm = () => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [file, setFile] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [user, setUser] = useState(null);
  const [isHOD, setIsHOD] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        get(ref(database, 'users/' + currentUser.uid)).then((snapshot) => {
          if (snapshot.exists()) {
            setIsHOD(snapshot.val().isHOD);
          } else {
            toast.error("No user data available");
          }
        }).catch((error) => {
          console.error("Error fetching user data:", error);
          toast.error("Error fetching user data");
        });
      } else {
        setUser(null);
        setIsHOD(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const handleFileUpload = async (file, path) => {
    const fileRef = storageRef(storage, `${path}/${Date.now()}_${file.name}`);
    await uploadBytes(fileRef, file);
    const fileURL = await getDownloadURL(fileRef);
    return fileURL;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (title === '' || content === '') {
      toast.error('Please fill in both fields');
      return;
    }

    if (!user) {
      toast.error('Please log in to submit a notice.');
      return;
    }

    setIsLoading(true);

    try {
      const noticeData = {
        title: title,
        content: content,
        timestamp: new Date().toISOString(),
        user: {
          uid: user.uid,
          email: user.email,
        },
        isApproved: isHOD,
      };

      if (file) {
        const fileType = file.type;
        let path = '';

        if (fileType === 'application/pdf') {
          path = 'Notices/PDFs';
        } else if (fileType.startsWith('image/')) {
          path = 'Notices/Images';
        } else {
          toast.error('Unsupported file type. Please upload a PDF or an image.');
          setIsLoading(false);
          return;
        }

        const fileURL = await handleFileUpload(file, path);
        noticeData.fileUrl = fileURL;
        noticeData.fileType = fileType;
      }

      const noticeRef = ref(database, (isHOD ? 'ApprovedNotices/' : 'UnApprovedNotices/') + Date.now());
      await set(noticeRef, noticeData);

      toast.success('Notice uploaded successfully!');
      setTitle('');
      setContent('');
      setFile(null);
    } catch (error) {
      console.error('Error uploading notice:', error);
      toast.error('Error uploading notice. Check console for details.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center h-[80vh] p-6">
      <div className="bg-white shadow-md rounded-lg p-8 max-w-lg w-full">
        <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">Submit a Notice</h2>
        <ToastContainer />
        {!user ? (
          <p className="text-center text-red-500">Please log in to submit a notice.</p>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700">Notice Title:</label>
              <input
                type="text"
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                placeholder="Enter notice title"
              />
            </div>
            <div>
              <label htmlFor="content" className="block text-sm font-medium text-gray-700">Notice Content:</label>
              <textarea
                id="content"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                placeholder="Enter notice content"
                rows="4"
              ></textarea>
            </div>
            <div>
              <label htmlFor="file" className="block text-sm font-medium text-gray-700">Upload File (PDF or Image):</label>
              <input
                type="file"
                id="file"
                accept="application/pdf, image/*"
                onChange={(e) => setFile(e.target.files[0])}
                className="mt-1 block w-full"
              />
            </div>
            <button
              type="submit"
              disabled={isLoading}
              className={`w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {isLoading ? 'Uploading...' : 'Submit Notice'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default NoticeForm;
  