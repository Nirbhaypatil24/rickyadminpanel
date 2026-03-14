import React, { useState } from 'react';
import Header from './components/Layout/Header';
import Dashboard from './components/Dashboard/Dashboard';
import DriversList from './components/Drivers/DriversList';
import VehiclesList from './components/Vehicles/VehiclesList';
import FaresList from './components/Fares/FaresList';
import SosDashboard from './components/SOS/SosDashboard';
import AutometerDashboard from './components/AutometerData/AutometerDashboard';
import FareRateSettings from './components/Settings/FareRateSettings';
import MapDashboard from './components/Maps/MapDashboard';  // ← ADD THIS IMPORT
import Login from './components/Auth/Login';

const SESSION_KEY = 'adminSessionToken';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(
    () => !!localStorage.getItem(SESSION_KEY)
  );
  const [activeTab, setActiveTab] = useState('dashboard');

  const handleLogin = () => {
    const token = `session_${Date.now()}_${Math.random().toString(36).slice(2)}`;
    localStorage.setItem(SESSION_KEY, token);
    setIsLoggedIn(true);
  };

  const handleLogout = () => {
    localStorage.removeItem(SESSION_KEY);
    setIsLoggedIn(false);
    setActiveTab('dashboard');
  };

  if (!isLoggedIn) {
    return <Login onLogin={handleLogin} />;
  }

  const renderActiveComponent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard setActiveTab={setActiveTab} />;
      case 'drivers':
        return <DriversList />;
      case 'vehicles':
        return <VehiclesList />;
      case 'fares':
        return <FaresList />;
      case 'sos':
        return <SosDashboard />;
      case 'autometer':
        return <AutometerDashboard />;
      case 'settings':
        return <FareRateSettings />;
      case 'map':  // ← ADD THIS CASE
        return <MapDashboard />;
      default:
        return <Dashboard setActiveTab={setActiveTab} />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header activeTab={activeTab} setActiveTab={setActiveTab} onLogout={handleLogout} />
      
      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {renderActiveComponent()}
      </main>
    </div>
  );
}

export default App;
