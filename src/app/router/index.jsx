import React from 'react';
import { useRoutes } from 'react-router-dom';
import { routeConfig } from './routeConfig.jsx';

export default function AppRouter() {
  return useRoutes(routeConfig);
}
