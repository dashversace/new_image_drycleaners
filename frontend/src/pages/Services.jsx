import React, { useEffect, useState } from 'react';
import api from '../api/axios';

export default function Services() {
  const [services, setServices] = useState([]);
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [description, setDescription] = useState('');

  const fetchServices = () => {
    api.get('services/').then(res => setServices(res.data)).catch(err => console.error(err));
  };

  useEffect(() => {
    fetchServices();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await api.post('services/', { name, price: Number(price), description });
      setName(''); setPrice(''); setDescription('');
      fetchServices();
      alert('Service saved successfully!');
    } catch (err) {
      alert('Failed to save service.');
    }
  };

  const toggleActive = async (srv) => {
    try {
      await api.patch(`services/${srv.id}/`, { is_active: !srv.is_active });
      fetchServices();
    } catch (err) {
      alert('Failed to update service status.');
    }
  };

  return (
    <div className="space-y-6">
      <h3 className="text-xl font-bold text-slate-800">Services & Pricing Management</h3>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <form onSubmit={handleCreate} className="bg-white p-6 rounded-lg shadow-sm border border-slate-200 space-y-4 h-fit">
          <h4 className="font-bold text-slate-800 border-b pb-2">Add / Update Service</h4>
          <div>
            <label className="block text-xs font-bold uppercase text-slate-600 mb-1">Service Name</label>
            <input type="text" required placeholder="e.g. Blankets, Sheets" value={name} onChange={e => setName(e.target.value)} className="w-full border rounded px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="block text-xs font-bold uppercase text-slate-600 mb-1">Default Price ($)</label>
            <input type="number" step="0.01" required placeholder="0.00" value={price} onChange={e => setPrice(e.target.value)} className="w-full border rounded px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="block text-xs font-bold uppercase text-slate-600 mb-1">Description</label>
            <textarea rows="2" value={description} onChange={e => setDescription(e.target.value)} className="w-full border rounded px-3 py-2 text-sm"></textarea>
          </div>
          <button type="submit" className="w-full bg-sky-600 hover:bg-sky-700 text-white font-bold py-2 rounded text-sm shadow">Save Service</button>
        </form>

        <div className="md:col-span-2 bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="bg-slate-100 border-b text-xs uppercase text-slate-600 font-bold">
                <th className="p-3">Service</th>
                <th className="p-3">Price</th>
                <th className="p-3">Status</th>
                <th className="p-3">Action</th>
              </tr>
            </thead>
            <tbody>
              {services.map(s => (
                <tr key={s.id} className="border-b border-slate-100 hover:bg-slate-50">
                  <td className="p-3 font-semibold">{s.name}</td>
                  <td className="p-3 font-bold">${Number(s.price).toFixed(2)}</td>
                  <td className="p-3">
                    <span className={`px-2 py-0.5 rounded text-xs font-bold ${s.is_active ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'}`}>
                      {s.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="p-3">
                    <button onClick={() => toggleActive(s)} className="text-xs font-bold text-sky-600 hover:underline">
                      {s.is_active ? 'Deactivate' : 'Activate'}
                    </button>
                  </td>
                </tr>
              ))}
              {services.length === 0 && (
                <tr><td colSpan="4" className="p-4 text-center text-slate-500">No services configured yet.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}