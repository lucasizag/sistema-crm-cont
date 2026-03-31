import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Users, UserCircle, CheckSquare, Briefcase, LogOut, Clock } from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
  user: any;
  onLogout: () => void;
}

export default function Layout({ children, user, onLogout }: LayoutProps) {
  const location = useLocation();

  const menuItems = [
    { path: '/', name: 'Panel', icon: LayoutDashboard },
    { path: '/clientes', name: 'Clientes', icon: Users },
    // Solo mostramos asistentes en el menú si es admin
    ...(user.role === 'admin' ? [{ path: '/asistentes', name: 'Asistentes', icon: UserCircle }] : []),
    { path: '/tareas', name: 'Tareas', icon: CheckSquare },
    { path: '/horas', name: 'Horas', icon: Clock }, // <--- NUEVO MÓDULO AGREGADO AQUÍ
  ];

  return (
    <div className="flex h-screen bg-slate-50 font-sans overflow-hidden">
      
      {/* SIDEBAR ESCRITORIO */}
      <aside className="hidden md:flex flex-col w-64 bg-slate-900 text-slate-300 border-r border-slate-800 z-20">
        <div className="p-6 flex items-center gap-3 text-white">
          <div className="bg-indigo-600 p-2 rounded-lg shadow-md">
            <Briefcase className="w-5 h-5" />
          </div>
          <span className="text-xl font-bold tracking-tight">Estudio Kari</span>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
          {menuItems.map((item) => {
            const isActive = location.pathname === item.path || (item.path !== '/' && location.pathname.startsWith(item.path));
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium ${
                  isActive 
                    ? 'bg-indigo-600 text-white shadow-md' 
                    : 'hover:bg-slate-800 hover:text-white'
                }`}
              >
                <item.icon className="w-5 h-5" />
                {item.name}
              </Link>
            );
          })}
        </nav>

        {/* Perfil del usuario y Botón Salir */}
        <div className="p-4 border-t border-slate-800 space-y-2">
          <div className="flex items-center gap-3 px-4 py-2">
            <div className="w-9 h-9 bg-indigo-500 rounded-full flex items-center justify-center text-white font-bold uppercase">
              {user.name?.charAt(0) || 'U'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">{user.name}</p>
              <p className="text-xs text-slate-500 capitalize">{user.role}</p>
            </div>
          </div>
          
          <button 
            onClick={onLogout}
            className="flex items-center gap-3 w-full px-4 py-2 text-slate-400 hover:text-red-400 hover:bg-red-900/20 rounded-xl transition-all text-sm font-medium"
          >
            <LogOut className="w-4 h-4" />
            Cerrar Sesión
          </button>
        </div>
      </aside>

      {/* CONTENIDO PRINCIPAL */}
      <main className="flex-1 overflow-y-auto pb-20 md:pb-0 h-full">
        {children}
      </main>

      {/* NAVBAR MÓVIL */}
      <nav className="md:hidden fixed bottom-0 w-full bg-white border-t border-slate-200 flex justify-around items-center p-2 z-50 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] overflow-x-auto">
        {menuItems.map((item) => {
          const isActive = location.pathname === item.path || (item.path !== '/' && location.pathname.startsWith(item.path));
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex flex-col items-center p-2 rounded-lg min-w-[64px] ${
                isActive ? 'text-indigo-600' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <item.icon className={`w-6 h-6 mb-1 ${isActive ? 'fill-indigo-50/50' : ''}`} />
              <span className="text-[10px] font-medium">{item.name}</span>
            </Link>
          );
        })}
        {/* Botón salir móvil */}
        <button 
          onClick={onLogout}
          className="flex flex-col items-center p-2 text-slate-500 min-w-[64px]"
        >
          <LogOut className="w-6 h-6 mb-1" />
          <span className="text-[10px] font-medium">Salir</span>
        </button>
      </nav>

    </div>
  );
}