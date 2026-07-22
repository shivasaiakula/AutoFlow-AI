import React, { useState } from 'react';
import {
  Zap,
  Webhook,
  GitBranch,
  Clock,
  Repeat,
  UserCheck,
  Mail,
  MessageSquare,
  MessageCircle,
  Bell,
  Globe,
  Database,
  CreditCard,
  FileText,
  Brain,
  Code,
  Search,
  ChevronDown,
  ChevronRight,
  Plus,
} from 'lucide-react';
import { NODE_METADATA, NodeMeta } from '../../data/mockData';
import { NodeType, NodeCategory } from '../../types';

interface NodePaletteProps {
  onAddNode: (type: NodeType) => void;
}

export const NodePalette: React.FC<NodePaletteProps> = ({ onAddNode }) => {
  const [search, setSearch] = useState('');
  const [openCategories, setOpenCategories] = useState<Record<string, boolean>>({
    triggers: true,
    logic: true,
    communication: true,
    integrations: true,
    ai: true,
    utilities: true,
  });

  const categoryLabels: Record<NodeCategory, { name: string; color: string }> = {
    triggers: { name: 'Triggers & Webhooks', color: 'text-emerald-500' },
    logic: { name: 'Logic & Flow Rules', color: 'text-amber-500' },
    communication: { name: 'Communication & Messaging', color: 'text-blue-500' },
    integrations: { name: 'APIs, Databases & ERP', color: 'text-sky-500' },
    ai: { name: 'AI Reasoning Engines', color: 'text-fuchsia-500' },
    utilities: { name: 'Code & Custom Scripts', color: 'text-slate-500' },
  };

  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'Zap': return Zap;
      case 'Webhook': return Webhook;
      case 'GitBranch': return GitBranch;
      case 'Clock': return Clock;
      case 'Repeat': return Repeat;
      case 'UserCheck': return UserCheck;
      case 'Mail': return Mail;
      case 'MessageSquare': return MessageSquare;
      case 'MessageCircle': return MessageCircle;
      case 'Bell': return Bell;
      case 'Globe': return Globe;
      case 'Database': return Database;
      case 'CreditCard': return CreditCard;
      case 'FileText': return FileText;
      case 'Brain': return Brain;
      case 'Code': return Code;
      default: return Zap;
    }
  };

  const toggleCategory = (cat: string) => {
    setOpenCategories((prev) => ({ ...prev, [cat]: !prev[cat] }));
  };

  const allNodes = Object.values(NODE_METADATA);
  const filteredNodes = allNodes.filter(
    (n) =>
      n.label.toLowerCase().includes(search.toLowerCase()) ||
      n.description.toLowerCase().includes(search.toLowerCase())
  );

  const categories = Array.from(new Set(allNodes.map((n) => n.category))) as NodeCategory[];

  return (
    <div className="w-64 bg-[#0A0A0A] border-r border-[#1F1F1F] flex flex-col h-full select-none">
      {/* Header */}
      <div className="p-3 border-b border-[#1F1F1F]">
        <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
          Node Palette (16 Types)
        </h3>
        <div className="relative">
          <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-slate-500" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search nodes..."
            className="w-full bg-[#161616] border border-[#222] text-xs pl-8 pr-3 py-1.5 rounded-lg text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
          />
        </div>
      </div>

      {/* Nodes Accordion List */}
      <div className="flex-1 overflow-y-auto p-2 space-y-2">
        {categories.map((cat) => {
          const catNodes = filteredNodes.filter((n) => n.category === cat);
          if (catNodes.length === 0) return null;

          const isOpen = openCategories[cat];
          const info = categoryLabels[cat];

          return (
            <div key={cat} className="rounded-lg border border-[#1F1F1F] overflow-hidden bg-[#0A0A0A]">
              <button
                onClick={() => toggleCategory(cat)}
                className="w-full flex items-center justify-between p-2 text-[11px] font-bold text-slate-300 bg-[#161616] hover:bg-[#1A1A1A] transition-colors"
              >
                <span className={`flex items-center gap-1.5 ${info.color}`}>
                  {isOpen ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
                  {info.name}
                </span>
                <span className="text-[10px] text-slate-500 font-normal">({catNodes.length})</span>
              </button>

              {isOpen && (
                <div className="p-1 space-y-1 bg-[#0A0A0A]">
                  {catNodes.map((node) => {
                    const IconComponent = getIcon(node.iconName);
                    return (
                      <div
                        key={node.type}
                        onClick={() => onAddNode(node.type)}
                        className="group flex items-center justify-between p-2 rounded-lg bg-[#161616] hover:bg-[#1A1A1A] text-left cursor-pointer transition-all border border-[#222] hover:border-indigo-500/50"
                        title={node.description}
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div
                            className={`w-7 h-7 rounded-lg flex items-center justify-center border shrink-0 ${node.badgeColor}`}
                          >
                            <IconComponent className="w-3.5 h-3.5" />
                          </div>
                          <div className="min-w-0">
                            <p className="text-xs font-semibold text-slate-200 group-hover:text-white truncate">
                              {node.label}
                            </p>
                            <p className="text-[10px] text-slate-500 truncate max-w-[130px]">
                              {node.description}
                            </p>
                          </div>
                        </div>

                        <button className="opacity-0 group-hover:opacity-100 p-1 rounded bg-indigo-600 text-white transition-opacity">
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
