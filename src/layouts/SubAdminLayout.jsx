import React from 'react';
import MainLayout from './MainLayout';

export default function SubAdminLayout({ children, activeKey = 'dashboard', ...props }) {
  return (
    <MainLayout activeKey={activeKey} {...props}>
      {children}
    </MainLayout>
  );
}
