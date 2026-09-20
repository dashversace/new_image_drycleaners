import React, { useEffect, useState } from 'react';
import api from '../api/axios';

export default function AuditLogs() {
  const [logs, setLogs] = useState([]);

  useEffect(() => {
    api.get('audit-logs/').then(res => setLogs(res.data)).catch(() => {});
  }, []);

  return (
    <div className="space-y-6">
      <h3 className="text-xl font-bold text-slate-800">System Audit Logs</h3>

      <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="bg-slate-100 border-b text-xs uppercase text-slate-600 font-bold">
              <th className="p-3">Timestamp</th>
              <th className="p-3">User</th>
              <th className="p-3">Action</th>
              <th className="p-3">Details</th>
            </tr>
          </thead>
          <tbody>
            {logs.map(log => (
              <tr key={log.id} className="border-b border-slate-100 hover:bg-slate-50">
                <td className="p-3 text-xs">{new Date(log.timestamp).toLocaleString()}</td>
                <td className="p-3 font-semibold">{log.username || 'System'}</td>
                <td className="p-3"><span className="px-2 py-0.5 bg-slate-100 rounded text-xs font-bold">{log.action}</span></td>
                <td className="p-3 text-xs text-slate-600">{log.details}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}