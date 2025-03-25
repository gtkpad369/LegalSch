import { useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { Link } from "wouter";

type SidebarNavItemProps = {
  href: string;
  icon: React.ReactNode;
  label: string;
  isActive?: boolean;
};

const SidebarNavItem = ({ href, icon, label, isActive }: SidebarNavItemProps) => {
  return (
    <li>
      <Link 
        href={href} 
        className={cn(
          "flex items-center space-x-2 p-2 rounded-lg hover:bg-slate-100",
          isActive ? "bg-primary text-white hover:bg-primary-dark" : "text-slate-700"
        )}
      >
        {icon}
        <span>{label}</span>
      </Link>
    </li>
  );
};

interface SidebarNavigationProps {
  currentPage?: string;
}

export function SidebarNavigation({ currentPage = "/dashboard" }: SidebarNavigationProps) {
  const [location] = useLocation();
  const currentPath = currentPage || location;

  return (
    <aside className="hidden md:flex flex-col w-64 bg-white border-r border-slate-200 h-screen fixed">
      <div className="p-4 border-b border-slate-200">
        <h1 className="text-xl font-bold text-primary">JurisAgenda</h1>
        <p className="text-sm text-slate-500">Sistema de Agendamentos</p>
      </div>
      
      <nav className="flex-1 overflow-y-auto p-4">
        <ul className="space-y-2">
          <SidebarNavItem
            href="/dashboard"
            isActive={currentPath === "/dashboard" || currentPath === "/"}
            icon={
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
            }
            label="Dashboard"
          />
          
          <SidebarNavItem
            href="/agenda"
            isActive={currentPath === "/agenda"}
            icon={
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            }
            label="Agenda"
          />
          
          <SidebarNavItem
            href="/profile"
            isActive={currentPath === "/profile"}
            icon={
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            }
            label="Perfil"
          />
          
          <SidebarNavItem
            href="/clients"
            isActive={currentPath === "/clients"}
            icon={
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            }
            label="Clientes"
          />
          
          <SidebarNavItem
            href="/settings"
            isActive={currentPath === "/settings"}
            icon={
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            }
            label="Configurações"
          />
        </ul>
      </nav>
      
      <div className="p-4 border-t border-slate-200">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-white font-semibold">
            DR
          </div>
          <div>
            <p className="font-medium">Dr. Rafael Silva</p>
            <p className="text-xs text-slate-500">OAB/SP 123456</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
