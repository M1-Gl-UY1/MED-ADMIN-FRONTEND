import { useState } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Car,
  ShoppingCart,
  Users,
  Package,
  Sliders,
  Bell,
  Settings,
  X,
  ChevronLeft,
} from 'lucide-react';
import logoMedBlanc from '../../assets/logo_med.jpeg';

const navigation = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboard },
  { name: 'Vehicules', href: '/vehicules', icon: Car },
  { name: 'Commandes', href: '/commandes', icon: ShoppingCart },
  { name: 'Clients', href: '/clients', icon: Users },
  { name: 'Stock', href: '/stock', icon: Package },
  { name: 'Options', href: '/options', icon: Sliders },
  { name: 'Notifications', href: '/notifications', icon: Bell },
  { name: 'Parametres', href: '/parametres', icon: Settings },
];

export default function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const location = useLocation();

  const isActive = (href: string) => {
    if (href === '/') return location.pathname === '/';
    return location.pathname.startsWith(href);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 z-50 h-full bg-primary text-white transition-all duration-300 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:translate-x-0 ${sidebarCollapsed ? 'lg:w-20' : 'lg:w-64'}`}
      >
        {/* Sidebar header */}
        <div className="flex items-center justify-between h-16 px-4 border-b border-white/10">
          <Link to="/" className="flex items-center gap-3">
            <img
              src={logoMedBlanc}
              alt="MED Auto"
              className={`h-10 w-auto object-contain rounded-lg ${sidebarCollapsed ? 'lg:h-8' : ''}`}
            />
            {!sidebarCollapsed && (
              <span className="text-lg font-bold">MED Admin</span>
            )}
          </Link>

          {/* Mobile close button */}
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden p-2 rounded-lg hover:bg-white/10"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="p-4 space-y-1">
          {navigation.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);
            return (
              <Link
                key={item.name}
                to={item.href}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  active
                    ? 'bg-secondary text-primary font-semibold'
                    : 'text-white/80 hover:bg-white/10 hover:text-white'
                } ${sidebarCollapsed ? 'lg:justify-center lg:px-2' : ''}`}
                title={sidebarCollapsed ? item.name : undefined}
              >
                <Icon className="w-5 h-5 flex-shrink-0" />
                {!sidebarCollapsed && <span>{item.name}</span>}
              </Link>
            );
          })}
        </nav>

        {/* Collapse button (desktop only) */}
        <button
          onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
          className="hidden lg:flex absolute bottom-4 right-4 p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
        >
          <ChevronLeft
            className={`w-5 h-5 transition-transform ${sidebarCollapsed ? 'rotate-180' : ''}`}
          />
        </button>
      </aside>

      {/* Main content */}
      <div
        className={`transition-all duration-300 ${
          sidebarCollapsed ? 'lg:ml-20' : 'lg:ml-64'
        }`}
      >
        <Outlet context={{ setSidebarOpen }} />
      </div>
    </div>
  );
}
