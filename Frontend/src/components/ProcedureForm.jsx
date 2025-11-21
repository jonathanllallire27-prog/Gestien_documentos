import React, { useState } from 'react';
import { Save, X, FileText } from 'lucide-react';
import { proceduresAPI } from '../services/api';

function ProcedureForm({ person, onSuccess, onCancel }) {
  const [formData, setFormData] = useState({
    tipo: '',
    descripcion: '',
    fecha_documento: new Date().toISOString().split('T')[0],
    responsable: '',
    estado: 'Pendiente'
  });
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const procedureTypes = [
    'Licencia de Conducir',
    'Permiso de Construcción',
    'Certificado de Nacimiento',
    'Partida de Matrimonio',
    'Certificado de Estudios',
    'Permiso Municipal',
    'Licencia de Funcionamiento',
    'Otro'
  ];

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.tipo.trim()) {
      newErrors.tipo = 'El tipo de trámite es requerido';
    }
    
    if (!formData.fecha_documento) {
      newErrors.fecha_documento = 'La fecha del documento es requerida';
    }
    
    if (!formData.responsable.trim()) {
      newErrors.responsable = 'El responsable es requerido';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    try {
      await proceduresAPI.create({
        ...formData,
        person_id: person.id
      });
      
      onSuccess();
    } catch (error) {
      console.error('Error al crear trámite:', error);
      alert('Error al crear trámite: ' + (error.response?.data?.error || error.message));
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center gap-3 mb-6">
          <FileText className="text-blue-600" size={24} />
          <h2 className="text-2xl font-bold text-gray-800">Nuevo Trámite</h2>
        </div>

        <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-700">
            <strong>Persona:</strong> {person.nombre} - DNI: {person.dni}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 gap-6">
            {/* Tipo de Trámite */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tipo de Trámite *
              </label>
              <select
                value={formData.tipo}
                onChange={(e) => handleChange('tipo', e.target.value)}
                className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200 ${
                  errors.tipo ? 'border-red-500' : 'border-gray-300'
                }`}
              >
                <option value="">Seleccionar tipo de trámite</option>
                {procedureTypes.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
              {errors.tipo && (
                <p className="text-red-500 text-sm mt-1">{errors.tipo}</p>
              )}
            </div>

            {/* Descripción */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Descripción
              </label>
              <textarea
                value={formData.descripcion}
                onChange={(e) => handleChange('descripcion', e.target.value)}
                rows={3}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200"
                placeholder="Descripción detallada del trámite..."
              />
            </div>

            {/* Fecha del Documento */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Fecha del Documento *
              </label>
              <input
                type="date"
                value={formData.fecha_documento}
                onChange={(e) => handleChange('fecha_documento', e.target.value)}
                className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200 ${
                  errors.fecha_documento ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.fecha_documento && (
                <p className="text-red-500 text-sm mt-1">{errors.fecha_documento}</p>
              )}
            </div>

            {/* Responsable */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Responsable *
              </label>
              <input
                type="text"
                value={formData.responsable}
                onChange={(e) => handleChange('responsable', e.target.value)}
                className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200 ${
                  errors.responsable ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Nombre del responsable del trámite"
              />
              {errors.responsable && (
                <p className="text-red-500 text-sm mt-1">{errors.responsable}</p>
              )}
            </div>

            {/* Estado */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Estado
              </label>
              <select
                value={formData.estado}
                onChange={(e) => handleChange('estado', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200"
              >
                <option value="Pendiente">Pendiente</option>
                <option value="En revisión">En revisión</option>
                <option value="Aprobado">Aprobado</option>
                <option value="Rechazado">Rechazado</option>
                <option value="Completado">Completado</option>
              </select>
            </div>
          </div>

          {/* Botones */}
          <div className="flex gap-4 pt-6 border-t border-gray-200">
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-all duration-200"
            >
              {isLoading ? (
                <div className="loading-spinner-small"></div>
              ) : (
                <Save size={18} />
              )}
              Crear Trámite
            </button>
            
            <button
              type="button"
              onClick={onCancel}
              className="px-6 py-3 bg-gray-500 text-white rounded-xl hover:bg-gray-600 flex items-center gap-2 transition-all duration-200"
            >
              <X size={18} />
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ProcedureForm;