import { Outlet, Link, useNavigate } from 'react-router-dom';
import { insforge } from '../lib/insforge';
import { Code2, LogOut, User } from 'lucide-react';

export default function Layout() {
    const navigate = useNavigate();

    const handleLogout = async () => {
        await insforge.auth.signOut();
        navigate('/auth');
    };

    return (
        <div className="min-h-screen bg-dark-bg text-dark-text flex flex-col">
            {/* Navbar */}
            <nav className="h-14 border-b border-dark-card flex items-center px-6 justify-between bg-dark-card/50 backdrop-blur">
                <div className="flex items-center gap-8">
                    <Link to="/" className="flex items-center gap-2 font-bold text-xl hover:opacity-90">
                        <div className="w-8 h-8 bg-brand-yellow rounded-lg flex items-center justify-center text-white">
                            <Code2 size={20} />
                        </div>
                        <span>LeetClone</span>
                    </Link>

                    <div className="flex items-center gap-4 text-sm text-dark-sub">
                        <Link to="/" className="hover:text-dark-text transition-colors">Problems</Link>
                        <Link to="/leaderboard" className="hover:text-dark-text transition-colors">Leaderboard</Link>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    <button className="p-2 hover:bg-dark-bg rounded-full transition-colors">
                        <User size={20} className="text-dark-sub" />
                    </button>
                    <button
                        onClick={handleLogout}
                        className="p-2 hover:bg-dark-bg rounded-full transition-colors text-dark-sub hover:text-red-400"
                    >
                        <LogOut size={20} />
                    </button>
                </div>
            </nav>

            {/* Main Content */}
            <main className="flex-1 overflow-auto">
                <Outlet />
            </main>
        </div>
    );
}
