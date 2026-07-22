import React from 'react';
import { WorkflowNode } from '../../types';

interface MinimapProps {
  nodes: WorkflowNode[];
  pan: { x: number; y: number };
  zoom: number;
}

export const Minimap: React.FC<MinimapProps> = ({ nodes, pan, zoom }) => {
  if (nodes.length === 0) return null;

  // Calculate bounding box of all nodes
  const minX = Math.min(...nodes.map((n) => n.x)) - 100;
  const maxX = Math.max(...nodes.map((n) => n.x)) + 300;
  const minY = Math.min(...nodes.map((n) => n.y)) - 100;
  const maxY = Math.max(...nodes.map((n) => n.y)) + 200;

  const width = Math.max(maxX - minX, 600);
  const height = Math.max(maxY - minY, 400);

  return (
    <div className="absolute bottom-6 left-6 z-20 flex items-end gap-4 pointer-events-auto">
      <div className="w-36 h-28 bg-[#161616] border border-[#222] rounded-lg shadow-xl overflow-hidden opacity-60 hover:opacity-100 transition-opacity p-2 flex flex-col">
        <div className="text-[9px] font-bold uppercase tracking-wider text-slate-500 mb-1 flex items-center justify-between">
          <span>Minimap</span>
          <span>{nodes.length} Nodes</span>
        </div>

        <div className="flex-1 relative w-full h-full bg-[#0A0A0A] rounded border border-[#222]">
          <svg
            viewBox={`${minX} ${minY} ${width} ${height}`}
            className="w-full h-full"
          >
            {nodes.map((node) => (
              <rect
                key={node.id}
                x={node.x}
                y={node.y}
                width={180}
                height={70}
                rx={6}
                className="fill-indigo-500/40 stroke-indigo-500 stroke-1"
              />
            ))}

            {/* Viewport Overlay Box */}
            <rect
              x={-pan.x / zoom}
              y={-pan.y / zoom}
              width={800 / zoom}
              height={500 / zoom}
              className="fill-indigo-500/10 stroke-indigo-400 stroke-1 stroke-dasharray-2"
            />
          </svg>
        </div>
      </div>
    </div>
  );
};
