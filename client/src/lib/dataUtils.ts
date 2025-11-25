// Data Export/Import Utilities

export interface NodeData {
  id: string;
  name: string;
  type: string;
  latitude: string;
  longitude: string;
  inputPower?: string;
  location?: string;
  notes?: string;
}

export interface ExportData {
  timestamp: string;
  nodes: NodeData[];
  routes?: Array<{
    startNode: string;
    endNode: string;
    distance: number;
  }>;
}

// Export nodes to JSON
export function exportToJSON(nodes: NodeData[], filename = 'fibertrace-nodes.json'): void {
  const data: ExportData = {
    timestamp: new Date().toISOString(),
    nodes,
  };

  const json = JSON.stringify(data, null, 2);
  downloadFile(json, filename, 'application/json');
}

// Export nodes to CSV
export function exportToCSV(nodes: NodeData[], filename = 'fibertrace-nodes.csv'): void {
  const headers = ['ID', 'Name', 'Type', 'Latitude', 'Longitude', 'Input Power', 'Location', 'Notes'];
  const rows = nodes.map(node => [
    node.id,
    node.name,
    node.type,
    node.latitude,
    node.longitude,
    node.inputPower || '',
    node.location || '',
    node.notes || '',
  ]);

  const csv = [
    headers.join(','),
    ...rows.map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(',')),
  ].join('\n');

  downloadFile(csv, filename, 'text/csv');
}

// Download file helper
function downloadFile(content: string, filename: string, type: string): void {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

// Import nodes from JSON file
export async function importFromJSON(file: File): Promise<NodeData[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target?.result as string) as ExportData;
        resolve(data.nodes);
      } catch (error) {
        reject(new Error('Invalid JSON format'));
      }
    };
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsText(file);
  });
}

// Import nodes from CSV file
export async function importFromCSV(file: File): Promise<NodeData[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const lines = (e.target?.result as string).split('\n');
        if (lines.length < 2) {
          reject(new Error('CSV file is empty'));
          return;
        }

        const headers = lines[0].split(',').map(h => h.trim());
        const nodes: NodeData[] = [];

        for (let i = 1; i < lines.length; i++) {
          if (!lines[i].trim()) continue;

          const values = parseCSVLine(lines[i]);
          if (values.length >= 5) {
            nodes.push({
              id: values[0]?.trim() || `import-${i}`,
              name: values[1]?.trim() || 'Unnamed',
              type: values[2]?.trim() || 'Unknown',
              latitude: values[3]?.trim() || '0',
              longitude: values[4]?.trim() || '0',
              inputPower: values[5]?.trim(),
              location: values[6]?.trim(),
              notes: values[7]?.trim(),
            });
          }
        }

        resolve(nodes);
      } catch (error) {
        reject(new Error('Invalid CSV format'));
      }
    };
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsText(file);
  });
}

// Parse CSV line handling quoted values
function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    const nextChar = line[i + 1];

    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      result.push(current);
      current = '';
    } else {
      current += char;
    }
  }

  result.push(current);
  return result;
}

// Filter nodes by search term
export function filterNodesBySearch(
  nodes: NodeData[],
  searchTerm: string,
  filterType?: string,
  filterPowerLevel?: string
): NodeData[] {
  let filtered = nodes;

  if (searchTerm) {
    const lower = searchTerm.toLowerCase();
    filtered = filtered.filter(
      node =>
        node.name.toLowerCase().includes(lower) ||
        node.type.toLowerCase().includes(lower) ||
        node.location?.toLowerCase().includes(lower) ||
        node.notes?.toLowerCase().includes(lower)
    );
  }

  if (filterType && filterType !== 'All') {
    filtered = filtered.filter(node => node.type === filterType);
  }

  if (filterPowerLevel && filterPowerLevel !== 'All') {
    const power = (node: NodeData) => {
      const p = parseFloat(node.inputPower || '0');
      if (filterPowerLevel === 'High') return p >= 0;
      if (filterPowerLevel === 'Medium') return p >= -10 && p < 0;
      if (filterPowerLevel === 'Low') return p < -10;
      return false;
    };
    filtered = filtered.filter(power);
  }

  return filtered;
}

// Get unique node types from collection
export function getNodeTypes(nodes: NodeData[]): string[] {
  const types = new Set(nodes.map(n => n.type));
  return Array.from(types).sort();
}
