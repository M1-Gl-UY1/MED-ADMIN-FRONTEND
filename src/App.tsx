import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/layout/Layout';
import { Dashboard, Vehicules, Commandes, Clients, Stock, Parametres, Login } from './pages';

function App() {
  return (
    <AuthProvider>
      <Router>
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
            <Route path="parametres" element={<Parametres />} />
          </Route>
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
