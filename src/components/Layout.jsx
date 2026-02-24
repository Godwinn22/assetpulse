import React from "react";

const Layout = () => {
    return (
        <div className="min-h-screen flex">
            <aside className="w-64 bg-white shadow-md">Sidebar</aside>

            <main className="flex-1 p-6 bg-gray-50">{children}</main>
        </div>
    );
};

export default Layout;
