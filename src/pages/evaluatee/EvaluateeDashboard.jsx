import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../lib/api';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';

const EvaluateeDashboard = () => {
    const [myEvals, setMyEvals] = useState([]);

    useEffect(() => {
        const fetchMyEvals = async () => {
            try {
                const res = await api.get('/me/evaluation');
                const data = res.data;
                // Ensure data is always an array
                if (Array.isArray(data)) {
                    setMyEvals(data);
                } else if (data && Array.isArray(data.data)) {
                    setMyEvals(data.data); // in case backend wraps it in { data: [...] }
                } else {
                    setMyEvals([]);
                }
            } catch (error) {
                console.error("Failed to fetch my evaluations", error);
            }
        };
        fetchMyEvals();
    }, []);

    return (
        <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-6">การประเมินของฉัน</h1>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {myEvals.length === 0 ? (
                    <div className="col-span-full">
                        <Card className="p-8 text-center text-gray-500">
                            ไม่มีรอบการประเมินที่กำลังดำเนินการ
                        </Card>
                    </div>
                ) : (
                    myEvals.map(assign => (
                        <Card key={assign.id} className="p-6">
                            <h3 className="font-bold text-lg text-primary-900 mb-2">{assign.evaluation.name}</h3>
                            <div className="flex justify-between items-center text-sm mb-4">
                                <span className="text-gray-500">ผู้ประเมิน: {assign.evaluator.name}</span>
                                <Badge variant={assign.evaluation.status === 'OPEN' ? 'success' : 'gray'}>
                                    {assign.evaluation.status}
                                </Badge>
                            </div>
                            <Link
                                to={`/me/evaluations/${assign.id}`}
                                className="w-full text-center block bg-primary-50 text-primary-700 hover:bg-primary-100 py-2 rounded-lg font-medium transition-colors"
                            >
                                ดูรายละเอียด / อัปโหลดหลักฐาน
                            </Link>
                        </Card>
                    ))
                )}
            </div>
        </div>
    );
};
export default EvaluateeDashboard;
