import React, { useEffect, useState } from "react";
import styles from "../../styles/styles";
import { AiOutlineArrowRight, AiOutlineMoneyCollect } from "react-icons/ai";
import { MdBorderClear } from "react-icons/md";
import { Link } from "react-router-dom";
import { DataGrid } from "@material-ui/data-grid";
import { useDispatch, useSelector } from "react-redux";
import { getAllOrdersOfAdmin } from "../../redux/actions/order";
import Loader from "../Layout/Loader";
import { getAllSellers } from "../../redux/actions/sellers";
import axios from "axios";
import { server } from "../../server";

const AdminDashboardMain = () => {
  const dispatch = useDispatch();
  const [stats, setStats] = useState(null);
  const [activity, setActivity] = useState(null);

  const { adminOrders, adminOrderLoading } = useSelector(
    (state) => state.order
  );
  const { sellers } = useSelector((state) => state.seller);

  useEffect(() => {
    dispatch(getAllOrdersOfAdmin());
    dispatch(getAllSellers());
    axios
      .get(`${server}/admin/stats`, { withCredentials: true })
      .then((res) => setStats(res.data.stats))
      .catch((error) =>
        console.log(error.response?.data?.message || error.message)
      );
    axios
      .get(`${server}/admin/activity`, { withCredentials: true })
      .then((res) => setActivity(res.data.activity))
      .catch((error) =>
        console.log(error.response?.data?.message || error.message)
      );
  }, []);

  const adminBalance = stats ? stats.platformEarnings.toFixed(2) : null;

  const columns = [
    { field: "id", headerName: "Order ID", minWidth: 150, flex: 0.7 },

    {
      field: "status",
      headerName: "Status",
      minWidth: 130,
      flex: 0.7,
      cellClassName: (params) => {
        return params.getValue(params.id, "status") === "Delivered"
          ? "greenColor"
          : "redColor";
      },
    },
    {
      field: "itemsQty",
      headerName: "Items Qty",
      type: "number",
      minWidth: 130,
      flex: 0.7,
    },

    {
      field: "total",
      headerName: "Total",
      type: "number",
      minWidth: 130,
      flex: 0.8,
    },
    {
      field: "createdAt",
      headerName: "Order Date",
      type: "number",
      minWidth: 130,
      flex: 0.8,
    },
  ];

  const row = [];
  adminOrders &&
    adminOrders.forEach((item) => {
      row.push({
        id: item._id,
        itemsQty: item?.cart?.reduce((acc, item) => acc + item.qty, 0),
        total: item?.totalPrice + " $",
        status: item?.status,
        createdAt: item?.createdAt.slice(0, 10),
      });
    });

  return (
    <>
      {adminOrderLoading ? (
        <Loader />
      ) : (
        <div className="w-full p-4">
          <h3 className="text-[22px] font-Poppins pb-2">Overview</h3>
          {stats && (
            <div className="w-full grid grid-cols-2 800px:grid-cols-4 gap-3 mb-4">
              {[
                { label: "Total Sales (paid)", value: `$${stats.totalSales.toFixed(2)}` },
                { label: "Paid Orders", value: stats.paidOrders },
                { label: "Total Orders", value: stats.totalOrders },
                { label: "Buyers", value: stats.totalUsers },
                { label: "Sellers (active)", value: `${stats.totalSellers} (${stats.activeSellers})` },
                { label: "Products / Events", value: `${stats.totalProducts} / ${stats.totalEvents}` },
                { label: "Pending Withdrawals", value: `${stats.pendingWithdrawals} ($${stats.pendingWithdrawalsAmount.toFixed(2)})` },
                { label: "Suspended Sellers", value: stats.suspendedSellers },
              ].map((card) => (
                <div key={card.label} className="bg-white shadow rounded px-3 py-4">
                  <h3 className="text-[13px] font-[400] text-[#00000085]">{card.label}</h3>
                  <h5 className="pt-1 text-[18px] font-[500]">{card.value}</h5>
                </div>
              ))}
            </div>
          )}
          <div className="w-full block 800px:flex items-center justify-between">
            <div className="w-full mb-4 800px:w-[30%] min-h-[20vh] bg-white shadow rounded px-2 py-5">
              <div className="flex items-center">
                <AiOutlineMoneyCollect
                  size={30}
                  className="mr-2"
                  fill="#00000085"
                />
                <h3
                  className={`${styles.productTitle} !text-[18px] leading-5 !font-[400] text-[#00000085]`}
                >
                  Total Earning
                </h3>
              </div>
              <h5 className="pt-2 pl-[36px] text-[22px] font-[500]">
                $ {adminBalance}
              </h5>
            </div>

            <div className="w-full mb-4 800px:w-[30%] min-h-[20vh] bg-white shadow rounded px-2 py-5">
              <div className="flex items-center">
                <MdBorderClear size={30} className="mr-2" fill="#00000085" />
                <h3
                  className={`${styles.productTitle} !text-[18px] leading-5 !font-[400] text-[#00000085]`}
                >
                  All Sellers
                </h3>
              </div>
              <h5 className="pt-2 pl-[36px] text-[22px] font-[500]">
                {sellers && sellers.length}
              </h5>
              <Link to="/admin-sellers">
                <h5 className="pt-4 pl-2 text-[#077f9c]">View Sellers</h5>
              </Link>
            </div>

            <div className="w-full mb-4 800px:w-[30%] min-h-[20vh] bg-white shadow rounded px-2 py-5">
              <div className="flex items-center">
                <AiOutlineMoneyCollect
                  size={30}
                  className="mr-2"
                  fill="#00000085"
                />
                <h3
                  className={`${styles.productTitle} !text-[18px] leading-5 !font-[400] text-[#00000085]`}
                >
                  All Orders
                </h3>
              </div>
              <h5 className="pt-2 pl-[36px] text-[22px] font-[500]">
                {adminOrders && adminOrders.length}
              </h5>
              <Link to="/admin-orders">
                <h5 className="pt-4 pl-2 text-[#077f9c]">View Orders</h5>
              </Link>
            </div>
          </div>

          <br />
          <h3 className="text-[22px] font-Poppins pb-2">Latest Orders</h3>
          <div className="w-full min-h-[45vh] bg-white rounded">
            <DataGrid
              rows={row}
              columns={columns}
              pageSize={4}
              disableSelectionOnClick
              autoHeight
            />
          </div>

          {activity && (
            <div className="w-full mt-6">
              <h3 className="text-[22px] font-Poppins pb-2">Recent Platform Activity</h3>
              <div className="w-full grid grid-cols-1 800px:grid-cols-2 gap-3">
                {[
                  { title: "New Users", items: activity.users.map((u) => ({ name: u.name, sub: `${u.role || "User"} · ${new Date(u.createdAt).toLocaleDateString()}`, to: "/admin-users" })) },
                  { title: "New Sellers", items: activity.shops.map((s) => ({ name: s.name, sub: `${s.status || "Active"} · ${new Date(s.createdAt).toLocaleDateString()}`, to: "/admin-sellers" })) },
                  { title: "New Products", items: activity.products.map((p) => ({ name: p.name, sub: `$${p.discountPrice} · ${new Date(p.createdAt).toLocaleDateString()}`, to: "/admin-products" })) },
                  { title: "Latest Orders", items: activity.orders.map((o) => ({ name: `Order — $${o.totalPrice}`, sub: `${o.status} · ${new Date(o.createdAt).toLocaleDateString()}`, to: "/admin-orders" })) },
                  { title: "Withdrawal Requests", items: activity.withdraws.map((w) => ({ name: `$${w.amount}`, sub: `${w.status} · ${new Date(w.createdAt).toLocaleDateString()}`, to: "/admin-withdraw" })) },
                ].map((group) => (
                  <div key={group.title} className="bg-white shadow rounded p-4">
                    <h4 className="text-[15px] font-[600] pb-2">{group.title}</h4>
                    {group.items.length === 0 ? (
                      <p className="text-[13px] text-[#00000085]">No activity yet</p>
                    ) : (
                      group.items.slice(0, 5).map((item, idx) => (
                        <Link key={idx} to={item.to}>
                          <div className="flex justify-between py-1 border-b last:border-0">
                            <span className="text-[13px]">{item.name}</span>
                            <span className="text-[12px] text-[#00000085]">{item.sub}</span>
                          </div>
                        </Link>
                      ))
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </>
  );
};

export default AdminDashboardMain;
