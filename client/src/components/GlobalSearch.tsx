import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Button } from "@/components/ui/button";
import { Search, Network, Box, Database, MapPin, Package, Briefcase } from "lucide-react";
import type { Olt, Splitter, Fat, Atb, Closure, Client, InventoryItem } from "@shared/schema";
import type { JobWithClient } from "@/lib/api";

interface GlobalSearchProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function GlobalSearch({ open, onOpenChange }: GlobalSearchProps) {
  const [, setLocation] = useLocation();
  const [searchQuery, setSearchQuery] = useState("");

  const { data: olts = [] } = useQuery<Olt[]>({
    queryKey: ['/api/olts'],
    enabled: open,
  });

  const { data: splitters = [] } = useQuery<Splitter[]>({
    queryKey: ['/api/splitters'],
    enabled: open,
  });

  const { data: fats = [] } = useQuery<Fat[]>({
    queryKey: ['/api/fats'],
    enabled: open,
  });

  const { data: atbs = [] } = useQuery<Atb[]>({
    queryKey: ['/api/atbs'],
    enabled: open,
  });

  const { data: closures = [] } = useQuery<Closure[]>({
    queryKey: ['/api/closures'],
    enabled: open,
  });

  const { data: jobs = [] } = useQuery<JobWithClient[]>({
    queryKey: ['jobs'],
    enabled: open,
  });

  const { data: inventory = [] } = useQuery<InventoryItem[]>({
    queryKey: ['/api/inventory'],
    enabled: open,
  });

