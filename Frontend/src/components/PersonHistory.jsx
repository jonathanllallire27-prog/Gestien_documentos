import React, { useState, useEffect } from 'react';
import { ArrowLeft, FileText, Plus, Eye, Download, Trash2 } from 'lucide-react';
import { proceduresAPI, documentsAPI } from '../services/api';
import ProcedureForm from './ProcedureForm';
import DocumentForm from './DocumentForm';
import DocumentViewer from './DocumentViewer';

function PersonHistory({ person, onBack }) {
  const [procedures, setProcedures] = useState([]);
  const [selectedProcedure, setSelectedProcedure] = useState(null);
  const [documents, setDocuments] = useState([]);
  const [viewDocument, setViewDocument] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showProcedureForm, setShowProcedureForm] = useState(false);
  const [showDocumentForm, setShowDocumentForm] = useState(false);

  useEffect(() => {
    loadProcedures();
  }, [person.id]);

  const loadProcedures = async () => {
    setIsLoading(true);
    try {
      const proceduresData = await proceduresAPI.getByPerson(person.id);
      setProcedures(proceduresData);
    } catch (error) {
      console.error('Error al cargar trámites:', error);
      alert('Error al cargar trámites: ' + (error.response?.data?.error || error.message));
    } finally {
      setIsLoading(false);
    }
  };

  const loadDocuments = async (procedureId) => {
    try {
      const documentsData = await documentsAPI.getByProcedure(procedureId);
      setDocuments(documentsData);
    } catch (error) {
      console.error('Error al cargar documentos:', error);
      alert('Error al cargar documentos: ' + (error.response?.data?.error || error.message));
    }
  };

  const handleSelectProcedure = async (procedure) => {
    setSelectedProcedure(procedure);
    await loadDocuments(procedure.id);
  };

  const handleViewDocument = async (doc) => {
    try {
      const url = `http://localhost:5000/uploads/${doc.file_path.split('/').pop()}`;
      setViewDocument({ ...doc, url });
    } catch (error) {
      console.error('Error al cargar documento:', error);
      alert('Error al cargar documento: ' + (error.response?.data?.error || error.message));
    }
  };

  const handleDownloadDocument = async (doc) => {
    try {
      const response = await documentsAPI.download(doc.id);
      const blob = new Blob([response.data]);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = doc.nombre;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error al descargar documento:', error);
      alert('Error al descargar documento: ' + (error.response?.data?.error || error.message));
    }
  };

  const handleDeleteDocument = async (docId) => {
    if (!confirm('¿Está seguro de eliminar este documento?')) return;

    try {
      await documentsAPI.delete(docId);
      if (selectedProcedure) {
        await loadDocuments(selectedProcedure.id);
      }
      alert('Documento eliminado correctamente');
    } catch (error) {
      console.error('Error al eliminar documento:', error);
      alert('Error al eliminar documento: ' + (error.response?.data?.error || error.message));
    }
  };

  const getEstadoColor = (estado) => {
    switch (estado) {
      case 'Aprobado': return 'bg-green-100 text-green-800';
      case 'Pendiente': return 'bg-yellow-100 text-yellow-800';
      case 'Rechazado': return 'bg-red-100 text-red-800';
      case 'Completado': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={onBack}
            className="p-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors duration-200"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Historial de {person.nombre}</h2>
            <p className="text-gray-600">DNI: {person.dni} • Trámites: {procedures.length}</p>
          </div>
        </div>
        
        <button
          onClick={() => setShowProcedureForm(true)}
          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2 transition-all duration-200"
        >
          <Plus size={18} />
          Nuevo Trámite
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Lista de Trámites */}
        <div className="lg:col-span-1">
          <div className="bg-white border border-gray-200 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Trámites ({procedures.length})</h3>
            
            {isLoading ? (
              <div className="text-center py-8">
                <div className="loading-spinner mx-auto mb-4"></div>
                <p className="text-gray-600">Cargando trámites...</p>
              </div>
            ) : procedures.length === 0 ? (
              <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-lg">
                <FileText className="mx-auto text-gray-400 mb-4" size={48} />
                <p className="text-gray-500">No hay trámites registrados</p>
              </div>
            ) : (
              <div className="space-y-3">
                {procedures.map(procedure => (
                  <div
                    key={procedure.id}
                    className={`p-4 border rounded-lg cursor-pointer transition-all duration-200 ${
                      selectedProcedure?.id === procedure.id
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => handleSelectProcedure(procedure)}
                  >
                    <h4 className="font-semibold text-gray-800 mb-2">{procedure.tipo}</h4>
                    <div className="flex justify-between items-center">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getEstadoColor(procedure.estado)}`}>
                        {procedure.estado}
                      </span>
                      <span className="text-xs text-gray-500">
                        {new Date(procedure.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    {procedure.descripcion && (
                      <p className="text-sm text-gray-600 mt-2 line-clamp-2">{procedure.descripcion}</p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Documentos del Trámite Seleccionado */}
        <div className="lg:col-span-2">
          <div className="bg-white border border-gray-200 rounded-xl p-6">
            {!selectedProcedure ? (
              <div className="text-center py-12">
                <FileText className="mx-auto text-gray-400 mb-4" size={48} />
                <p className="text-gray-500">Selecciona un trámite para ver sus documentos</p>
              </div>
            ) : (
              <div>
                <div className="flex justify-between items-center mb-6">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800">{selectedProcedure.tipo}</h3>
                    <p className="text-gray-600">{selectedProcedure.descripcion}</p>
                  </div>
                  <button
                    onClick={() => setShowDocumentForm(true)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2 transition-all duration-200"
                  >
                    <Plus size={18} />
                    Subir Documento
                  </button>
                </div>

                {documents.length === 0 ? (
                  <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-lg">
                    <FileText className="mx-auto text-gray-400 mb-4" size={48} />
                    <p className="text-gray-500">No hay documentos para este trámite</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {documents.map(doc => (
                      <div key={doc.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors duration-200">
                        <div className="flex items-center gap-3">
                          <FileText className="text-blue-600" size={24} />
                          <div>
                            <h4 className="font-semibold text-gray-800">{doc.nombre}</h4>
                            <p className="text-sm text-gray-500">Subido: {new Date(doc.fecha).toLocaleDateString()}</p>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleViewDocument(doc)}
                            className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
                            title="Visualizar"
                          >
                            <Eye size={16} />
                          </button>
                          <button
                            onClick={() => handleDownloadDocument(doc)}
                            className="p-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors duration-200"
                            title="Descargar"
                          >
                            <Download size={16} />
                          </button>
                          <button
                            onClick={() => handleDeleteDocument(doc.id)}
                            className="p-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors duration-200"
                            title="Eliminar"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modales */}
      {showProcedureForm && (
        <ProcedureForm
          person={person}
          onSuccess={() => {
            setShowProcedureForm(false);
            loadProcedures();
          }}
          onCancel={() => setShowProcedureForm(false)}
        />
      )}

      {showDocumentForm && selectedProcedure && (
        <DocumentForm
          procedure={selectedProcedure}
          onSuccess={() => {
            setShowDocumentForm(false);
            loadDocuments(selectedProcedure.id);
          }}
          onCancel={() => setShowDocumentForm(false)}
        />
      )}

      {viewDocument && (
        <DocumentViewer
          document={viewDocument}
          onClose={() => setViewDocument(null)}
        />
      )}
    </div>
  );
}

export default PersonHistory;