import { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { Helmet } from 'react-helmet-async';
import { format } from 'date-fns';
import { PlusCircle, Edit, Trash2, CalendarClock } from 'lucide-react';

const Results = () => {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  
  const [formData, setFormData] = useState({ title: '', data: '', scheduledDate: '', status: 'executed' });
  const { user: currentUser } = useContext(AuthContext);

  const fetchResults = async () => {
    try {
      const config = { headers: { Authorization: `Bearer ${currentUser.token}` } };
      const { data } = await axios.get('/api/results', config);
      setResults(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResults();
  }, [currentUser]);

  const handleDelete = async (id) => {
    if (window.confirm('Delete this result?')) {
      try {
        const config = { headers: { Authorization: `Bearer ${currentUser.token}` } };
        await axios.delete(`/api/results/${id}`, config);
        fetchResults();
      } catch (error) {
        alert('Error deleting result');
      }
    }
  };

  const handleOpenModal = (result = null) => {
    if (result) {
      setEditingId(result._id);
      setFormData({
        title: result.title,
        data: typeof result.data === 'string' ? result.data : JSON.stringify(result.data),
        scheduledDate: result.scheduledDate ? new Date(result.scheduledDate).toISOString().slice(0, 16) : '',
        status: result.status
      });
    } else {
      setEditingId(null);
      setFormData({ title: '', data: '', scheduledDate: '', status: 'executed' });
    }
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const config = { headers: { Authorization: `Bearer ${currentUser.token}` } };
      const payload = {
        title: formData.title,
        data: formData.data,
        scheduledDate: formData.scheduledDate || undefined,
        status: formData.status
      };

      if (editingId) {
        await axios.put(`/api/results/${editingId}`, payload, config);
      } else {
        await axios.post('/api/results', payload, config);
      }
      
      setShowModal(false);
      fetchResults();
    } catch (error) {
      alert(error.response?.data?.message || 'Error saving result');
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="space-y-6 animate-in fade-in">
      <Helmet>
        <title>Manage Results | Admin Panel</title>
        <meta name="description" content="Add and schedule results." />
      </Helmet>

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">Results Data</h1>
          <p className="text-gray-500 mt-1">Add, update and schedule results information.</p>
        </div>
        
        <button 
          onClick={() => handleOpenModal()}
          className="flex items-center gap-2 bg-gray-900 hover:bg-black text-white px-4 py-2 rounded-xl transition-colors shadow-sm"
        >
          <PlusCircle size={18} />
          Add Result
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 lg:gap-6 gap-4">
        {results.map((result) => (
          <div key={result._id} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-start">
                <h3 className="text-lg font-bold text-gray-900">{result.title}</h3>
                <span className={`px-2 py-1 text-xs font-semibold rounded-full 
                      ${result.status === 'executed' ? 'bg-green-100 text-green-800' : 
                        result.status === 'pending' ? 'bg-amber-100 text-amber-800' : 'bg-red-100 text-red-800'}`
                }>
                  {result.status}
                </span>
              </div>
              
              <div className="mt-4 p-4 bg-gray-50 rounded-xl text-sm font-mono text-gray-700 break-all">
                {typeof result.data === 'string' ? result.data : JSON.stringify(result.data)}
              </div>

              {result.scheduledDate && (
                <div className="mt-4 flex items-center gap-2 text-sm text-gray-500">
                  <CalendarClock size={16} />
                  <span>Scheduled: {format(new Date(result.scheduledDate), 'MMM dd, yyyy HH:mm')}</span>
                </div>
              )}
            </div>

            <div className="mt-6 pt-4 border-t flex justify-between items-center text-sm">
              <div className="text-gray-500">
                Created: {format(new Date(result.createdAt), 'MMM dd, px')}
              </div>
              <div className="flex gap-2">
                <button onClick={() => handleOpenModal(result)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                  <Edit size={18} />
                </button>
                {currentUser.role === 'admin' && (
                  <button onClick={() => handleDelete(result._id)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                    <Trash2 size={18} />
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
        {results.length === 0 && (
          <div className="col-span-full py-10 text-center text-gray-500 bg-white rounded-2xl border">
            No results found. Start by creating one.
          </div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-lg shadow-xl">
            <h2 className="text-xl font-bold mb-4">{editingId ? 'Edit Result' : 'Add New Result'}</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                <input required type="text" className="w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Data (Payload)</label>
                <textarea required className="w-full h-32 px-4 py-2 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none font-mono" placeholder="Enter text or JSON data" value={formData.data} onChange={e => setFormData({...formData, data: e.target.value})}></textarea>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                  <select className="w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none" value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})}>
                    <option value="executed">Executed (Immediate)</option>
                    <option value="pending">Pending (Scheduled)</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Schedule Date (Optional)</label>
                  <input type="datetime-local" className="w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none" value={formData.scheduledDate} onChange={e => setFormData({...formData, scheduledDate: e.target.value})} />
                </div>
              </div>
              <div className="flex justify-end gap-3 mt-6">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-xl">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-gray-900 text-white hover:bg-black rounded-xl">Save Result</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Results;
