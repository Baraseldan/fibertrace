import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { Closure } from "@shared/schema";
import {
  Box,
  CircleDot,
  Cloud,
  Radio,
  Plus,
  MapPin,
  Calendar,
} from "lucide-react";

export default function Infrastructure() {
  const { data: closures = [], isLoading } = useQuery<Closure[]>({
    queryKey: ['/api/closures'],
  });

  const domeClosures = closures.filter((c) => c.type === "Dome");
  const undergroundClosures = closures.filter((c) => c.type === "Underground");
  const aerialClosures = closures.filter((c) => c.type === "Aerial");

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold text-white">
            Infrastructure
          </h1>
          <p className="text-muted-foreground mt-1">
            Closures, FATS, ATBs & Domes Management
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" data-testid="button-add-infrastructure">
            <Plus className="mr-2 h-4 w-4" /> Add Infrastructure
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-gradient-to-br from-purple-500/20 to-purple-500/5 border-purple-500/30">
          <CardHeader className="flex flex-row items-center justify-between gap-1 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Dome Closures
            </CardTitle>
            <CircleDot className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white" data-testid="stat-domes">
              {domeClosures.length}
            </div>
            <p className="text-xs text-muted-foreground">Active installations</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-500/20 to-orange-500/5 border-orange-500/30">
          <CardHeader className="flex flex-row items-center justify-between gap-1 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Underground
            </CardTitle>
            <Cloud className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white" data-testid="stat-underground">
              {undergroundClosures.length}
            </div>
            <p className="text-xs text-muted-foreground">Buried closures</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-cyan-500/20 to-cyan-500/5 border-cyan-500/30">
          <CardHeader className="flex flex-row items-center justify-between gap-1 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Aerial Closures
            </CardTitle>
            <Radio className="h-4 w-4 text-cyan-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white" data-testid="stat-aerial">
              {aerialClosures.length}
            </div>
            <p className="text-xs text-muted-foreground">Pole-mounted</p>
          </CardContent>
        </Card>
      </div>

      {/* Closures Tabs */}
      <Tabs defaultValue="all" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="all" data-testid="tab-all">All</TabsTrigger>
          <TabsTrigger value="dome" data-testid="tab-dome">Dome</TabsTrigger>
          <TabsTrigger value="underground" data-testid="tab-underground">Underground</TabsTrigger>
          <TabsTrigger value="aerial" data-testid="tab-aerial">Aerial</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          {isLoading ? (
            <div className="text-center py-8 text-muted-foreground">
              Loading closures...
            </div>
          ) : closures.length === 0 ? (
            <Card className="bg-card/30">
              <CardContent className="p-8 text-center">
                <Box className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground mb-4">
                  No closures configured yet
                </p>
                <Button data-testid="button-add-first-closure">
                  <Plus className="mr-2 h-4 w-4" /> Add First Closure
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {closures.map((closure) => (
                <ClosureCard key={closure.id} closure={closure} />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="dome" className="space-y-4">
          {domeClosures.length === 0 ? (
            <Card className="bg-card/30">
              <CardContent className="p-8 text-center">
                <CircleDot className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground">No dome closures yet</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {domeClosures.map((closure: any) => (
                <ClosureCard key={closure.id} closure={closure} />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="underground" className="space-y-4">
          {undergroundClosures.length === 0 ? (
            <Card className="bg-card/30">
              <CardContent className="p-8 text-center">
                <Cloud className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground">No underground closures yet</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {undergroundClosures.map((closure: any) => (
                <ClosureCard key={closure.id} closure={closure} />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="aerial" className="space-y-4">
          {aerialClosures.length === 0 ? (
            <Card className="bg-card/30">
              <CardContent className="p-8 text-center">
                <Radio className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground">No aerial closures yet</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {aerialClosures.map((closure: any) => (
                <ClosureCard key={closure.id} closure={closure} />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

function ClosureCard({ closure }: { closure: Closure }) {
  const iconMap: Record<string, any> = {
    Dome: CircleDot,
    Underground: Cloud,
    Aerial: Radio,
  };

  const Icon = iconMap[closure.type] || Box;

  return (
    <Card
      className="bg-card/30 hover:bg-card/50 transition-colors"
      data-testid={`card-closure-${closure.id}`}
    >
      <CardContent className="p-5">
        <div className="flex items-start gap-4">
          <div className="h-12 w-12 rounded-lg bg-purple-500/20 flex items-center justify-center flex-shrink-0">
            <Icon className="h-6 w-6 text-purple-500" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <h3 className="font-bold text-white">{closure.name}</h3>
              <Badge variant="outline" className="text-xs">
                {closure.type}
              </Badge>
              <Badge variant={closure.status === "Active" ? "default" : "secondary"}>
                {closure.status}
              </Badge>
            </div>
            <div className="space-y-1 text-sm">
              <div className="flex items-center gap-2 text-muted-foreground">
                <MapPin className="h-3 w-3" />
                <span className="truncate">{closure.location}</span>
              </div>
              {closure.installDate && (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Calendar className="h-3 w-3" />
                  <span>{new Date(closure.installDate).toLocaleDateString()}</span>
                </div>
              )}
            </div>
            <div className="grid grid-cols-3 gap-3 mt-3 pt-3 border-t border-border/50">
              <div>
                <p className="text-xs text-muted-foreground">Fibers</p>
                <p className="text-sm font-medium text-white">{closure.fiberCount}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Splices</p>
                <p className="text-sm font-medium text-primary">{closure.spliceCount}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Power</p>
                <p className="text-sm font-medium text-green-500">
                  {closure.inputPower || "--"} dBm
                </p>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
