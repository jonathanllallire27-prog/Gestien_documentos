import React, { useState } from 'react';
import { Search, LogIn, User, FileText, Calendar, Download, Eye, Shield, MapPin, Phone, Mail } from 'lucide-react';
import { personsAPI, proceduresAPI, documentsAPI } from '../services/api';
import DocumentViewer from './DocumentViewer';

function PublicSearch({ onAdminLogin, loginError, setLoginError }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [selectedPerson, setSelectedPerson] = useState(null);
  const [procedures, setProcedures] = useState([]);
  const [selectedProcedure, setSelectedProcedure] = useState(null);
  const [documents, setDocuments] = useState([]);
  const [viewDocument, setViewDocument] = useState(null);
  const [isSearching, setIsSearching] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [loginForm, setLoginForm] = useState({ username: '', password: '' });

  const handleSearch = async () => {
    const query = searchQuery.trim();
    if (!query) {
      alert('Por favor ingrese un nombre o DNI para buscar');
      return;
    }

    setIsSearching(true);
    try {
      const persons = await personsAPI.search(query);
      setSearchResults(persons);
      if (persons.length === 0) {
        alert('No se encontraron personas con los criterios de búsqueda.');
      }
    } catch (error) {
      console.error('Error en búsqueda:', error);
      alert('Error al buscar: ' + (error.response?.data?.error || error.message));
    } finally {
      setIsSearching(false);
    }
  };

  const handleSelectPerson = async (person) => {
    setSelectedPerson(person);
    try {
      const proceduresData = await proceduresAPI.getByPerson(person.id);
      setProcedures(proceduresData);
      setSelectedProcedure(null);
      setDocuments([]);
    } catch (error) {
      console.error('Error al cargar trámites:', error);
      alert('Error al cargar trámites: ' + (error.response?.data?.error || error.message));
    }
  };

  const handleSelectProcedure = async (procedure) => {
    setSelectedProcedure(procedure);
    try {
      const documentsData = await documentsAPI.getByProcedure(procedure.id);
      setDocuments(documentsData);
    } catch (error) {
      console.error('Error al cargar documentos:', error);
      alert('Error al cargar documentos: ' + (error.response?.data?.error || error.message));
    }
  };

  const handleViewDocument = async (doc) => {
    try {
      const response = await documentsAPI.download(doc.id);
      const blob = new Blob([response.data], { type: doc.tipo });
      const url = URL.createObjectURL(blob);
      setViewDocument({ ...doc, url });
    } catch (error) {
      console.error('Error al cargar documento:', error);
      alert('Error al cargar documento: ' + (error.response?.data?.error || error.message));
    }
  };

  const handleDownloadDocument = async (doc) => {
    try {
      const response = await documentsAPI.download(doc.id);
      const blob = new Blob([response.data], { type: doc.tipo });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = doc.nombre;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error al descargar documento:', error);
      alert('Error al descargar documento: ' + (error.response?.data?.error || error.message));
    }
  };

  const handleLogin = (e) => {
    e.preventDefault();
    if (!loginForm.username || !loginForm.password) {
      setLoginError('Por favor complete todos los campos');
      return;
    }
    onAdminLogin(loginForm);
  };

  const handleCloseLogin = () => {
    setShowLogin(false);
    setLoginForm({ username: '', password: '' });
    setLoginError('');
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      {/* Header con botón de administrador */}
      <div className="max-w-7xl mx-auto mb-6">
        <div className="flex justify-between items-center bg-white rounded-2xl shadow-lg p-4">
          <div className="flex items-center gap-3">
            <FileText className="text-blue-600" size={32} />
            <div>
              <h1 className="text-2xl font-bold text-gray-800">Sistema de Gestión de Trámites</h1>
              <p className="text-gray-600">Consulta pública de trámites y documentos</p>
            </div>
          </div>
          <button
            onClick={() => setShowLogin(true)}
            className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 inline-flex items-center gap-2 transition-all duration-300 shadow-lg hover:shadow-xl"
          >
            <Shield size={18} />
            Acceso Administrativo
          </button>
        </div>
      </div>

      {/* Contenido principal */}
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="text-center mb-8">
            <Search className="mx-auto text-blue-600 mb-4" size={64} />
            <h2 className="text-3xl font-bold text-gray-800 mb-2">Búsqueda de Trámites</h2>
            <p className="text-gray-600 text-lg">Busque personas por nombre completo o DNI para consultar sus trámites</p>
          </div>

          {/* Barra de búsqueda */}
          <div className="flex gap-4 mb-8">
            <input
              type="text"
              placeholder="Ingrese nombre completo o DNI de la persona..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              className="flex-1 px-4 py-4 text-lg border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-500 focus:ring-opacity-50 focus:border-blue-500 transition-all duration-300"
              disabled={isSearching}
            />
            <button
              onClick={handleSearch}
              disabled={isSearching}
              className="px-8 py-4 bg-blue-600 text-white rounded-xl hover:bg-blue-700 flex items-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 text-lg font-semibold shadow-lg hover:shadow-xl"
            >
              {isSearching ? (
                <div className="loading-spinner-small"></div>
              ) : (
                <Search size={24} />
              )}
              {isSearching ? 'Buscando...' : 'Buscar'}
            </button>
          </div>

          {/* Resultados de búsqueda */}
          {searchResults.length > 0 && (
            <div className="mb-8">
              <h3 className="text-xl font-semibold mb-4 text-gray-800">
                Resultados de la búsqueda ({searchResults.length})
              </h3>
              <div className="grid gap-4">
                {searchResults.map(person => (
                  <div
                    key={person.id}
                    className="border-2 border-gray-200 rounded-xl p-6 hover:border-blue-300 hover:shadow-lg transition-all duration-300 cursor-pointer bg-white"
                    onClick={() => handleSelectPerson(person)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <User className="text-blue-600" size={32} />
                        <div>
                          <h4 className="text-xl font-semibold text-gray-800">{person.nombre}</h4>
                          <div className="flex flex-wrap gap-4 mt-2 text-sm text-gray-600">
                            <span className="flex items-center gap-1">
                              <FileText size={16} />
                              DNI: {person.dni}
                            </span>
                            <span className="flex items-center gap-1">
                              <Calendar size={16} />
                              Trámites: {person.tramites_count || 0}
                            </span>
                            <span className="flex items-center gap-1">
                              <FileText size={16} />
                              Documentos: {person.documentos_count || 0}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm text-gray-500">Registrado</div>
                        <div className="text-sm font-medium text-gray-700">
                          {new Date(person.created_at).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Información de la persona seleccionada */}
          {selectedPerson && (
            <div className="mb-8">
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 rounded-2xl p-6 mb-6">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-2xl font-semibold text-gray-800">Información Personal</h3>
                  <button
                    onClick={() => {
                      setSelectedPerson(null);
                      setSearchResults([]);
                      setSearchQuery('');
                    }}
                    className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-all duration-300"
                  >
                    Nueva Búsqueda
                  </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <div className="bg-white rounded-xl p-4 border border-blue-100">
                    <div className="flex items-center gap-2 mb-2">
                      <User className="text-blue-600" size={20} />
                      <span className="font-semibold text-gray-700">Nombre Completo</span>
                    </div>
                    <p className="text-gray-800">{selectedPerson.nombre}</p>
                  </div>
                  <div className="bg-white rounded-xl p-4 border border-blue-100">
                    <div className="flex items-center gap-2 mb-2">
                      <FileText className="text-blue-600" size={20} />
                      <span className="font-semibold text-gray-700">DNI</span>
                    </div>
                    <p className="text-gray-800">{selectedPerson.dni}</p>
                  </div>
                  <div className="bg-white rounded-xl p-4 border border-blue-100">
                    <div className="flex items-center gap-2 mb-2">
                      <Phone className="text-blue-600" size={20} />
                      <span className="font-semibold text-gray-700">Teléfono</span>
                    </div>
                    <p className="text-gray-800">{selectedPerson.celular || 'No registrado'}</p>
                  </div>
                  {selectedPerson.direccion && (
                    <div className="bg-white rounded-xl p-4 border border-blue-100">
                      <div className="flex items-center gap-2 mb-2">
                        <MapPin className="text-blue-600" size={20} />
                        <span className="font-semibold text-gray-700">Dirección</span>
                      </div>
                      <p className="text-gray-800">{selectedPerson.direccion}</p>
                    </div>
                  )}
                  {selectedPerson.correo && (
                    <div className="bg-white rounded-xl p-4 border border-blue-100">
                      <div className="flex items-center gap-2 mb-2">
                        <Mail className="text-blue-600" size={20} />
                        <span className="font-semibold text-gray-700">Correo Electrónico</span>
                      </div>
                      <p className="text-gray-800">{selectedPerson.correo}</p>
                    </div>
                  )}
                  <div className="bg-white rounded-xl p-4 border border-blue-100">
                    <div className="flex items-center gap-2 mb-2">
                      <Calendar className="text-blue-600" size={20} />
                      <span className="font-semibold text-gray-700">Fecha de Registro</span>
                    </div>
                    <p className="text-gray-800">{new Date(selectedPerson.created_at).toLocaleDateString()}</p>
                  </div>
                </div>
              </div>

              {/* Trámites de la persona */}
              <div className="bg-white border border-gray-200 rounded-2xl p-6">
                <h3 className="text-2xl font-semibold mb-6 text-gray-800">Trámites Realizados</h3>
                {procedures.length === 0 ? (
                  <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-xl">
                    <FileText className="mx-auto text-gray-400 mb-4" size={48} />
                    <p className="text-gray-500 text-lg">No se encontraron trámites</p>
                    <p className="text-gray-400 mt-2">Esta persona no tiene trámites registrados</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {procedures.map(procedure => (
                      <div
                        key={procedure.id}
                        className={`border-2 rounded-xl p-6 hover:shadow-md transition-all duration-300 cursor-pointer ${
                          selectedProcedure?.id === procedure.id 
                            ? 'border-blue-500 bg-blue-50' 
                            : 'border-gray-200 bg-white'
                        }`}
                        onClick={() => handleSelectProcedure(procedure)}
                      >
                        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-3">
                              <FileText className="text-blue-600" size={24} />
                              <div>
                                <h4 className="text-xl font-semibold text-gray-800">{procedure.tipo}</h4>
                                <p className="text-gray-600 mt-1">{procedure.descripcion}</p>
                              </div>
                            </div>
                            <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                              <span className="flex items-center gap-1">
                                <Calendar size={16} />
                                Fecha: {procedure.fecha_documento}
                              </span>
                              <span className="flex items-center gap-1">
                                <User size={16} />
                                Responsable: {procedure.responsable}
                              </span>
                              <span className="flex items-center gap-1">
                                <FileText size={16} />
                                Documentos: {procedure.documentos_count || 0}
                              </span>
                            </div>
                          </div>
                          <div className="flex flex-col sm:flex-row lg:flex-col items-end gap-2">
                            <span className={`px-3 py-1 rounded-full text-sm font-medium ${getEstadoColor(procedure.estado)}`}>
                              {procedure.estado}
                            </span>
                            <span className="text-sm text-gray-500">
                              {new Date(procedure.created_at).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Documentos del trámite seleccionado */}
          {selectedProcedure && (
            <div className="mb-8">
              <div className="bg-white border border-gray-200 rounded-2xl p-6">
                <div className="flex justify-between items-center mb-6">
                  <div>
                    <h3 className="text-2xl font-semibold text-gray-800">
                      Documentos del Trámite
                    </h3>
                    <p className="text-gray-600 mt-1">{selectedProcedure.tipo}</p>
                  </div>
                  <button
                    onClick={() => setSelectedProcedure(null)}
                    className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-all duration-300"
                  >
                    Volver a Trámites
                  </button>
                </div>

                {documents.length === 0 ? (
                  <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-xl">
                    <FileText className="mx-auto text-gray-400 mb-4" size={48} />
                    <p className="text-gray-500 text-lg">No hay documentos asociados</p>
                    <p className="text-gray-400 mt-2">Este trámite no tiene documentos adjuntos</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {documents.map(doc => (
                      <div key={doc.id} className="border-2 border-gray-200 rounded-xl p-4 hover:border-blue-300 hover:shadow-md transition-all duration-300 bg-white">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                          <div className="flex items-center gap-3 flex-1">
                            <FileText className="text-blue-600 flex-shrink-0" size={24} />
                            <div className="min-w-0">
                              <p className="font-semibold text-gray-800 truncate">{doc.nombre}</p>
                              <div className="flex flex-wrap gap-2 mt-1">
                                <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                                  {doc.tipo}
                                </span>
                                <span className="text-xs bg-blue-100 text-blue-600 px-2 py-1 rounded">
                                  {doc.fecha}
                                </span>
                              </div>
                            </div>
                          </div>
                          <div className="flex gap-2 flex-shrink-0">
                            <button
                              onClick={() => handleViewDocument(doc)}
                              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-300 flex items-center gap-2"
                            >
                              <Eye size={16} />
                              Visualizar
                            </button>
                            <button
                              onClick={() => handleDownloadDocument(doc)}
                              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all duration-300 flex items-center gap-2"
                            >
                              <Download size={16} />
                              Descargar
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modal de Login */}
      {showLogin && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl">
            <div className="text-center mb-6">
              <Shield className="mx-auto text-blue-600 mb-4" size={48} />
              <h2 className="text-2xl font-bold text-gray-800">Acceso Administrativo</h2>
              <p className="text-gray-600 mt-2">Ingrese sus credenciales de administrador</p>
            </div>

            <form onSubmit={handleLogin} className="space-y-6">
              {loginError && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">
                  {loginError}
                </div>
              )}

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Usuario
                  </label>
                  <input
                    type="text"
                    placeholder="Ingrese su usuario"
                    value={loginForm.username}
                    onChange={(e) => {
                      setLoginForm({ ...loginForm, username: e.target.value });
                      setLoginError('');
                    }}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-500 focus:ring-opacity-50 focus:border-blue-500 transition-all duration-300"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Contraseña
                  </label>
                  <input
                    type="password"
                    placeholder="Ingrese su contraseña"
                    value={loginForm.password}
                    onChange={(e) => {
                      setLoginForm({ ...loginForm, password: e.target.value });
                      setLoginError('');
                    }}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-500 focus:ring-opacity-50 focus:border-blue-500 transition-all duration-300"
                    required
                  />
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                <p className="text-sm text-blue-700 text-center">
                  <strong>Credenciales por defecto:</strong><br />
                  Usuario: <strong>admin</strong><br />
                  Contraseña: <strong>admin123</strong>
                </p>
              </div>

              <div className="flex gap-3">
                <button
                  type="submit"
                  className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all duration-300 font-semibold shadow-lg hover:shadow-xl"
                >
                  Ingresar
                </button>
                <button
                  type="button"
                  onClick={handleCloseLogin}
                  className="px-6 py-3 bg-gray-500 text-white rounded-xl hover:bg-gray-600 transition-all duration-300 font-semibold"
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal de visualización de documento */}
      {viewDocument && (
        <DocumentViewer
          document={viewDocument}
          onClose={() => setViewDocument(null)}
        />
      )}
    </div>
  );
}

export default PublicSearch;