import { WorkflowNode, Connection, NodeType } from '../types';

export interface ValidationIssue {
  id: string;
  nodeId?: string;
  severity: 'error' | 'warning' | 'info';
  title: string;
  message: string;
}

export function validateWorkflow(nodes: WorkflowNode[], connections: Connection[]): ValidationIssue[] {
  const issues: ValidationIssue[] = [];

  if (nodes.length === 0) {
    issues.push({
      id: 'no-nodes',
      severity: 'error',
      title: 'Empty Workflow',
      message: 'Add at least one trigger node to start constructing your automated workflow.',
    });
    return issues;
  }

  // Check for trigger
  const triggers = nodes.filter((n) => n.type === 'trigger' || n.type === 'webhook');
  if (triggers.length === 0) {
    issues.push({
      id: 'missing-trigger',
      severity: 'error',
      title: 'Missing Event Trigger',
      message: 'Workflows require an Event Trigger or Webhook node to initiate execution.',
    });
  }

  // Check for orphaned nodes
  nodes.forEach((node) => {
    const isTrigger = node.type === 'trigger' || node.type === 'webhook';
    const hasIncoming = connections.some((c) => c.targetId === node.id);
    const hasOutgoing = connections.some((c) => c.sourceId === node.id);

    if (!isTrigger && !hasIncoming) {
      issues.push({
        id: `orphan-in-${node.id}`,
        nodeId: node.id,
        severity: 'warning',
        title: 'Unreachable Node',
        message: `Node "${node.data.label}" has no incoming connection and will never execute.`,
      });
    }

    if (!hasOutgoing && node.type !== 'notification' && node.type !== 'database' && node.type !== 'email') {
      issues.push({
        id: `orphan-out-${node.id}`,
        nodeId: node.id,
        severity: 'info',
        title: 'Terminal Node',
        message: `Node "${node.data.label}" ends a branch without sending downstream output.`,
      });
    }
  });

  return issues;
}

export function autoLayoutNodes(nodes: WorkflowNode[], connections: Connection[]): WorkflowNode[] {
  if (nodes.length === 0) return [];

  // Group nodes by depth from trigger
  const nodeDepths: Record<string, number> = {};
  const visited = new Set<string>();

  const startNodes = nodes.filter(
    (n) => n.type === 'trigger' || n.type === 'webhook' || !connections.some((c) => c.targetId === n.id)
  );

  function assignDepth(nodeId: string, depth: number) {
    nodeDepths[nodeId] = Math.max(nodeDepths[nodeId] || 0, depth);
    visited.add(nodeId);

    const outgoing = connections.filter((c) => c.sourceId === nodeId);
    outgoing.forEach((conn) => {
      if (!visited.has(conn.targetId) || depth + 1 > (nodeDepths[conn.targetId] || 0)) {
        assignDepth(conn.targetId, depth + 1);
      }
    });
  }

  startNodes.forEach((s) => assignDepth(s.id, 0));

  // Any unreachable nodes get depth based on original index
  nodes.forEach((n, idx) => {
    if (nodeDepths[n.id] === undefined) {
      nodeDepths[n.id] = idx;
    }
  });

  // Group by depth
  const depthGroups: Record<number, WorkflowNode[]> = {};
  nodes.forEach((node) => {
    const d = nodeDepths[node.id] || 0;
    if (!depthGroups[d]) depthGroups[d] = [];
    depthGroups[d].push(node);
  });

  const updatedNodes = nodes.map((node) => ({ ...node }));
  const X_SPACING = 280;
  const Y_SPACING = 160;
  const START_X = 100;
  const START_Y = 200;

  Object.entries(depthGroups).forEach(([depthStr, groupNodes]) => {
    const depth = Number(depthStr);
    const groupHeight = (groupNodes.length - 1) * Y_SPACING;
    const startY = START_Y - groupHeight / 2;

    groupNodes.forEach((groupNode, index) => {
      const target = updatedNodes.find((n) => n.id === groupNode.id);
      if (target) {
        target.x = START_X + depth * X_SPACING;
        target.y = startY + index * Y_SPACING;
      }
    });
  });

  return updatedNodes;
}

export function autoLayoutWorkflow(nodes: WorkflowNode[], connections: Connection[]): { nodes: WorkflowNode[]; connections: Connection[] } {
  const lNodes = autoLayoutNodes(nodes, connections);
  return { nodes: lNodes, connections };
}

export function generateConnectionPath(
  sourcePos: { x: number; y: number },
  targetPos: { x: number; y: number }
): string {
  const dx = targetPos.x - sourcePos.x;
  const dy = targetPos.y - sourcePos.y;
  const controlDist = Math.max(Math.abs(dx) * 0.5, 60);

  const c1x = sourcePos.x + controlDist;
  const c1y = sourcePos.y;
  const c2x = targetPos.x - controlDist;
  const c2y = targetPos.y;

  return `M ${sourcePos.x} ${sourcePos.y} C ${c1x} ${c1y}, ${c2x} ${c2y}, ${targetPos.x} ${targetPos.y}`;
}
