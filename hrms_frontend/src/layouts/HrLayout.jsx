import React from 'react';
import MainLayout from './MainLayout';

export default function HrLayout({ children, activeKey = 'dashboard', ...props }) {
  return (
    <MainLayout activeKey={activeKey} {...props}>
      {children}
    </MainLayout>
  );
}
