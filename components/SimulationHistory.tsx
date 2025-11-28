'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth-context';
import { createSupabaseClient } from '@/lib/supabase/client';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import { History, Clock, TrendingUp, TrendingDown, Loader2, Trash2 } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from './ui/alert-dialog';

interface SavedSimulation {
  id: string;
  name: string;
  base_score: number;
  projected_score: number;
  status: string;
  created_at: string;
  scenarios_count: number;
}

interface SimulationHistoryProps {
  onLoadSimulation: (simulationId: string) => void;
  currentSimulationId: string | null;
}

export function SimulationHistory({ onLoadSimulation, currentSimulationId }: SimulationHistoryProps) {
  const { user } = useAuth();
  const [simulations, setSimulations] = useState<SavedSimulation[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const loadSimulations = async () => {
    if (!user) return;

    try {
      const supabase = createSupabaseClient();
      const { data, error } = await supabase
        .from('simulations')
        .select('id, name, base_score, projected_score, status, created_at, scenarios_count')
        .eq('user_id', user.id)
        .in('status', ['active', 'archived'])
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) throw error;
      setSimulations(data || []);
    } catch (error) {
      console.error('Error loading simulations:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSimulations();
  }, [user, currentSimulationId]);

  const handleDelete = async () => {
    if (!deleteId) return;

    setDeleting(true);
    try {
      const supabase = createSupabaseClient();
      await supabase
        .from('simulations')
        .update({ status: 'deleted' })
        .eq('id', deleteId);

      setSimulations(simulations.filter(s => s.id !== deleteId));
      setDeleteId(null);
    } catch (error) {
      console.error('Error deleting simulation:', error);
    } finally {
      setDeleting(false);
    }
  };

  const getImpactColor = (base: number, projected: number) => {
    const diff = projected - base;
    if (diff > 0) return 'text-green-600';
    if (diff < 0) return 'text-red-600';
    return 'text-gray-600';
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" disabled={loading}>
            {loading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <History className="mr-2 h-4 w-4" />
            )}
            History
            {simulations.length > 0 && (
              <Badge variant="secondary" className="ml-2">
                {simulations.length}
              </Badge>
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-96 p-0 bg-white border-2 border-blue-200 shadow-xl">
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-4 text-white">
            <DropdownMenuLabel className="text-white font-semibold text-base px-0">
              <div className="flex items-center gap-2">
                <History className="h-5 w-5" />
                Simulation History
              </div>
            </DropdownMenuLabel>
            {simulations.length > 0 && (
              <p className="text-blue-100 text-xs mt-1 px-0">
                {simulations.length} saved simulation{simulations.length !== 1 ? 's' : ''}
              </p>
            )}
          </div>
          <div className="max-h-96 overflow-y-auto">
            {simulations.length === 0 ? (
              <div className="p-8 text-center">
                <History className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                <p className="text-sm font-medium text-gray-600 mb-1">No saved simulations</p>
                <p className="text-xs text-gray-500">Create and save scenarios to see them here</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {simulations.map((sim) => {
                  const impact = sim.projected_score - sim.base_score;
                  const isActive = sim.id === currentSimulationId;

                  return (
                    <div
                      key={sim.id}
                      className={`p-4 cursor-pointer transition-colors ${
                        isActive 
                          ? 'bg-blue-50 border-l-4 border-blue-600' 
                          : 'hover:bg-gray-50'
                      }`}
                      onClick={() => onLoadSimulation(sim.id)}
                    >
                      <div className="flex items-start justify-between gap-3 mb-2">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className={`font-semibold text-sm truncate ${
                              isActive ? 'text-blue-700' : 'text-gray-900'
                            }`}>
                              {sim.name || 'Untitled Simulation'}
                            </span>
                            {isActive && (
                              <Badge className="bg-blue-600 text-white text-xs px-2 py-0.5">
                                Active
                              </Badge>
                            )}
                          </div>
                          <div className="flex items-center gap-2 text-xs text-gray-500">
                            <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {new Date(sim.created_at).toLocaleDateString('en-US', { 
                                month: 'short', 
                                day: 'numeric', 
                                year: 'numeric' 
                              })}
                            </span>
                            {sim.scenarios_count > 0 && (
                              <>
                                <span>•</span>
                                <span>{sim.scenarios_count} scenario{sim.scenarios_count !== 1 ? 's' : ''}</span>
                              </>
                            )}
                          </div>
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setDeleteId(sim.id);
                          }}
                          className="text-gray-400 hover:text-red-600 p-1.5 rounded hover:bg-red-50 transition-colors shrink-0"
                          title="Delete simulation"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                      <div className="flex items-center gap-4 mt-3 pt-3 border-t border-gray-100">
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-gray-500">Score:</span>
                          <span className="font-mono font-semibold text-sm text-gray-700">
                            {sim.base_score}
                          </span>
                          <span className="text-gray-400">→</span>
                          <span className={`font-mono font-semibold text-sm ${
                            impact > 0 ? 'text-green-600' : impact < 0 ? 'text-red-600' : 'text-gray-700'
                          }`}>
                            {sim.projected_score}
                          </span>
                        </div>
                        <div className={`flex items-center gap-1 px-2 py-1 rounded-md text-xs font-semibold ${
                          impact > 0 
                            ? 'bg-green-100 text-green-700' 
                            : impact < 0 
                            ? 'bg-red-100 text-red-700' 
                            : 'bg-gray-100 text-gray-700'
                        }`}>
                          {impact > 0 ? (
                            <TrendingUp className="h-3 w-3" />
                          ) : impact < 0 ? (
                            <TrendingDown className="h-3 w-3" />
                          ) : null}
                          {impact > 0 ? '+' : ''}{impact} pts
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </DropdownMenuContent>
      </DropdownMenu>

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Simulation?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this simulation and all its scenarios. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={deleting}
              className="bg-red-600 hover:bg-red-700"
            >
              {deleting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                'Delete'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

