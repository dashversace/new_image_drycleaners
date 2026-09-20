import React, { useEffect, useState } from 'react';
import api from '../api/axios';

export default function Users() {
  const [users, setUsers] = useState([]);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('Receptionist');
  const [phone, setPhone] = useState('');

  const fetchUsers = () => {
    api.get('users/').then(res => setUsers(res.data)).catch(() => {});
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await api.post('users/', { username, password, role, phone });
      setUsername(''); setPassword(''); setPhone('');
      fetchUsers();
    } catch (err) {
      alert('Failed to create user.');
    }
  };

  return (
    <div className="space-y-6">
      <h3 className="text-xl font-bold text-slate-800">User Management</h3>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <form onSubmit={handleCreate} className="bg-white p-6 rounded-lg shadow-sm border border-slate-200 space-y-4 h-fit">
          <h4 className="font-bold text-slate-800 border-b pb-2">Add New User</h4>
          <div>
            <label className="block text-xs font-bold uppercase text-slate-600 mb-1">Username</label>
            <input type="text" required value={username} onChange={e => setUsername(e.target.value)} className="w-full border rounded px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="block text-xs font-bold uppercase text-slate-600 mb-1">Password</label>
            <input type="password" required value={password} onChange={e => setPassword(e.target.value)} className="w-full border rounded px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="block text-xs font-bold uppercase text-slate-600 mb-1">Role</label>
            <select value={role} onChange={e => setRole(e.target.value)} className="w-full border rounded px-3 py-2 text-sm">
              <option value="Admin">Admin</option>
              <option value="Manager">Manager</option>
              <option value="Receptionist">Receptionist</option>
              <option value="Cleaning Staff">Cleaning Staff</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-bold uppercase text-slate-600 mb-1">Phone</label>
            <input type="text" value={phone} onChange={e => setPhone(e.target.value)} className="w-full border rounded px-3 py-2 text-sm" />
          </div>
          <button type="submit" className="w-full bg-sky-600 hover:bg-sky-700 text-white font-bold py-2 rounded text-sm">Save User</button>
        </form>

        <div className="md:col-span-2 bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="bg-slate-100 border-b text-xs uppercase text-slate-600 font-bold">
                <th className="p-3">Username</th>
                <th className="p-3">Role</th>
                <th className="p-3">Phone</th>
              </tr>
            </thead>
            <tbody>
              {users.map(u => (
                <tr key={u.id} className="border-b border-slate-100 hover:bg-slate-50">
                  <td className="p-3 font-semibold">{u.username}</td>
                  <td className="p-3"><span className="px-2 py-0.5 bg-sky-100 text-sky-800 rounded text-xs font-bold">{u.role}</span></td>
                  <td className="p-3">{u.phone || 'N/A'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}