import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { ref, get } from 'firebase/database';
import { database } from './firebase';

const NoticeDetails = () => {
  const { noticeId } = useParams(); // Get the notice ID from the URL
  const [notice, setNotice] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNotice = async () => {
      try {
        const noticeRef = ref(database, `UnApprovedNotices/${noticeId}`);
        const snapshot = await get(noticeRef);
        if (snapshot.exists()) {
          setNotice(snapshot.val());
        } else {
          console.log('Notice not found');
        }
        setLoading(false);
      } catch (error) {
        console.error('Error fetching notice details:', error);
        setLoading(false);
      }
    };

    fetchNotice();
  }, [noticeId]);

  if (loading) {
    return <p>Loading...</p>;
  }

  if (!notice) {
    return <p>Notice not found</p>;
  }

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4">{notice.title}</h2>
      <p className="text-gray-700 mb-4">{notice.content}</p>
      {notice.fileUrl && (
        <iframe
          src={notice.fileUrl}
          title="Document Preview"
          className="w-full h-96 border"
          frameBorder="0"
        />
      )}
    </div>
  );
};

export default NoticeDetails;
