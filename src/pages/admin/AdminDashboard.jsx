import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Users, Calendar, Settings, ChartBar } from 'lucide-react';
import api from '../../lib/api';
import Card from '../../components/ui/Card';

const adminLinks = [
    { title: 'ผู้ใช้งานระบบ', path: '/admin/users', icon: <Users size={32} />, bg: 'bg-primary-100', color: 'text-primary-600' },
    { title: 'รอบการประเมิน', path: '/admin/evaluations', icon: <Calendar size={32} />, bg: 'bg-secondary-100', color: 'text-secondary-600' },
    { title: 'การมอบหมาย', path: '/admin/assignments', icon: <Settings size={32} />, bg: 'bg-blue-100', color: 'text-blue-600' },
    { title: 'รายงานผล', path: '/admin/reports', icon: <ChartBar size={32} />, bg: 'bg-green-100', color: 'text-green-600' }
];

const AdminDashboard = () => {
    const [stats, setStats] = useState({
        totalEvaluations: 0,
        evaluators: 0,
        evaluatees: 0
    });

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const [evalsRes, usersRes] = await Promise.all([
                    api.get('/admin/periods'),
                    api.get('/admin/users')
                ]);

                // Handle users array extraction
                let users = [];
                if (Array.isArray(usersRes.data)) {
                    users = usersRes.data;
                } else if (usersRes.data && Array.isArray(usersRes.data.data)) {
                    users = usersRes.data.data;
                }

                // Handle periods array extraction
                let evalsCount = 0;
                if (Array.isArray(evalsRes.data)) {
                    evalsCount = evalsRes.data.length;
                } else if (evalsRes.data && Array.isArray(evalsRes.data.data)) {
                    evalsCount = evalsRes.data.data.length;
                }

                const evaluatorCount = users.filter(u => u.role === 'EVALUATOR').length;
                const evaluateeCount = users.filter(u => u.role === 'EVALUATEE').length;

                setStats({
                    totalEvaluations: evalsCount,
                    evaluators: evaluatorCount,
                    evaluatees: evaluateeCount
                });
            } catch (error) {
                console.error('Error fetching admin stats:', error);
            }
        };
        fetchStats();
    }, []);

    return (
        <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-6">แดชบอร์ดผู้ดูแลระบบ (Admin)</h1>

            {/* Stats Summary */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <Link to="/admin/evaluations">
                    <Card className="p-6 flex items-center gap-4 hover:border-primary-300 transition-colors h-full">
                        <div className="p-4 rounded-full bg-blue-100 text-blue-600">
                            <Calendar size={24} />
                        </div>
                        <div>
                            <p className="text-gray-500 text-sm font-medium">จำนวนการประเมินทั้งหมด</p>
                            <h3 className="text-2xl font-bold text-gray-900">{stats.totalEvaluations}</h3>
                        </div>
                    </Card>
                </Link>

                <Card className="p-6 flex items-center gap-4">
                    <div className="p-4 rounded-full bg-purple-100 text-purple-600">
                        <Users size={24} />
                    </div>
                    <div>
                        <p className="text-gray-500 text-sm font-medium">จำนวน EVALUATOR</p>
                        <h3 className="text-2xl font-bold text-gray-900">{stats.evaluators}</h3>
                    </div>
                </Card>

                <Card className="p-6 flex items-center gap-4">
                    <div className="p-4 rounded-full bg-green-100 text-green-600">
                        <Users size={24} />
                    </div>
                    <div>
                        <p className="text-gray-500 text-sm font-medium">จำนวน EVALUATEE</p>
                        <h3 className="text-2xl font-bold text-gray-900">{stats.evaluatees}</h3>
                    </div>
                </Card>

                <Card className="p-6 flex items-center gap-4">
                    <div className="p-4 rounded-full bg-orange-100 text-orange-600">
                        <Settings size={24} />
                    </div>
                    <div>
                        <p className="text-gray-500 text-sm font-medium">การมอบหมาย</p>
                        <h3 className="text-2xl font-bold text-gray-900">{stats.assignments}</h3>
                    </div>
                </Card>
            </div>

            <h2 className="text-xl font-bold text-gray-900 mb-4">เมนูด่วน</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {adminLinks.map((link) => (
                    <Link key={link.path} to={link.path}>
                        <Card className="p-6 hover:shadow-md transition-shadow cursor-pointer h-full flex flex-col items-center justify-center text-center gap-4 hover:border-primary-300">
                            <div className={`p-4 rounded-full ${link.bg} ${link.color}`}>
                                {link.icon}
                            </div>
                            <h3 className="font-bold text-gray-800">{link.title}</h3>
                        </Card>
                    </Link>
                ))}
            </div>
        </div>
    );
};

export default AdminDashboard;
