"use client";

import { useEffect, useState } from "react";
import axiosInstance from "../../components/AxiosInstance";
import toast from "react-hot-toast";

export default function OrderListPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  useEffect(() => {
    axiosInstance
      .get("/orders/")
      .then((res) => setOrders(res.data))
      .catch(() => toast.error("Failed to fetch orders"))
      .finally(() => setLoading(false));
  }, []);

  const filteredOrders = orders.filter((order) => {
    const date = new Date(order.order_date);
    const from = fromDate ? new Date(fromDate) : null;
    const to = toDate ? new Date(toDate) : null;
    return (!from || date >= from) && (!to || date <= to);
  });

  return (
    <div className="p-6 space-y-4">
      <h2 className="text-xl font-bold">Order List</h2>

      {/* Filter */}
      <div className="flex gap-4 items-end">
        <div>
          <label className="text-sm font-medium">From Date:</label>
          <input
            type="date"
            className="border rounded px-3 py-1 text-sm"
            value={fromDate}
            onChange={(e) => setFromDate(e.target.value)}
          />
        </div>
        <div>
          <label className="text-sm font-medium">To Date:</label>
          <input
            type="date"
            className="border rounded px-3 py-1 text-sm"
            value={toDate}
            onChange={(e) => setToDate(e.target.value)}
          />
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto border rounded shadow">
        <table className="table text-sm w-full border border-gray-300">
          <thead className="bg-sky-800 text-white text-center">
            <tr>
              <th>SI</th>
              <th>Order No</th>
              <th>Order Date</th>
              <th>Product Name</th>
              <th>Company</th>
              <th>Quantity</th>
              <th>Order Price</th>
              <th>Total</th>
              <th>Invoice</th>
            </tr>
          </thead>
          <tbody>
            {filteredOrders.length === 0 ? (
              <tr>
                <td colSpan={9} className="text-center py-4 text-gray-500">
                  No orders found
                </td>
              </tr>
            ) : (
              filteredOrders.map((order, orderIndex) =>
                order.items.map((item, itemIndex) => (
                  <tr
                    key={`${order.id}-${item.id}`}
                    className="border-b border-gray-200"
                  >
                    {/* SI, Order No, Order Date */}
                    {itemIndex === 0 && (
                      <>
                        <td
                          rowSpan={order.items.length}
                          className="text-center align-middle font-bold"
                        >
                          {orderIndex + 1}
                        </td>
                        <td
                          rowSpan={order.items.length}
                          className="text-center align-middle font-semibold text-sky-700"
                        >
                          {order.order_no}
                        </td>
                        <td
                          rowSpan={order.items.length}
                          className="text-center align-middle"
                        >
                          {order.order_date}
                        </td>
                      </>
                    )}

                    {/* Product Info */}
                    <td className="text-center">
                      {item.product_details?.product_name || "N/A"}
                    </td>
                    <td className="text-center">
                      {item.product_details?.category_detail?.company_detail
                        ?.company_name || "N/A"}
                    </td>
                    <td className="text-center">{item.quantity}</td>
                    <td className="text-center">{item.order_price}</td>
                    <td className="text-center">
                      {(item.quantity * item.order_price).toFixed(2)}
                    </td>

                    {/* Invoice Button */}
                    {itemIndex === 0 && (
                      <td
                        rowSpan={order.items.length}
                        className="text-center align-middle"
                      >
                        <button
                          onClick={() => handleEdit(order)}
                          className="btn btn-sm btn-outline btn-primary"
                        >
                          Edit
                        </button>
                      </td>
                    )}
                  </tr>
                ))
              )
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
