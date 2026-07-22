import React, { useState } from 'react';
import {
  Store,
  Search,
  Star,
  Download,
  CheckCircle2,
  Sparkles,
  Zap,
  Tag,
  Share2,
  Plus,
  ArrowRight,
  ShieldCheck,
  TrendingUp,
} from 'lucide-react';
import { MARKETPLACE_TEMPLATES } from '../../data/mockData';
import { MarketplaceTemplate, Workflow } from '../../types';

interface MarketplaceViewProps {
  onInstallTemplate: (workflow: Partial<Workflow>) => void;
}

export const MarketplaceView: React.FC<MarketplaceViewProps> = ({ onInstallTemplate }) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [search, setSearch] = useState('');
  const [templates, setTemplates] = useState<MarketplaceTemplate[]>(MARKETPLACE_TEMPLATES);
  const [installedIds, setInstalledIds] = useState<string[]>([]);
  const [publishOpen, setPublishOpen] = useState(false);

  const categories = [
    'All',
    'E-commerce',
    'Customer Support',
    'HR',
    'Sales',
    'Marketing',
    'Finance',
    'IT Operations',
  ];

  const filtered = templates.filter((t) => {
    const matchesCat = selectedCategory === 'All' || t.category === selectedCategory;
    const matchesSearch =
      t.title.toLowerCase().includes(search.toLowerCase()) ||
      t.description.toLowerCase().includes(search.toLowerCase()) ||
      t.tags.some((tag) => tag.toLowerCase().includes(search.toLowerCase()));
    return matchesCat && matchesSearch;
  });

  const handleInstall = (tmpl: MarketplaceTemplate) => {
    setInstalledIds((prev) => [...prev, tmpl.id]);
    onInstallTemplate({
      name: tmpl.title,
      description: tmpl.description,
      category: tmpl.category,
      nodes: tmpl.workflow.nodes,
      connections: tmpl.workflow.connections,
    });
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6 animate-fade-in">
      {/* Banner Header */}
      <div className="relative rounded-3xl bg-gradient-to-r from-indigo-900 via-purple-900 to-slate-900 text-white p-8 overflow-hidden shadow-2xl border border-indigo-500/20">
        <div className="relative z-10 max-w-2xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5 fill-current" />
            <span>Workflow Marketplace & AI Exchange</span>
          </div>
          <h1 className="text-3xl font-black tracking-tight">
            Discover & Monetize Enterprise Automation Workflows
          </h1>
          <p className="text-xs text-indigo-200/80 leading-relaxed">
            Install 1-click battle-tested workflow templates built by top engineers or publish your custom automations to the global community.
          </p>
          <div className="pt-2 flex items-center gap-3">
            <button
              onClick={() => setPublishOpen(true)}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-400 hover:to-purple-400 font-bold text-xs shadow-lg shadow-indigo-500/30 transition-transform active:scale-95"
            >
              Publish Template to Marketplace
            </button>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Category Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-2 md:pb-0">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                selectedCategory === cat
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                  : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200/60 dark:border-slate-700/60'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search templates, integrations, tags..."
            className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
      </div>

      {/* Templates Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map((tmpl) => {
          const isInstalled = installedIds.includes(tmpl.id);
          return (
            <div
              key={tmpl.id}
              className="group rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 shadow-lg hover:shadow-2xl hover:border-indigo-500/50 transition-all flex flex-col justify-between"
            >
              <div>
                {/* Author & Rating Header */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <img
                      src={tmpl.author.avatar}
                      alt={tmpl.author.name}
                      className="w-6 h-6 rounded-full object-cover"
                    />
                    <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                      {tmpl.author.name}
                      {tmpl.author.verified && (
                        <ShieldCheck className="w-3.5 h-3.5 text-indigo-500 fill-indigo-500/20" />
                      )}
                    </span>
                  </div>

                  <div className="flex items-center gap-1 bg-amber-500/10 text-amber-600 dark:text-amber-400 px-2 py-0.5 rounded-full text-[11px] font-bold">
                    <Star className="w-3 h-3 fill-current" />
                    <span>{tmpl.rating}</span>
                    <span className="text-slate-400 font-normal">({tmpl.reviewsCount})</span>
                  </div>
                </div>

                <h3 className="text-base font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors mb-2">
                  {tmpl.title}
                </h3>

                <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-3 leading-relaxed mb-4">
                  {tmpl.description}
                </p>

                {/* Tags */}
                <div className="flex flex-wrap gap-1 mb-4">
                  {tmpl.tags.map((tag, idx) => (
                    <span
                      key={idx}
                      className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>

              {/* Stats & Install Action */}
              <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
                  <span className="flex items-center gap-1">
                    <Download className="w-3.5 h-3.5" />
                    {tmpl.downloadsCount}
                  </span>
                  <span className="flex items-center gap-1">
                    <Zap className="w-3.5 h-3.5 text-indigo-500" />
                    {tmpl.nodesCount} nodes
                  </span>
                </div>

                <button
                  onClick={() => handleInstall(tmpl)}
                  className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-md active:scale-95 ${
                    isInstalled
                      ? 'bg-emerald-600 text-white'
                      : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-500/20'
                  }`}
                >
                  {isInstalled ? (
                    <>
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Installed</span>
                    </>
                  ) : (
                    <>
                      <Download className="w-3.5 h-3.5" />
                      <span>1-Click Install</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
