import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';
import {
  Breadcrumb,
  BreadcrumbEllipsis,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface AppBreadcrumbProps {
  items?: BreadcrumbItem[];
  currentPage?: string;
}

const AppBreadcrumb: React.FC<AppBreadcrumbProps> = ({ items = [], currentPage }) => {
  const location = useLocation();
  
  // Auto-generate breadcrumbs based on current path if no items provided
  const generateBreadcrumbs = (): BreadcrumbItem[] => {
    const pathSegments = location.pathname.split('/').filter(Boolean);
    const breadcrumbs: BreadcrumbItem[] = [];
    
    pathSegments.forEach((segment, index) => {
      const href = '/' + pathSegments.slice(0, index + 1).join('/');
      
      // Map common routes to German labels
      const segmentLabels: Record<string, string> = {
        'wizard': 'Streaming-Wizard',
        'vergleich': 'Anbieter-Vergleich', 
        'detailvergleich': 'Detail-Vergleich',
        'ligen': 'Ligen',
        'deals': 'Deals & News',
        'anbieter': 'Alle Anbieter',
        'club': 'Verein',
        'competition': 'Liga',
        'provider': 'Anbieter'
      };
      
      const label = segmentLabels[segment] || segment.charAt(0).toUpperCase() + segment.slice(1);
      
      // Only add link for non-final segments
      if (index < pathSegments.length - 1) {
        breadcrumbs.push({ label, href });
      } else {
        breadcrumbs.push({ label });
      }
    });
    
    return breadcrumbs;
  };

  const breadcrumbItems = items.length > 0 ? items : generateBreadcrumbs();
  
  // Don't show breadcrumbs on homepage
  if (location.pathname === '/' && !items.length) {
    return null;
  }

  return (
    <div className="mb-4">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link to="/" className="flex items-center gap-1">
                <Home className="h-3 w-3" />
                <span className="sr-only">Home</span>
              </Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          
          {breadcrumbItems.map((item, index) => (
            <React.Fragment key={index}>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                {item.href ? (
                  <BreadcrumbLink asChild>
                    <Link to={item.href}>{item.label}</Link>
                  </BreadcrumbLink>
                ) : (
                  <BreadcrumbPage>{currentPage || item.label}</BreadcrumbPage>
                )}
              </BreadcrumbItem>
            </React.Fragment>
          ))}
        </BreadcrumbList>
      </Breadcrumb>
    </div>
  );
};

export default AppBreadcrumb;