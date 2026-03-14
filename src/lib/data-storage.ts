import fs from 'fs';
import path from 'path';
import { EcosystemMetrics } from '@/lib/types';
import { fetchEcosystemMetrics } from './api-services';

const DATA_DIR = path.join(process.cwd(), 'data');
const LATEST_FILE = path.join(DATA_DIR, 'latest.json');

// Ensure data directory exists
export function ensureDataDir(): void {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
    console.log(`Created data directory: ${DATA_DIR}`);
  }
}

// Generate timestamped filename
export function generateTimestampedFilename(): string {
  const now = new Date();
  const timestamp = now.toISOString().replace(/[:.]/g, '-').slice(0, 19);
  return path.join(DATA_DIR, `metrics-${timestamp}.json`);
}

// Save metrics to file
export function saveMetrics(metrics: EcosystemMetrics, filename?: string): string {
  ensureDataDir();
  
  const targetFile = filename || generateTimestampedFilename();
  const data = {
    ...metrics,
    _meta: {
      savedAt: new Date().toISOString(),
      version: '1.0.0'
    }
  };
  
  fs.writeFileSync(targetFile, JSON.stringify(data, null, 2));
  console.log(`Metrics saved to: ${targetFile}`);
  
  // Also update latest.json
  fs.writeFileSync(LATEST_FILE, JSON.stringify(data, null, 2));
  console.log(`Latest metrics updated: ${LATEST_FILE}`);
  
  return targetFile;
}

// Load latest metrics
export function loadLatestMetrics(): EcosystemMetrics | null {
  try {
    if (!fs.existsSync(LATEST_FILE)) {
      console.log('No latest metrics file found');
      return null;
    }
    
    const data = fs.readFileSync(LATEST_FILE, 'utf-8');
    const metrics = JSON.parse(data);
    
    // Remove meta fields before returning
    delete metrics._meta;
    
    return metrics as EcosystemMetrics;
  } catch (error) {
    console.error('Failed to load latest metrics:', error);
    return null;
  }
}

// Load metrics from specific file
export function loadMetricsFromFile(filename: string): EcosystemMetrics | null {
  try {
    const filepath = path.join(DATA_DIR, filename);
    if (!fs.existsSync(filepath)) {
      console.log(`File not found: ${filepath}`);
      return null;
    }
    
    const data = fs.readFileSync(filepath, 'utf-8');
    const metrics = JSON.parse(data);
    
    delete metrics._meta;
    return metrics as EcosystemMetrics;
  } catch (error) {
    console.error(`Failed to load metrics from ${filename}:`, error);
    return null;
  }
}

// List all saved metric files
export function listMetricFiles(): string[] {
  try {
    ensureDataDir();
    const files = fs.readdirSync(DATA_DIR);
    return files
      .filter(f => f.startsWith('metrics-') && f.endsWith('.json'))
      .sort()
      .reverse();
  } catch (error) {
    console.error('Failed to list metric files:', error);
    return [];
  }
}

// Collect and save metrics
export async function collectAndSaveMetrics(): Promise<{ success: boolean; file: string | null; metrics: EcosystemMetrics | null }> {
  try {
    console.log('Starting metrics collection...');
    
    const metrics = await fetchEcosystemMetrics();
    const filename = saveMetrics(metrics);
    
    console.log('Metrics collection completed successfully');
    return { success: true, file: filename, metrics };
  } catch (error) {
    console.error('Failed to collect and save metrics:', error);
    return { success: false, file: null, metrics: null };
  }
}

// Get metrics (from storage or fetch fresh)
export async function getMetrics(useFresh: boolean = false): Promise<EcosystemMetrics | null> {
  if (!useFresh) {
    const stored = loadLatestMetrics();
    if (stored) {
      console.log('Using stored metrics');
      return stored;
    }
  }
  
  console.log('Fetching fresh metrics...');
  const { metrics } = await collectAndSaveMetrics();
  return metrics;
}
