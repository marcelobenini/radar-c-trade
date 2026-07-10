/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useCallback } from 'react';
import { SecurityService, AccessProfile, UserDetail, AuditLog } from '../services/securityService';

export function useSecurity() {
  const [realUser, setRealUser] = useState<UserDetail>(() => SecurityService.getRealUser());
  const [simulatedRole, setSimulatedRole] = useState<string | null>(() => SecurityService.getSimulatedRole());
  const [profiles, setProfiles] = useState<AccessProfile[]>(() => SecurityService.getProfiles());
  const [users, setUsers] = useState<UserDetail[]>(() => SecurityService.getUsers());
  const [logs, setLogs] = useState<AuditLog[]>(() => SecurityService.getLogs());

  const activeRole = simulatedRole || realUser.role;

  // Handler for synchronization across components
  useEffect(() => {
    const handleSimulationChange = () => {
      setSimulatedRole(SecurityService.getSimulatedRole());
    };

    const handleProfilesChange = () => {
      setProfiles(SecurityService.getProfiles());
    };

    const handleUsersChange = () => {
      setUsers(SecurityService.getUsers());
      setRealUser(SecurityService.getRealUser());
    };

    const handleLogsChange = () => {
      setLogs(SecurityService.getLogs());
    };

    window.addEventListener('rbac-simulation-updated', handleSimulationChange);
    window.addEventListener('rbac-profiles-updated', handleProfilesChange);
    window.addEventListener('rbac-users-updated', handleUsersChange);
    window.addEventListener('rbac-logs-updated', handleLogsChange);

    return () => {
      window.removeEventListener('rbac-simulation-updated', handleSimulationChange);
      window.removeEventListener('rbac-profiles-updated', handleProfilesChange);
      window.removeEventListener('rbac-users-updated', handleUsersChange);
      window.removeEventListener('rbac-logs-updated', handleLogsChange);
    };
  }, []);

  const hasPermission = useCallback((moduleName: string, actionName: string): boolean => {
    return SecurityService.hasPermission(moduleName, actionName);
  }, [simulatedRole, realUser.role, profiles]);

  const startSimulation = useCallback((roleName: string) => {
    SecurityService.setSimulatedRole(roleName);
  }, []);

  const stopSimulation = useCallback(() => {
    SecurityService.setSimulatedRole(null);
  }, []);

  const addLog = useCallback((module: string, action: string, result: 'Sucesso' | 'Bloqueado') => {
    SecurityService.logAction({ module, action, result });
  }, []);

  return {
    realUser,
    simulatedRole,
    activeRole,
    profiles,
    users,
    logs,
    isSimulating: !!simulatedRole,
    hasPermission,
    startSimulation,
    stopSimulation,
    addLog,
  };
}
