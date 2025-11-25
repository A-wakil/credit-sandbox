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
        <DropdownMenuContent align="end" className="w-80">
          <DropdownMenuLabel>Saved Simulations</DropdownMenuLabel>
          <DropdownMenuSeparator />
          {simulations.length === 0 ? (
            <div className="p-4 text-center text-sm text-gray-500">
              No saved simulations yet
            </div>
          ) : (
            <div className="max-h-96 overflow-y-auto">
              {simulations.map((sim) => {
                const impact = sim.projected_score - sim.base_score;
                const isActive = sim.id === currentSimulationId;

                return (
                  <DropdownMenuItem
                    key={sim.id}
                    className="flex flex-col items-start gap-2 p-3 cursor-pointer"
                    onClick={() => onLoadSimulation(sim.id)}
                  >
                    <div className="flex items-center justify-between w-full">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-sm truncate max-w-[180px]">
                          {sim.name || 'Untitled'}
                        </span>
                        {isActive && (
                          <Badge variant="default" className="text-xs">
                            Current
                          </Badge>
                        )}
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setDeleteId(sim.id);
                        }}
                        className="text-red-600 hover:text-red-700 p-1"
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-gray-600 w-full">
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {new Date(sim.created_at).toLocaleDateString()}
                      </span>
                      <span>
                        {sim.base_score} → {sim.projected_score}
                      </span>
                      <span className={`flex items-center gap-1 font-medium ${getImpactColor(sim.base_score, sim.projected_score)}`}>
                        {impact > 0 ? (
                          <TrendingUp className="h-3 w-3" />
                        ) : impact < 0 ? (
                          <TrendingDown className="h-3 w-3" />
                        ) : null}
                        {impact > 0 ? '+' : ''}{impact}
                      </span>
                    </div>
                  </DropdownMenuItem>
                );
              })}
            </div>
          )}
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

