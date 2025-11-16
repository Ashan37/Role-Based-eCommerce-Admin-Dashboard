import { useEffect, useState } from "react";
import { H2, H3, Text, Box, Loader, Table, TableRow, TableCell, TableHead, TableBody } from "@adminjs/design-system";

const Dashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/admin/api/dashboard")
      .then((response) => {
        console.log("Dashboard fetch status:", response.status);
        return response.json();
      })
      .then((responseData) => {
        console.log("Dashboard API response:", responseData);
        setData(responseData);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Dashboard error:", error);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <Box p="xxl">
        <Loader />
      </Box>
    );
  }

  const role = data?.role || 'guest';

  // Regular user dashboard - comprehensive view
  if (role === 'user') {
    return (
      <div style={{ padding: 20 }}>
        <H2>User Dashboard</H2>
        <Text style={{ marginBottom: 20 }}>Welcome, {data.userName}</Text>
        
        {/* Recent Products Section */}
        {data.recentProducts && data.recentProducts.length > 0 && (
          <Box mb="xl">
            <H3 mb="lg">Recent Products</H3>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>ID</TableCell>
                  <TableCell>Title</TableCell>
                  <TableCell>Price</TableCell>
                  <TableCell>Category</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {data.recentProducts.map(product => (
                  <TableRow key={product.id}>
                    <TableCell>{product.id}</TableCell>
                    <TableCell>{product.title}</TableCell>
                    <TableCell>${parseFloat(product.price).toFixed(2)}</TableCell>
                    <TableCell>{product.categoryId || 'N/A'}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Box>
        )}

        {/* Recent Orders Section */}
        {data.recentOrders && data.recentOrders.length > 0 && (
          <Box mb="xl">
            <H3 mb="lg">Recent Orders</H3>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>ID</TableCell>
                  <TableCell>User ID</TableCell>
                  <TableCell>Total</TableCell>
                  <TableCell>Status</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {data.recentOrders.map(order => (
                  <TableRow key={order.id}>
                    <TableCell>{order.id}</TableCell>
                    <TableCell>{order.userId}</TableCell>
                    <TableCell>${parseFloat(order.total || 0).toFixed(2)}</TableCell>
                    <TableCell>{order.status || 'Pending'}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Box>
        )}
      </div>
    );
  }

  // Admin dashboard (full system summary)
  const users = data?.usersCount ?? 0;
  const orders = data?.ordersCount ?? 0;
  const products = data?.productsCount ?? 0;
  const revenue = data?.revenue ?? 0;

  return (
    <div style={{ padding: 20 }}>
      <H2>System summary</H2>
      <div style={{ display: "flex", gap: 20, marginTop: 12 }}>
        <div style={{ padding: 12, border: "1px solid #eee", borderRadius: 8 }}>
          <Text variant="lg">Users</Text>
          <div style={{ fontSize: 22 }}>{users}</div>
        </div>
        <div style={{ padding: 12, border: "1px solid #eee", borderRadius: 8 }}>
          <Text variant="lg">Orders</Text>
          <div style={{ fontSize: 22 }}>{orders}</div>
        </div>
        <div style={{ padding: 12, border: "1px solid #eee", borderRadius: 8 }}>
          <Text variant="lg">Products</Text>
          <div style={{ fontSize: 22 }}>{products}</div>
        </div>
        <div style={{ padding: 12, border: "1px solid #eee", borderRadius: 8 }}>
          <Text variant="lg">Revenue</Text>
          <div style={{ fontSize: 22 }}>${revenue.toFixed(2)}</div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

