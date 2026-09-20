import React from 'react';

export default function ReceiptModal({ order, onClose }) {
  if (!order) return null;

  const total = Number(order.total_amount);
  const paid = Number(order.paid_amount);
  const balance = Number(order.balance_amount);
  const isOverpaid = paid > total;
  const changeAmount = isOverpaid ? paid - total : 0;

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-2xl max-w-md w-full overflow-hidden flex flex-col">
        <div className="p-4 bg-slate-800 text-white flex justify-between items-center">
          <h3 className="font-bold text-lg">Digital Receipt</h3>
          <button onClick={onClose} className="text-slate-300 hover:text-white font-bold text-xl">&times;</button>
        </div>

        <div id="printable-receipt" className="p-6 space-y-4 font-mono text-xs text-slate-800 bg-white">
          <div className="text-center border-b pb-4">
            <h2 className="text-base font-bold uppercase">New Image Dry Cleaners (Pvt) Ltd</h2>
            <p>59 Second Street, Mutare, Zimbabwe</p>
            <p>Phone: 02061211 / +263774092783</p>
            <p className="font-bold mt-2">ORDER RECEIPT</p>
          </div>

          <div className="space-y-1">
            <p><span className="font-bold">Order No:</span> {order.order_number}</p>
            <p><span className="font-bold">Date:</span> {new Date(order.created_at).toLocaleString()}</p>
            <p><span className="font-bold">Customer:</span> {order.customer_details?.name}</p>
            <p><span className="font-bold">Phone:</span> {order.customer_details?.phone}</p>
            <p><span className="font-bold">Collection Date:</span> {order.collection_date}</p>
            <p><span className="font-bold">Received By:</span> {order.received_by_name || 'Staff'}</p>
          </div>

          <table className="w-full text-left border-t border-b border-dashed my-2 py-2">
            <thead>
              <tr className="border-b border-dashed">
                <th className="py-1">Item</th>
                <th className="py-1 text-center">Qty</th>
                <th className="py-1 text-right">Price</th>
                <th className="py-1 text-right">Total</th>
              </tr>
            </thead>
            <tbody>
              {order.items?.map((item, idx) => (
                <tr key={idx}>
                  <td className="py-1">{item.service_name}</td>
                  <td className="py-1 text-center">{item.quantity}</td>
                  <td className="py-1 text-right">${Number(item.unit_price).toFixed(2)}</td>
                  <td className="py-1 text-right">${Number(item.subtotal).toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="space-y-1 border-t pt-2">
            <div className="flex justify-between font-bold">
              <span>Total Amount:</span>
              <span>${total.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>Paid Amount:</span>
              <span>${paid.toFixed(2)}</span>
            </div>

            {isOverpaid ? (
              <div className="flex justify-between font-bold text-emerald-600 border-t pt-1">
                <span>Change Due:</span>
                <span>${changeAmount.toFixed(2)}</span>
              </div>
            ) : (
              <div className="flex justify-between font-bold text-rose-600 border-t pt-1">
                <span>Balance Due:</span>
                <span>${balance.toFixed(2)}</span>
              </div>
            )}
          </div>

          {order.special_instructions && (
            <div className="mt-2 border-t pt-2">
              <p className="font-bold">Special Instructions:</p>
              <p className="italic">{order.special_instructions}</p>
            </div>
          )}

          <div className="text-center border-t pt-4 text-[10px] space-y-1">
            <p>Thank you for choosing New Image Dry Cleaners!</p>
            <p className="italic">Items uncollected after 90 days incur storage charges.</p>
          </div>
        </div>

        <div className="p-4 bg-slate-100 flex justify-end space-x-2">
          <button onClick={() => window.print()} className="bg-sky-600 hover:bg-sky-700 text-white px-4 py-2 rounded font-medium text-sm">
            Print Receipt
          </button>
          <button onClick={onClose} className="bg-slate-300 hover:bg-slate-400 text-slate-800 px-4 py-2 rounded font-medium text-sm">
            Close
          </button>
        </div>
      </div>
    </div>
  );
}