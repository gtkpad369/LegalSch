import { Link } from "wouter";
import { Button } from "@/components/ui/button";

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  actionButton?: {
    label: string;
    icon?: React.ReactNode;
    href?: string;
    onClick?: () => void;
  };
}

export function PageHeader({ title, subtitle, actionButton }: PageHeaderProps) {
  const ActionButton = () => {
    if (!actionButton) return null;
    
    const { label, icon, href, onClick } = actionButton;
    
    if (href) {
      return (
        <Button asChild>
          <Link href={href} className="bg-primary hover:bg-primary-dark text-white px-4 py-2 rounded-lg flex items-center">
            {icon && <span className="mr-2">{icon}</span>}
            {label}
          </Link>
        </Button>
      );
    }
    
    return (
      <Button 
        onClick={onClick} 
        className="bg-primary hover:bg-primary-dark text-white px-4 py-2 rounded-lg flex items-center"
      >
        {icon && <span className="mr-2">{icon}</span>}
        {label}
      </Button>
    );
  };
  
  return (
    <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">{title}</h1>
        {subtitle && <p className="text-slate-500">{subtitle}</p>}
      </div>
      {actionButton && (
        <div className="mt-4 md:mt-0">
          <ActionButton />
        </div>
      )}
    </div>
  );
}
