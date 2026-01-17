import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/layout/Layout';
import { Dashboard, Vehicules, Commandes, Clients, Stock, Options, Parametres, Login, Notifications } from './pages';

function App() {
  return (
    <AuthProvider>
      <Router>
        <NotificationProvider>
          <Routes>
            {/* Route publique - Login */}
            <Route path="/login" element={<Login />} />

            {/* Routes protegees */}
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <Layout />
                </ProtectedRoute>
              }
            >
              <Route index element={<Dashboard />} />
              <Route path="vehicules" element={<Vehicules />} />
              <Route path="commandes" element={<Commandes />} />
              <Route path="clients" element={<Clients />} />
              <Route path="stock" element={<Stock />} />
              <Route path="options" element={<Options />} />
              <Route path="notifications" element={<Notifications />} />
              <Route path="parametres" element={<Parametres />} />
            </Route>
          </Routes>
        </NotificationProvider>
      </Router>
    </AuthProvider>
  );
}

export default App;
