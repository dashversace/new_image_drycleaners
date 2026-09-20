import React, { useEffect, useState } from 'react';
import api from '../api/axios';

export default function Payments() {
  const [payments, setPayments] = useState([]);

  useEffect(() => {
    api.get('payments/').then(res => setPayments(res.data)).catch(() => {});
  }, []);

  return (
    <div className="space-y-6">
      <h3 className="text-xl font-bold text-slate-800">All Payment Transactions</h3>

      <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="bg-slate-100 border-b text-xs uppercase text-slate-600 font-bold">
              <th className="p-3">Date</th>
              <th className="p-3">Amount</th>
              <th className="p-3">Method</th>
              <th className="p-3">Reference</th>
              <th className="p-3">Received By</th>
            </tr>
          </thead>
          <tbody>
            {payments.map(p => (
              <tr key={p.id} className="border-b border-slate-100 hover:bg-slate-50">
                <td className="p-3 text-xs">{new Date(p.created_at).toLocaleString()}</td>
                <td className="p-3 font-bold text-emerald-600">${Number(p.amount).toFixed(2)}</td>
                <td className="p-3">{p.payment_method}</td>
                <td className="p-3">{p.reference_number || 'N/A'}</td>
                <td className="p-3">{p.received_by_name}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}