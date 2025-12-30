import React, { useState, useMemo } from 'react';
import { Check, ChevronsUpDown, Search, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/components/ui/command";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { Club } from "@/hooks/useClubs";
import { LeagueEnhanced } from "@/hooks/useLeaguesEnhanced";

export interface SearchEntity {
    type: 'club' | 'league';
    id: string | number; // slug for league, id for club
    name: string;
    icon?: string;
}

interface ComparisonSearchProps {
    clubs: Club[];
    leagues: LeagueEnhanced[];
    selectedEntities: SearchEntity[];
    onSelectionChange: (entities: SearchEntity[]) => void;
    placeholder?: string;
}

const ComparisonSearch: React.FC<ComparisonSearchProps> = ({
    clubs,
    leagues,
    selectedEntities,
    onSelectionChange,
    placeholder,
}) => {
    const [open, setOpen] = useState(false);
    const [inputValue, setInputValue] = useState("");

    // Memoize options to avoid re-calculation
    const options = useMemo(() => {
        const clubOptions: SearchEntity[] = clubs.map(c => ({
            type: 'club',
            id: c.club_id,
            name: c.name || "Unknown Club",
            icon: c.logo_url || "⚽"
        }));

        const leagueOptions: SearchEntity[] = leagues.map(l => ({
            type: 'league',
            id: l.league_slug,
            name: l.league,
            icon: "🏆"
        }));

        return [...leagueOptions, ...clubOptions];
    }, [clubs, leagues]);

    const filteredOptions = useMemo(() => {
        if (!inputValue) return options.slice(0, 20); // Limit initial view
        const lower = inputValue.toLowerCase();
        return options.filter(n => n.name.toLowerCase().includes(lower)).slice(0, 20);
    }, [options, inputValue]);

    const toggleSelection = (entity: SearchEntity) => {
        const isSelected = selectedEntities.some(e => e.type === entity.type && e.id === entity.id);
        if (isSelected) {
            onSelectionChange(selectedEntities.filter(e => !(e.type === entity.type && e.id === entity.id)));
        } else {
            onSelectionChange([...selectedEntities, entity]);
        }
    };

    return (
        <div className="w-full">
            <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild>
                    <Button
                        variant="outline"
                        role="combobox"
                        aria-expanded={open}
                        className="w-full justify-between h-14 text-base border-2 border-green-500/20 hover:border-green-500/50 hover:bg-green-50/50 transition-all shadow-sm group"
                    >
                        {selectedEntities.length > 0 ? (
                            <div className="flex gap-1 flex-wrap truncate">
                                {selectedEntities.map((entity) => (
                                    <Badge
                                        key={`${entity.type}-${entity.id}`}
                                        variant="secondary"
                                        className="mr-1 bg-green-100 text-green-800 border-green-200 hover:bg-green-200"
                                    >
                                        {entity.name}
                                        <span
                                            className="ml-1 text-xs opacity-50 cursor-pointer hover:opacity-100 p-0.5"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                toggleSelection(entity);
                                            }}
                                        >
                                            <X className="h-3 w-3" />
                                        </span>
                                    </Badge>
                                ))}
                            </div>
                        ) : (
                            <div className="flex items-center text-gray-500 group-hover:text-green-700 transition-colors">
                                <Search className="mr-2 h-4 w-4 text-green-600" />
                                <span className="">{placeholder || "Suche nach Vereinen (z.B. FC Bayern) oder Ligen..."}</span>
                            </div>
                        )}
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0" align="start">
                    <Command shouldFilter={false}>
                        <CommandInput
                            placeholder="Suche nach Verein oder Liga..."
                            value={inputValue}
                            onValueChange={setInputValue}
                        />
                        <CommandList>
                            <CommandEmpty>Keine Ergebnisse gefunden.</CommandEmpty>
                            <CommandGroup heading="Vorschläge">
                                {filteredOptions.map((option) => {
                                    const isSelected = selectedEntities.some(e => e.type === option.type && e.id === option.id);
                                    return (
                                        <CommandItem
                                            key={`${option.type}-${option.id}`}
                                            value={option.name}
                                            onSelect={() => {
                                                toggleSelection(option);
                                                setOpen(false);
                                            }}
                                        >
                                            <Check
                                                className={cn(
                                                    "mr-2 h-4 w-4",
                                                    isSelected ? "opacity-100" : "opacity-0"
                                                )}
                                            />
                                            <div className="flex items-center gap-2 flex-1">
                                                {option.icon && (option.icon.startsWith('http') ? <img src={option.icon} alt="" className="w-5 h-5 object-contain" /> : <span>{option.icon}</span>)}
                                                <span>{option.name}</span>
                                                <span className="text-xs text-gray-400 ml-auto capitalize">{option.type === 'league' ? 'Wettbewerb' : 'Verein'}</span>
                                            </div>
                                        </CommandItem>
                                    );
                                })}
                            </CommandGroup>
                        </CommandList>
                    </Command>
                </PopoverContent>
            </Popover>
        </div>
    );
};

export default ComparisonSearch;
