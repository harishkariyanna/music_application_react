import { useState, useEffect } from 'react';
import './AdminDashboard.css';

interface User {
  id: number;
  username: string;
  email: string;
  role: string;
  createdAt: string;
  isActive: boolean;
}

interface Media {
  mediaId: number;
  title: string;
  composer?: string;
  album?: string;
  language?: string;
  durationInMinutes: number;
  creatorId?: number;
}

interface Subscription {
  id: number;
  userId: number;
  username: string;
  planType: string;
  startDate: string;
  endDate: string;
  status: string;
}

export default function AdminDashboard() {
  const [tabValue, setTabValue] = useState(0);
  const [users, setUsers] = useState<User[]>([]);
  const [media, setMedia] = useState<Media[]>([]);
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingMedia, setEditingMedia] = useState<Media | null>(null);

  useEffect(() => {
    fetchAdminData();
  }, []);

  const fetchAdminData = async () => {
    try {
      const token = localStorage.getItem('token');
      
      const usersResponse = await fetch('https://localhost:7192/api/Admin/users', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (usersResponse.ok) setUsers(await usersResponse.json());

      const mediaResponse = await fetch('https://localhost:7192/api/Media', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (mediaResponse.ok) setMedia(await mediaResponse.json());

      const subscriptionsResponse = await fetch('https://localhost:7192/api/Admin/subscriptions', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (subscriptionsResponse.ok) setSubscriptions(await subscriptionsResponse.json());
    } catch (error) {
      console.error('Error fetching admin data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteMedia = async (id: number) => {
    if (!confirm('Delete this media?')) return;
    try {
      const token = localStorage.getItem('token');
      await fetch(`https://localhost:7192/api/Media/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      setMedia(media.filter(m => m.mediaId !== id));
    } catch (error) {
      console.error('Error deleting media:', error);
    }
  };

  const handleEditMedia = (m: Media) => {
    setEditingMedia(m);
  };

  const handleUpdateMedia = async () => {
    if (!editingMedia) return;
    try {
      const token = localStorage.getItem('token');
      await fetch(`https://localhost:7192/api/Media/${editingMedia.mediaId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(editingMedia)
      });
      setMedia(media.map(m => m.mediaId === editingMedia.mediaId ? editingMedia : m));
      setEditingMedia(null);
    } catch (error) {
      console.error('Error updating media:', error);
    }
  };

  const handleTabChange = (_: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active': return 'success';
      case 'inactive': return 'error';
      case 'pending': return 'warning';
      case 'completed': return 'success';
      case 'failed': return 'error';
      default: return 'default';
    }
  };

  if (loading) {
    return (
      <div className="admin-dashboard">
        <p>Loading admin data...</p>
      </div>
    );
  }

  return (
    <div className="admin-dashboard">
      <h1 className="admin-title">Admin Dashboard</h1>

      <div className="admin-stats">
        <div className="stat-card">
          <div className="stat-card-header">
            <span className="stat-icon">👤</span>
            <h3 className="stat-title">Total Users</h3>
          </div>
          <p className="stat-value">{users.length}</p>
        </div>

        <div className="stat-card">
          <div className="stat-card-header">
            <span className="stat-icon">💳</span>
            <h3 className="stat-title">Active Subscriptions</h3>
          </div>
          <p className="stat-value">{subscriptions.filter(s => s.status === 'Active').length}</p>
        </div>
      </div>

      <div className="admin-tabs">
        <button className={`admin-tab ${tabValue === 0 ? 'active' : ''}`} onClick={() => setTabValue(0)}>
          Users
        </button>
        <button className={`admin-tab ${tabValue === 1 ? 'active' : ''}`} onClick={() => setTabValue(1)}>
          Media
        </button>
        <button className={`admin-tab ${tabValue === 2 ? 'active' : ''}`} onClick={() => setTabValue(2)}>
          Subscriptions
        </button>
      </div>

      {tabValue === 0 && (
        <div className="admin-table-container">
          <table className="admin-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Username</th>
                <th>Email</th>
                <th>Role</th>
                <th>Created At</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id}>
                  <td>{user.id}</td>
                  <td>{user.username}</td>
                  <td>{user.email}</td>
                  <td>{user.role}</td>
                  <td>{new Date(user.createdAt).toLocaleDateString()}</td>
                  <td>
                    <span className={`status-chip ${user.isActive ? 'success' : 'error'}`}>
                      {user.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}



      {tabValue === 1 && (
        <div className="admin-table-container">
          {editingMedia && (
            <div style={{ background: '#282828', padding: '20px', marginBottom: '20px', borderRadius: '8px' }}>
              <h3>Edit Media</h3>
              <input value={editingMedia.title} onChange={(e) => setEditingMedia({...editingMedia, title: e.target.value})} placeholder="Title" style={{ width: '100%', padding: '8px', marginBottom: '10px' }} />
              <input value={editingMedia.composer || ''} onChange={(e) => setEditingMedia({...editingMedia, composer: e.target.value})} placeholder="Composer" style={{ width: '100%', padding: '8px', marginBottom: '10px' }} />
              <input value={editingMedia.album || ''} onChange={(e) => setEditingMedia({...editingMedia, album: e.target.value})} placeholder="Album" style={{ width: '100%', padding: '8px', marginBottom: '10px' }} />
              <input value={editingMedia.language || ''} onChange={(e) => setEditingMedia({...editingMedia, language: e.target.value})} placeholder="Language" style={{ width: '100%', padding: '8px', marginBottom: '10px' }} />
              <button onClick={handleUpdateMedia} style={{ padding: '8px 16px', marginRight: '10px', background: '#1db954', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Save</button>
              <button onClick={() => setEditingMedia(null)} style={{ padding: '8px 16px', background: '#666', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Cancel</button>
            </div>
          )}
          <table className="admin-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Title</th>
                <th>Composer</th>
                <th>Album</th>
                <th>Language</th>
                <th>Duration</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {media.map((m) => (
                <tr key={m.mediaId}>
                  <td>{m.mediaId}</td>
                  <td>{m.title}</td>
                  <td>{m.composer || '-'}</td>
                  <td>{m.album || '-'}</td>
                  <td>{m.language || '-'}</td>
                  <td>{m.durationInMinutes} min</td>
                  <td>
                    <button onClick={() => handleEditMedia(m)} style={{ padding: '4px 8px', marginRight: '5px', background: '#1db954', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Edit</button>
                    <button onClick={() => handleDeleteMedia(m.mediaId)} style={{ padding: '4px 8px', background: '#e74c3c', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {tabValue === 2 && (
        <div className="admin-table-container">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Subscription ID</th>
                <th>User</th>
                <th>Plan Type</th>
                <th>Start Date</th>
                <th>End Date</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {subscriptions.map((subscription) => (
                <tr key={subscription.id}>
                  <td>{subscription.id}</td>
                  <td>{subscription.username}</td>
                  <td>{subscription.planType}</td>
                  <td>{new Date(subscription.startDate).toLocaleDateString()}</td>
                  <td>{new Date(subscription.endDate).toLocaleDateString()}</td>
                  <td>
                    <span className={`status-chip ${getStatusColor(subscription.status)}`}>
                      {subscription.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}