import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
import './FilePages.css';

function UploadFilesPage() {
  const navigate = useNavigate();
  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('user_profile'));
    } catch {
      return null;
    }
  });
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [checkingAccess, setCheckingAccess] = useState(true);
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    let isActive = true;
    const loadProfile = async () => {
      try {
        const response = user ? { data: user } : await api.get('/api/auth/profile');
        if (!isActive) return;
        setUser(response.data);
        localStorage.setItem('user_profile', JSON.stringify(response.data));
        if (response.data.role !== 'admin') navigate('/view-files', { replace: true });
      } catch {
        navigate('/login', { replace: true });
      } finally {
        if (isActive) setCheckingAccess(false);
      }
    };
    loadProfile();
    return () => { isActive = false; };
  }, [navigate, user]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!file) {
      setMessage({ type: 'error', text: 'Choose a PDF file first.' });
      return;
    }

    setLoading(true);
    setMessage({ type: '', text: '' });
    const formData = new FormData();
    formData.append('file', file);

    try {
      await api.post('/api/files/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setFile(null);
      event.target.reset();
      setMessage({ type: 'success', text: 'PDF uploaded to the shared library.' });
    } catch (error) {
      setMessage({
        type: 'error',
        text: error.response?.data?.detail || 'The PDF could not be uploaded.',
      });
    } finally {
      setLoading(false);
    }
  };

  if (checkingAccess || user?.role !== 'admin') {
    return <div className="page-center"><div className="dashboard-loading"><div className="dashboard-loading-spinner" /><p>Checking access...</p></div></div>;
  }

  return (
    <div className="file-page page-full">
      <header className="file-page-header">
        <button type="button" className="file-back-button" onClick={() => navigate('/dashboard')}>
          <span aria-hidden="true">←</span> Dashboard
        </button>
        <div className="file-page-user">{user.full_name} <span>Administrator</span></div>
      </header>
      <main className="file-page-content">
        <div className="file-page-heading">
          <p className="file-page-kicker">Shared library</p>
          <h1>Upload files</h1>
          <p>Add a PDF for every authenticated user to view.</p>
        </div>
        {message.text && <div className={`file-message file-message-${message.type}`}>{message.text}</div>}
        <form className="file-upload-panel glass-card" onSubmit={handleSubmit}>
          <label className="file-dropzone" htmlFor="pdf-file">
            <span className="file-upload-mark">↑</span>
            <strong>{file ? file.name : 'Choose a PDF file'}</strong>
            <span>{file ? `${(file.size / 1024 / 1024).toFixed(2)} MB selected` : 'Maximum size: 25 MB'}</span>
            <input
              id="pdf-file"
              type="file"
              accept="application/pdf,.pdf"
              onChange={(event) => {
                setFile(event.target.files[0] || null);
                setMessage({ type: '', text: '' });
              }}
            />
          </label>
          <button type="submit" className="btn btn-primary file-submit" disabled={loading || !file}>
            {loading ? 'Uploading...' : 'Upload PDF'}
          </button>
        </form>
      </main>
    </div>
  );
}

export default UploadFilesPage;
