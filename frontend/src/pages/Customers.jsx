import React, { useEffect, useState } from 'react';
import api from '../api/axios';

export default function Customers() {
  const [customers, setCustomers] = useState([]);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');

  const fetchCustomers = () => {
    api.get('customers/').then(res => setCustomers(res.data)).catch(() => {});
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await api.post('customers/', { name, phone, email, address });
      setName(''); setPhone(''); setEmail(''); setAddress('');
      fetchCustomers();
    } catch (err) {
      alert('Failed to create customer. Phone number must be unique.');
    }
  };

  return (
    <div className="space-y-6">
      <h3 className="text-xl font-bold text-slate-800">Customer Management</h3>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <form onSubmit={handleCreate} className="bg-white p-6 rounded-lg shadow-sm border border-slate-200 space-y-4 h-fit">
          <h4 className="font-bold text-slate-800 border-b pb-2">Add New Customer</h4>
          <div>
            <label className="block text-xs font-bold uppercase text-slate-600 mb-1">Full Name</label>
            <input type="text" required value={name} onChange={e => setName(e.target.value)} className="w-full border rounded px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="block text-xs font-bold uppercase text-slate-600 mb-1">Phone Number</label>
            <input type="text" required value={phone} onChange={e => setPhone(e.target.value)} className="w-full border rounded px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="block text-xs font-bold uppercase text-slate-600 mb-1">Email</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} className="w-full border rounded px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="block text-xs font-bold uppercase text-slate-600 mb-1">Address</label>
            <textarea rows="2" value={address} onChange={e => setAddress(e.target.value)} className="w-full border rounded px-3 py-2 text-sm"></textarea>
          </div>
          <button type="submit" className="w-full bg-sky-600 hover:bg-sky-700 text-white font-bold py-2 rounded text-sm">Save Customer</button>
        </form>

        <div className="md:col-span-2 bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="bg-slate-100 border-b text-xs uppercase text-slate-600 font-bold">
                <th className="p-3">Name</th>
                <th className="p-3">Phone</th>
                <th className="p-3">Email</th>
                <th className="p-3">Address</th>
              </tr>
            </thead>
            <tbody>
              {customers.map(c => (
                <tr key={c.id} className="border-b border-slate-100 hover:bg-slate-50">
                  <td className="p-3 font-semibold">{c.name}</td>
                  <td className="p-3">{c.phone}</td>
                  <td className="p-3">{c.email || 'N/A'}</td>
                  <td className="p-3">{c.address || 'N/A'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}