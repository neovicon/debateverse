import { Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logout, reset } from '../store/authSlice';
import { BrainCircuit, LogOut, User as UserIcon } from 'lucide-react';

const Navbar = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);

  const onLogout = () => {
    dispatch(logout());
    dispatch(reset());
    navigate('/');
  };

  return (
    <nav className="glass-panel border-b border-white/10 sticky top-0 z-50">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <Link to="/" className="flex items-center gap-2 group">
          <BrainCircuit className="text-[var(--color-neon-blue)] group-hover:animate-spin" size={32} />
          <span className="text-2xl font-bold tracking-wider neon-text-blue">
            DebateVerse
          </span>
        </Link>
        <ul className="flex items-center gap-6">
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
      </div>
    </nav>
  );
};

export default Navbar;
