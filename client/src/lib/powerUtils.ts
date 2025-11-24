/**
 * Utility functions for power status calculations
 */

export type PowerStatus = 'Normal' | 'Warning' | 'Critical';

export interface PowerColor {
  status: PowerStatus;
  color: string;
}

/**
 * Calculate power status based on input power value
 * @param inputPower Power value in dBm
 * @returns PowerStatus and associated color
 */
export function getPowerStatus(inputPower: string | null | undefined): PowerColor {
  if (!inputPower) {
    return { status: 'Critical', color: '#6b7280' }; // Gray for unknown
  }
  
  const power = parseFloat(inputPower);
  
  if (power >= -15) {
    return { status: 'Normal', color: '#10b981' }; // Green
  }
  
  if (power >= -25) {
    return { status: 'Warning', color: '#f59e0b' }; // Amber
  }
  
  return { status: 'Critical', color: '#ef4444' }; // Red
}

/**
 * Format power value for display
 */
export function formatPower(power: string | null | undefined): string {
  if (!power) return 'N/A';
  return `${power} dBm`;
}

/**
 * Calculate splitter loss based on split ratio
 * Standard loss values for common splitter types
 */
export function getSplitterLoss(splitRatio: string): number {
  const lossMap: Record<string, number> = {
    '1:2': 3.5,
    '1:4': 7.0,
    '1:8': 10.5,
    '1:16': 14.0,
    '1:32': 17.5,
    '1:64': 21.0,
  };
  
  return lossMap[splitRatio] || 0;
}

/**
 * Calculate output power from input power and losses
 */
export function calculateOutputPower(
  inputPower: number,
  splitterLoss: number,
  connectorLoss: number = 0.5,
  spliceLoss: number = 0.1,
  distanceAttenuation: number = 0
): number {
  return inputPower - splitterLoss - connectorLoss - spliceLoss - distanceAttenuation;
}
