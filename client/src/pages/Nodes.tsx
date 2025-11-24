import { Link } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Database,
  Server,
  Split,
  Box,
  Home,
  Radio,
  CircleDot,
  Cloud,
  ArrowRight,
} from "lucide-react";

export default function Nodes() {
  const modules = [
    {
      title: "OLTs",
      description: "Optical Line Terminals",
      icon: Server,
      color: "blue",
      path: "/topology",
      count: "-",
    },
    {
      title: "ODFs",
      description: "Optical Distribution Frames",
      icon: Database,
      color: "cyan",
      path: "/topology",
      count: "-",
    },
    {
      title: "Splitters",
      description: "1:2, 1:4, 1:8, 1:16, 1:32, 1:64",
      icon: Split,
      color: "purple",
      path: "/topology",
      count: "-",
    },
    {
      title: "FATs",
      description: "Fiber Access Terminals",
      icon: Box,
      color: "green",
      path: "/topology",
      count: "-",
    },
    {
      title: "ATBs",
      description: "Access Terminal Boxes",
      icon: Home,
      color: "amber",
      path: "/topology",
      count: "-",
    },
    {
      title: "Closures",
      description: "Dome, Underground, Aerial",
      icon: Radio,
      color: "pink",
      path: "/infrastructure",
      count: "-",
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-display font-bold text-white">
          Nodes & Splitters Library
        </h1>
        <p className="text-muted-foreground mt-1">
          Complete GPON/FTTH Node Directory
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {modules.map((module) => (
          <Link key={module.title} href={module.path}>
            <Card className="bg-card/30 hover:bg-card/50 transition-all hover:scale-105 cursor-pointer">
              <CardHeader className="flex flex-row items-center justify-between gap-1 pb-3">
                <CardTitle className="text-base">{module.title}</CardTitle>
                <module.icon className="h-5 w-5 text-primary" />
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  {module.description}
                </p>
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-bold text-white">
                    {module.count}
                  </span>
                  <Button variant="ghost" size="sm">
                    View
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
