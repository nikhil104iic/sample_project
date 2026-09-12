import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
import './FilePages.css';

function ViewFilesPage() {
  const navigate = useNavigate();
  const [documents, setDocuments] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let isActive = true;
    api.get('/api/files')
      .then((response) => {
        if (!isActive) return;
        setDocuments(response.data);
        setSelectedId(response.data[0]?.id || null);
      })
      .catch((requestError) => {
        if (isActive) setError(requestError.response?.data?.detail || 'The files could not be loaded.');
      })
      .finally(() => {
        if (isActive) setLoading(false);
      });
    return () => { isActive = false; };
  }, []);

  useEffect(() => {
    if (!selectedId) {
      return undefined;
    }

    let isActive = true;
    let objectUrl = '';
    api.get(`/api/files/${selectedId}`, { responseType: 'blob' })
      .then((response) => {
        if (!isActive) return;
        objectUrl = URL.createObjectURL(response.data);
        setPreviewUrl(objectUrl);
      })
      .catch(() => {
        if (isActive) setError('This PDF could not be opened.');
      });

    return () => {
      isActive = false;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [selectedId]);

  const selectedDocument = documents.find((document) => document.id === selectedId);

  return (
    <div className="file-page page-full">
      <header className="file-page-header">
        <button type="button" className="file-back-button" onClick={() => navigate('/dashboard')}>
          <span aria-hidden="true">←</span> Dashboard
        </button>
        <button type="button" className="file-header-action" onClick={() => navigate('/upload-files')}>
          Upload files
        </button>
      </header>
      <main className="file-page-content file-view-content">
        <div className="file-page-heading">
          <p className="file-page-kicker">Shared library</p>
          <h1>View files</h1>
          <p>Open an uploaded PDF without leaving the workspace.</p>
        </div>
        {error && <div className="file-message file-message-error">{error}</div>}
        {loading ? (
          <div className="file-empty-state">Loading PDFs...</div>
        ) : documents.length === 0 ? (
          <div className="file-empty-state">No PDFs have been uploaded yet.</div>
        ) : (
          <section className="file-viewer-layout">
            <aside className="file-list glass-card">
              <div className="file-list-heading">
                <strong>PDF library</strong>
                <span>{documents.length}</span>
              </div>
              <div className="file-list-items">
                {documents.map((document) => (
                  <button
                    type="button"
                    key={document.id}
                    className={`file-list-item ${document.id === selectedId ? 'file-list-item-active' : ''}`}
                    onClick={() => {
                      setPreviewUrl('');
                      setSelectedId(document.id);
                    }}
                  >
                    <span className="file-list-icon">PDF</span>
                    <span className="file-list-name">{document.original_name}</span>
                  </button>
                ))}
              </div>
            </aside>
            <section className="file-preview glass-card">
              <div className="file-preview-header">
                <strong>{selectedDocument?.original_name}</strong>
                <span>{selectedDocument ? `${(selectedDocument.file_size / 1024 / 1024).toFixed(2)} MB` : ''}</span>
              </div>
              {selectedId && !previewUrl ? (
                <div className="file-empty-state">Opening PDF...</div>
              ) : previewUrl ? (
                <iframe className="file-preview-frame" src={previewUrl} title={selectedDocument?.original_name || 'PDF viewer'} />
              ) : (
                <div className="file-empty-state">Select a PDF to view it.</div>
              )}
            </section>
          </section>
        )}
      </main>
    </div>
  );
}

export default ViewFilesPage;
