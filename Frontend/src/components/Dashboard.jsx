import React, { useState, useEffect } from 'react';
import { Users, FileText, Archive, Clock, CheckCircle, XCircle } from 'lucide-react';
import { proceduresAPI } from '../services/api';

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

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const [proceduresData] = await Promise.all([
        proceduresAPI.getAll()
      ]);

      // Calcular estadísticas básicas (en una app real, esto vendría del backend)
      const totalProcedures = proceduresData.length;
      const pendingProcedures = proceduresData.filter(p => p.estado === 'Pendiente').length;
      const completedProcedures = proceduresData.filter(p => p.estado === 'Completado').length;

      setStats({
        totalPersons: 0, // Esto debería venir de una API de estadísticas
        totalProcedures,
        totalDocuments: 0, // Esto debería venir de una API de estadísticas
        pendingProcedures,
        completedProcedures
      });

      setRecentProcedures(proceduresData.slice(0, 5));
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getEstadoColor = (estado) => {
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
          </div>
        ) : (
          <div className="space-y-4">
            {recentProcedures.map(procedure => (
              <div key={procedure.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors duration-200">
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-800">{procedure.tipo}</h3>
                  <p className="text-sm text-gray-600 mt-1">{procedure.persona_nombre} - DNI: {procedure.dni}</p>
                  <p className="text-sm text-gray-500 mt-1">Responsable: {procedure.responsable}</p>
                </div>
                <div className="flex items-center gap-4">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getEstadoColor(procedure.estado)}`}>
                    {procedure.estado}
                  </span>
                  <span className="text-sm text-gray-500">
                    {new Date(procedure.created_at).toLocaleDateString()}
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
          <button className="p-4 border border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all duration-200 text-left">
            <Users className="text-blue-600 mb-2" size={24} />
            <h3 className="font-semibold text-gray-800">Nueva Persona</h3>
            <p className="text-sm text-gray-600 mt-1">Registrar nueva persona</p>
          </button>
          
          <button className="p-4 border border-gray-200 rounded-lg hover:border-green-500 hover:bg-green-50 transition-all duration-200 text-left">
            <FileText className="text-green-600 mb-2" size={24} />
            <h3 className="font-semibold text-gray-800">Nuevo Trámite</h3>
            <p className="text-sm text-gray-600 mt-1">Crear nuevo trámite</p>
          </button>
          
          <button className="p-4 border border-gray-200 rounded-lg hover:border-purple-500 hover:bg-purple-50 transition-all duration-200 text-left">
            <Archive className="text-purple-600 mb-2" size={24} />
            <h3 className="font-semibold text-gray-800">Subir Documento</h3>
            <p className="text-sm text-gray-600 mt-1">Adjuntar documentos</p>
          </button>
          
          <button className="p-4 border border-gray-200 rounded-lg hover:border-orange-500 hover:bg-orange-50 transition-all duration-200 text-left">
            <CheckCircle className="text-orange-600 mb-2" size={24} />
            <h3 className="font-semibold text-gray-800">Reportes</h3>
            <p className="text-sm text-gray-600 mt-1">Generar reportes</p>
          </button>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;