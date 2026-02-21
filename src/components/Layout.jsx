import React, { useState } from 'react';
import { Outlet, useLocation, Link } from 'react-router-dom';
import Sidebar from './Sidebar';

export default function Layout() {
    return (
        <div className="flex h-screen bg-background text-[var(--text-main)]">
            <Sidebar />
            <main className="flex-1 flex flex-col h-screen overflow-hidden">
                <Outlet />
            </main>
        </div>
    );
}
