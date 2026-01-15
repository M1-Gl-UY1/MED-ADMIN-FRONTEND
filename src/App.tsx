import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/layout/Layout';
import { Dashboard, Vehicules, Commandes, Clients, Stock, Parametres } from './pages';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="vehicules" element={<Vehicules />} />
          <Route path="commandes" element={<Commandes />} />
          <Route path="clients" element={<Clients />} />
          <Route path="stock" element={<Stock />} />
          <Route path="parametres" element={<Parametres />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
