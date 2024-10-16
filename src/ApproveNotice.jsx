import { useEffect, useState } from 'react';
import { ref, get, set, remove } from 'firebase/database';
import { database } from './firebase'; // Import Firebase database reference
import { toast } from 'react-toastify'; // Import toast for notifications
import { Link } from 'react-router-dom'; // Import Link for navigation

const ApproveNotice = () => {
  const [unapprovedNotices, setUnapprovedNotices] = useState([]);

  // Fetch Unapproved Notices
  useEffect(() => {
    const fetchNotices = async () => {
      try {
        const noticesRef = ref(database, 'UnApprovedNotices');
        const snapshot = await get(noticesRef);
        if (snapshot.exists()) {
          const noticesData = snapshot.val();
          const noticesList = Object.keys(noticesData).map((key) => ({
            id: key,
            ...noticesData[key],
          }));
          setUnapprovedNotices(noticesList);
        } else {
          setUnapprovedNotices([]);
        }
      } catch (error) {
        console.error('Error fetching unapproved notices:', error);
        toast.error('Error fetching unapproved notices');
      }
    };

    fetchNotices();
  }, []);

  // Approve Notice
  const handleApprove = async (notice) => {
    try {
      // Move notice to ApprovedNotices
      const approvedRef = ref(database, `ApprovedNotices/${notice.id}`);
      await set(approvedRef, {
        ...notice,
        isApproved: true,
        approvedAt: new Date().toISOString(),
      });

      // Remove notice from UnApprovedNotices
      const unapprovedRef = ref(database, `UnApprovedNotices/${notice.id}`);
      await remove(unapprovedRef);

      // Update local state
      setUnapprovedNotices((prevNotices) => prevNotices.filter((n) => n.id !== notice.id));

      toast.success('Notice approved successfully!');
    } catch (error) {
      console.error('Error approving notice:', error);
      toast.error('Error approving notice');
    }
  };

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4">Approve Notices</h2>
      {unapprovedNotices.length === 0 ? (
        <p>No unapproved notices available.</p>
      ) : (
        <ul className="space-y-4">
          {unapprovedNotices.map((notice) => (
            <li key={notice.id} className="border rounded-md p-4 bg-white shadow">
              <Link to={`/notice-details/${notice.id}`}>
                <h3 className="text-lg font-bold hover:underline">{notice.title}</h3>
              </Link>
              <p className="text-gray-600">{notice.content}</p>
              {notice.fileUrl && (
                <a href={notice.fileUrl} target="_blank" rel="noopener noreferrer" className="text-blue-500 underline">
                  View Attachment
                </a>
              )}
              <div className="mt-4">
                <button
                  onClick={() => handleApprove(notice)}
                  className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
                >
                  Approve
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default ApproveNotice;
