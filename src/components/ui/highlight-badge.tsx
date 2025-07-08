
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface HighlightBadgeProps {
  text: string;
  priority: 'primary' | 'secondary' | 'tertiary';
  tooltip?: boolean;
  className?: string;
}

const HighlightBadge: React.FC<HighlightBadgeProps> = ({ 
  text, 
  priority, 
  tooltip = true, 
  className = '' 
}) => {
  if (!text?.trim()) return null;

  const getPriorityStyles = (priority: string) => {
    switch (priority) {
      case 'primary':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'secondary':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'tertiary':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const truncateText = (text: string, maxLength: number = 25) => {
    return text.length > maxLength ? `${text.substring(0, maxLength)}...` : text;
  };

  const badge = (
    <Badge 
      variant="outline" 
      className={`text-xs ${getPriorityStyles(priority)} ${className} cursor-help`}
    >
      {truncateText(text)}
    </Badge>
  );

  if (!tooltip || text.length <= 25) {
    return badge;
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          {badge}
        </TooltipTrigger>
        <TooltipContent>
          <p className="max-w-xs">{text}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default HighlightBadge;
