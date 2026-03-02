import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../lib/api';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import { PenTool } from 'lucide-react';

const EvaluatorDashboard = () => {
    const [assignments, setAssignments] = useState([]);

    useEffect(() => {
        const fetchAssignments = async () => {
            try {
                const res = await api.get('/evaluator/assignments');
                const responseData = res.data;

                // The backend list controller returns { data: [...], meta: {...} }
                if (Array.isArray(responseData)) {
                    setAssignments(responseData);
                } else if (responseData && Array.isArray(responseData.data)) {
                    setAssignments(responseData.data);
                } else {
                    setAssignments([]);
                }
            } catch (error) {
                console.error("Failed to fetch evaluator assignments", error);
                setAssignments([]);
            }
        };
        fetchAssignments();
    }, []);

    return (
        <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-6">แดชบอร์ดผู้ประเมิน</h1>

            <Card>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left text-gray-500">
                        <thead className="text-xs text-gray-700 uppercase bg-gray-50 border-b">
                            <tr>
                                <th className="px-6 py-3">การประเมิน</th>
                                <th className="px-6 py-3">ผู้รับการประเมิน</th>
                                <th className="px-6 py-3">แผนก</th>
                                <th className="px-6 py-3">สถานะ</th>
                                <th className="px-6 py-3 text-right">จัดการ</th>
                            </tr>
                        </thead>
                        <tbody>
                            {assignments.length === 0 ? (
                                <tr><td colSpan="5" className="px-6 py-4 text-center">ยังไม่มีรายชื่อผู้รับการประเมิน</td></tr>
                            ) : (
                                assignments.map(a => (
                                    <tr key={a.id} className="border-b">
                                        <td className="px-6 py-4 font-medium text-gray-900">{a.evaluation.name}</td>
                                        <td className="px-6 py-4">{a.evaluatee.name}</td>
                                        <td className="px-6 py-4">{a.evaluatee.department?.name || '-'}</td>
                                        <td className="px-6 py-4">
                                            {/* Assuming there's some completion logic, we placeholder it */}
                                            <Badge variant="warning">รอการประเมิน</Badge>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <Link
                                                to={`/evaluator/assignment/${a.id}/result`}
                                                className="text-primary-600 hover:text-primary-800 flex items-center justify-end gap-1 w-full font-medium"
                                            >
                                                <PenTool size={16} /> ประเมิน
                                            </Link>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </Card>
        </div>
    );
};
export default EvaluatorDashboard;
