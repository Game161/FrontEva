import React, { useContext, useState } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../../contexts/AuthContext';
import { Menu, X, LogOut, User, Activity } from 'lucide-react';

const Navbar = () => {
    const { user, logout } = useContext(AuthContext);
    const [isOpen, setIsOpen] = useState(false);

    const getLinks = () => {
        if (!user) return [];
        if (user.role === 'ADMIN') {
            return [
                { name: 'แดชบอร์ด', path: '/admin' },
                { name: 'จัดการผู้ใช้', path: '/admin/users' },
                { name: 'จัดการการประเมิน', path: '/admin/evaluations' },
                { name: 'จัดการการมอบหมาย', path: '/admin/assignments' }
            ];
        }
        if (user.role === 'EVALUATOR') {
            return [{ name: 'แดชบอร์ด (ผู้ประเมิน)', path: '/evaluator' }];
        }
        if (user.role === 'EVALUATEE') {
            return [{ name: 'การประเมินของฉัน', path: '/me' }];
        }
        return [];
    };

    return (
        <nav className="bg-primary-700 text-white shadow-md sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16">
                    <div className="flex items-center">
                        <Link to="/" className="flex items-center gap-2">
                            <Activity className="h-8 w-8 text-primary-200" />
                            <span className="font-bold text-xl tracking-wide hidden sm:block">Performance Evaluation System</span>
                            <span className="font-bold text-xl tracking-wide sm:hidden">PES</span>
                        </Link>
                    </div>

                    {/* Desktop Menu */}
                    <div className="hidden md:flex items-center space-x-4">
                        {getLinks().map((link) => (
                            <Link
                                key={link.path}
                                to={link.path}
                                className="hover:bg-primary-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                            >
                                {link.name}
                            </Link>
                        ))}

                        {user ? (
                            <div className="flex items-center gap-4 ml-4 border-l border-primary-500 pl-4">
                                <div className="flex items-center gap-2">
                                    <div className="h-8 w-8 rounded-full bg-primary-200 flex items-center justify-center text-primary-800 font-bold">
                                        {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-sm font-medium leading-none">{user.name}</span>
                                        <span className="text-xs text-primary-200">{user.role}</span>
                                    </div>
                                </div>
                                <button
                                    onClick={logout}
                                    className="p-2 text-primary-100 hover:text-white hover:bg-primary-800 rounded-full transition-colors"
                                    title="ออกจากระบบ"
                                >
                                    <LogOut size={20} />
                                </button>
                            </div>
                        ) : (
                            <div className="flex space-x-2 ml-4">
                                <Link to="/login" className="text-white hover:bg-primary-600 px-3 py-2 rounded-md text-sm font-medium">เข้าสู่ระบบ</Link>
                                <Link to="/register" className="bg-white text-primary-700 hover:bg-primary-50 px-3 py-2 rounded-md text-sm font-medium">สมัครสมาชิก</Link>
                            </div>
                        )}
                    </div>

                    {/* Mobile menu button */}
                    <div className="flex items-center md:hidden">
                        <button
                            onClick={() => setIsOpen(!isOpen)}
                            className="inline-flex items-center justify-center p-2 rounded-md text-primary-100 hover:text-white hover:bg-primary-600 focus:outline-none"
                        >
                            {isOpen ? <X className="block h-6 w-6" /> : <Menu className="block h-6 w-6" />}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Menu */}
            {isOpen && (
                <div className="md:hidden bg-primary-800">
                    <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
                        {getLinks().map((link) => (
                            <Link
                                key={link.path}
                                to={link.path}
                                className="text-white hover:bg-primary-600 block px-3 py-2 rounded-md text-base font-medium"
                                onClick={() => setIsOpen(false)}
                            >
                                {link.name}
                            </Link>
                        ))}
                        {!user && (
                            <>
                                <Link to="/login" className="text-white hover:bg-primary-600 block px-3 py-2 rounded-md text-base font-medium">เข้าสู่ระบบ</Link>
                                <Link to="/register" className="text-white hover:bg-primary-600 block px-3 py-2 rounded-md text-base font-medium">สมัครสมาชิก</Link>
                            </>
                        )}
                    </div>
                    {user && (
                        <div className="pt-4 pb-3 border-t border-primary-600">
                            <div className="flex items-center px-5 gap-3">
                                <div className="h-10 w-10 border-2 border-primary-500 rounded-full bg-primary-200 flex items-center justify-center text-primary-800 font-bold text-lg">
                                    {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                                </div>
                                <div>
                                    <div className="text-base font-medium leading-none text-white mb-1">{user.name}</div>
                                    <div className="text-sm font-medium leading-none text-primary-200">{user.email} ({user.role})</div>
                                </div>
                            </div>
                            <div className="mt-3 px-2 space-y-1">
                                <button
                                    onClick={() => {
                                        setIsOpen(false);
                                        logout();
                                    }}
                                    className="w-full text-left flex items-center gap-2 text-primary-100 hover:text-white hover:bg-primary-600 px-3 py-2 rounded-md text-base font-medium"
                                >
                                    <LogOut size={20} />
                                    ออกจากระบบ
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </nav>
    );
};

export default Navbar;
