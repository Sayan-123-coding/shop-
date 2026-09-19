import { Outlet } from 'react-router-dom';
import PublicNavbar from './PublicNavbar';
import PublicFooter from './PublicFooter';

export default function PublicLayout() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', backgroundColor: 'var(--color-bg-base)', color: 'var(--color-text-primary)' }}>
      <PublicNavbar />
      
      <main style={{ flex: '1 1 auto' }}>
        <Outlet />
      </main>

      <PublicFooter />
    </div>
  );
}
