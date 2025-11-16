import React, { useEffect, useState } from 'react';
import { ApiClient } from 'adminjs';

const Dashboard = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const api = new ApiClient();
        const response = await api.getDashboard();
        console.log('API Response:', response);
        console.log('Response.data:', response.data);
        
        setDashboardData(response.data);
        console.log('Data set successfully');
      } catch (error) {
        console.error('Error fetching dashboard:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);


  if (loading) {
    return <div style={{ padding: '40px', fontSize: '20px' }}>Loading Dashboard...</div>;
  }

  if (!dashboardData) {
    return <div style={{ padding: '40px', fontSize: '20px', color: 'red' }}>Error loading dashboard</div>;
  }

  const { stats = {}, totalRevenue = '0.00', recentOrders = [], recentProducts = [], userName = 'User', userRole = 'user' } = dashboardData;
  
  return (
    <div style={{ padding: '40px', backgroundColor: '#f5f5f5', minHeight: '100vh' }}>
      <div style={{ marginBottom: '40px' }}>
        <h1 style={{ fontSize: '32px', marginBottom: '10px' }}>📊 Dashboard Overview</h1>
        <p style={{ fontSize: '16px', color: '#666' }}>
          Welcome, <strong>{userName}</strong> ({userRole === 'admin' ? '👑 Admin' : '👤 User'})
        </p>
      </div>

      <div style={{ marginBottom: '40px' }}>
        <h2 style={{ fontSize: '24px', marginBottom: '20px' }}>📈 Key Statistics</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px' }}>
          <div style={{ backgroundColor: 'white', padding: '30px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
            <div style={{ fontSize: '40px', marginBottom: '10px' }}>👥</div>
            <div style={{ fontSize: '14px', color: '#666', marginBottom: '5px' }}>Total Users</div>
            <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#1976d2' }}>{stats.usersCount || 0}</div>
          </div>
          
          <div style={{ backgroundColor: 'white', padding: '30px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
            <div style={{ fontSize: '40px', marginBottom: '10px' }}>📁</div>
            <div style={{ fontSize: '14px', color: '#666', marginBottom: '5px' }}>Categories</div>
            <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#0288d1' }}>{stats.categoriesCount || 0}</div>
          </div>
          
          <div style={{ backgroundColor: 'white', padding: '30px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
            <div style={{ fontSize: '40px', marginBottom: '10px' }}>📦</div>
            <div style={{ fontSize: '14px', color: '#666', marginBottom: '5px' }}>Products</div>
            <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#388e3c' }}>{stats.productsCount || 0}</div>
          </div>
          
          <div style={{ backgroundColor: 'white', padding: '30px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
            <div style={{ fontSize: '40px', marginBottom: '10px' }}>🛒</div>
            <div style={{ fontSize: '14px', color: '#666', marginBottom: '5px' }}>Orders</div>
            <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#f57c00' }}>{stats.ordersCount || 0}</div>
          </div>
          
          <div style={{ backgroundColor: 'white', padding: '30px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
            <div style={{ fontSize: '40px', marginBottom: '10px' }}>📋</div>
            <div style={{ fontSize: '14px', color: '#666', marginBottom: '5px' }}>Order Items</div>
            <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#7b1fa2' }}>{stats.orderItemsCount || 0}</div>
          </div>
        </div>
      </div>

      <div style={{ marginBottom: '40px' }}>
        <div style={{ backgroundColor: '#388e3c', padding: '40px', borderRadius: '8px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)', textAlign: 'center' }}>
          <div style={{ fontSize: '18px', color: 'white', marginBottom: '10px' }}>💰 Total Revenue</div>
          <div style={{ fontSize: '48px', fontWeight: 'bold', color: 'white' }}>${totalRevenue}</div>
        </div>
      </div>

      {recentOrders && recentOrders.length > 0 && (
        <div style={{ marginBottom: '40px' }}>
          <h2 style={{ fontSize: '24px', marginBottom: '20px' }}>🛒 Recent Orders</h2>
          <div style={{ backgroundColor: 'white', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)', overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ backgroundColor: '#f5f5f5', borderBottom: '2px solid #ddd' }}>
                  <th style={{ padding: '15px', textAlign: 'left', fontWeight: 'bold' }}>Order ID</th>
                  <th style={{ padding: '15px', textAlign: 'left', fontWeight: 'bold' }}>Status</th>
                  <th style={{ padding: '15px', textAlign: 'left', fontWeight: 'bold' }}>Total</th>
                  <th style={{ padding: '15px', textAlign: 'left', fontWeight: 'bold' }}>Date</th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.map((order, index) => (
                  <tr key={order.id} style={{ borderBottom: index < recentOrders.length - 1 ? '1px solid #eee' : 'none' }}>
                    <td style={{ padding: '15px' }}>#{order.id}</td>
                    <td style={{ padding: '15px' }}>
                      <span style={{
                        backgroundColor: order.status === 'completed' ? '#388e3c' : order.status === 'pending' ? '#f57c00' : '#0288d1',
                        color: 'white',
                        padding: '5px 15px',
                        borderRadius: '4px',
                        fontSize: '12px',
                        fontWeight: 'bold'
                      }}>
                        {order.status}
                      </span>
                    </td>
                    <td style={{ padding: '15px', fontWeight: 'bold' }}>${order.total}</td>
                    <td style={{ padding: '15px', color: '#666' }}>{new Date(order.createdAt).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {recentProducts && recentProducts.length > 0 && (
        <div style={{ marginBottom: '40px' }}>
          <h2 style={{ fontSize: '24px', marginBottom: '20px' }}>🏷️ Recent Products</h2>
          <div style={{ backgroundColor: 'white', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)', overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ backgroundColor: '#f5f5f5', borderBottom: '2px solid #ddd' }}>
                  <th style={{ padding: '15px', textAlign: 'left', fontWeight: 'bold' }}>Product ID</th>
                  <th style={{ padding: '15px', textAlign: 'left', fontWeight: 'bold' }}>Name</th>
                  <th style={{ padding: '15px', textAlign: 'left', fontWeight: 'bold' }}>Price</th>
                  <th style={{ padding: '15px', textAlign: 'left', fontWeight: 'bold' }}>Stock</th>
                </tr>
              </thead>
              <tbody>
                {recentProducts.map((product, index) => (
                  <tr key={product.id} style={{ borderBottom: index < recentProducts.length - 1 ? '1px solid #eee' : 'none' }}>
                    <td style={{ padding: '15px' }}>#{product.id}</td>
                    <td style={{ padding: '15px' }}>{product.title || product.name}</td>
                    <td style={{ padding: '15px', fontWeight: 'bold' }}>${product.price}</td>
                    <td style={{ padding: '15px' }}>
                      <span style={{
                        backgroundColor: (product.stock || 0) > 10 ? '#388e3c' : (product.stock || 0) > 0 ? '#f57c00' : '#d32f2f',
                        color: 'white',
                        padding: '5px 15px',
                        borderRadius: '4px',
                        fontSize: '12px',
                        fontWeight: 'bold'
                      }}>
                        {product.stock || 0}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
