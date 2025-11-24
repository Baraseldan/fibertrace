import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import type { SpliceRecord } from "@shared/schema";
import {
  Bluetooth,
  BluetoothConnected,
  BluetoothOff,
  Activity,
  Save,
  RefreshCw,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

export default function Splicer() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [isConnected, setIsConnected] = useState(false);
  const [deviceName, setDeviceName] = useState("");
  const [fiber1, setFiber1] = useState("");
  const [fiber2, setFiber2] = useState("");
  const [spliceLoss, setSpliceLoss] = useState("");
  const [attenuation, setAttenuation] = useState("");
  const [fusionCount, setFusionCount] = useState("");
  const [spliceQuality, setSpliceQuality] = useState<"Excellent" | "Good" | "Fair" | "Poor">("Good");

  const { data: spliceRecords = [] } = useQuery<SpliceRecord[]>({
    queryKey: ['/api/splice-records'],
  });

  const saveMutation = useMutation({
    mutationFn: async (data: any) => {
      return apiRequest('/api/splice-records', 'POST', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/splice-records'] });
      toast({
        title: "Splice Record Saved",
        description: "Splice data has been recorded successfully.",
      });
      resetForm();
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to save splice record",
        variant: "destructive",
      });
    },
  });

  const handleConnect = () => {
    // Simulated Bluetooth connection
    toast({
      title: "Bluetooth",
      description: "Bluetooth connection is simulated in this demo",
    });
    setIsConnected(true);
    setDeviceName("Fujikura FSM-100P");
  };

  const handleDisconnect = () => {
    setIsConnected(false);
    setDeviceName("");
  };

  const handleSave = () => {
    if (!fiber1 || !fiber2) {
      toast({
        title: "Error",
        description: "Please enter fiber identifiers",
        variant: "destructive",
      });
      return;
    }

    const loss = spliceLoss ? parseFloat(spliceLoss).toFixed(2) : undefined;
    const atten = attenuation ? parseFloat(attenuation).toFixed(2) : undefined;
    const count = fusionCount ? parseInt(fusionCount) : undefined;

    saveMutation.mutate({
      fiber1,
      fiber2,
      spliceLoss: loss,
      attenuation: atten,
      fusionCount: count,
      spliceQuality,
      deviceName: deviceName || "Manual Entry",
    });
  };

  const resetForm = () => {
    setFiber1("");
    setFiber2("");
    setSpliceLoss("");
    setAttenuation("");
    setFusionCount("");
    setSpliceQuality("Good");
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold text-white">
            Bluetooth Splicer
          </h1>
          <p className="text-muted-foreground mt-1">
            Real-time Splice Data Sync
          </p>
        </div>
      </div>

      {/* Connection Status */}
      <Card className="bg-gradient-to-br from-card/80 to-card/40">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div
                className={`h-16 w-16 rounded-full flex items-center justify-center ${
                  isConnected
                    ? "bg-green-500/20 border-2 border-green-500"
                    : "bg-muted/20 border-2 border-border"
                }`}
              >
                {isConnected ? (
                  <BluetoothConnected className="h-8 w-8 text-green-500" />
                ) : (
                  <BluetoothOff className="h-8 w-8 text-muted-foreground" />
                )}
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">
                  {isConnected ? "Connected" : "Not Connected"}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {isConnected
                    ? `Device: ${deviceName}`
                    : "No Bluetooth device connected"}
                </p>
              </div>
            </div>
            <Button
              onClick={isConnected ? handleDisconnect : handleConnect}
              variant={isConnected ? "destructive" : "default"}
              data-testid="button-bluetooth"
            >
              <Bluetooth className="mr-2 h-4 w-4" />
              {isConnected ? "Disconnect" : "Connect Device"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Splice Data Entry */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-card/30">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-primary" />
              Splice Data
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="fiber1">Fiber 1 ID</Label>
                <Input
                  id="fiber1"
                  placeholder="F1-A-01"
                  value={fiber1}
                  onChange={(e) => setFiber1(e.target.value)}
                  data-testid="input-fiber1"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="fiber2">Fiber 2 ID</Label>
                <Input
                  id="fiber2"
                  placeholder="F1-B-01"
                  value={fiber2}
                  onChange={(e) => setFiber2(e.target.value)}
                  data-testid="input-fiber2"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="splice-loss">Splice Loss (dB)</Label>
                <Input
                  id="splice-loss"
                  type="number"
                  step="0.01"
                  placeholder="0.05"
                  value={spliceLoss}
                  onChange={(e) => setSpliceLoss(e.target.value)}
                  data-testid="input-splice-loss"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="attenuation">Attenuation (dB)</Label>
                <Input
                  id="attenuation"
                  type="number"
                  step="0.01"
                  placeholder="0.20"
                  value={attenuation}
                  onChange={(e) => setAttenuation(e.target.value)}
                  data-testid="input-attenuation"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="fusion-count">Fusion Count</Label>
              <Input
                id="fusion-count"
                type="number"
                placeholder="1"
                value={fusionCount}
                onChange={(e) => setFusionCount(e.target.value)}
                data-testid="input-fusion-count"
              />
            </div>

            <div className="flex gap-2 pt-4">
              <Button
                onClick={handleSave}
                disabled={saveMutation.isPending}
                className="flex-1"
                data-testid="button-save-splice"
              >
                <Save className="mr-2 h-4 w-4" />
                {saveMutation.isPending ? "Saving..." : "Save Record"}
              </Button>
              <Button
                variant="outline"
                onClick={resetForm}
                data-testid="button-reset"
              >
                <RefreshCw className="mr-2 h-4 w-4" />
                Reset
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Live Reading Display */}
        <Card className="bg-card/30">
          <CardHeader>
            <CardTitle>Quality Indicators</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              {["Excellent", "Good", "Fair", "Poor"].map((quality) => (
                <button
                  key={quality}
                  onClick={() => setSpliceQuality(quality as any)}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    spliceQuality === quality
                      ? quality === "Excellent"
                        ? "bg-green-500/20 border-green-500"
                        : quality === "Good"
                        ? "bg-blue-500/20 border-blue-500"
                        : quality === "Fair"
                        ? "bg-amber-500/20 border-amber-500"
                        : "bg-red-500/20 border-red-500"
                      : "bg-card border-border hover:border-primary/50"
                  }`}
                  data-testid={`button-quality-${quality.toLowerCase()}`}
                >
                  <p className="text-sm font-medium text-white">{quality}</p>
                </button>
              ))}
            </div>

            <div className="p-4 rounded-lg bg-muted/20 mt-4">
              <p className="text-xs font-medium text-white mb-2">
                Quality Guidelines:
              </p>
              <div className="space-y-1 text-xs">
                <p className="text-green-500">Excellent: &lt; 0.05 dB</p>
                <p className="text-blue-500">Good: 0.05 - 0.10 dB</p>
                <p className="text-amber-500">Fair: 0.10 - 0.20 dB</p>
                <p className="text-red-500">Poor: &gt; 0.20 dB</p>
              </div>
            </div>

            {isConnected && (
              <div className="p-4 rounded-lg bg-green-500/10 border border-green-500/20">
                <p className="text-sm font-medium text-green-500 mb-2">
                  Live Data Sync Active
                </p>
                <p className="text-xs text-muted-foreground">
                  Splice readings will automatically update from connected device
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent Splices */}
      <Card className="bg-card/30">
        <CardHeader>
          <CardTitle>Recent Splice Records</CardTitle>
        </CardHeader>
        <CardContent>
          {spliceRecords.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No splice records yet
            </div>
          ) : (
            <div className="space-y-2">
              {spliceRecords.slice(0, 10).map((record: any) => (
                <div
                  key={record.id}
                  className="flex items-center justify-between p-3 rounded-md bg-card hover:bg-card/80 transition-colors"
                  data-testid={`splice-record-${record.id}`}
                >
                  <div className="flex-1">
                    <p className="text-sm font-medium text-white">
                      {record.fiber1} ↔ {record.fiber2}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(record.spliceDate).toLocaleString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-4 text-sm">
                    <div className="text-right">
                      <p className="text-xs text-muted-foreground">Loss</p>
                      <p className="font-mono text-primary">
                        {record.spliceLoss || "--"} dB
                      </p>
                    </div>
                    <Badge
                      variant={
                        record.spliceQuality === "Excellent"
                          ? "default"
                          : record.spliceQuality === "Good"
                          ? "outline"
                          : "secondary"
                      }
                    >
                      {record.spliceQuality || "N/A"}
                    </Badge>
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
