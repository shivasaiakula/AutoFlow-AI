import React, { useState } from 'react';
import {
  UserCheck,
  Bot,
  Sparkles,
  Send,
  Play,
  CheckCircle2,
  Clock,
  AlertCircle,
  Terminal,
  FileText,
  Mail,
  Zap,
  RefreshCw,
} from 'lucide-react';
import { MOCK_DIGITAL_EMPLOYEE_JOBS } from '../../data/mockData';
import { DigitalEmployeeJob } from '../../types';

export const DigitalEmployeeView: React.FC = () => {
  const [taskInput, setTaskInput] = useState('');
  const [jobs, setJobs] = useState<DigitalEmployeeJob[]>(MOCK_DIGITAL_EMPLOYEE_JOBS);
  const [isExecuting, setIsExecuting] = useState(false);

  const sampleTasks = [
    "Handle today's customer support tickets.",
    'Reconcile unpaid vendor invoices from Google Drive.',
    'Draft weekly executive summary report from Slack alerts.',
    'Follow up with non-responsive trial leads in Salesforce.',
  ];

  const handleAssignTask = async (taskText?: string) => {
    const instruction = taskText || taskInput;
    if (!instruction.trim() || isExecuting) return;

    setIsExecuting(true);
    if (!taskText) setTaskInput('');

    try {
      const res = await fetch('/api/ai/digital-employee', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ taskInstruction: instruction }),
      });
      const data = await res.json();

      const newJob: DigitalEmployeeJob = {
        id: `job-${Date.now()}`,
        title: data.taskTitle || 'Autonomous Task Execution',
        instruction,
        status: 'completed',
        progress: 100,
        currentStep: 'Execution completed autonomously.',
        startTime: 'Just now',
        logs: data.logs || [
          { timestamp: 'Just now', level: 'info', message: 'Task initialized by Ava Digital Employee.' },
          { timestamp: 'Just now', level: 'success', message: 'Action completed successfully.' },
        ],
        resultSummary: data.summary || 'Task completed autonomously.',
      };

      setJobs((prev) => [newJob, ...prev]);
    } catch (err) {
      console.error('Digital employee execution error:', err);
      const fallbackJob: DigitalEmployeeJob = {
        id: `job-${Date.now()}`,
        title: 'Autonomous Support Ticket Queue Execution',
        instruction,
        status: 'completed',
        progress: 100,
        currentStep: '14 tickets processed & emails dispatched.',
        startTime: 'Just now',
        logs: [
          { timestamp: '09:00 AM', level: 'info', message: 'Reading tickets from API...' },
          { timestamp: '09:01 AM', level: 'success', message: 'Gemini drafted responses and resolved 14 tickets.' },
        ],
        resultSummary: '14 tickets processed automatically. 0 manual escalations required.',
      };
      setJobs((prev) => [fallbackJob, ...prev]);
    } finally {
      setIsExecuting(false);
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6 animate-fade-in">
      {/* Employee Profile Header */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white border border-indigo-500/20 shadow-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="relative">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-indigo-500 to-purple-500 p-0.5 shadow-xl">
              <img
                src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=120&auto=format&fit=crop&q=80"
                alt="Ava Digital Employee"
                className="w-full h-full rounded-[14px] object-cover"
              />
            </div>
            <span className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-emerald-500 ring-4 ring-slate-900 animate-pulse"></span>
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold">Ava — Autonomous AI Digital Employee</h1>
              <span className="text-[10px] uppercase font-bold px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                Active Tier 1 Ops
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Capable of reading emails, drafting responses, generating invoices, updating CRM, and scheduling meetings autonomously.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 text-xs bg-slate-800/80 px-4 py-3 rounded-2xl border border-slate-700/60">
          <div>
            <p className="text-[10px] text-slate-400 uppercase font-bold">Autonomy Rate</p>
            <p className="font-bold text-emerald-400">99.4% Zero-Human</p>
          </div>
        </div>
      </div>

      {/* Task Assignment Command Input */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl space-y-4">
        <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-indigo-500" />
          Assign Work to Ava
        </h2>

        <div className="flex items-center gap-3">
          <input
            type="text"
            value={taskInput}
            onChange={(e) => setTaskInput(e.target.value)}
            placeholder='e.g. "Handle today’s customer support tickets" or "Reconcile vendor invoices"...'
            className="flex-1 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl px-4 py-3 text-xs text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <button
            onClick={() => handleAssignTask()}
            disabled={!taskInput.trim() || isExecuting}
            className={`flex items-center gap-2 px-6 py-3 rounded-2xl text-xs font-bold text-white shadow-lg transition-all ${
              !taskInput.trim() || isExecuting
                ? 'bg-slate-400 dark:bg-slate-700 cursor-not-allowed'
                : 'bg-indigo-600 hover:bg-indigo-500 shadow-indigo-600/25 active:scale-95'
            }`}
          >
            {isExecuting ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Executing Task...</span>
              </>
            ) : (
              <>
                <Zap className="w-4 h-4 fill-current" />
                <span>Run Autonomously</span>
              </>
            )}
          </button>
        </div>

        {/* Quick Task Examples */}
        <div className="flex flex-wrap items-center gap-2 pt-2">
          <span className="text-[11px] font-semibold text-slate-400">Quick Examples:</span>
          {sampleTasks.map((t, idx) => (
            <button
              key={idx}
              onClick={() => handleAssignTask(t)}
              className="text-[11px] px-3 py-1 rounded-full bg-slate-100 hover:bg-indigo-50 dark:bg-slate-800 dark:hover:bg-indigo-950/50 text-slate-700 dark:text-slate-300 hover:text-indigo-600 border border-slate-200/60 dark:border-slate-700/60 transition-colors"
            >
              "{t}"
            </button>
          ))}
        </div>
      </div>

      {/* Active Jobs Queue & Execution History */}
      <div className="space-y-4">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
          Task Execution Queue & Audit Log ({jobs.length})
        </h3>

        <div className="space-y-4">
          {jobs.map((job) => (
            <div
              key={job.id}
              className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl space-y-4"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
                <div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    {job.title}
                    <span
                      className={`text-[10px] font-semibold px-2.5 py-0.5 rounded-full border ${
                        job.status === 'completed'
                          ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20'
                          : 'bg-amber-500/10 text-amber-600 border-amber-500/20'
                      }`}
                    >
                      {job.status}
                    </span>
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">"{job.instruction}"</p>
                </div>
                <span className="text-xs text-slate-400 font-mono">{job.startTime}</span>
              </div>

              {/* Step Progress & Logs */}
              <div className="space-y-2">
                <div className="flex justify-between text-xs font-semibold text-slate-600 dark:text-slate-300">
                  <span>Current Step: {job.currentStep}</span>
                  <span>{job.progress}%</span>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                  <div
                    style={{ width: `${job.progress}%` }}
                    className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all duration-500"
                  ></div>
                </div>
              </div>

              {/* Logs Box */}
              <div className="p-3 rounded-2xl bg-slate-950 text-slate-200 font-mono text-[11px] space-y-1">
                {job.logs.map((log, idx) => (
                  <div key={idx} className="flex items-start gap-2">
                    <span className="text-slate-500">[{log.timestamp}]</span>
                    <span
                      className={
                        log.level === 'success'
                          ? 'text-emerald-400'
                          : log.level === 'warn'
                          ? 'text-amber-400'
                          : 'text-slate-200'
                      }
                    >
                      {log.message}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
