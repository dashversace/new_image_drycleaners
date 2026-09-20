import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import ReceiptModal from '../components/ReceiptModal';

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchOrders = () => {
    setLoading(true);
    let url = 'orders/?';
    if (search) url += `search=${search}&`;
    if (statusFilter) url += `status=${statusFilter}&`;
    
    api.get(url)
      .then(res => {
        const data = res.data;
        const list = Array.isArray(data) ? data : (data.results || data.orders || []);
        setOrders(list);
        setLoading(false);
      })
      .catch(err => {
        console.error("Failed to load orders:", err);
        setOrders([]);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchOrders();
  }, [search, statusFilter]);

  const updateStatus = async (id, newStatus) => {
    try {
      await api.patch(`orders/${id}/`, { status: newStatus });
      fetchOrders();
    } catch (err) {
      alert('Failed to update status.');
    }
  };

  const deleteOrder = async (id, orderNumber) => {
    if (window.confirm(`Are you sure you want to delete order ${orderNumber}?`)) {
      try {
        await api.delete(`orders/${id}/`);
        fetchOrders();
      } catch (err) {
        alert('Failed to delete order.');
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h3 className="text-xl font-bold text-slate-800">Orders Management</h3>
        <Link to="/orders/new" className="bg-sky-600 hover:bg-sky-700 text-white px-4 py-2 rounded text-sm font-bold shadow">
          + New Order
        </Link>
      </div>

      <div className="flex flex-col md:flex-row gap-4 bg-white p-4 rounded-lg shadow-sm border border-slate-200">
        <input 
          type="text" 
          placeholder="Search order #, customer name, phone..." 
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="flex-1 border border-slate-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-sky-600"
        />
        <select 
          value={statusFilter} 
          onChange={e => setStatusFilter(e.target.value)}
          className="border border-slate-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-sky-600 bg-white"
        >
          <option value="">All Statuses</option>
          <option value="RECEIVED">RECEIVED</option>
          <option value="PROCESSING">PROCESSING</option>
          <option value="CLEANING">CLEANING</option>
          <option value="PRESSING">PRESSING</option>
          <option value="QUALITY CHECK">QUALITY CHECK</option>
          <option value="READY">READY</option>
          <option value="COLLECTED">COLLECTED</option>
        </select>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
        <table className="w-full text-left border-collapse text-sm">
          <thead>
            <tr className="bg-slate-100 border-b border-slate-200 text-xs uppercase text-slate-600 font-bold">
              <th className="p-3">Order #</th>
              <th className="p-3">Customer</th>
              <th className="p-3">Collection</th>
              <th className="p-3">Status</th>
              <th className="p-3">Total / Balance</th>
              <th className="p-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="6" className="p-6 text-center text-slate-500">Loading orders...</td></tr>
            ) : orders.map(order => {
              const total = Number(order.total_amount || 0);
              const paid = Number(order.paid_amount || 0);
              const balance = Number(order.balance_amount || 0);
              const isOverpaid = paid > total;
              const changeAmount = isOverpaid ? paid - total : 0;

              return (
                <tr key={order.id} className="border-b border-slate-100 hover:bg-slate-50">
                  <td className="p-3 font-bold text-sky-600">
                    <Link to={`/orders/${order.id}`}>{order.order_number}</Link>
                  </td>
                  <td className="p-3">
                    <div className="font-semibold">{order.customer_details?.name || 'Walk-in Customer'}</div>
                    <div className="text-xs text-slate-400">{order.customer_details?.phone || 'N/A'}</div>
                  </td>
                  <td className="p-3 text-xs">{order.collection_date}</td>
                  <td className="p-3">
                    <select 
                      value={order.status} 
                      onChange={e => updateStatus(order.id, e.target.value)}
                      className="border border-slate-300 rounded px-2 py-1 text-xs font-semibold bg-white"
                    >
                      <option value="RECEIVED">RECEIVED</option>
                      <option value="PROCESSING">PROCESSING</option>
                      <option value="CLEANING">CLEANING</option>
                      <option value="PRESSING">PRESSING</option>
                      <option value="QUALITY CHECK">QUALITY CHECK</option>
                      <option value="READY">READY</option>
                      <option value="COLLECTED">COLLECTED</option>
                    </select>
                  </td>
                  <td className="p-3 text-xs">
                    <div className="font-bold">${total.toFixed(2)}</div>
                    {isOverpaid ? (
                      <div className="text-emerald-600 font-semibold">Change: ${changeAmount.toFixed(2)}</div>
                    ) : (
                      <div className="text-rose-600">Bal: ${balance.toFixed(2)}</div>
                    )}
                  </td>
                  <td className="p-3 space-x-2">
                    <Link to={`/orders/${order.id}`} className="text-sky-600 hover:underline font-bold text-xs">View</Link>
                    <button onClick={() => setSelectedOrder(order)} className="text-slate-600 hover:underline font-bold text-xs">Receipt</button>
                    <button onClick={() => deleteOrder(order.id, order.order_number)} className="text-rose-600 hover:underline font-bold text-xs">Delete</button>
                  </td>
                </tr>
              );
            })}
            {!loading && orders.length === 0 && (
              <tr>
                <td colSpan="6" className="p-6 text-center text-slate-500">No orders found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <ReceiptModal order={selectedOrder} onClose={() => setSelectedOrder(null)} />
    </div>
  );
}