import React, { useState, useEffect } from 'react';
import { Users, FileText, Archive, Clock, CheckCircle } from 'lucide-react';
import { proceduresAPI, personsAPI } from '../services/api';

function Dashboard() {
  const [stats, setStats] = useState({
    totalPersons: 0,
    totalProcedures: 0,
    totalDocuments: 0,
    pendingProcedures: 0,
    completedProcedures: 0
  });
  const [recentProcedures, setRecentProcedures] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      console.log('Cargando datos del dashboard...');
      
      // Hacer las peticiones de forma individual para mejor manejo de errores
      let proceduresData = [];
      let personsData = [];

      try {
        const proceduresResponse = await proceduresAPI.getAll();
        console.log('Respuesta de trámites:', proceduresResponse);
        
        // Verificar si es un array, si no, usar array vacío
        proceduresData = Array.isArray(proceduresResponse) ? proceduresResponse : [];
        if (!Array.isArray(proceduresResponse)) {
          console.warn('La API de trámites no devolvió un array:', proceduresResponse);
        }
      } catch (procError) {
        console.error('Error al cargar trámites:', procError);
        proceduresData = [];
      }

      try {
        const personsResponse = await personsAPI.getAll();
        console.log('Respuesta de personas:', personsResponse);
        
        // Verificar si es un array, si no, usar array vacío
        personsData = Array.isArray(personsResponse) ? personsResponse : [];
        if (!Array.isArray(personsResponse)) {
          console.warn('La API de personas no devolvió un array:', personsResponse);
        }
      } catch (personsError) {
        console.error('Error al cargar personas:', personsError);
        personsData = [];
      }

      console.log('Trámites procesados:', proceduresData);
      console.log('Personas procesadas:', personsData);

      // Calcular estadísticas - con verificación adicional
      const totalProcedures = proceduresData.length || 0;
      const pendingProcedures = Array.isArray(proceduresData) 
        ? proceduresData.filter(p => p && p.estado === 'Pendiente').length 
        : 0;
      const completedProcedures = Array.isArray(proceduresData)
        ? proceduresData.filter(p => p && p.estado === 'Completado').length
        : 0;
      
      // Calcular total de documentos
      let totalDocuments = 0;
      if (Array.isArray(proceduresData)) {
        proceduresData.forEach(procedure => {
          if (procedure && typeof procedure === 'object') {
            totalDocuments += procedure.documentos_count || 0;
          }
        });
      }

      const newStats = {
        totalPersons: personsData.length || 0,
        totalProcedures,
        totalDocuments,
        pendingProcedures,
        completedProcedures
      };

      console.log('Estadísticas calculadas:', newStats);

      setStats(newStats);
      setRecentProcedures(Array.isArray(proceduresData) ? proceduresData.slice(0, 5) : []);
      setError(null);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      setError('Error al cargar los datos del dashboard');
      // En caso de error, establecer valores por defecto
      setStats({
        totalPersons: 0,
        totalProcedures: 0,
        totalDocuments: 0,
        pendingProcedures: 0,
        completedProcedures: 0
      });
      setRecentProcedures([]);
    } finally {
      setIsLoading(false);
    }
  };

  const getEstadoColor = (estado) => {
    if (!estado) return 'bg-gray-100 text-gray-800';
    
    switch (estado) {
      case 'Completado': return 'bg-green-100 text-green-800';
      case 'Pendiente': return 'bg-yellow-100 text-yellow-800';
      case 'Rechazado': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (isLoading) {
    return (
      <div className="text-center py-12">
        <div className="loading-spinner mx-auto mb-4"></div>
        <p className="text-gray-600">Cargando dashboard...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          <strong>Error:</strong> {error}
          <button 
            onClick={loadDashboardData}
            className="ml-4 bg-red-600 text-white px-3 py-1 rounded text-sm"
          >
            Reintentar
          </button>
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white border border-blue-200 rounded-xl p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-100 rounded-lg">
              <Users className="text-blue-600" size={24} />
            </div>
            <div>
              <p className="text-sm text-gray-600">Personas Registradas</p>
              <p className="text-2xl font-bold text-gray-800">{stats.totalPersons}</p>
            </div>
          </div>
        </div>

        <div className="bg-white border border-green-200 rounded-xl p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-green-100 rounded-lg">
              <FileText className="text-green-600" size={24} />
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Trámites</p>
              <p className="text-2xl font-bold text-gray-800">{stats.totalProcedures}</p>
            </div>
          </div>
        </div>

        <div className="bg-white border border-purple-200 rounded-xl p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-purple-100 rounded-lg">
              <Archive className="text-purple-600" size={24} />
            </div>
            <div>
              <p className="text-sm text-gray-600">Documentos</p>
              <p className="text-2xl font-bold text-gray-800">{stats.totalDocuments}</p>
            </div>
          </div>
        </div>

        <div className="bg-white border border-orange-200 rounded-xl p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-orange-100 rounded-lg">
              <Clock className="text-orange-600" size={24} />
            </div>
            <div>
              <p className="text-sm text-gray-600">Pendientes</p>
              <p className="text-2xl font-bold text-gray-800">{stats.pendingProcedures}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Procedures */}
      <div className="bg-white border border-gray-200 rounded-xl p-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Trámites Recientes</h2>
        {recentProcedures.length === 0 ? (
          <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-lg">
            <FileText className="mx-auto text-gray-400 mb-4" size={48} />
            <p className="text-gray-500">No hay trámites recientes</p>
            <p className="text-gray-400 text-sm mt-2">Los trámites aparecerán aquí una vez que sean creados</p>
          </div>
        ) : (
          <div className="space-y-4">
            {recentProcedures.map(procedure => (
              <div key={procedure.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors duration-200">
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-800">{procedure.tipo || 'Sin tipo'}</h3>
                  <p className="text-sm text-gray-600 mt-1">
                    {procedure.persona_nombre || 'Sin nombre'} - DNI: {procedure.dni || 'N/A'}
                  </p>
                  <p className="text-sm text-gray-500 mt-1">Responsable: {procedure.responsable || 'No asignado'}</p>
                </div>
                <div className="flex items-center gap-4">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getEstadoColor(procedure.estado)}`}>
                    {procedure.estado || 'Desconocido'}
                  </span>
                  <span className="text-sm text-gray-500">
                    {procedure.created_at ? new Date(procedure.created_at).toLocaleDateString() : 'Fecha no disponible'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="bg-white border border-gray-200 rounded-xl p-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Acciones Rápidas</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 border border-gray-200 rounded-lg text-left">
            <Users className="text-blue-600 mb-2" size={24} />
            <h3 className="font-semibold text-gray-800">Gestión de Personas</h3>
            <p className="text-sm text-gray-600 mt-1">Usa el menú lateral para gestionar personas</p>
          </div>
          
          <div className="p-4 border border-gray-200 rounded-lg text-left">
            <FileText className="text-green-600 mb-2" size={24} />
            <h3 className="font-semibold text-gray-800">Gestión de Trámites</h3>
            <p className="text-sm text-gray-600 mt-1">Accede desde el historial de personas</p>
          </div>
          
          <div className="p-4 border border-gray-200 rounded-lg text-left">
            <Archive className="text-purple-600 mb-2" size={24} />
            <h3 className="font-semibold text-gray-800">Documentos</h3>
            <p className="text-sm text-gray-600 mt-1">Administra documentos en cada trámite</p>
          </div>
          
          <div className="p-4 border border-gray-200 rounded-lg text-left">
            <CheckCircle className="text-orange-600 mb-2" size={24} />
            <h3 className="font-semibold text-gray-800">Reportes</h3>
            <p className="text-sm text-gray-600 mt-1">Consulta estadísticas del sistema</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;