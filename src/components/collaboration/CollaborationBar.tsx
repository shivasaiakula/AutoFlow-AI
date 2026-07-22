import React, { useState } from 'react';
import { Users, History, MessageSquare, Check, RotateCcw, X, Plus, Send } from 'lucide-react';
import { MOCK_USERS, MOCK_COMMENTS, MOCK_VERSIONS } from '../../data/mockData';
import { WorkflowComment, WorkflowVersion } from '../../types';

interface CollaborationBarProps {
  onRollbackVersion?: (version: WorkflowVersion) => void;
}

export const CollaborationBar: React.FC<CollaborationBarProps> = ({ onRollbackVersion }) => {
  const [historyOpen, setHistoryOpen] = useState(false);
  const [commentsOpen, setCommentsOpen] = useState(false);
  const [comments, setComments] = useState<WorkflowComment[]>(MOCK_COMMENTS);
  const [newCommentText, setNewCommentText] = useState('');

  const handleAddComment = () => {
    if (!newCommentText.trim()) return;
    const cmt: WorkflowComment = {
      id: `cmt-${Date.now()}`,
      author: {
        name: 'Alex Smith (You)',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80',
      },
      text: newCommentText,
      createdAt: 'Just now',
      resolved: false,
    };
    setComments((prev) => [cmt, ...prev]);
    setNewCommentText('');
  };

  const toggleResolve = (id: string) => {
    setComments((prev) =>
      prev.map((c) => (c.id === id ? { ...c, resolved: !c.resolved } : c))
    );
  };

  return (
    <>
      {/* Floating Collaboration Actions */}
      <div className="absolute top-16 right-4 z-20 flex items-center gap-2">
        {/* Comments Thread Trigger */}
        <button
          onClick={() => {
            setCommentsOpen(!commentsOpen);
            setHistoryOpen(false);
          }}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-2xl border shadow-xl backdrop-blur-md text-xs font-semibold transition-all ${
            commentsOpen
              ? 'bg-indigo-600 border-indigo-500 text-white'
              : 'bg-white/90 dark:bg-slate-900/90 border-slate-200/80 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-indigo-500'
          }`}
        >
          <MessageSquare className="w-3.5 h-3.5" />
          <span>Comments ({comments.filter((c) => !c.resolved).length})</span>
        </button>

        {/* Version History Drawer Trigger */}
        <button
          onClick={() => {
            setHistoryOpen(!historyOpen);
            setCommentsOpen(false);
          }}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-2xl border shadow-xl backdrop-blur-md text-xs font-semibold transition-all ${
            historyOpen
              ? 'bg-indigo-600 border-indigo-500 text-white'
              : 'bg-white/90 dark:bg-slate-900/90 border-slate-200/80 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-indigo-500'
          }`}
        >
          <History className="w-3.5 h-3.5" />
          <span>Version History</span>
        </button>
      </div>

      {/* Version History Drawer */}
      {historyOpen && (
        <div className="absolute top-28 right-4 z-30 w-80 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl p-4 animate-fade-in">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 mb-3">
            <h3 className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
              <History className="w-4 h-4 text-indigo-500" />
              Workflow Version History
            </h3>
            <button
              onClick={() => setHistoryOpen(false)}
              className="p-1 rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
            {MOCK_VERSIONS.map((v) => (
              <div
                key={v.id}
                className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 text-xs space-y-1"
              >
                <div className="flex items-center justify-between font-bold text-slate-800 dark:text-slate-200">
                  <span>{v.versionNumber}</span>
                  <span className="text-[10px] text-slate-400 font-normal">{v.createdAt}</span>
                </div>
                <p className="text-[11px] text-slate-600 dark:text-slate-300">{v.commitMessage}</p>
                <div className="flex items-center justify-between pt-1 text-[10px] text-slate-400">
                  <span>By {v.createdBy}</span>
                  {onRollbackVersion && (
                    <button
                      onClick={() => onRollbackVersion(v)}
                      className="text-indigo-600 dark:text-indigo-400 font-semibold hover:underline flex items-center gap-0.5"
                    >
                      <RotateCcw className="w-2.5 h-2.5" />
                      Rollback
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Comments Thread Drawer */}
      {commentsOpen && (
        <div className="absolute top-28 right-4 z-30 w-80 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl p-4 animate-fade-in flex flex-col">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 mb-3">
            <h3 className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
              <MessageSquare className="w-4 h-4 text-indigo-500" />
              Collaborative Discussion Thread
            </h3>
            <button
              onClick={() => setCommentsOpen(false)}
              className="p-1 rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="space-y-2.5 max-h-60 overflow-y-auto pr-1 mb-3">
            {comments.map((c) => (
              <div
                key={c.id}
                className={`p-2.5 rounded-xl border text-xs space-y-1.5 ${
                  c.resolved
                    ? 'bg-slate-100 dark:bg-slate-800/30 border-slate-200 dark:border-slate-800 opacity-60'
                    : 'bg-slate-50 dark:bg-slate-800/80 border-slate-200/60 dark:border-slate-700/60'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <img src={c.author.avatar} alt={c.author.name} className="w-5 h-5 rounded-full object-cover" />
                    <span className="font-bold text-slate-800 dark:text-slate-200">{c.author.name}</span>
                  </div>
                  <span className="text-[10px] text-slate-400">{c.createdAt}</span>
                </div>

                <p className="text-[11px] text-slate-700 dark:text-slate-300">{c.text}</p>

                <div className="flex items-center justify-end">
                  <button
                    onClick={() => toggleResolve(c.id)}
                    className="text-[10px] font-semibold text-slate-500 hover:text-indigo-600 flex items-center gap-1"
                  >
                    <Check className="w-3 h-3" />
                    {c.resolved ? 'Reopen' : 'Mark Resolved'}
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* New Comment Input */}
          <div className="flex items-center gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
            <input
              type="text"
              value={newCommentText}
              onChange={(e) => setNewCommentText(e.target.value)}
              placeholder="Add a comment or @mention team..."
              className="flex-1 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-1.5 text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
            <button
              onClick={handleAddComment}
              className="p-2 rounded-xl bg-indigo-600 text-white hover:bg-indigo-500 transition-colors"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}
    </>
  );
};
