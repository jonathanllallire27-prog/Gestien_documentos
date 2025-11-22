import React, { useState, useEffect } from 'react';
import { LogOut, Users, FileText, UserPlus, Search } from 'lucide-react';
import Dashboard from './Dashboard';
import PersonForm from './PersonForm';
import PersonHistory from './PersonHistory';
import { personsAPI } from '../services/api';

function AdminModule({ onLogout }) {
  const [currentView, setCurrentView] = useState('dashboard');
  const [selectedPerson, setSelectedPerson] = useState(null);
  const [persons, setPersons] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Cargar personas cuando cambie la vista a 'persons'
  useEffect(() => {
    console.log('Current view changed to:', currentView);
    if (currentView === 'persons') {
      loadPersons();
    }
  }, [currentView]);

  const loadPersons = async () => {
    setIsLoading(true);
    setError(null);
    try {
      console.log('Loading persons...');
      const personsData = await personsAPI.getAll();
      console.log('Persons loaded:', personsData);
      
      // Asegurarnos de que personsData sea un array
      const safePersonsData = Array.isArray(personsData) ? personsData : [];
      if (!Array.isArray(personsData)) {
        console.warn('La API de personas no devolvió un array:', personsData);
        setError('Los datos de personas no están en el formato esperado');
      }
      
      setPersons(safePersonsData);
    } catch (error) {
      console.error('Error al cargar personas:', error);
      const errorMessage = error.response?.data?.error || error.message;
      setError('Error al cargar personas: ' + errorMessage);
      setPersons([]); // Asegurar que persons sea un array vacío en caso de error
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      loadPersons();
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      const personsData = await personsAPI.search(searchQuery);
      // Asegurarnos de que personsData sea un array
      const safePersonsData = Array.isArray(personsData) ? personsData : [];
      setPersons(safePersonsData);
    } catch (error) {
      console.error('Error al buscar personas:', error);
      const errorMessage = error.response?.data?.error || error.message;
      setError('Error al buscar personas: ' + errorMessage);
      setPersons([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePersonCreated = () => {
    setCurrentView('persons');
    loadPersons();
    setSelectedPerson(null);
  };

  const handleViewPersonHistory = (person) => {
    setSelectedPerson(person);
    setCurrentView('person-history');
  };

  const handleEditPerson = (person) => {
    setSelectedPerson(person);
    setCurrentView('create-person');
  };

  const handleCancelCreatePerson = () => {
    setCurrentView('persons');
    setSelectedPerson(null);
  };

  const getFilteredPersons = () => {
    // Asegurarnos de que persons sea un array
    if (!Array.isArray(persons)) {
      console.warn('persons no es un array:', persons);
      return [];
    }
    
    if (!searchQuery.trim()) return persons;
    
    const query = searchQuery.toLowerCase();
    return persons.filter(person => 
      person && (
        (person.nombre && person.nombre.toLowerCase().includes(query)) ||
        (person.dni && person.dni.includes(query))
      )
    );
  };

  // Renderizar contenido basado en la vista actual
  const renderContent = () => {
    console.log('Rendering content for view:', currentView);
    
    switch (currentView) {
      case 'dashboard':
        return <Dashboard />;
        
      case 'persons':
        const filteredPersons = getFilteredPersons();
        return (
          <div>
            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                <strong>Error:</strong> {error}
                <button 
                  onClick={loadPersons}
                  className="ml-4 bg-red-600 text-white px-3 py-1 rounded text-sm"
                >
                  Reintentar
                </button>
              </div>
            )}
            
            {isLoading ? (
              <div className="text-center py-12">
                <div className="loading-spinner mx-auto mb-4"></div>
                <p className="text-gray-600">Cargando personas...</p>
              </div>
            ) : filteredPersons.length === 0 ? (
              <div className="text-center py-12 border-2 border-dashed border-gray-300 rounded-xl">
                <Users className="mx-auto text-gray-400 mb-4" size={48} />
                <p className="text-gray-500 text-lg">
                  {searchQuery ? 'No se encontraron personas' : 'No hay personas registradas'}
                </p>
                <p className="text-gray-400 mt-2">
                  {searchQuery 
                    ? 'Intenta con otros términos de búsqueda' 
                    : 'Haz clic en "Nueva Persona" para agregar una'
                  }
                </p>
              </div>
            ) : (
              <div className="grid gap-4">
                {filteredPersons.map(person => (
                  <div key={person.id} className="border border-gray-200 rounded-xl p-6 hover:shadow-md transition-all duration-200">
                    <div className="flex justify-between items-center">
                      <div className="flex-1">
                        <h3 className="text-xl font-semibold text-gray-800 mb-2">{person.nombre || 'Sin nombre'}</h3>
                        <div className="grid grid-cols-3 gap-4 text-sm text-gray-600">
                          <div>
                            <span className="font-medium">DNI:</span> {person.dni || 'No registrado'}
                          </div>
                          <div>
                            <span className="font-medium">Teléfono:</span> {person.celular || 'No registrado'}
                          </div>
                          <div>
                            <span className="font-medium">Trámites:</span> {person.tramites_count || 0}
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleViewPersonHistory(person)}
                          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-200"
                        >
                          Ver Historial
                        </button>
                        <button
                          onClick={() => handleEditPerson(person)}
                          className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-all duration-200"
                        >
                          Editar
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        );
        
      case 'create-person':
        return (
          <PersonForm 
            person={selectedPerson}
            onSuccess={handlePersonCreated}
            onCancel={handleCancelCreatePerson}
          />
        );
        
      case 'person-history':
        return selectedPerson ? (
          <PersonHistory 
            person={selectedPerson}
            onBack={() => {
              setCurrentView('persons');
              setSelectedPerson(null);
            }}
          />
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-500">No se ha seleccionado ninguna persona</p>
          </div>
        );
        
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Sidebar */}
      <div className="fixed left-0 top-0 h-full w-64 bg-white shadow-lg">
        <div className="p-6 border-b border-gray-200">
          <h1 className="text-xl font-bold text-gray-800">Panel Admin</h1>
          <p className="text-sm text-gray-600">Sistema de Trámites</p>
        </div>
        
        <nav className="p-4 space-y-2">
          <button
            onClick={() => {
              console.log('Navigating to dashboard');
              setCurrentView('dashboard');
              setSelectedPerson(null);
              setError(null);
            }}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all duration-200 ${
              currentView === 'dashboard' 
                ? 'bg-blue-600 text-white' 
                : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            <FileText size={20} />
            Dashboard
          </button>
          
          <button
            onClick={() => {
              console.log('Navigating to persons');
              setCurrentView('persons');
              setSelectedPerson(null);
              setError(null);
            }}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all duration-200 ${
              currentView === 'persons' 
                ? 'bg-blue-600 text-white' 
                : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            <Users size={20} />
            Gestión de Personas
          </button>
          
          <button
            onClick={() => {
              console.log('Navigating to create-person');
              setSelectedPerson(null);
              setCurrentView('create-person');
              setError(null);
            }}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all duration-200 ${
              currentView === 'create-person' 
                ? 'bg-blue-600 text-white' 
                : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            <UserPlus size={20} />
            Nueva Persona
          </button>
        </nav>
        
        <div className="absolute bottom-4 left-4 right-4">
          <button
            onClick={onLogout}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-all duration-200"
          >
            <LogOut size={18} />
            Cerrar Sesión
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="ml-64 p-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-2xl font-bold text-gray-800">
                  {currentView === 'dashboard' && 'Dashboard Principal'}
                  {currentView === 'persons' && 'Gestión de Personas'}
                  {currentView === 'create-person' && (selectedPerson ? 'Editar Persona' : 'Nueva Persona')}
                  {currentView === 'person-history' && `Historial de ${selectedPerson?.nombre || 'Persona'}`}
                </h1>
                <p className="text-gray-600 mt-1">
                  {currentView === 'dashboard' && 'Resumen y estadísticas del sistema'}
                  {currentView === 'persons' && 'Buscar y gestionar personas registradas'}
                  {currentView === 'create-person' && (selectedPerson ? 'Editar información de la persona' : 'Registrar nueva persona en el sistema')}
                  {currentView === 'person-history' && 'Trámites y documentos de la persona'}
                </p>
              </div>
              
              {currentView === 'persons' && (
                <div className="flex gap-4">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Buscar por nombre o DNI..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                      className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-80"
                    />
                    <button
                      onClick={handleSearch}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
                    >
                      <Search size={18} />
                      Buscar
                    </button>
                  </div>
                  <button
                    onClick={() => {
                      setSelectedPerson(null);
                      setCurrentView('create-person');
                    }}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2"
                  >
                    <UserPlus size={18} />
                    Nueva Persona
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Content */}
          <div className="bg-white rounded-2xl shadow-lg p-6 min-h-[500px]">
            {renderContent()}
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminModule;