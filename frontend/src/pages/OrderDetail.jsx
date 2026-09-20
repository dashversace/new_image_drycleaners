import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../api/axios';
import ReceiptModal from '../components/ReceiptModal';

export default function OrderDetail() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [payAmount, setPayAmount] = useState('');
  const [payMethod, setPayMethod] = useState('Cash');
  const [refNum, setRefNum] = useState('');
  const [showReceipt, setShowReceipt] = useState(false);

  const fetchOrder = () => {
    api.get(`orders/${id}/`).then(res => setOrder(res.data)).catch(() => {});
  };

  useEffect(() => {
    fetchOrder();
  }, [id]);

  const handlePayment = async (e) => {
    e.preventDefault();
    if (!payAmount || Number(payAmount) <= 0) return;

    try {
      await api.post('payments/', {
        order: order.id,
        amount: Number(payAmount),
        payment_method: payMethod,
        reference_number: refNum
      });
      setPayAmount('');
      setRefNum('');
      fetchOrder();
    } catch (err) {
      alert('Failed to record payment.');
    }
  };

  if (!order) return <div className="p-6">Loading order details...</div>;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-xl font-bold text-slate-800">Order {order.order_number}</h3>
          <p className="text-xs text-slate-500">Created on {new Date(order.created_at).toLocaleString()}</p>
        </div>
        <div className="space-x-3">
          <button onClick={() => setShowReceipt(true)} className="bg-slate-800 hover:bg-slate-900 text-white px-4 py-2 rounded text-sm font-bold">
            Print Digital Receipt
          </button>
          <Link to="/orders" className="text-slate-600 hover:underline text-sm font-bold">&larr; Back</Link>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200 space-y-4">
          <h4 className="font-bold text-slate-800 border-b pb-2">Customer Information</h4>
          <div className="text-sm space-y-1">
            <p><span className="font-bold">Name:</span> {order.customer_details?.name}</p>
            <p><span className="font-bold">Phone:</span> {order.customer_details?.phone}</p>
            <p><span className="font-bold">Email:</span> {order.customer_details?.email || 'N/A'}</p>
            <p><span className="font-bold">Address:</span> {order.customer_details?.address || 'N/A'}</p>
          </div>

          <h4 className="font-bold text-slate-800 border-b pb-2 pt-4">Order Status & Info</h4>
          <div className="text-sm space-y-1">
            <p><span className="font-bold">Status:</span> <span className="px-2 py-0.5 bg-sky-100 text-sky-800 rounded font-bold text-xs">{order.status}</span></p>
            <p><span className="font-bold">Collection Date:</span> {order.collection_date}</p>
            <p><span className="font-bold">Received By:</span> {order.received_by_name}</p>
            {order.special_instructions && <p><span className="font-bold">Instructions:</span> {order.special_instructions}</p>}
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200 space-y-4">
          <h4 className="font-bold text-slate-800 border-b pb-2">Financial Breakdown</h4>
          <div className="text-sm space-y-2">
            <div className="flex justify-between font-bold">
              <span>Total Amount:</span>
              <span>${Number(order.total_amount).toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>Paid Amount:</span>
              <span>${Number(order.paid_amount).toFixed(2)}</span>
            </div>
            <div className="flex justify-between font-bold text-rose-600 border-t pt-2">
              <span>Balance Due:</span>
              <span>${Number(order.balance_amount).toFixed(2)}</span>
            </div>
          </div>

          {!order.is_fully_paid && (
            <form onSubmit={handlePayment} className="border-t pt-4 space-y-3">
              <h5 className="font-bold text-xs uppercase text-slate-600">Record Payment</h5>
              <input 
                type="number" 
                step="0.01" 
                required 
                placeholder="Amount ($)"
                value={payAmount}
                onChange={e => setPayAmount(e.target.value)}
                className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-sky-600"
              />
              <select 
                value={payMethod}
                onChange={e => setPayMethod(e.target.value)}
                className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-sky-600"
              >
                <option value="Cash">Cash</option>
                <option value="EcoCash">EcoCash</option>
                <option value="Bank Transfer">Bank Transfer</option>
                <option value="Other">Other</option>
              </select>
              <input 
                type="text" 
                placeholder="Reference Number (Optional)"
                value={refNum}
                onChange={e => setRefNum(e.target.value)}
                className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-sky-600"
              />
              <button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2 rounded text-sm shadow">
                Add Payment
              </button>
            </form>
          )}
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
        <h4 className="font-bold text-slate-800 mb-4">Order Items</h4>
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b text-xs uppercase text-slate-600">
              <th className="pb-2">Service</th>
              <th className="pb-2 text-center">Unit Price</th>
              <th className="pb-2 text-center">Qty</th>
              <th className="pb-2 text-right">Subtotal</th>
            </tr>
          </thead>
          <tbody>
            {order.items?.map((item, idx) => (
              <tr key={idx} className="border-b border-slate-100">
                <td className="py-2 font-semibold">{item.service_name}</td>
                <td className="py-2 text-center">${Number(item.unit_price).toFixed(2)}</td>
                <td className="py-2 text-center">{item.quantity}</td>
                <td className="py-2 text-right font-bold">${Number(item.subtotal).toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <ReceiptModal order={showReceipt ? order : null} onClose={() => setShowReceipt(false)} />
    </div>
  );
}