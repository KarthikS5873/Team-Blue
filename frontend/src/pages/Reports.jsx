import React, { useState, useEffect, useCallback } from 'react';
import { api } from '../lib/api';
import { BarChart3, Loader2, AlertCircle, FileText, Calendar, Clock, ChevronRight, Sparkles, RefreshCw } from 'lucide-react';

const TABS = ['daily', 'weekly', 'monthly'];

export const Reports = () => {
  const [activeTab, setActiveTab] = useState('daily');
  const [reports, setReports] = useState([]);
  const [selectedReport, setSelectedReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState('');

  const fetchReports = useCallback(async () => {
    setLoading(true);
    setSelectedReport(null);
    try {
      const data = await api.reports.list(activeTab);
      setReports(data.reports || []);
      setError('');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [activeTab]);

  useEffect(() => { fetchReports(); }, [fetchReports]);

  const handleGenerate = async () => {
    setGenerating(true);
    setError('');
    try {
      const data = await api.reports.generate(activeTab);
      setReports(prev => [data.report, ...prev]);
      setSelectedReport(data.report);
    } catch (err) {
      setError(err.message);
    } finally {
      setGenerating(false);
    }
  };

  const handleSelect = async (id) => {
    try {
      const data = await api.reports.get(activeTab, id);
      setSelectedReport(data.report);
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <BarChart3 className="w-5 h-5 text-blue-400" />
          <h3 className="text-lg font-bold text-white">Business Reports</h3>
        </div>
        <button onClick={handleGenerate} disabled={generating}
          className="flex items-center space-x-1.5 px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 disabled:opacity-50 text-white text-xs font-semibold rounded-lg transition-all cursor-pointer">
          {generating ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
          <span>{generating ? 'Generating...' : `Generate ${activeTab} Report`}</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 bg-slate-900 border border-slate-800 rounded-lg p-1">
        {TABS.map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)}
            className={`flex-1 py-2 text-xs font-semibold rounded-md transition-colors cursor-pointer ${
              activeTab === tab ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
            }`}>
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {error && (
        <div className="flex items-start space-x-2 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-xs text-red-400">
          <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Report List */}
        <div className="lg:col-span-1 bg-slate-900 border border-slate-800 rounded-lg p-4">
          <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
            {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} Reports ({reports.length})
          </h4>

          {loading ? (
            <div className="text-center py-8"><Loader2 className="w-5 h-5 animate-spin text-slate-500 mx-auto" /></div>
          ) : reports.length === 0 ? (
            <div className="text-center py-8">
              <FileText className="w-6 h-6 text-slate-600 mx-auto mb-2" />
              <p className="text-xs text-slate-500">No reports yet. Click generate to create one.</p>
            </div>
          ) : (
            <div className="space-y-1">
              {reports.map(report => (
                <button key={report.id} onClick={() => handleSelect(report.id)}
                  className={`w-full text-left p-3 rounded-lg transition-colors cursor-pointer ${
                    selectedReport?.id === report.id ? 'bg-slate-800' : 'hover:bg-slate-800/50'
                  }`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Calendar className="w-3.5 h-3.5 text-slate-500" />
                      <span className="text-xs text-slate-300">{report.period_start?.slice(0, 10)}</span>
                    </div>
                    <ChevronRight className="w-3 h-3 text-slate-600" />
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Report Detail */}
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-lg p-6">
          {selectedReport ? (
            <div>
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-lg font-bold text-white">{activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} Report</h4>
                <span className="text-[10px] text-slate-500">{selectedReport.period_start?.slice(0, 10)} - {selectedReport.period_end?.slice(0, 10)}</span>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-3 gap-3">
                  {selectedReport.total_activities !== undefined && (
                    <div className="p-3 bg-slate-800/50 border border-slate-700/50 rounded-lg text-center">
                      <p className="text-2xl font-bold text-white">{selectedReport.total_activities}</p>
                      <p className="text-[10px] text-slate-400 uppercase tracking-wider mt-1">Activities</p>
                    </div>
                  )}
                  {selectedReport.total_minutes !== undefined && (
                    <div className="p-3 bg-slate-800/50 border border-slate-700/50 rounded-lg text-center">
                      <p className="text-2xl font-bold text-white">{Math.round(selectedReport.total_minutes / 60)}h</p>
                      <p className="text-[10px] text-slate-400 uppercase tracking-wider mt-1">Total Time</p>
                    </div>
                  )}
                  {selectedReport.categories_covered !== undefined && (
                    <div className="p-3 bg-slate-800/50 border border-slate-700/50 rounded-lg text-center">
                      <p className="text-2xl font-bold text-white">{selectedReport.categories_covered}</p>
                      <p className="text-[10px] text-slate-400 uppercase tracking-wider mt-1">Categories</p>
                    </div>
                  )}
                </div>

                {selectedReport.recommendations?.length > 0 && (
                  <div>
                    <h5 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 flex items-center">
                      <Sparkles className="w-3.5 h-3.5 text-blue-400 mr-1.5" /> Recommendations
                    </h5>
                    <div className="space-y-2">
                      {selectedReport.recommendations.map((rec, i) => (
                        <div key={i} className="p-3 bg-slate-800/30 border border-slate-700/30 rounded-lg">
                          <p className="text-xs text-slate-300 leading-relaxed">{rec}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {selectedReport.content && !selectedReport.recommendations && (
                  <div className="p-4 bg-slate-800/30 border border-slate-700/30 rounded-lg">
                    <p className="text-sm text-slate-300 whitespace-pre-wrap leading-relaxed">{selectedReport.content}</p>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="text-center py-16">
              <FileText className="w-10 h-10 text-slate-600 mx-auto mb-3" />
              <p className="text-sm text-slate-500">Select a report to view its details</p>
              {reports.length === 0 && !loading && (
                <button onClick={handleGenerate} disabled={generating}
                  className="mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-xs font-semibold rounded-lg inline-flex items-center space-x-1.5 cursor-pointer">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Generate First Report</span>
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
