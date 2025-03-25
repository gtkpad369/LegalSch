import { useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { Link } from "wouter";

type MobileNavItemProps = {
  href: string;
  icon: React.ReactNode;
  label: string;
  isActive?: boolean;
};

const MobileNavItem = ({ href, icon, label, isActive }: MobileNavItemProps) => {
  return (
    <Link 
      href={href} 
      className={cn(
        "flex flex-col items-center p-2",
        isActive ? "text-primary" : "text-slate-600"
      )}
    >
      {icon}
      <span className="text-xs">{label}</span>
    </Link>
  );
};

export function MobileNavigation() {
  const [location] = useLocation();
  const currentPath = location;

  return (
    <div className="md:hidden fixed bottom-0 w-full bg-white border-t border-slate-200 z-10">
      <nav className="flex items-center justify-around p-2">
        <MobileNavItem
          href="/dashboard"
          isActive={currentPath === "/dashboard" || currentPath === "/"}
          icon={
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
          }
          label="Dashboard"
        />
        
        <MobileNavItem
          href="/agenda"
          isActive={currentPath === "/agenda"}
          icon={
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          }
          label="Agenda"
        />
        
        <MobileNavItem
          href="/clients"
          isActive={currentPath === "/clients"}
          icon={
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          }
          label="Clientes"
        />
        
        <MobileNavItem
          href="/profile"
          isActive={currentPath === "/profile"}
          icon={
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          }
          label="Perfil"
        />
      </nav>
    </div>
  );
}
