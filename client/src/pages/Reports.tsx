import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from "recharts";
import { Download, Mail } from "lucide-react";

export default function Reports() {
  const jobData = [
    { name: 'Mon', jobs: 4 },
    { name: 'Tue', jobs: 6 },
    { name: 'Wed', jobs: 3 },
    { name: 'Thu', jobs: 8 },
    { name: 'Fri', jobs: 5 },
    { name: 'Sat', jobs: 2 },
    { name: 'Sun', jobs: 1 },
  ];

  const typeData = [
    { name: 'Install', value: 45 },
    { name: 'Repair', value: 30 },
    { name: 'Survey', value: 15 },
    { name: 'Splice', value: 10 },
  ];

  const COLORS = ['hsl(190 100% 50%)', 'hsl(280 100% 60%)', 'hsl(320 100% 50%)', 'hsl(40 100% 50%)'];

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold text-white">Reports & Analytics</h1>
          <p className="text-muted-foreground">Weekly performance and job statistics</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="border-border/50">
            <Mail className="mr-2 h-4 w-4" /> Email
          </Button>
          <Button className="bg-primary text-black hover:bg-primary/90">
            <Download className="mr-2 h-4 w-4" /> Export PDF
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Weekly Job Completion */}
        <Card className="bg-card/40 border-border/50">
          <CardHeader>
            <CardTitle>Weekly Jobs</CardTitle>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={jobData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" vertical={false} />
                <XAxis dataKey="name" stroke="rgba(255,255,255,0.3)" fontSize={12} tick={{fill: 'rgba(255,255,255,0.5)'}} />
                <YAxis stroke="rgba(255,255,255,0.3)" fontSize={12} tick={{fill: 'rgba(255,255,255,0.5)'}} />
                <Tooltip 
                  cursor={{fill: 'rgba(255,255,255,0.05)'}}
                  contentStyle={{ backgroundColor: 'rgba(15, 23, 42, 0.9)', border: '1px solid rgba(255,255,255,0.1)' }}
                  itemStyle={{ color: 'cyan' }}
                />
                <Bar dataKey="jobs" fill="hsl(190 100% 50%)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Job Types Distribution */}
        <Card className="bg-card/40 border-border/50">
          <CardHeader>
            <CardTitle>Work Distribution</CardTitle>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={typeData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  fill="#8884d8"
                  paddingAngle={5}
                  dataKey="value"
                >
                  {typeData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: 'rgba(15, 23, 42, 0.9)', border: '1px solid rgba(255,255,255,0.1)' }}
                  itemStyle={{ color: 'white' }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex justify-center gap-4 mt-4">
              {typeData.map((entry, index) => (
                <div key={entry.name} className="flex items-center gap-2 text-xs text-muted-foreground">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                  {entry.name}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
