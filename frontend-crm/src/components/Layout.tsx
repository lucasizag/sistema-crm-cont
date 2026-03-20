import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Users, UserCircle, CheckSquare, Briefcase } from 'lucide-react';

export default function Layout({ children }: { children: React.ReactNode }) {
  const location = useLocation();

  // Aquí definimos las opciones del menú
  const menuItems = [
    { path: '/', name: 'Panel', icon: LayoutDashboard },
    { path: '/clientes', name: 'Clientes', icon: Users },
    { path: '/asistentes', name: 'Asistentes', icon: UserCircle },
    { path: '/tareas', name: 'Tareas', icon: CheckSquare },
  ];

  return (
    <div className="flex h-screen bg-slate-50 font-sans overflow-hidden">
      
      {/* --- SIDEBAR ESCRITORIO (Oculto en celular) --- */}
      <aside className="hidden md:flex flex-col w-64 bg-slate-900 text-slate-300 border-r border-slate-800 transition-all z-20">
        <div className="p-6 flex items-center gap-3 text-white">
          <div className="bg-indigo-600 p-2 rounded-lg shadow-md">
            <Briefcase className="w-5 h-5" />
          </div>
          <span className="text-xl font-bold tracking-tight">Estudio Kari</span>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
          {menuItems.map((item) => {
            // Comprobamos si estamos en la ruta actual para pintarlo de otro color
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

        {/* Perfil del usuario abajo */}
        <div className="p-4 border-t border-slate-800">
          <div className="flex items-center gap-3 px-4 py-2 hover:bg-slate-800 rounded-xl transition cursor-pointer">
            <div className="w-9 h-9 bg-indigo-500 rounded-full flex items-center justify-center text-white font-bold">
              K
            </div>
            <div>
              <p className="text-sm font-medium text-white">Karina</p>
              <p className="text-xs text-slate-500">Administradora</p>
            </div>
          </div>
        </div>
      </aside>

      {/* --- CONTENIDO PRINCIPAL --- */}
      <main className="flex-1 overflow-y-auto pb-20 md:pb-0 h-full">
        {children}
      </main>

      {/* --- NAVBAR MÓVIL (Fija abajo solo en celular) --- */}
      <nav className="md:hidden fixed bottom-0 w-full bg-white border-t border-slate-200 flex justify-around items-center p-2 z-50 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
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
      </nav>

    </div>
  );
}