import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Login from './pages/Login';
import Register from './pages/Register';
import PersonaBuilder from './pages/PersonaBuilder';
import DebateArena from './pages/DebateArena';
import Dashboard from './pages/Dashboard';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-[var(--color-dark-bg)] text-[var(--color-text-primary)]">
        <Navbar />
        <main className="container mx-auto px-4 py-8">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/builder" element={<PersonaBuilder />} />
            <Route path="/builder/:id" element={<PersonaBuilder />} />
            <Route path="/debate/:id" element={<DebateArena />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
