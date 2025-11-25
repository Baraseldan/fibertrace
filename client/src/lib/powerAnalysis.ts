// Power Analysis Utilities

export interface PowerMetrics {
  nodeId: string;
  nodeName: string;
  power: number;
  level: 'High' | 'Medium' | 'Low' | 'Critical';
  loss: number;
}

export interface PowerAnalysis {
  totalNodes: number;
  avgPower: number;
  minPower: number;
  maxPower: number;
  powerByType: Record<string, number>;
  criticalNodes: PowerMetrics[];
  powerDistribution: {
    high: number;
    medium: number;
    low: number;
    critical: number;
  };
}

export function calculatePowerMetrics(
  nodeId: string,
  nodeName: string,
  inputPower?: string
): PowerMetrics {
  const power = parseFloat(inputPower || '0');
  let level: 'High' | 'Medium' | 'Low' | 'Critical' = 'High';
  let loss = 0;

  if (power < -20) {
    level = 'Critical';
    loss = Math.abs(power) - 20;
  } else if (power < -10) {
    level = 'Low';
    loss = Math.abs(power) - 10;
  } else if (power < 0) {
    level = 'Medium';
  }

  return {
    nodeId,
    nodeName,
    power,
    level,
    loss,
  };
}

export function analyzePowerDistribution(nodes: Array<{
  id: string;
  name: string;
  type: string;
  inputPower?: string;
}>): PowerAnalysis {
  const metrics = nodes.map(n => calculatePowerMetrics(n.id, n.name, n.inputPower));
  const powers = metrics.map(m => m.power);
  const avgPower = powers.length > 0 ? powers.reduce((a, b) => a + b, 0) / powers.length : 0;
  const minPower = powers.length > 0 ? Math.min(...powers) : 0;
  const maxPower = powers.length > 0 ? Math.max(...powers) : 0;

  const powerByType: Record<string, number> = {};
  nodes.forEach(node => {
    if (!powerByType[node.type]) {
      powerByType[node.type] = 0;
    }
    powerByType[node.type] += parseFloat(node.inputPower || '0');
  });

  const distribution = {
    high: metrics.filter(m => m.level === 'High').length,
    medium: metrics.filter(m => m.level === 'Medium').length,
    low: metrics.filter(m => m.level === 'Low').length,
    critical: metrics.filter(m => m.level === 'Critical').length,
  };

  const criticalNodes = metrics
    .filter(m => m.level === 'Critical' || m.level === 'Low')
    .sort((a, b) => a.power - b.power)
    .slice(0, 5);

  return {
    totalNodes: nodes.length,
    avgPower: Math.round(avgPower * 100) / 100,
    minPower: Math.round(minPower * 100) / 100,
    maxPower: Math.round(maxPower * 100) / 100,
    powerByType,
    criticalNodes,
    powerDistribution: distribution,
  };
}

export function getPowerStatus(power?: string): {
  color: string;
  status: string;
  level: string;
} {
  const p = parseFloat(power || '0');

  if (p < -20) {
    return {
      color: '#ef4444',
      status: 'Critical',
      level: 'Critical Power Loss',
    };
  } else if (p < -10) {
    return {
      color: '#f97316',
      status: 'Low',
      level: 'Significant Loss',
    };
  } else if (p < 0) {
    return {
      color: '#eab308',
      status: 'Medium',
      level: 'Some Loss',
    };
  } else {
    return {
      color: '#10b981',
      status: 'Good',
      level: 'Healthy Power',
    };
  }
}

export function calculatePowerLoss(distance: number, power: number): number {
  // Simplified power loss calculation: ~0.2dB per km for single mode fiber
  const lossPerKm = 0.2;
  const loss = distance * lossPerKm;
  return Math.round((power - loss) * 100) / 100;
}
