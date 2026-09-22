import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import ReceiptModal from '../components/ReceiptModal';

export default function NewOrder() {
  const navigate = useNavigate();
  const [services, setServices] = useState([]);
  const [loadingServices, setLoadingServices] = useState(true);
  
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [customerAddress, setCustomerAddress] = useState('');

  const [items, setItems] = useState([{ service: '', quantity: 1, unit_price: '' }]);
  const [collectionDate, setCollectionDate] = useState('');
  const [specialInstructions, setSpecialInstructions] = useState('');
  const [discount, setDiscount] = useState('');
  const [initialPayment, setInitialPayment] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('Cash');
  const [referenceNumber, setReferenceNumber] = useState('');
  
  const [createdOrder, setCreatedOrder] = useState(null);

  const fetchServices = () => {
    setLoadingServices(true);
    api.get('services/')
      .then(res => {
        const data = res.data;
        const list = Array.isArray(data) ? data : (data.results || data.services || []);
        const active = list.filter(s => s.is_active !== false);
        setServices(active);
        setLoadingServices(false);
      })
      .catch(err => {
        console.error("Failed to load services:", err);
        setLoadingServices(false);
      });
  };

  useEffect(() => {
    fetchServices();
  }, []);

  const addItem = () => setItems([...items, { service: '', quantity: 1, unit_price: '' }]);
  const removeItem = (index) => setItems(items.filter((_, i) => i !== index));

  const handleItemChange = (index, field, value) => {
    const newItems = [...items];
    newItems[index][field] = value;
    
    if (field === 'service') {
      const srv = services.find(s => s.id == value);
      if (srv) {
        newItems[index].unit_price = srv.price;
      }
    }

    setItems(newItems);
  };

  const calculateSubtotal = () => {
    return items.reduce((acc, curr) => {
      const s = services.find(srv => srv.id == curr.service);
      const price = curr.unit_price !== '' && curr.unit_price !== undefined ? Number(curr.unit_price) : (s ? Number(s.price) : 0);
      return acc + (price * Number(curr.quantity || 1));
    }, 0);
  };

  const subtotal = calculateSubtotal();
  const numericDiscount = discount !== '' && !isNaN(discount) ? Number(discount) : 0;
  const finalTotal = Math.max(0, subtotal - numericDiscount);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!customerName || !customerPhone || items.length === 0 || !collectionDate) {
      alert('Please fill out customer name, phone, at least one item, and collection date.');
      return;
    }

    try {
      const customerRes = await api.post('customers/', {
        name: customerName,
        phone: customerPhone,
        email: customerEmail || '',
        address: customerAddress || ''
      });

      const customerId = customerRes.data.id;

      const formattedItems = items.map(i => ({
        service: Number(i.service),
        quantity: Number(i.quantity),
        unit_price: i.unit_price !== '' && i.unit_price !== undefined ? Number(i.unit_price) : undefined
      }));

      const payload = {
        customer: customerId,
        items: formattedItems,
        collection_date: collectionDate,
        special_instructions: specialInstructions || '',
        discount: numericDiscount,
        initial_payment: initialPayment ? Number(initialPayment) : 0,
        payment_method: paymentMethod,
        reference_number: referenceNumber || ''
      };

      const res = await api.post('orders/', payload);
      setCreatedOrder(res.data);
    } catch (err) {
      console.error("Order creation error:", err.response?.data);
      alert('Failed to create order.');
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-bold text-slate-800">Create New Order</h3>
        <button onClick={() => navigate('/orders')} className="text-slate-600 hover:underline text-sm font-bold">&larr; Back to Orders</button>
      </div>

      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-sm border border-slate-200 space-y-6">
        <div className="space-y-4 border-b pb-4">
          <h4 className="font-bold text-xs uppercase text-sky-700 tracking-wider">Customer Details</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase text-slate-600 mb-1">Customer Full Name *</label>
              <input 
                type="text" 
                required
                placeholder="e.g. Tendai Mutasa"
                value={customerName}
                onChange={e => setCustomerName(e.target.value)}
                className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-sky-600"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase text-slate-600 mb-1">Phone Number *</label>
              <input 
                type="text" 
                required
                placeholder="e.g. +263771234567"
                value={customerPhone}
                onChange={e => setCustomerPhone(e.target.value)}
                className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-sky-600"
              />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase text-slate-600 mb-1">Email (Optional)</label>
              <input 
                type="email" 
                placeholder="customer@email.com"
                value={customerEmail}
                onChange={e => setCustomerEmail(e.target.value)}
                className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-sky-600"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase text-slate-600 mb-1">Address (Optional)</label>
              <input 
                type="text" 
                placeholder="Mutare Address"
                value={customerAddress}
                onChange={e => setCustomerAddress(e.target.value)}
                className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-sky-600"
              />
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <h4 className="font-bold text-xs uppercase text-sky-700 tracking-wider">Items & Services (Prices fully editable for Blankets, Sheets, etc.)</h4>
            {services.length === 0 && (
              <button type="button" onClick={fetchServices} className="text-xs text-sky-600 font-bold hover:underline">
                {loadingServices ? 'Loading services...' : 'Click to reload services'}
              </button>
            )}
          </div>

          {items.map((item, idx) => {
            const selectedSrv = services.find(s => s.id == item.service);
            return (
              <div key={idx} className="flex gap-3 items-center bg-slate-50 p-3 rounded border border-slate-200">
                <select 
                  required
                  value={item.service}
                  onChange={e => handleItemChange(idx, 'service', e.target.value)}
                  className="flex-2 border border-slate-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-sky-600 bg-white"
                >
                  <option value="">{loadingServices ? 'Loading services...' : 'Select Service...'}</option>
                  {services.map(s => (
                    <option key={s.id} value={s.id}>{s.name} (Default: ${s.price})</option>
                  ))}
                </select>

                <div className="w-28">
                  <span className="text-[10px] uppercase font-bold text-slate-500 block">Price ($)</span>
                  <input 
                    type="number" 
                    step="0.01" 
                    placeholder={selectedSrv ? selectedSrv.price : 'Price'}
                    value={item.unit_price}
                    onChange={e => handleItemChange(idx, 'unit_price', e.target.value)}
                    className="w-full border border-slate-300 rounded px-2 py-1.5 text-sm focus:outline-none focus:border-sky-600 bg-white font-bold"
                  />
                </div>

                <div className="w-20">
                  <span className="text-[10px] uppercase font-bold text-slate-500 block">Qty</span>
                  <input 
                    type="number" 
                    min="1" 
                    required
                    value={item.quantity}
                    onChange={e => handleItemChange(idx, 'quantity', e.target.value)}
                    className="w-full border border-slate-300 rounded px-2 py-1.5 text-sm focus:outline-none focus:border-sky-600 bg-white"
                  />
                </div>

                {items.length > 1 && (
                  <button type="button" onClick={() => removeItem(idx)} className="text-rose-600 font-bold text-xl px-2 mt-4">&times;</button>
                )}
              </div>
            );
          })}
          <button type="button" onClick={addItem} className="text-xs font-bold text-sky-600 hover:underline">+ Add Another Item</button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t pt-4">
          <div>
            <label className="block text-xs font-bold uppercase text-slate-600 mb-1">Collection Date *</label>
            <input 
              type="date" 
              required
              value={collectionDate}
              onChange={e => setCollectionDate(e.target.value)}
              className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-sky-600"
            />
          </div>

          <div className="bg-slate-50 p-3 rounded border border-slate-200 space-y-1">
            <div className="flex justify-between text-xs text-slate-600">
              <span>Subtotal:</span>
              <span className="font-mono">${subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-xs font-bold uppercase text-slate-600">Discount ($):</span>
              <input 
                type="number" 
                step="0.01" 
                min="0"
                placeholder="0.00"
                value={discount}
                onChange={e => setDiscount(e.target.value)}
                className="w-28 border border-slate-300 rounded px-2 py-1 text-sm focus:outline-none focus:border-sky-600 font-bold bg-white text-right font-mono"
              />
            </div>
            <div className="flex justify-between items-center pt-2 border-t font-black text-slate-800 text-base">
              <span>Final Total:</span>
              <span className="text-sky-700 font-mono">${finalTotal.toFixed(2)}</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 border-t pt-4">
          <div>
            <label className="block text-xs font-bold uppercase text-slate-600 mb-1">Initial Payment ($)</label>
            <input 
              type="number" 
              step="0.01" 
              value={initialPayment}
              onChange={e => setInitialPayment(e.target.value)}
              className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-sky-600"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase text-slate-600 mb-1">Payment Method</label>
            <select 
              value={paymentMethod}
              onChange={e => setPaymentMethod(e.target.value)}
              className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-sky-600 bg-white"
            >
              <option value="Cash">Cash</option>
              <option value="EcoCash">EcoCash</option>
              <option value="Bank Transfer">Bank Transfer</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase text-slate-600 mb-1">Reference # (If any)</label>
            <input 
              type="text" 
              value={referenceNumber}
              onChange={e => setReferenceNumber(e.target.value)}
              className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-sky-600"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold uppercase text-slate-600 mb-1">Special Instructions</label>
          <textarea 
            rows="2"
            value={specialInstructions}
            onChange={e => setSpecialInstructions(e.target.value)}
            className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-sky-600"
          ></textarea>
        </div>

        <button type="submit" className="w-full bg-sky-600 hover:bg-sky-700 text-white font-bold py-2.5 rounded transition text-sm shadow">
          Save & Create Order
        </button>
      </form>

      <ReceiptModal order={createdOrder} onClose={() => navigate('/orders')} />
    </div>
  );
}