import { useFetch } from './useFetch';
import { dashboardService, vehiculeService, commandeService, clientService, stockService } from '../services';
import type { DashboardComplet, Vehicule, Commande, VehiculeFilters, CommandeFilters } from '../services/types';

/**
 * Hook pour récupérer toutes les données du dashboard
 */
export function useDashboard() {
  const { data, loading, error, refetch } = useFetch<DashboardComplet>(
    dashboardService.getDashboardComplet,
    [],
    { refetchInterval: 60000 } // Refresh toutes les minutes
  );

  return {
    dashboard: data,
    loading,
    error,
    refetch,
  };
}

/**
 * Hook pour récupérer les véhicules avec filtres
 */
export function useVehicules(filters?: VehiculeFilters) {
  const fetchFn = async () => {
    if (filters && Object.keys(filters).length > 0) {
      return vehiculeService.search(filters);
    }
    return vehiculeService.getAllCustom();
  };

  const { data, loading, error, refetch } = useFetch<Vehicule[]>(
    fetchFn,
    [JSON.stringify(filters)]
  );

  return {
    vehicules: data || [],
    loading,
    error,
    refetch,
  };
}

/**
 * Hook pour récupérer un véhicule par ID
 */
export function useVehicule(id: number | undefined) {
  const fetchFn = async () => {
    if (!id) throw new Error('ID requis');
    return vehiculeService.getById(id);
  };

  const { data, loading, error, refetch } = useFetch<Vehicule>(
    fetchFn,
    [id],
    { enabled: !!id }
  );

  return {
    vehicule: data,
    loading,
    error,
    refetch,
  };
}

/**
 * Hook pour récupérer les commandes avec filtres
 */
export function useCommandes(filters?: CommandeFilters) {
  const fetchFn = async () => {
    const result = await commandeService.getAll(filters);
    return result.commandes;
  };

  const { data, loading, error, refetch } = useFetch<Commande[]>(
    fetchFn,
    [JSON.stringify(filters)]
  );

  return {
    commandes: data || [],
    loading,
    error,
    refetch,
  };
}

/**
 * Hook pour récupérer les clients
 */
export function useClients() {
  const fetchFn = async () => {
    const result = await clientService.getAllClients({ size: 1000 });
    return result.clients;
  };

  const { data, loading, error, refetch } = useFetch(fetchFn, []);

  return {
    clients: data || [],
    loading,
    error,
    refetch,
  };
}

/**
 * Hook pour récupérer les sociétés
 */
export function useSocietes() {
  const fetchFn = async () => {
    const result = await clientService.getAllSocietes({ size: 1000 });
    return result.societes;
  };

  const { data, loading, error, refetch } = useFetch(fetchFn, []);

  return {
    societes: data || [],
    loading,
    error,
    refetch,
  };
}

/**
 * Hook pour récupérer l'inventaire des stocks
 */
export function useInventaire() {
  const { data, loading, error, refetch } = useFetch(
    stockService.getInventaire,
    []
  );

  return {
    inventaire: data || [],
    loading,
    error,
    refetch,
  };
}

/**
 * Hook pour récupérer les alertes de stock
 */
export function useAlertesStock(seuil: number = 3) {
  const fetchFn = async () => dashboardService.getAlertesStock(seuil);

  const { data, loading, error, refetch } = useFetch(
    fetchFn,
    [seuil]
  );

  return {
    alertes: data || [],
    loading,
    error,
    refetch,
  };
}

export default useDashboard;
