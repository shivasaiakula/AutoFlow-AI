export type NodeType =
  | 'trigger'
  | 'condition'
  | 'delay'
  | 'loop'
  | 'approval'
  | 'email'
  | 'sms'
  | 'whatsapp'
  | 'api_request'
  | 'database'
  | 'ai_decision'
  | 'webhook'
  | 'document'
  | 'payment'
  | 'notification'
  | 'custom_function';

export type NodeCategory =
  | 'triggers'
  | 'logic'
  | 'communication'
  | 'integrations'
  | 'ai'
  | 'utilities';

export interface WorkflowNodeData {
  label: string;
  description?: string;
  config: Record<string, any>;
  status?: 'idle' | 'running' | 'success' | 'failed' | 'waiting';
  lastRunOutput?: string;
  executionTimeMs?: number;
  aiPrompt?: string;
}

export interface WorkflowNode {
  id: string;
  type: NodeType;
  x: number;
  y: number;
  data: WorkflowNodeData;
  groupId?: string;
}

export interface Connection {
  id: string;
  sourceId: string;
  targetId: string;
  sourceHandle?: 'out' | 'true' | 'false';
  label?: string;
  animated?: boolean;
}

export interface NodeGroup {
  id: string;
  title: string;
  color: string;
  bounds: { x: number; y: number; width: number; height: number };
}

export type ViewMode =
  | 'canvas'
  | 'marketplace'
  | 'roi'
  | 'employee'
  | 'meeting'
  | 'analytics';

export interface Workflow {
  id: string;
  name: string;
  description: string;
  category: string;
  version?: string;
  status?: 'active' | 'draft' | 'paused';
  createdAt?: string;
  updatedAt: string;
  nodes: WorkflowNode[];
  connections: Connection[];
  groups?: NodeGroup[];
  healthScore?: number;
  optimizationScore?: number;
  estimatedTimeSavedMinutes?: number;
  estimatedCostReductionUSD?: number;
  tags?: string[];
}

export interface MarketplaceTemplate {
  id: string;
  title: string;
  description: string;
  category: string;
  rating: number;
  reviewsCount: number;
  downloadsCount: number;
  author: {
    name: string;
    avatar: string;
    verified: boolean;
  };
  price: 'Free' | string;
  nodesCount: number;
  tags: string[];
  trending?: boolean;
  workflow: Omit<Workflow, 'id'>;
}

export interface UserPresence {
  id: string;
  name: string;
  avatar: string;
  color: string;
  cursor?: { x: number; y: number };
  activeNodeId?: string;
  status: 'editing' | 'viewing' | 'idle';
}

export interface WorkflowComment {
  id: string;
  nodeId?: string;
  author: {
    name: string;
    avatar: string;
  };
  text: string;
  createdAt: string;
  resolved: boolean;
}

export interface WorkflowVersion {
  id: string;
  versionNumber: string;
  createdAt: string;
  createdBy: string;
  commitMessage: string;
  nodesCount: number;
}

export interface OptimizationResult {
  healthScore: number;
  optimizationScore: number;
  estimatedTimeSavedMinutes: number;
  estimatedCostReductionUSD: number;
  confidenceScore: number;
  recommendations: {
    id: string;
    type: 'performance' | 'cost' | 'reliability' | 'structure';
    title: string;
    description: string;
    impact: 'high' | 'medium' | 'low';
    autoFixAvailable: boolean;
    fixAction?: string;
  }[];
}

export interface DigitalEmployeeJob {
  id: string;
  title: string;
  instruction: string;
  status: 'queued' | 'running' | 'completed' | 'failed' | 'waiting_approval';
  progress: number;
  currentStep: string;
  startTime: string;
  endTime?: string;
  logs: { timestamp: string; level: 'info' | 'warn' | 'success' | 'error'; message: string }[];
  resultSummary?: string;
}

export interface MeetingTranscriptInput {
  source: 'Zoom' | 'Google Meet' | 'Microsoft Teams' | 'Upload' | 'Audio';
  title: string;
  date: string;
  transcriptText: string;
}

export interface CopilotMessage {
  id: string;
  sender: 'user' | 'assistant' | 'system';
  text: string;
  timestamp: string;
  suggestedAction?: {
    label: string;
    type: 'add_nodes' | 'apply_optimization' | 'open_template' | 'explain';
    payload?: any;
  };
}

export interface AnalyticsSummary {
  activeWorkflows: number;
  completedWorkflows: number;
  failedWorkflows: number;
  runningTasks: number;
  aiRecommendationsCount: number;
  teamProductivityIncreasePct: number;
  monthlySavingsUSD: number;
  hoursSavedThisMonth: number;
  successRatePct: number;
  avgExecutionTimeMs: number;
}
