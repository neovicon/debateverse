import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logout, reset } from '../store/authSlice';
import { BrainCircuit, LogOut, User as UserIcon, Menu, X } from 'lucide-react';

const Navbar = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const onLogout = () => {
    dispatch(logout());
    dispatch(reset());
    navigate('/');
  };

  return (
    <nav className="glass-panel border-b border-white/10 sticky top-0 z-50">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <Link to="/" className="flex items-center gap-2 group" onClick={() => setIsMobileMenuOpen(false)}>
          <BrainCircuit className="text-[var(--color-neon-blue)] group-hover:animate-spin" size={32} />
          <span className="text-2xl font-bold tracking-wider neon-text-blue">
            DebateVerse
          </span>
        </Link>
        
        {/* Desktop Navigation */}
        <ul className="hidden md:flex items-center gap-6">
          {user ? (
            <>
              <li>
                <Link to="/builder" className="text-gray-300 hover:text-[var(--color-neon-blue)] transition-colors">
                  Forge Persona
                </Link>
              </li>
              <li>
                <span className="flex items-center gap-2 text-gray-300">
                  <UserIcon size={18} /> {user.username}
                </span>
              </li>
              <li>
                <button className="btn-neon-pink flex items-center gap-2 text-sm" onClick={onLogout}>
                  <LogOut size={16} /> Logout
                </button>
              </li>
            </>
          ) : (
            <>
              <li>
                <Link to="/login" className="text-gray-300 hover:text-white transition-colors">
                  Login
                </Link>
              </li>
              <li>
                <Link to="/register" className="btn-neon-blue">
                  Register
                </Link>
              </li>
            </>
          )}
        </ul>

        {/* Mobile Hamburger Button */}
        <button 
          className="md:hidden text-gray-300 hover:text-[var(--color-neon-blue)] transition-colors focus:outline-none p-1"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          aria-label="Toggle menu"
        >
          {isMobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
        </button>
      </div>

      {/* Mobile Navigation Dropdown */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-t border-white/10 bg-[var(--color-dark-bg)]/95 backdrop-blur-lg px-6 py-6 absolute left-0 right-0 shadow-[0_10px_20px_rgba(0,0,0,0.8)] flex flex-col gap-4 animate-in fade-in slide-in-from-top-5 duration-200">
          {user ? (
            <div className="flex flex-col gap-4">
              <Link 
                to="/builder" 
                className="text-gray-300 hover:text-[var(--color-neon-blue)] transition-colors text-lg font-medium py-2"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Forge Persona
              </Link>
              <div className="flex items-center gap-2 text-gray-300 text-lg py-2 border-t border-white/5">
                <UserIcon size={20} className="text-[var(--color-neon-blue)]" /> 
                <span className="font-semibold">{user.username}</span>
              </div>
              <button 
                className="btn-neon-pink w-full flex items-center justify-center gap-2 text-base py-3 mt-2" 
                onClick={() => {
                  onLogout();
                  setIsMobileMenuOpen(false);
                }}
              >
                <LogOut size={18} /> Logout
              </button>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              <Link 
                to="/login" 
                className="text-gray-300 hover:text-white transition-colors text-lg font-medium py-2"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Login
              </Link>
              <Link 
                to="/register" 
                className="btn-neon-blue text-center text-lg py-3 mt-2"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Register
              </Link>
            </div>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;
