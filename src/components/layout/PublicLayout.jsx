import { Outlet, Link } from 'react-router-dom';

export default function PublicLayout() {
  return (
    <div className="public-layout flex flex-col h-full min-h-screen">
      <header className="border-b">
        <div className="container flex items-center justify-between py-4">
          <Link to="/" className="font-bold text-xl">ShoeStore</Link>
          <nav className="flex gap-4">
            <Link to="/collections">Collections</Link>
            <Link to="/about">About</Link>
            <Link to="/contact">Contact</Link>
          </nav>
        </div>
      </header>
      
      <main className="flex-1 py-8">
        <Outlet />
      </main>

      <footer className="border-t py-8 mt-auto">
        <div className="container text-center text-sm text-gray-500">
          &copy; {new Date().getFullYear()} ShoeStore. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
