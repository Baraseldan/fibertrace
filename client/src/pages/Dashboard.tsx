import { useQuery } from "@tanstack/react-query";
import { jobsApi, statsApi } from "@/lib/api";
import { useAuth } from "@/lib/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Network, 
  Zap, 
  Box, 
  Database, 
  Bluetooth, 
  MapPin, 
  Ruler, 
  Package, 
  FileBarChart, 
  CheckCircle2, 
  Clock, 
  Activity,
  Briefcase,
  Wifi,
  WifiOff,
  Search
} from "lucide-react";
import { Link } from "wouter";
import { useState, useEffect } from "react";
import type { Olt, Splitter, Fat, Atb, Closure } from "@shared/schema";

export default function Dashboard() {
  const { user } = useAuth();
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const { data: jobs = [], isLoading: jobsLoading } = useQuery({
    queryKey: ['jobs'],
    queryFn: jobsApi.getAll,
  });

  const { data: stats } = useQuery({
    queryKey: ['stats'],
    queryFn: statsApi.getStats,
    initialData: { total: 0, pending: 0, inProgress: 0, completed: 0 }
  });

  const { data: olts = [] } = useQuery<Olt[]>({
    queryKey: ['/api/olts'],
  });

  const { data: splitters = [] } = useQuery<Splitter[]>({
    queryKey: ['/api/splitters'],
  });

  const { data: fats = [] } = useQuery<Fat[]>({
    queryKey: ['/api/fats'],
  });

  const { data: atbs = [] } = useQuery<Atb[]>({
    queryKey: ['/api/atbs'],
  });

  const { data: closures = [] } = useQuery<Closure[]>({
    queryKey: ['/api/closures'],
  });

  const modules = [
    {
      title: 'Network Topology',
      description: 'View & manage GPON structure',
      icon: Network,
      color: 'primary',
      path: '/topology',
      badge: 'Live'
    },
    {
      title: 'Power Mapping',
      description: 'Signal analysis & loss calculation',
      icon: Zap,
      color: 'amber',
      path: '/power-analysis',
      badge: 'Active'
    },
    {
      title: 'Closures & Infrastructure',
      description: 'FATS, ATBs, Domes & Closures',
      icon: Box,
      color: 'purple',
      path: '/infrastructure',
    },
    {
      title: 'Nodes & Splitters',
      description: 'OLT, ODF, Splitter library',
      icon: Database,
      color: 'blue',
      path: '/nodes',
    },
    {
      title: 'Bluetooth Splicer',
      description: 'Real-time splice data sync',
      icon: Bluetooth,
      color: 'cyan',
      path: '/splicer',
      badge: 'BT'
    },
    {
      title: 'Offline Map',
      description: 'GPS tracking & field planning',
      icon: MapPin,
      color: 'green',
      path: '/map',
    },
    {
      title: 'Distance Calculator',
      description: 'Route planning & cable estimation',
      icon: Ruler,
      color: 'orange',
      path: '/calculator',
    },
    {
      title: 'Inventory Manager',
      description: 'Tools & materials tracking',
      icon: Package,
      color: 'pink',
      path: '/inventory',
    },
    {
      title: 'Reports & Logs',
      description: 'Field reports & job documentation',
      icon: FileBarChart,
      color: 'violet',
      path: '/reports',
    },
  ];

  const colorMap: Record<string, string> = {
    primary: 'from-primary/20 to-primary/5 border-primary/30 hover:border-primary/50',
    amber: 'from-amber-500/20 to-amber-500/5 border-amber-500/30 hover:border-amber-500/50',
    purple: 'from-purple-500/20 to-purple-500/5 border-purple-500/30 hover:border-purple-500/50',
    blue: 'from-blue-500/20 to-blue-500/5 border-blue-500/30 hover:border-blue-500/50',
    cyan: 'from-cyan-500/20 to-cyan-500/5 border-cyan-500/30 hover:border-cyan-500/50',
    green: 'from-green-500/20 to-green-500/5 border-green-500/30 hover:border-green-500/50',
    orange: 'from-orange-500/20 to-orange-500/5 border-orange-500/30 hover:border-orange-500/50',
    pink: 'from-pink-500/20 to-pink-500/5 border-pink-500/30 hover:border-pink-500/50',
    violet: 'from-violet-500/20 to-violet-500/5 border-violet-500/30 hover:border-violet-500/50',
  };

  const iconColorMap: Record<string, string> = {
    primary: 'text-primary',
    amber: 'text-amber-500',
    purple: 'text-purple-500',
    blue: 'text-blue-500',
    cyan: 'text-cyan-500',
    green: 'text-green-500',
    orange: 'text-orange-500',
    pink: 'text-pink-500',
    violet: 'text-violet-500',
  };

  if (jobsLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-white text-lg">Loading dashboard...</div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold text-white">
            Welcome back, <span className="text-primary">{user?.name.split(' ')[0]}</span>
          </h1>
          <p className="text-muted-foreground mt-1">GPON/FTTH Field Management System</p>
        </div>
        <div className="flex items-center gap-3">
          {/* Sync Status */}
          <div className="flex items-center gap-2 px-3 py-2 rounded-md bg-card border border-border">
            {isOnline ? (
              <>
                <Wifi className="h-4 w-4 text-green-500" data-testid="icon-online" />
                <span className="text-sm text-green-500 font-medium" data-testid="text-status">Online</span>
              </>
            ) : (
              <>
                <WifiOff className="h-4 w-4 text-amber-500" data-testid="icon-offline" />
                <span className="text-sm text-amber-500 font-medium" data-testid="text-status">Offline</span>
              </>
            )}
          </div>
          {/* Search */}
          <Button variant="outline" size="icon" data-testid="button-search">
            <Search className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-card/80 to-card/40 border-primary/20">
          <CardHeader className="flex flex-row items-center justify-between gap-1 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Jobs</CardTitle>
            <Briefcase className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white" data-testid="stat-total">{stats.total}</div>
            <p className="text-xs text-muted-foreground">All assigned jobs</p>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-card/80 to-card/40 border-amber-500/20">
          <CardHeader className="flex flex-row items-center justify-between gap-1 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Pending</CardTitle>
            <Clock className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-500" data-testid="stat-pending">{stats.pending}</div>
            <p className="text-xs text-muted-foreground">Requires attention</p>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-card/80 to-card/40 border-blue-500/20">
          <CardHeader className="flex flex-row items-center justify-between gap-1 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">In Progress</CardTitle>
            <Activity className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-500" data-testid="stat-inprogress">{stats.inProgress}</div>
            <p className="text-xs text-muted-foreground">Currently active</p>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-card/80 to-card/40 border-green-500/20">
          <CardHeader className="flex flex-row items-center justify-between gap-1 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Completed</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-500" data-testid="stat-completed">{stats.completed}</div>
            <p className="text-xs text-muted-foreground">Successfully finished</p>
          </CardContent>
        </Card>
      </div>

      {/* Network Infrastructure Stats */}
      <div>
        <h2 className="text-2xl font-bold font-display mb-4">Network Infrastructure</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          <Card className="bg-gradient-to-br from-green-500/10 to-green-500/5 border-green-500/20">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <Network className="h-5 w-5 text-green-500" />
                <Badge variant="outline" className="text-xs" data-testid="badge-olt-count">{olts.length}</Badge>
              </div>
              <p className="text-sm font-medium text-white">OLTs</p>
              <p className="text-xs text-muted-foreground">Optical Line Terminals</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-blue-500/10 to-blue-500/5 border-blue-500/20">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <Database className="h-5 w-5 text-blue-500" />
                <Badge variant="outline" className="text-xs" data-testid="badge-splitter-count">{splitters.length}</Badge>
              </div>
              <p className="text-sm font-medium text-white">Splitters</p>
              <p className="text-xs text-muted-foreground">
                {splitters.filter(s => s.status === 'Active').length} Active
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-amber-500/10 to-amber-500/5 border-amber-500/20">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <MapPin className="h-5 w-5 text-amber-500" />
                <Badge variant="outline" className="text-xs" data-testid="badge-fat-count">{fats.length}</Badge>
              </div>
              <p className="text-sm font-medium text-white">FATs</p>
              <p className="text-xs text-muted-foreground">
                {fats.reduce((acc, f) => acc + (f.usedPorts || 0), 0)}/{fats.reduce((acc, f) => acc + f.totalPorts, 0)} Ports Used
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-500/10 to-purple-500/5 border-purple-500/20">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <Box className="h-5 w-5 text-purple-500" />
                <Badge variant="outline" className="text-xs" data-testid="badge-atb-count">{atbs.length}</Badge>
              </div>
              <p className="text-sm font-medium text-white">ATBs</p>
              <p className="text-xs text-muted-foreground">
                {atbs.reduce((acc, a) => acc + (a.usedPorts || 0), 0)}/{atbs.reduce((acc, a) => acc + a.totalPorts, 0)} Ports Used
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-pink-500/10 to-pink-500/5 border-pink-500/20">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <Box className="h-5 w-5 text-pink-500" />
                <Badge variant="outline" className="text-xs" data-testid="badge-closure-count">{closures.length}</Badge>
              </div>
              <p className="text-sm font-medium text-white">Closures</p>
              <p className="text-xs text-muted-foreground">
                {closures.reduce((acc, c) => acc + (c.spliceCount || 0), 0)} Total Splices
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Main Action Tiles */}
      <div>
        <h2 className="text-2xl font-bold font-display mb-4">System Modules</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {modules.map((module) => (
            <Link key={module.title} href={module.path}>
              <Card 
                className={`bg-gradient-to-br ${colorMap[module.color]} transition-all duration-300 hover:scale-105 cursor-pointer h-full`}
                data-testid={`card-module-${module.title.toLowerCase().replace(/\s+/g, '-')}`}
              >
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className={`h-12 w-12 rounded-lg bg-card/50 flex items-center justify-center ${iconColorMap[module.color]}`}>
                      <module.icon className="h-6 w-6" />
                    </div>
                    {module.badge && (
                      <Badge variant="outline" className="text-xs">
                        {module.badge}
                      </Badge>
                    )}
                  </div>
                  <h3 className="font-display font-bold text-lg text-white mb-2">
                    {module.title}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {module.description}
                  </p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>

      {/* Recent Activity */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold font-display">Recent Jobs</h2>
          <Link href="/jobs">
            <Button variant="link" className="text-primary" data-testid="link-view-all-jobs">
              View All →
            </Button>
          </Link>
        </div>
        <div className="grid grid-cols-1 gap-3">
          {jobs.slice(0, 3).map((job) => (
            <Card 
              key={job.id} 
              className="bg-card/30 hover:bg-card/50 transition-colors border-border/50"
              data-testid={`card-job-${job.id}`}
            >
              <CardContent className="p-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="space-y-1 flex-1">
                    <div className="flex items-center gap-3 flex-wrap">
                      <span className="text-base font-bold text-white" data-testid={`text-client-${job.id}`}>
                        {job.clientName}
                      </span>
                      <Badge 
                        variant={
                          job.status === 'In Progress' ? 'default' :
                          job.status === 'Pending' ? 'secondary' :
                          'outline'
                        }
                        className="text-xs"
                        data-testid={`badge-status-${job.id}`}
                      >
                        {job.status}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <MapPin className="h-3 w-3" />
                      <span data-testid={`text-address-${job.id}`}>{job.address}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right hidden sm:block">
                      <p className="text-xs text-muted-foreground">Type</p>
                      <p className="text-sm font-medium text-primary" data-testid={`text-type-${job.id}`}>
                        {job.type}
                      </p>
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm"
                      data-testid={`button-details-${job.id}`}
                    >
                      Details
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
