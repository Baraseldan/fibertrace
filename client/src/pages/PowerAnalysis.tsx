import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { PowerReading } from "@shared/schema";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  Zap,
  TrendingDown,
  AlertTriangle,
  CheckCircle,
  Calculator,
  Download,
} from "lucide-react";

// Splitter loss coefficients (typical values in dB)
const SPLITTER_LOSSES: Record<string, number> = {
  "1:2": 3.5,
  "1:4": 7.0,
  "1:8": 10.5,
  "1:16": 14.0,
  "1:32": 17.5,
  "1:64": 21.0,
};

export default function PowerAnalysis() {
  const [inputPower, setInputPower] = useState<string>("");
  const [splitterRatio, setSplitterRatio] = useState<string>("1:8");
  const [connectorLoss, setConnectorLoss] = useState<string>("0.5");
  const [spliceLoss, setSpliceLoss] = useState<string>("0.1");
  const [distance, setDistance] = useState<string>("0");
  const [fiberAttenuation] = useState<number>(0.35); // dB/km for typical fiber

  const { data: powerReadings = [] } = useQuery<PowerReading[]>({
    queryKey: ['/api/power-readings'],
  });

  const calculatePowerChain = () => {
    const input = parseFloat(inputPower) || 0;
    const splitterLoss = SPLITTER_LOSSES[splitterRatio] || 0;
    const connector = parseFloat(connectorLoss) || 0;
    const splice = parseFloat(spliceLoss) || 0;
    const dist = parseFloat(distance) || 0;
    const distanceLoss = dist * fiberAttenuation;

    const totalLoss = splitterLoss + connector + splice + distanceLoss;
    const outputPower = input - totalLoss;

    let status: "Normal" | "Warning" | "Critical";
    if (outputPower >= -23) {
      status = "Normal";
    } else if (outputPower >= -27) {
      status = "Warning";
    } else {
      status = "Critical";
    }

    return {
      inputPower: input,
      splitterLoss,
      connectorLoss: connector,
      spliceLoss: splice,
      distanceLoss,
      totalLoss,
      outputPower,
      status,
    };
  };

  const results = calculatePowerChain();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold text-white">
            Power Analysis
          </h1>
          <p className="text-muted-foreground mt-1">
            Signal Loss Calculation & Power Mapping
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" data-testid="button-export-report">
            <Download className="mr-2 h-4 w-4" /> Export Report
          </Button>
        </div>
      </div>

      {/* Power Calculator */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Input Section */}
        <Card className="bg-card/30">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calculator className="h-5 w-5 text-primary" />
              Power Chain Calculator
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="input-power">Input Power (dBm)</Label>
              <Input
                id="input-power"
                type="number"
                step="0.01"
                placeholder="-3.00"
                value={inputPower}
                onChange={(e) => setInputPower(e.target.value)}
                data-testid="input-power"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="splitter-ratio">Splitter Ratio</Label>
              <Select value={splitterRatio} onValueChange={setSplitterRatio}>
                <SelectTrigger id="splitter-ratio" data-testid="select-splitter">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1:2">1:2 (3.5 dB)</SelectItem>
                  <SelectItem value="1:4">1:4 (7.0 dB)</SelectItem>
                  <SelectItem value="1:8">1:8 (10.5 dB)</SelectItem>
                  <SelectItem value="1:16">1:16 (14.0 dB)</SelectItem>
                  <SelectItem value="1:32">1:32 (17.5 dB)</SelectItem>
                  <SelectItem value="1:64">1:64 (21.0 dB)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="connector-loss">Connector Loss (dB)</Label>
                <Input
                  id="connector-loss"
                  type="number"
                  step="0.1"
                  value={connectorLoss}
                  onChange={(e) => setConnectorLoss(e.target.value)}
                  data-testid="input-connector-loss"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="splice-loss">Splice Loss (dB)</Label>
                <Input
                  id="splice-loss"
                  type="number"
                  step="0.01"
                  value={spliceLoss}
                  onChange={(e) => setSpliceLoss(e.target.value)}
                  data-testid="input-splice-loss"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="distance">Distance (km)</Label>
              <Input
                id="distance"
                type="number"
                step="0.1"
                placeholder="0.0"
                value={distance}
                onChange={(e) => setDistance(e.target.value)}
                data-testid="input-distance"
              />
              <p className="text-xs text-muted-foreground">
                Fiber attenuation: {fiberAttenuation} dB/km
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Results Section */}
        <Card className="bg-card/30">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-amber-500" />
              Power Budget Results
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Status Badge */}
            <div className="flex items-center justify-between p-4 rounded-lg bg-card">
              <span className="text-sm font-medium">Signal Status</span>
              <Badge
                variant={
                  results.status === "Normal"
                    ? "default"
                    : results.status === "Warning"
                    ? "secondary"
                    : "destructive"
                }
                className="flex items-center gap-1"
                data-testid="badge-status"
              >
                {results.status === "Normal" && (
                  <CheckCircle className="h-3 w-3" />
                )}
                {results.status === "Warning" && (
                  <AlertTriangle className="h-3 w-3" />
                )}
                {results.status === "Critical" && (
                  <TrendingDown className="h-3 w-3" />
                )}
                {results.status}
              </Badge>
            </div>

            {/* Power Chain Breakdown */}
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 rounded-md bg-green-500/10 border border-green-500/20">
                <span className="text-sm text-muted-foreground">Input Power</span>
                <span className="text-lg font-mono font-bold text-green-500" data-testid="result-input-power">
                  {results.inputPower.toFixed(2)} dBm
                </span>
              </div>

              <div className="space-y-2 p-3 rounded-md bg-card">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Splitter Loss</span>
                  <span className="font-mono text-amber-500">
                    -{results.splitterLoss.toFixed(2)} dB
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Connector Loss</span>
                  <span className="font-mono text-amber-500">
                    -{results.connectorLoss.toFixed(2)} dB
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Splice Loss</span>
                  <span className="font-mono text-amber-500">
                    -{results.spliceLoss.toFixed(2)} dB
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Distance Loss</span>
                  <span className="font-mono text-amber-500">
                    -{results.distanceLoss.toFixed(2)} dB
                  </span>
                </div>
                <div className="h-px bg-border my-2" />
                <div className="flex justify-between text-sm font-medium">
                  <span className="text-muted-foreground">Total Loss</span>
                  <span className="font-mono text-red-500" data-testid="result-total-loss">
                    -{results.totalLoss.toFixed(2)} dB
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between p-3 rounded-md bg-primary/10 border border-primary/20">
                <span className="text-sm text-muted-foreground">Output Power</span>
                <span
                  className={`text-lg font-mono font-bold ${
                    results.status === "Normal"
                      ? "text-green-500"
                      : results.status === "Warning"
                      ? "text-amber-500"
                      : "text-red-500"
                  }`}
                  data-testid="result-output-power"
                >
                  {results.outputPower.toFixed(2)} dBm
                </span>
              </div>
            </div>

            {/* Power Guidelines */}
            <div className="p-3 rounded-md bg-muted/20 text-xs space-y-1">
              <p className="font-medium text-white">Power Level Guidelines:</p>
              <p className="text-green-500">✓ Normal: &gt;= -23 dBm</p>
              <p className="text-amber-500">⚠ Warning: -27 to -23 dBm</p>
              <p className="text-red-500">✗ Critical: &lt; -27 dBm</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Power Readings */}
      <Card className="bg-card/30">
        <CardHeader>
          <CardTitle>Recent Power Readings</CardTitle>
        </CardHeader>
        <CardContent>
          {powerReadings.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No power readings recorded yet
            </div>
          ) : (
            <div className="space-y-3">
              {powerReadings.slice(0, 5).map((reading, index) => (
                <div
                  key={reading.id || index}
                  className="flex items-center justify-between p-3 rounded-md bg-card hover:bg-card/80 transition-colors"
                  data-testid={`reading-${reading.id}`}
                >
                  <div className="flex-1">
                    <p className="text-sm font-medium text-white">
                      Node ID: {reading.nodeId} ({reading.nodeType})
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(reading.readingDate).toLocaleString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-4 text-sm">
                    <div className="text-right">
                      <p className="text-xs text-muted-foreground">Input</p>
                      <p className="font-mono text-green-500">
                        {reading.inputPower} dBm
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-muted-foreground">Output</p>
                      <p className="font-mono text-primary">
                        {reading.outputPower} dBm
                      </p>
                    </div>
                    <Badge variant={reading.status === "Normal" ? "default" : "secondary"}>
                      {reading.status}
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
