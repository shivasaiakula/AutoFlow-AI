import React from 'react';
import {
  BarChart3,
  TrendingUp,
  Zap,
  CheckCircle2,
  AlertCircle,
  Clock,
  Globe,
  DollarSign,
  Activity,
  Layers,
  ArrowUpRight,
} from 'lucide-react';
import { MOCK_ANALYTICS } from '../../data/mockData';

export const AnalyticsDashboard: React.FC = () => {
  const data = MOCK_ANALYTICS;

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-500 flex items-center justify-center">
            <BarChart3 className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900 dark:text-white">
              Enterprise Live Workflow Analytics
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Real-time monitoring of workflow throughput, API latency, success rates, and cost savings.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs font-semibold px-3 py-1.5 rounded-full bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <span>Live WebSocket Stream Connected</span>
        </div>
      </div>

      {/* Primary KPI Metrics Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-lg">
          <div className="flex items-center justify-between text-slate-400 text-xs font-bold mb-1">
            <span>Total Executions</span>
            <Zap className="w-4 h-4 text-indigo-500" />
          </div>
          <p className="text-3xl font-black text-slate-900 dark:text-white">
            {data.completedWorkflows.toLocaleString()}
          </p>
          <p className="text-xs text-emerald-500 font-medium mt-1 flex items-center gap-1">
            <TrendingUp className="w-3 h-3" />
            +18.4% from last week
          </p>
        </div>

        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-lg">
          <div className="flex items-center justify-between text-slate-400 text-xs font-bold mb-1">
            <span>Success Rate</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </div>
          <p className="text-3xl font-black text-slate-900 dark:text-white">{data.successRatePct}%</p>
          <p className="text-xs text-emerald-500 font-medium mt-1">12 failed / 18,450 runs</p>
        </div>

        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-lg">
          <div className="flex items-center justify-between text-slate-400 text-xs font-bold mb-1">
            <span>Avg Execution Latency</span>
            <Clock className="w-4 h-4 text-purple-500" />
          </div>
          <p className="text-3xl font-black text-slate-900 dark:text-white">{data.avgExecutionTimeMs} ms</p>
          <p className="text-xs text-indigo-500 font-medium mt-1">Sub-second execution</p>
        </div>

        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-lg">
          <div className="flex items-center justify-between text-slate-400 text-xs font-bold mb-1">
            <span>Monthly Cost Saved</span>
            <DollarSign className="w-4 h-4 text-emerald-500" />
          </div>
          <p className="text-3xl font-black text-slate-900 dark:text-white">
            ${data.monthlySavingsUSD.toLocaleString()}
          </p>
          <p className="text-xs text-emerald-500 font-medium mt-1">{data.hoursSavedThisMonth} hrs reclaimed</p>
        </div>
      </div>

      {/* Visual Charts & Real-Time Event Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Execution Volume Trend Bar Chart Simulation */}
        <div className="lg:col-span-2 p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Activity className="w-4 h-4 text-indigo-500" />
              Daily Workflow Execution Load (Last 7 Days)
            </h3>
            <span className="text-xs text-slate-400 font-mono">18,450 Total</span>
          </div>

          <div className="flex items-end justify-between gap-3 h-48 pt-6 pb-2 border-b border-slate-100 dark:border-slate-800">
            {[
              { day: 'Mon', count: 2100, height: '60%' },
              { day: 'Tue', count: 2800, height: '80%' },
              { day: 'Wed', count: 3400, height: '95%' },
              { day: 'Thu', count: 2900, height: '82%' },
              { day: 'Fri', count: 3100, height: '88%' },
              { day: 'Sat', count: 1200, height: '35%' },
              { day: 'Sun', count: 950, height: '28%' },
            ].map((bar, idx) => (
              <div key={idx} className="flex-1 flex flex-col items-center gap-2 h-full justify-end group">
                <span className="text-[10px] font-mono text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity">
                  {bar.count}
                </span>
                <div
                  style={{ height: bar.height }}
                  className="w-full rounded-2xl bg-gradient-to-t from-indigo-600 to-purple-500 group-hover:from-indigo-500 group-hover:to-purple-400 transition-all shadow-md shadow-indigo-500/20"
                ></div>
                <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">{bar.day}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Real-time Activity Feed */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl space-y-4">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Layers className="w-4 h-4 text-emerald-500" />
            Live Execution Stream
          </h3>

          <div className="space-y-3 font-mono text-xs">
            {[
              { id: '#9823', name: 'Order Fulfillment', time: '1s ago', status: 'OK 200' },
              { id: '#9822', name: 'Zendesk Ticket AI', time: '4s ago', status: 'OK 200' },
              { id: '#9821', name: 'Slack Ops Alert', time: '8s ago', status: 'OK 200' },
              { id: '#9820', name: 'PDF Tax Invoice', time: '12s ago', status: 'OK 200' },
            ].map((item, idx) => (
              <div key={idx} className="p-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 flex items-center justify-between">
                <div>
                  <p className="font-bold text-slate-800 dark:text-slate-200">{item.name}</p>
                  <p className="text-[10px] text-slate-400">{item.id} • {item.time}</p>
                </div>
                <span className="text-[10px] font-bold text-emerald-500 px-2 py-0.5 rounded-full bg-emerald-500/10">
                  {item.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
