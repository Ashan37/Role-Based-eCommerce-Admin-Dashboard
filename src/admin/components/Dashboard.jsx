import React from 'react';
import { H2, Text } from '@adminjs/design-system';

const Dashboard = (props) => {
  const { data } = props;
  const users = data?.usersCount ?? 0;
  const orders = data?.ordersCount ?? 0;
  const products = data?.productsCount ?? 0;
  const revenue = data?.revenue ?? 0;

  return (
    <div style={{ padding: 20 }}>
      <H2>System summary</H2>
      <div style={{ display: 'flex', gap: 20, marginTop: 12 }}>
        <div style={{ padding: 12, border: '1px solid #eee', borderRadius: 8 }}>
          <Text variant="lg">Users</Text>
          <div style={{ fontSize: 22 }}>{users}</div>
        </div>
        <div style={{ padding: 12, border: '1px solid #eee', borderRadius: 8 }}>
          <Text variant="lg">Orders</Text>
          <div style={{ fontSize: 22 }}>{orders}</div>
        </div>
        <div style={{ padding: 12, border: '1px solid #eee', borderRadius: 8 }}>
          <Text variant="lg">Products</Text>
          <div style={{ fontSize: 22 }}>{products}</div>
        </div>
        <div style={{ padding: 12, border: '1px solid #eee', borderRadius: 8 }}>
          <Text variant="lg">Revenue</Text>
          <div style={{ fontSize: 22 }}>${revenue.toFixed(2)}</div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
