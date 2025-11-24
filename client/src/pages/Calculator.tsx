import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { FiberRoute } from "@shared/schema";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Ruler, MapPin, Plus, Save, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

export default function Calculator() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [routeName, setRouteName] = useState("");
  const [linearDistance, setLinearDistance] = useState<string>("");
  const [routedDistance, setRoutedDistance] = useState<string>("");
  const [slackPercentage, setSlackPercentage] = useState<string>("10");
  const [splicePoints, setSplicePoints] = useState<string>("0");
  const [fiberAttenuation] = useState<number>(0.35); // dB/km

  const { data: routes = [] } = useQuery<FiberRoute[]>({
    queryKey: ['/api/fiber-routes'],
  });

  const saveMutation = useMutation({
    mutationFn: async (data: any) => {
      return apiRequest('/api/fiber-routes', 'POST', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/fiber-routes'] });
      toast({
        title: "Route Saved",
        description: "Route calculation has been saved successfully.",
      });
      resetForm();
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to save route",
        variant: "destructive",
      });
    },
  });

  const calculateResults = () => {
    const linear = parseFloat(linearDistance) || 0;
    const routed = parseFloat(routedDistance) || linear;
    const slack = parseFloat(slackPercentage) || 10;
    const splices = parseInt(splicePoints) || 0;

    const cableRequired = routed * (1 + slack / 100);
    const estimatedLoss =
      routed * fiberAttenuation +
      splices * 0.1 +
      (splices > 0 ? splices * 0.5 : 0);

    return {
      linearDistance: linear,
      routedDistance: routed,
      slackPercentage: slack,
      cableRequired,
      splicePoints: splices,
      estimatedLoss,
    };
  };

  const results = calculateResults();

  const handleSave = () => {
    if (!routeName.trim()) {
      toast({
        title: "Error",
        description: "Please enter a route name",
        variant: "destructive",
      });
      return;
    }

    saveMutation.mutate({
      name: routeName,
      linearDistance: results.linearDistance.toFixed(2),
      routedDistance: results.routedDistance.toFixed(2),
      cableRequired: results.cableRequired.toFixed(2),
      slackPercentage: results.slackPercentage.toFixed(2),
      splicePoints: results.splicePoints,
      estimatedLoss: results.estimatedLoss.toFixed(2),
    });
  };

  const resetForm = () => {
    setRouteName("");
    setLinearDistance("");
    setRoutedDistance("");
    setSlackPercentage("10");
    setSplicePoints("0");
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold text-white">
            Distance Calculator
          </h1>
          <p className="text-muted-foreground mt-1">
            Route Planning & Cable Estimation
          </p>
        </div>
      </div>

      {/* Calculator */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Input Section */}
        <Card className="bg-card/30">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Ruler className="h-5 w-5 text-primary" />
              Route Input
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="route-name">Route Name</Label>
              <Input
                id="route-name"
                placeholder="OLT-01 to FAT-12"
                value={routeName}
                onChange={(e) => setRouteName(e.target.value)}
                data-testid="input-route-name"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="linear-distance">Linear Distance (m)</Label>
                <Input
                  id="linear-distance"
                  type="number"
                  step="0.1"
                  placeholder="0.0"
                  value={linearDistance}
                  onChange={(e) => setLinearDistance(e.target.value)}
                  data-testid="input-linear-distance"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="routed-distance">Routed Distance (m)</Label>
                <Input
                  id="routed-distance"
                  type="number"
                  step="0.1"
                  placeholder="0.0"
                  value={routedDistance}
                  onChange={(e) => setRoutedDistance(e.target.value)}
                  data-testid="input-routed-distance"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="slack">Slack Percentage (%)</Label>
                <Input
                  id="slack"
                  type="number"
                  step="1"
                  value={slackPercentage}
                  onChange={(e) => setSlackPercentage(e.target.value)}
                  data-testid="input-slack"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="splices">Splice Points</Label>
                <Input
                  id="splices"
                  type="number"
                  step="1"
                  value={splicePoints}
                  onChange={(e) => setSplicePoints(e.target.value)}
                  data-testid="input-splice-points"
                />
              </div>
            </div>

            <div className="flex gap-2 pt-4">
              <Button
                onClick={handleSave}
                disabled={saveMutation.isPending}
                className="flex-1"
                data-testid="button-save-route"
              >
                <Save className="mr-2 h-4 w-4" />
                {saveMutation.isPending ? "Saving..." : "Save Route"}
              </Button>
              <Button
                variant="outline"
                onClick={resetForm}
                data-testid="button-reset"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Reset
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Results Section */}
        <Card className="bg-card/30">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5 text-green-500" />
              Calculation Results
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 rounded-lg bg-card">
                <p className="text-xs text-muted-foreground mb-1">Linear Distance</p>
                <p className="text-lg font-mono font-bold text-white" data-testid="result-linear">
                  {results.linearDistance.toFixed(2)} m
                </p>
              </div>

              <div className="p-4 rounded-lg bg-card">
                <p className="text-xs text-muted-foreground mb-1">Routed Distance</p>
                <p className="text-lg font-mono font-bold text-white" data-testid="result-routed">
                  {results.routedDistance.toFixed(2)} m
                </p>
              </div>

              <div className="p-4 rounded-lg bg-card">
                <p className="text-xs text-muted-foreground mb-1">Slack</p>
                <p className="text-lg font-mono font-bold text-primary">
                  {results.slackPercentage}%
                </p>
              </div>

              <div className="p-4 rounded-lg bg-card">
                <p className="text-xs text-muted-foreground mb-1">Splice Points</p>
                <p className="text-lg font-mono font-bold text-primary">
                  {results.splicePoints}
                </p>
              </div>
            </div>

            {/* Main Results */}
            <div className="space-y-3">
              <div className="p-4 rounded-lg bg-gradient-to-r from-green-500/20 to-green-500/5 border border-green-500/30">
                <p className="text-sm text-muted-foreground mb-2">
                  Total Cable Required
                </p>
                <p className="text-2xl font-mono font-bold text-green-500" data-testid="result-cable-required">
                  {results.cableRequired.toFixed(2)} m
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Including {results.slackPercentage}% slack
                </p>
              </div>

              <div className="p-4 rounded-lg bg-gradient-to-r from-amber-500/20 to-amber-500/5 border border-amber-500/30">
                <p className="text-sm text-muted-foreground mb-2">
                  Estimated Loss
                </p>
                <p className="text-2xl font-mono font-bold text-amber-500" data-testid="result-loss">
                  {results.estimatedLoss.toFixed(2)} dB
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Fiber attenuation: {fiberAttenuation} dB/km
                </p>
              </div>
            </div>

            {/* Formula Breakdown */}
            <div className="p-3 rounded-md bg-muted/20 text-xs space-y-1">
              <p className="font-medium text-white">Calculation Formula:</p>
              <p className="text-muted-foreground">
                Cable = Routed Distance × (1 + Slack %)
              </p>
              <p className="text-muted-foreground">
                Loss = Distance × 0.35 dB/km + Splices × 0.6 dB
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Saved Routes */}
      <Card className="bg-card/30">
        <CardHeader>
          <CardTitle>Saved Routes</CardTitle>
        </CardHeader>
        <CardContent>
          {routes.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No routes saved yet
            </div>
          ) : (
            <div className="space-y-2">
              {routes.map((route: any) => (
                <div
                  key={route.id}
                  className="flex items-center justify-between p-3 rounded-md bg-card hover:bg-card/80 transition-colors"
                  data-testid={`route-${route.id}`}
                >
                  <div className="flex-1">
                    <p className="text-sm font-medium text-white">{route.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(route.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-4 text-sm">
                    <div className="text-right">
                      <p className="text-xs text-muted-foreground">Distance</p>
                      <p className="font-mono text-white">
                        {route.routedDistance} m
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-muted-foreground">Cable</p>
                      <p className="font-mono text-green-500">
                        {route.cableRequired} m
                      </p>
                    </div>
                    <Badge variant="outline">{route.splicePoints} splices</Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
