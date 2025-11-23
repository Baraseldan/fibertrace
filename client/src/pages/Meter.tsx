import React, { useState, useEffect } from 'react';
import { useQuery, useMutation } from "@tanstack/react-query";
import { jobsApi, meterApi } from "@/lib/api";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Bluetooth, 
  Wifi, 
  RefreshCw, 
  Save, 
  Share2, 
  Zap,
  Activity
} from "lucide-react";
import { Area, AreaChart, CartesianGrid, Tooltip, XAxis, YAxis, ResponsiveContainer } from "recharts";

export default function Meter() {
  const [isScanning, setIsScanning] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [readings, setReadings] = useState<{time: string, dbm: number}[]>([]);
  const [currentReading, setCurrentReading] = useState<number | null>(null);
  const [selectedJobId, setSelectedJobId] = useState<number | null>(null);
  const { toast } = useToast();

  const { data: jobs = [] } = useQuery({
    queryKey: ['jobs'],
    queryFn: jobsApi.getAll,
  });

  const handleScan = () => {
    setIsScanning(true);
    setTimeout(() => {
      setIsScanning(false);
      setIsConnected(true);
    }, 2000);
  };

  const handleDisconnect = () => {
    setIsConnected(false);
    setReadings([]);
    setCurrentReading(null);
  };

  // Simulate live data readings
  useEffect(() => {
    if (!isConnected) return;

    const interval = setInterval(() => {
      const newReading = -15 + Math.random() * 2; // Random reading around -15dBm
      setCurrentReading(Number(newReading.toFixed(2)));
      
      setReadings(prev => {
        const newSet = [...prev, { 
          time: new Date().toLocaleTimeString('en-US', { hour12: false, minute: '2-digit', second: '2-digit' }), 
          dbm: Number(newReading.toFixed(2)) 
        }];
        return newSet.slice(-20); // Keep last 20
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isConnected]);

  const saveReadingMutation = useMutation({
    mutationFn: () => {
      if (!selectedJobId || !currentReading) {
        throw new Error("Please select a job and ensure meter is connected");
      }
      
      const avgReading = readings.length > 0
        ? readings.reduce((sum, r) => sum + r.dbm, 0) / readings.length
        : currentReading;
      
      return meterApi.create({
        jobId: selectedJobId,
        readingType: "Power Loss",
        lossDbm: parseFloat(avgReading.toFixed(2)),
        distanceMeters: null,
        deviceName: "EXFO-MAX-700",
        eventMarkers: null,
      });
    },
    onSuccess: () => {
      if (selectedJobId) {
        queryClient.invalidateQueries({ queryKey: ['meter-readings', selectedJobId] });
      }
      toast({
        title: "Success",
        description: "Meter reading saved successfully",
      });
      setReadings([]);
      setCurrentReading(null);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to save reading",
        variant: "destructive",
      });
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-display font-bold text-white">Bluetooth Meter</h1>
          <p className="text-muted-foreground">Connect to OTDR / Power Meter</p>
        </div>
        <div className="flex gap-2">
          {!isConnected ? (
            <Button 
              onClick={handleScan} 
              disabled={isScanning}
              className="bg-blue-600 hover:bg-blue-500"
            >
              {isScanning ? <RefreshCw className="mr-2 h-4 w-4 animate-spin" /> : <Bluetooth className="mr-2 h-4 w-4" />}
              {isScanning ? "Scanning..." : "Connect Device"}
            </Button>
          ) : (
            <Button variant="destructive" onClick={handleDisconnect}>
              Disconnect
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Device Status Card */}
        <Card className="md:col-span-1 bg-card/40 border-border/50">
          <CardHeader>
            <CardTitle>Device Status</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex flex-col items-center justify-center py-6">
              <div className={`h-32 w-32 rounded-full flex items-center justify-center border-4 ${isConnected ? 'border-primary/50 bg-primary/10 neon-box' : 'border-muted bg-muted/10'}`}>
                {isConnected ? (
                  <div className="text-center">
                    <p className="text-3xl font-bold font-mono text-primary">{currentReading}</p>
                    <p className="text-xs text-muted-foreground">dBm</p>
                  </div>
                ) : (
                  <Bluetooth className="h-12 w-12 text-muted-foreground/50" />
                )}
              </div>
              <p className="mt-4 font-medium text-white">
                {isConnected ? "EXFO-MAX-700 Connected" : "No Device Connected"}
              </p>
              <p className="text-xs text-muted-foreground">
                {isConnected ? "Battery: 84%" : "Search for nearby BLE devices"}
              </p>
            </div>

            {isConnected && (
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Pass/Fail Threshold</span>
                  <span className="text-primary">-22.00 dBm</span>
                </div>
                <Progress value={((currentReading || -30) + 30) * 5} className="h-2" />
              </div>
            )}
          </CardContent>
        </Card>

        {/* Live Chart */}
        <Card className="md:col-span-2 bg-card/40 border-border/50">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Signal History</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="h-[300px]">
            {isConnected && readings.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={readings}>
                  <defs>
                    <linearGradient id="colorDbm" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(190 100% 50%)" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="hsl(190 100% 50%)" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                  <XAxis dataKey="time" stroke="rgba(255,255,255,0.3)" fontSize={12} tick={{fill: 'rgba(255,255,255,0.5)'}} />
                  <YAxis domain={[-25, -10]} stroke="rgba(255,255,255,0.3)" fontSize={12} tick={{fill: 'rgba(255,255,255,0.5)'}} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: 'rgba(15, 23, 42, 0.9)', border: '1px solid rgba(255,255,255,0.1)' }}
                    itemStyle={{ color: 'cyan' }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="dbm" 
                    stroke="hsl(190 100% 50%)" 
                    strokeWidth={2}
                    fillOpacity={1} 
                    fill="url(#colorDbm)" 
                    isAnimationActive={false}
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full w-full flex items-center justify-center text-muted-foreground">
                <p>Connect a device to view live signal data</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Job Selection */}
      {isConnected && (
        <Card className="bg-card/40 border-border/50">
          <CardHeader>
            <CardTitle>Associate with Job</CardTitle>
          </CardHeader>
          <CardContent>
            <Select onValueChange={(value) => setSelectedJobId(parseInt(value))}>
              <SelectTrigger data-testid="select-job">
                <SelectValue placeholder="Select a job to save readings" />
              </SelectTrigger>
              <SelectContent>
                {jobs
                  .filter(job => job.status !== 'Completed')
                  .map((job) => (
                    <SelectItem key={job.id} value={job.id.toString()}>
                      #{job.id} - {job.clientName} ({job.type})
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </CardContent>
        </Card>
      )}

      {/* Action Buttons */}
      <div className="flex gap-4">
        <Button 
          className="flex-1 bg-primary text-black hover:bg-primary/90" 
          disabled={!isConnected || !selectedJobId}
          onClick={() => saveReadingMutation.mutate()}
          data-testid="button-save-reading"
        >
          <Save className="mr-2 h-4 w-4" />
          {saveReadingMutation.isPending ? "Saving..." : "Save to Job Log"}
        </Button>
        <Button variant="outline" className="flex-1" disabled={!isConnected}>
          <Share2 className="mr-2 h-4 w-4" />
          Export CSV
        </Button>
      </div>
    </div>
  );
}
