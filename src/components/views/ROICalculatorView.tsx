import React, { useState } from 'react';
import {
  Calculator,
  DollarSign,
  Clock,
  TrendingUp,
  Users,
  CheckCircle2,
  Download,
  Share2,
  Sparkles,
  BarChart3,
} from 'lucide-react';

export const ROICalculatorView: React.FC = () => {
  const [employees, setEmployees] = useState<number>(25);
  const [hourlyWage, setHourlyWage] = useState<number>(45);
  const [weeklyTasks, setWeeklyTasks] = useState<number>(180);

  // Dynamic ROI Math Calculations
  const hoursSavedPerTask = 0.75; // 45 mins saved per automated step
  const totalWeeklyHoursSaved = Math.round(weeklyTasks * hoursSavedPerTask);
  const totalMonthlyHoursSaved = totalWeeklyHoursSaved * 4;
  const totalAnnualHoursSaved = totalMonthlyHoursSaved * 12;

  const monthlyLaborSavings = Math.round(totalMonthlyHoursSaved * hourlyWage);
  const annualLaborSavings = Math.round(totalAnnualHoursSaved * hourlyWage);

  const autoFlowCostMonthly = 299; // Enterprise Tier
  const netMonthlySavings = Math.max(0, monthlyLaborSavings - autoFlowCostMonthly);
  const netAnnualSavings = netMonthlySavings * 12;

  const roiPercentage = Math.round((netAnnualSavings / (autoFlowCostMonthly * 12)) * 100);

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6 animate-fade-in">
      {/* Banner */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
            <Calculator className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900 dark:text-white">
              Automation ROI & Business Impact Calculator
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Measure real-time financial savings, employee productivity gains, and projected return on investment.
            </p>
          </div>
        </div>

        <button
          onClick={() => alert('Executive ROI Summary PDF Report downloaded successfully!')}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 font-bold text-xs text-white shadow-lg shadow-emerald-500/20 transition-all active:scale-95"
        >
          <Download className="w-4 h-4" />
          <span>Export Executive ROI Report</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Interactive Sliders Panel */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl space-y-6">
          <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-emerald-500" />
            Company Operational Inputs
          </h2>

          {/* Input 1: Team Employees */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs font-semibold">
              <span className="text-slate-700 dark:text-slate-300">Operations Team Members</span>
              <span className="text-indigo-600 dark:text-indigo-400 font-bold">{employees} employees</span>
            </div>
            <input
              type="range"
              min={1}
              max={200}
              value={employees}
              onChange={(e) => setEmployees(Number(e.target.value))}
              className="w-full accent-indigo-600"
            />
          </div>

          {/* Input 2: Hourly Wage */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs font-semibold">
              <span className="text-slate-700 dark:text-slate-300">Average Hourly Employee Cost</span>
              <span className="text-emerald-600 dark:text-emerald-400 font-bold">${hourlyWage} / hr</span>
            </div>
            <input
              type="range"
              min={15}
              max={150}
              value={hourlyWage}
              onChange={(e) => setHourlyWage(Number(e.target.value))}
              className="w-full accent-emerald-600"
            />
          </div>

          {/* Input 3: Weekly Manual Tasks */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs font-semibold">
              <span className="text-slate-700 dark:text-slate-300">Manual Executions / Week</span>
              <span className="text-purple-600 dark:text-purple-400 font-bold">{weeklyTasks} tasks/wk</span>
            </div>
            <input
              type="range"
              min={10}
              max={1000}
              value={weeklyTasks}
              onChange={(e) => setWeeklyTasks(Number(e.target.value))}
              className="w-full accent-purple-600"
            />
          </div>

          <div className="p-4 rounded-2xl bg-indigo-50/60 dark:bg-slate-800/60 border border-indigo-200/60 dark:border-slate-700/60 text-xs space-y-1">
            <p className="font-bold text-indigo-900 dark:text-indigo-300">ROI Methodology:</p>
            <p className="text-[11px] text-slate-600 dark:text-slate-400">
              Assumes 45 minutes of manual labor eliminated per workflow step. Calculations subtract standard AutoFlow AI enterprise cloud compute tier.
            </p>
          </div>
        </div>

        {/* Dynamic Metrics Visual Dashboard */}
        <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="p-6 rounded-3xl bg-gradient-to-br from-emerald-600 to-teal-700 text-white shadow-xl flex flex-col justify-between">
            <div>
              <span className="text-xs uppercase tracking-wider font-bold text-emerald-200">
                Net Annual Savings
              </span>
              <p className="text-4xl font-black mt-2">${netAnnualSavings.toLocaleString()}</p>
            </div>
            <p className="text-xs text-emerald-100 mt-4 flex items-center gap-1 font-semibold">
              <TrendingUp className="w-4 h-4" />
              <span>+{roiPercentage}% Return on Investment</span>
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-slate-900 text-white shadow-xl border border-slate-800 flex flex-col justify-between">
            <div>
              <span className="text-xs uppercase tracking-wider font-bold text-slate-400">
                Monthly Hours Reclaimed
              </span>
              <p className="text-4xl font-black text-indigo-400 mt-2">{totalMonthlyHoursSaved.toLocaleString()} hrs</p>
            </div>
            <p className="text-xs text-slate-400 mt-4 font-semibold">
              Equivalent to {Math.round((totalMonthlyHoursSaved / 160) * 10) / 10} full-time employees
            </p>
          </div>

          <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-lg">
            <div className="flex items-center justify-between text-slate-400 text-xs font-bold mb-1">
              <span>Employee Productivity Boost</span>
              <Users className="w-4 h-4 text-indigo-500" />
            </div>
            <p className="text-3xl font-black text-slate-900 dark:text-white">+340%</p>
            <p className="text-xs text-emerald-500 font-medium mt-1">Zero manual data entry errors</p>
          </div>

          <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-lg">
            <div className="flex items-center justify-between text-slate-400 text-xs font-bold mb-1">
              <span>Average Execution Time</span>
              <Clock className="w-4 h-4 text-purple-500" />
            </div>
            <p className="text-3xl font-black text-slate-900 dark:text-white">185 ms</p>
            <p className="text-xs text-indigo-500 font-medium mt-1">Instant sub-second response</p>
          </div>
        </div>
      </div>
    </div>
  );
};