  const { data: clients = [] } = useQuery<Client[]>({
    queryKey: ['/api/clients'],
    enabled: open,
  });

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        onOpenChange(!open);
      }
    };

    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, [open, onOpenChange]);

  const filterItems = <T extends { name: string }>(items: T[], query: string) => {
    if (!query) return items.slice(0, 5);
    return items
      .filter(item => item.name.toLowerCase().includes(query.toLowerCase()))
      .slice(0, 5);
  };

  const filterJobs = (items: JobWithClient[], query: string) => {
    if (!query) return items.slice(0, 5);
    return items
      .filter(job => 
        job.clientName.toLowerCase().includes(query.toLowerCase()) ||
        job.type.toLowerCase().includes(query.toLowerCase()) ||
        job.address.toLowerCase().includes(query.toLowerCase())
      )
      .slice(0, 5);
  };

  const handleSelect = (path: string) => {
    setLocation(path);
    onOpenChange(false);
    setSearchQuery("");
  };

  const filteredOlts = filterItems(olts, searchQuery);
  const filteredSplitters = filterItems(splitters, searchQuery);
  const filteredFats = filterItems(fats, searchQuery);
  const filteredAtbs = filterItems(atbs, searchQuery);
  const filteredClosures = filterItems(closures, searchQuery);
  const filteredJobs = filterJobs(jobs, searchQuery);
  const filteredInventory = filterItems(inventory, searchQuery);
  const filteredClients = filterItems(clients, searchQuery);

  const hasResults = filteredOlts.length > 0 || filteredSplitters.length > 0 || 
                     filteredFats.length > 0 || filteredAtbs.length > 0 || 
                     filteredClosures.length > 0 || filteredJobs.length > 0 ||
                     filteredInventory.length > 0 || filteredClients.length > 0;

  return (
    <CommandDialog open={open} onOpenChange={onOpenChange}>
      <CommandInput 
        placeholder="Search nodes, jobs, inventory..." 
        value={searchQuery}
        onValueChange={setSearchQuery}
        data-testid="input-global-search"
      />
      <CommandList>
        {!hasResults && <CommandEmpty>No results found.</CommandEmpty>}
        
        {filteredOlts.length > 0 && (
          <CommandGroup heading="OLTs">
            {filteredOlts.map((olt) => (
              <CommandItem
                key={`olt-${olt.id}`}
                onSelect={() => handleSelect('/topology')}
                data-testid={`search-result-olt-${olt.id}`}
              >
                <Network className="mr-2 h-4 w-4 text-green-500" />
                <span>{olt.name} - {olt.location}</span>
              </CommandItem>
            ))}
          </CommandGroup>
        )}

        {filteredSplitters.length > 0 && (
          <CommandGroup heading="Splitters">
            {filteredSplitters.map((splitter) => (
              <CommandItem
                key={`splitter-${splitter.id}`}
                onSelect={() => handleSelect('/nodes')}
                data-testid={`search-result-splitter-${splitter.id}`}
              >
                <Database className="mr-2 h-4 w-4 text-blue-500" />
                <span>{splitter.name} ({splitter.splitRatio}) - {splitter.location}</span>
              </CommandItem>
            ))}
          </CommandGroup>
        )}

        {filteredFats.length > 0 && (
          <CommandGroup heading="FATs">
            {filteredFats.map((fat) => (
              <CommandItem
                key={`fat-${fat.id}`}
                onSelect={() => handleSelect('/infrastructure')}
                data-testid={`search-result-fat-${fat.id}`}
              >
                <MapPin className="mr-2 h-4 w-4 text-amber-500" />
                <span>{fat.name} - {fat.location}</span>
              </CommandItem>
            ))}
          </CommandGroup>
        )}

        {filteredAtbs.length > 0 && (
          <CommandGroup heading="ATBs">
            {filteredAtbs.map((atb) => (
              <CommandItem
                key={`atb-${atb.id}`}
                onSelect={() => handleSelect('/infrastructure')}
                data-testid={`search-result-atb-${atb.id}`}
              >
                <Box className="mr-2 h-4 w-4 text-purple-500" />
                <span>{atb.name} - {atb.location}</span>
              </CommandItem>
            ))}
          </CommandGroup>
        )}

        {filteredClosures.length > 0 && (
          <CommandGroup heading="Closures">
            {filteredClosures.map((closure) => (
              <CommandItem
                key={`closure-${closure.id}`}
                onSelect={() => handleSelect('/infrastructure')}
                data-testid={`search-result-closure-${closure.id}`}
              >
                <Box className="mr-2 h-4 w-4 text-pink-500" />
                <span>{closure.name} ({closure.type}) - {closure.location}</span>
              </CommandItem>
            ))}
          </CommandGroup>
        )}

        {filteredJobs.length > 0 && (
          <CommandGroup heading="Jobs">
            {filteredJobs.map((job) => (
              <CommandItem
                key={`job-${job.id}`}
                onSelect={() => handleSelect('/jobs')}
                data-testid={`search-result-job-${job.id}`}
              >
                <Briefcase className="mr-2 h-4 w-4 text-cyan-500" />
                <span>{job.clientName} - {job.type} ({job.status})</span>
              </CommandItem>
            ))}
          </CommandGroup>
        )}

        {filteredInventory.length > 0 && (
          <CommandGroup heading="Inventory">
            {filteredInventory.map((item) => (
              <CommandItem
                key={`inventory-${item.id}`}
                onSelect={() => handleSelect('/inventory')}
                data-testid={`search-result-inventory-${item.id}`}
              >
                <Package className="mr-2 h-4 w-4 text-orange-500" />
                <span>{item.name} ({item.quantity} {item.unit})</span>
              </CommandItem>
            ))}
          </CommandGroup>
        )}
      </CommandList>
    </CommandDialog>
  );
}

export function GlobalSearchTrigger() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button
        variant="outline"
        className="relative w-full justify-start text-sm text-muted-foreground md:w-64"
        onClick={() => setOpen(true)}
        data-testid="button-search"
      >
        <Search className="mr-2 h-4 w-4" />
        <span>Search...</span>
        <kbd className="pointer-events-none absolute right-2 hidden h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100 md:flex">
          <span className="text-xs">⌘</span>K
        </kbd>
      </Button>
      <GlobalSearch open={open} onOpenChange={setOpen} />
    </>
  );
}
