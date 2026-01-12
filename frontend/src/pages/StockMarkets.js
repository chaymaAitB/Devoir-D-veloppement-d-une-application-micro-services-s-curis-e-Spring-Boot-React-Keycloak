import { useState, useEffect } from 'react';
import { useKeycloak } from '@react-keycloak/web';
import api from '../api';
import './StockMarkets.css';

export default function StockMarkets() {
  const { keycloak } = useKeycloak();
  const [stocks, setStocks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    date: '',
    openValue: '',
    closeValue: '',
    volume: '',
    companyId: ''
  });
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const isAdmin = keycloak.hasRealmRole('ADMIN');

  // Load all stocks initially
  const loadStocks = async () => {
    try {
      const res = await api.get('/api/stockMarkets', {
        headers: { Authorization: `Bearer ${keycloak.token}` }
      });
      setStocks(res.data || []);
    } catch (err) {
      console.error('Failed to load stocks:', err);
      setError('Failed to load stocks');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (keycloak.authenticated) {
      loadStocks();
    }
  }, [keycloak.authenticated]);

  // CREATE or UPDATE
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isAdmin) return;

    setError('');
    setSuccess('');

    const payload = {
      date: formData.date,
      openValue: Number(formData.openValue),
      closeValue: Number(formData.closeValue),
      volume: Number(formData.volume),
      companyId: Number(formData.companyId)
    };

    try {
      if (editingId) {
        await api.put(`/api/stockMarkets/${editingId}`, payload, {
          headers: { Authorization: `Bearer ${keycloak.token}` }
        });
        setSuccess('Stock updated successfully');
      } else {
        await api.post('/api/stockMarkets', payload, {
          headers: { Authorization: `Bearer ${keycloak.token}` }
        });
        setSuccess('Stock created successfully');
      }

      // Reset form & reload
      setFormData({ date: '', openValue: '', closeValue: '', volume: '', companyId: '' });
      setEditingId(null);
      loadStocks();
    } catch (err) {
      console.error('Operation failed:', err);
      setError('Failed to create/update stock');
    }
  };

  // EDIT
  const handleEdit = (stock) => {
    if (!isAdmin) return;

    setFormData({
      date: stock.date,
      openValue: stock.openValue,
      closeValue: stock.closeValue,
      volume: stock.volume,
      companyId: stock.companyId
    });
    setEditingId(stock.id);
    setError('');
    setSuccess('');
  };

  // DELETE
  const handleDelete = async (id) => {
    if (!isAdmin || !window.confirm('Are you sure you want to delete this stock?')) return;

    setError('');
    setSuccess('');
    try {
      await api.delete(`/api/stockMarkets/${id}`, {
        headers: { Authorization: `Bearer ${keycloak.token}` }
      });
      setSuccess('Stock deleted successfully');
      setStocks(stocks.filter(s => s.id !== id));
    } catch (err) {
      console.error('Delete failed:', err);
      setError('Failed to delete stock');
    }
  };

  if (loading) return <div>Loading stock markets...</div>;

  return (
    <div className="page-container">
      <h2>Stock Markets</h2>
      <p>Logged in as: <strong>{keycloak.tokenParsed?.preferred_username}</strong> | Role: {isAdmin ? 'ADMIN' : 'CLIENT'}</p>

      {error && <div className="error">{error}</div>}
      {success && <div className="success">{success}</div>}

      {/* Admin Form */}
      {isAdmin && (
        <div className="form-container">
          <h3>{editingId ? 'Edit Stock' : 'Add Stock'}</h3>
          <form onSubmit={handleSubmit}>
            <input type="date" value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} required />
            <input type="number" placeholder="Open Value" value={formData.openValue} onChange={e => setFormData({...formData, openValue: e.target.value})} required />
            <input type="number" placeholder="Close Value" value={formData.closeValue} onChange={e => setFormData({...formData, closeValue: e.target.value})} required />
            <input type="number" placeholder="Volume" value={formData.volume} onChange={e => setFormData({...formData, volume: e.target.value})} />
            <input type="number" placeholder="Company ID" value={formData.companyId} onChange={e => setFormData({...formData, companyId: e.target.value})} required />
            <button type="submit">{editingId ? 'Update Stock' : 'Add Stock'}</button>
            {editingId && <button type="button" onClick={() => setEditingId(null)}>Cancel</button>}
          </form>
        </div>
      )}

      {/* Stock List */}
      <div className="grid-container">
        {stocks.map(stock => (
          <div key={stock.id} className="card">
            <h3>Date: {stock.date}</h3>
            <p>Open: ${stock.openValue}</p>
            <p>Close: ${stock.closeValue}</p>
            <p>Volume: {stock.volume?.toLocaleString() || 'N/A'}</p>
            <p>Company ID: {stock.companyId}</p>

            {isAdmin && (
              <div className="stock-actions">
                <button onClick={() => handleEdit(stock)}>Edit</button>
                <button onClick={() => handleDelete(stock.id)}>Delete</button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
