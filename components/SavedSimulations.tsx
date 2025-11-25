'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth-context';
import { createSupabaseClient } from '@/lib/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Clock, TrendingUp, TrendingDown, Trash2, Loader2 } from 'lucide-react';
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

interface SavedSimulationsProps {
  onLoadSimulation: (simulationId: string) => void;
  currentSimulationId: string | null;
}

export function SavedSimulations({ onLoadSimulation, currentSimulationId }: SavedSimulationsProps) {
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
        .order('created_at', { ascending: false });

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
  }, [user]);

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

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
        </CardContent>
      </Card>
    );
  }

  if (simulations.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Saved Simulations</CardTitle>
          <CardDescription>Your simulation history will appear here</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-500 text-center py-8">
            No saved simulations yet. Create and save scenarios to see them here!
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Saved Simulations ({simulations.length})</CardTitle>
          <CardDescription>View and load your previous simulations</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {simulations.map((sim) => {
              const impact = sim.projected_score - sim.base_score;
              const isActive = sim.id === currentSimulationId;

              return (
                <div
                  key={sim.id}
                  className={`flex items-center justify-between p-4 rounded-lg border ${
                    isActive ? 'border-blue-500 bg-blue-50' : 'border-gray-200 bg-white'
                  } transition-all hover:shadow-md`}
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-medium text-sm">
                        {sim.name || 'Untitled Simulation'}
                      </h3>
                      {isActive && (
                        <Badge variant="default" className="text-xs">
                          Current
                        </Badge>
                      )}
                      {sim.status === 'archived' && (
                        <Badge variant="secondary" className="text-xs">
                          Archived
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-4 text-xs text-gray-600">
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
                        {impact > 0 ? '+' : ''}{impact} pts
                      </span>
                      <span className="text-gray-500">
                        {sim.scenarios_count} scenario{sim.scenarios_count !== 1 ? 's' : ''}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {!isActive && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => onLoadSimulation(sim.id)}
                      >
                        Load
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setDeleteId(sim.id)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

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

