import React, { useState, useEffect } from 'react';
import api from '../../lib/api';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import Swal from 'sweetalert2';
import { Trash2, UserPlus, X } from 'lucide-react';

const ManageAssignments = () => {
    const [assignments, setAssignments] = useState([]);
    const [evaluations, setEvaluations] = useState([]);
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);

    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [formData, setFormData] = useState({
        evaluationId: '',
        evaluatorId: '',
        evaluateeId: ''
    });

    const fetchData = async () => {
        try {
            setLoading(true);
            const [assignRes, evalRes, userRes] = await Promise.all([
                api.get('/admin/assignments'),
                api.get('/admin/periods'),
                api.get('/admin/users')
            ]);
            const assignData = Array.isArray(assignRes.data) ? assignRes.data : (assignRes.data?.data || []);
            const evalData = Array.isArray(evalRes.data) ? evalRes.data : (evalRes.data?.data || []);
            const userData = Array.isArray(userRes.data) ? userRes.data : (userRes.data?.data || []);

            setAssignments(assignData);
            setEvaluations(evalData.filter(e => e.status !== 'CLOSED')); // Only active evals
            setUsers(userData);
        } catch (error) {
            console.error("Failed to fetch assignment data", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const evaluators = users.filter(u => u.role === 'EVALUATOR');
    const evaluatees = users.filter(u => u.role === 'EVALUATEE');

    const handleAssign = async (e) => {
        e.preventDefault();
        if (!formData.evaluationId || !formData.evaluatorId || !formData.evaluateeId) {
            return Swal.fire('แจ้งเตือน', 'กรุณาเลือกข้อมูลให้ครบถ้วน', 'warning');
        }

        try {
            await api.post('/admin/assignments', formData);
            Swal.fire({ toast: true, position: 'top-end', icon: 'success', title: 'จับคู่การประเมินสำเร็จ', showConfirmButton: false, timer: 1500 });
            setIsModalOpen(false);
            setFormData({ evaluationId: '', evaluatorId: '', evaluateeId: '' });
            fetchData();
        } catch (error) {
            Swal.fire('ข้อผิดพลาด', error.response?.data?.message || 'ไม่สามารถจับคู่การประเมินได้', 'error');
        }
    };

    const handleDelete = async (id) => {
        const result = await Swal.fire({
            title: 'ยกเลิกการจับคู่นี้?',
            text: "หากลบแล้วข้อมูลการประเมินที่เกี่ยวข้องอาจสาบสูญ",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'ยกเลิกจับคู่'
        });

        if (result.isConfirmed) {
            try {
                await api.delete(`/admin/assignments/${id}`);
                Swal.fire('ลบสำเร็จ!', '', 'success');
                fetchData();
            } catch (error) {
                Swal.fire('ข้อผิดพลาด', 'ไม่สามารถยกเลิกจับคู่ได้', 'error');
            }
        }
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">จัดการหน้าจับคู่การประเมิน</h1>
                    <p className="text-gray-500 mt-1">จับคู่ผู้ประเมิน และผู้รับการประเมิน ตามรอบการประเมินที่กำหนด</p>
                </div>
                <Button onClick={() => setIsModalOpen(true)} className="flex items-center gap-2">
                    <UserPlus size={18} /> มอบหมายผู้ประเมิน
                </Button>
            </div>

            <Card className="mb-6">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="text-xs text-gray-700 uppercase bg-gray-50 border-b">
                            <tr>
                                <th className="px-6 py-3 w-16 text-center">ลำดับ</th>
                                <th className="px-6 py-3">ชื่อแบบประเมิน</th>
                                <th className="px-6 py-3">ผู้รับการประเมิน (Evaluatee)</th>
                                <th className="px-6 py-3">ผู้ประเมิน (Evaluator)</th>
                                <th className="px-6 py-3 text-center">จัดการ</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr><td colSpan="5" className="px-6 py-8 text-center text-gray-500">กำลังโหลดข้อมูล...</td></tr>
                            ) : assignments.length === 0 ? (
                                <tr><td colSpan="5" className="px-6 py-8 text-center text-gray-500 hover:bg-gray-50">ยังไม่มีการจับคู่การประเมินในระบบ</td></tr>
                            ) : (
                                assignments.map((a, idx) => (
                                    <tr key={a.id} className="border-b hover:bg-gray-50">
                                        <td className="px-6 py-4 text-center text-gray-500">{idx + 1}</td>
                                        <td className="px-6 py-4">
                                            <div className="font-medium text-gray-900">{a.evaluation?.name || 'ไม่ระบุ'}</div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <Badge variant="primary">รับการประเมิน</Badge>
                                                <span className="font-medium">{a.evaluatee?.name || 'ไม่พบผู้ใช้'}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <Badge variant="gray">ผู้ประเมิน</Badge>
                                                <span>{a.evaluator?.name || 'ไม่พบผู้ใช้'}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <button
                                                className="text-red-500 hover:bg-red-50 p-2 rounded transition-colors"
                                                title="ยกเลิกจับคู่"
                                                onClick={() => handleDelete(a.id)}
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </Card>

            {/* Modal for Creating Assignment */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
                    <Card className="w-full max-w-lg p-6 relative animate-in zoom-in-95">
                        <button
                            onClick={() => setIsModalOpen(false)}
                            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
                        >
                            <X size={20} />
                        </button>
                        <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                            <UserPlus size={24} className="text-primary-600" />
                            เพิ่มข้อมูลการจับคู่ประเมิน (Assignment)
                        </h2>

                        <form onSubmit={handleAssign} className="space-y-5">
                            <div>
                                <label className="block mb-2 text-sm font-bold text-gray-900">รอบการประเมิน</label>
                                <select
                                    className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full p-2.5"
                                    value={formData.evaluationId}
                                    onChange={(e) => setFormData({ ...formData, evaluationId: e.target.value })}
                                    required
                                >
                                    <option value="">-- เลือกรอบการประเมิน --</option>
                                    {evaluations.map(ev => (
                                        <option key={ev.id} value={ev.id}>{ev.name}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block mb-2 text-sm font-bold text-gray-900">ผู้รับการประเมิน (Evaluatee)</label>
                                    <select
                                        className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full p-2.5"
                                        value={formData.evaluateeId}
                                        onChange={(e) => setFormData({ ...formData, evaluateeId: e.target.value })}
                                        required
                                    >
                                        <option value="">-- เลือกผู้รับการประเมิน --</option>
                                        {evaluatees.map(u => (
                                            <option key={u.id} value={u.id}>{u.name}</option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block mb-2 text-sm font-bold text-gray-900">ผู้ประเมิน (Evaluator)</label>
                                    <select
                                        className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full p-2.5"
                                        value={formData.evaluatorId}
                                        onChange={(e) => setFormData({ ...formData, evaluatorId: e.target.value })}
                                        required
                                    >
                                        <option value="">-- เลือกผู้ประเมิน --</option>
                                        {evaluators.map(u => (
                                            <option key={u.id} value={u.id}>{u.name}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div className="pt-4 flex gap-3 justify-end border-t border-gray-100 mt-6">
                                <Button variant="outline" type="button" onClick={() => setIsModalOpen(false)}>ยกเลิก</Button>
                                <Button type="submit">บันทึกจับคู่</Button>
                            </div>
                        </form>
                    </Card>
                </div>
            )}
        </div>
    );
};
export default ManageAssignments;
