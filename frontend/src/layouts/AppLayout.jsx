import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../components/common/Sidebar';
import Header from '../components/common/Header';

export default function AppLayout() {
  const [globalSearch, setGlobalSearch] = useState('');

  return (
    <div className="min-h-screen flex bg-[#F8FAFC]">
      {/* Permanent Left Sidebar */}
      <Sidebar />

      {/* Main Content Workspace */}
      <div className="flex-1 flex flex-col min-w-0">
        <Header globalSearch={globalSearch} setGlobalSearch={setGlobalSearch} />
        <main className="flex-1 overflow-y-auto">
          <Outlet context={{ globalSearch }} />
        </main>
      </div>
    </div>
  );
}
