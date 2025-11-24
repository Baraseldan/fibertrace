import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { Olt, Splitter, Fat, Atb } from "@shared/schema";
import {
  Network,
  Server,
  Split,
  Box,
  Home,
  Plus,
  ChevronRight,
  Signal,
} from "lucide-react";
import { Link } from "wouter";

export default function Topology() {
  const { data: olts = [], isLoading: oltsLoading } = useQuery<Olt[]>({
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

  const stats = {
    olts: olts.length,
    splitters: splitters.length,
    fats: fats.length,
    atbs: atbs.length,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold text-white">
            Network Topology
          </h1>
          <p className="text-muted-foreground mt-1">
            GPON/FTTH Infrastructure Management
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" data-testid="button-add-node">
            <Plus className="mr-2 h-4 w-4" /> Add Node
          </Button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-blue-500/20 to-blue-500/5 border-blue-500/30">
          <CardHeader className="flex flex-row items-center justify-between gap-1 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              OLTs
            </CardTitle>
            <Server className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white" data-testid="stat-olts">
              {stats.olts}
            </div>
            <p className="text-xs text-muted-foreground">
              Optical Line Terminals
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-500/20 to-purple-500/5 border-purple-500/30">
          <CardHeader className="flex flex-row items-center justify-between gap-1 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Splitters
            </CardTitle>
            <Split className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white" data-testid="stat-splitters">
              {stats.splitters}
            </div>
            <p className="text-xs text-muted-foreground">
              Active optical splitters
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-500/20 to-green-500/5 border-green-500/30">
          <CardHeader className="flex flex-row items-center justify-between gap-1 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              FATs
            </CardTitle>
            <Box className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white" data-testid="stat-fats">
              {stats.fats}
            </div>
            <p className="text-xs text-muted-foreground">
              Fiber Access Terminals
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-amber-500/20 to-amber-500/5 border-amber-500/30">
          <CardHeader className="flex flex-row items-center justify-between gap-1 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              ATBs
            </CardTitle>
            <Home className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white" data-testid="stat-atbs">
              {stats.atbs}
            </div>
            <p className="text-xs text-muted-foreground">
              Access Terminal Boxes
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Network Structure Tabs */}
      <Tabs defaultValue="olts" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="olts" data-testid="tab-olts">OLTs</TabsTrigger>
          <TabsTrigger value="splitters" data-testid="tab-splitters">Splitters</TabsTrigger>
          <TabsTrigger value="fats" data-testid="tab-fats">FATs</TabsTrigger>
          <TabsTrigger value="atbs" data-testid="tab-atbs">ATBs</TabsTrigger>
        </TabsList>

        {/* OLTs Tab */}
        <TabsContent value="olts" className="space-y-4">
          {oltsLoading ? (
            <div className="text-center py-8 text-muted-foreground">
              Loading OLTs...
            </div>
          ) : olts.length === 0 ? (
            <Card className="bg-card/30">
              <CardContent className="p-8 text-center">
                <Server className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground mb-4">
                  No OLTs configured yet
                </p>
                <Button data-testid="button-add-olt">
                  <Plus className="mr-2 h-4 w-4" /> Add First OLT
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {olts.map((olt: any) => (
                <Card
                  key={olt.id}
                  className="bg-card/30 hover:bg-card/50 transition-colors"
                  data-testid={`card-olt-${olt.id}`}
                >
                  <CardContent className="p-6">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="flex items-start gap-4 flex-1">
                        <div className="h-12 w-12 rounded-lg bg-blue-500/20 flex items-center justify-center">
                          <Server className="h-6 w-6 text-blue-500" />
                        </div>
                        <div className="space-y-2 flex-1">
                          <div className="flex items-center gap-3 flex-wrap">
                            <h3 className="text-lg font-bold text-white">
                              {olt.name}
                            </h3>
                            <Badge
                              variant={olt.status === "Active" ? "default" : "secondary"}
                            >
                              {olt.status}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {olt.location}
                          </p>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-3">
                            <div>
                              <p className="text-xs text-muted-foreground">Capacity</p>
                              <p className="text-sm font-medium text-white">
                                {olt.capacity} ports
                              </p>
                            </div>
                            <div>
                              <p className="text-xs text-muted-foreground">Used</p>
                              <p className="text-sm font-medium text-primary">
                                {olt.usedPorts}
                              </p>
                            </div>
                            <div>
                              <p className="text-xs text-muted-foreground">Available</p>
                              <p className="text-sm font-medium text-green-500">
                                {olt.capacity - olt.usedPorts}
                              </p>
                            </div>
                            <div>
                              <p className="text-xs text-muted-foreground">Vendor</p>
                              <p className="text-sm font-medium text-white">
                                {olt.vendor || "N/A"}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm">
                          Details
                        </Button>
                        <Button variant="ghost" size="icon">
                          <ChevronRight className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Splitters Tab */}
        <TabsContent value="splitters" className="space-y-4">
          {splitters.length === 0 ? (
            <Card className="bg-card/30">
              <CardContent className="p-8 text-center">
                <Split className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground mb-4">
                  No splitters configured yet
                </p>
                <Button data-testid="button-add-splitter">
                  <Plus className="mr-2 h-4 w-4" /> Add First Splitter
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {splitters.map((splitter: any) => (
                <Card
                  key={splitter.id}
                  className="bg-card/30 hover:bg-card/50 transition-colors"
                  data-testid={`card-splitter-${splitter.id}`}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="h-10 w-10 rounded-lg bg-purple-500/20 flex items-center justify-center">
                        <Split className="h-5 w-5 text-purple-500" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-bold text-white">{splitter.name}</h4>
                        <p className="text-xs text-muted-foreground">
                          Ratio: {splitter.splitRatio}
                        </p>
                      </div>
                      <Badge variant="outline" className="text-xs">
                        {splitter.status}
                      </Badge>
                    </div>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Input Power</span>
                        <span className="text-white font-mono">
                          {splitter.inputPower || "--"} dBm
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Output Power</span>
                        <span className="text-white font-mono">
                          {splitter.outputPower || "--"} dBm
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Loss</span>
                        <span className="text-amber-500 font-mono">
                          {splitter.splitterLoss || "--"} dB
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* FATs Tab */}
        <TabsContent value="fats" className="space-y-4">
          {fats.length === 0 ? (
            <Card className="bg-card/30">
              <CardContent className="p-8 text-center">
                <Box className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground mb-4">
                  No FATs configured yet
                </p>
                <Button data-testid="button-add-fat">
                  <Plus className="mr-2 h-4 w-4" /> Add First FAT
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {fats.map((fat: any) => (
                <Card
                  key={fat.id}
                  className="bg-card/30 hover:bg-card/50 transition-colors"
                  data-testid={`card-fat-${fat.id}`}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="h-10 w-10 rounded-lg bg-green-500/20 flex items-center justify-center">
                        <Box className="h-5 w-5 text-green-500" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-bold text-white">{fat.name}</h4>
                        <p className="text-xs text-muted-foreground">
                          {fat.location}
                        </p>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <p className="text-xs text-muted-foreground">Ports</p>
                        <p className="text-white font-medium">{fat.totalPorts}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Used</p>
                        <p className="text-primary font-medium">{fat.usedPorts}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* ATBs Tab */}
        <TabsContent value="atbs" className="space-y-4">
          {atbs.length === 0 ? (
            <Card className="bg-card/30">
              <CardContent className="p-8 text-center">
                <Home className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground mb-4">
                  No ATBs configured yet
                </p>
                <Button data-testid="button-add-atb">
                  <Plus className="mr-2 h-4 w-4" /> Add First ATB
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {atbs.map((atb: any) => (
                <Card
                  key={atb.id}
                  className="bg-card/30 hover:bg-card/50 transition-colors"
                  data-testid={`card-atb-${atb.id}`}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="h-10 w-10 rounded-lg bg-amber-500/20 flex items-center justify-center">
                        <Home className="h-5 w-5 text-amber-500" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-bold text-white">{atb.name}</h4>
                        <p className="text-xs text-muted-foreground">
                          {atb.location}
                        </p>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <p className="text-xs text-muted-foreground">Ports</p>
                        <p className="text-white font-medium">{atb.totalPorts}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Used</p>
                        <p className="text-primary font-medium">{atb.usedPorts}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
