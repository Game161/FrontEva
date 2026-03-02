import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../lib/api';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import Input from '../../components/ui/Input';
import Swal from 'sweetalert2';
import { Edit2, Trash2, Eye, X } from 'lucide-react';

const ManageEvaluations = () => {
    const [evaluations, setEvaluations] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [newEval, setNewEval] = useState({ name: '', startAt: '', endAt: '' });

    // Inline Edit State
    const [editingId, setEditingId] = useState(null);
    const [editFormData, setEditFormData] = useState({ name: '', startAt: '', endAt: '' });

    const fetchEvals = async () => {
        try {
            setLoading(true);
            const res = await api.get('/admin/periods');
            const evalData = Array.isArray(res.data) ? res.data : (res.data?.data || []);
            setEvaluations(evalData);
        } catch (error) {
            console.error("Failed to fetch evaluations", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchEvals();
    }, []);

    // Add Evaluation
    const handleAddSubmit = async (e) => {
        e.preventDefault();
        try {
            await api.post('/admin/periods', newEval);
            Swal.fire('สำเร็จ', 'เพิ่มรอบการประเมินใหม่เรียบร้อยแล้ว', 'success');
            setIsModalOpen(false);
            setNewEval({ name: '', startAt: '', endAt: '' });
            fetchEvals();
        } catch (error) {
            Swal.fire('ข้อผิดพลาด', 'ไม่สามารถเพิ่มรอบการประเมินได้', 'error');
        }
    };

    // Delete Evaluation
    const handleDelete = async (id) => {
        const result = await Swal.fire({
            title: 'ยืนยันการลบ?',
            text: "คุณต้องการลบรอบการประเมินนี้ใช่หรือไม่?",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'ลบข้อมูล',
            cancelButtonText: 'ยกเลิก'
        });

        if (result.isConfirmed) {
            try {
                await api.delete(`/admin/periods/${id}`);
                Swal.fire('ลบสำเร็จ!', 'ข้อมูลถูกลบเรียบร้อยแล้ว', 'success');
                fetchEvals();
            } catch (error) {
                Swal.fire('ข้อผิดพลาด', 'ไม่สามารถลบข้อมูลได้', 'error');
            }
        }
    };

    // Handle Inline Edit Start
    const handleEditClick = (ev) => {
        setEditingId(ev.id);
        setEditFormData({
            name: ev.name,
            startAt: ev.startAt ? new Date(ev.startAt).toISOString().split('T')[0] : '',
            endAt: ev.endAt ? new Date(ev.endAt).toISOString().split('T')[0] : ''
        });
    };

    // Handle Inline Edit Submit
    const handleEditSubmit = async (id) => {
        try {
            await api.put(`/admin/periods/${id}`, editFormData);
            setEditingId(null);
            fetchEvals();
            Swal.fire({ toast: true, position: 'top-end', icon: 'success', title: 'แก้ไขข้อมูลสำเร็จ', showConfirmButton: false, timer: 1500 });
        } catch (error) {
            Swal.fire('ข้อผิดพลาด', 'ไม่สามารถแก้ไขข้อมูลได้', 'error');
        }
    };


    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-900">จัดการการประเมิน</h1>
                <Button onClick={() => setIsModalOpen(true)}>สร้างรอบการประเมินใหม่</Button>
            </div>
            <Card>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left text-gray-500">
                        <thead className="text-xs text-gray-700 uppercase bg-gray-50 border-b">
                            <tr>
                                <th className="px-6 py-3 w-16 text-center">ลำดับที่</th>
                                <th className="px-6 py-3 w-1/3">ชื่อแบบประเมิน</th>
                                <th className="px-6 py-3">วันเปิดประเมิน</th>
                                <th className="px-6 py-3">วันปิดประเมิน</th>
                                <th className="px-6 py-3">สถานะ</th>
                                <th className="px-6 py-3 text-center">จัดการ</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr><td colSpan="6" className="px-6 py-4 text-center">กำลังโหลด...</td></tr>
                            ) : evaluations.length === 0 ? (
                                <tr><td colSpan="6" className="px-6 py-4 text-center">ไม่มีข้อมูล</td></tr>
                            ) : (
                                evaluations.map((ev, index) => (
                                    <tr key={ev.id} className="border-b hover:bg-gray-50">
                                        <td className="px-6 py-4 text-center font-medium">{index + 1}</td>

                                        {/* Inline Edit Form */}
                                        {editingId === ev.id ? (
                                            <>
                                                <td className="px-4 py-2">
                                                    <Input
                                                        value={editFormData.name}
                                                        onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                                                        className="w-full text-sm py-1"
                                                    />
                                                </td>
                                                <td className="px-4 py-2">
                                                    <Input
                                                        type="date"
                                                        value={editFormData.startAt}
                                                        onChange={(e) => setEditFormData({ ...editFormData, startAt: e.target.value })}
                                                        className="w-full text-sm py-1"
                                                    />
                                                </td>
                                                <td className="px-4 py-2">
                                                    <Input
                                                        type="date"
                                                        value={editFormData.endAt}
                                                        onChange={(e) => setEditFormData({ ...editFormData, endAt: e.target.value })}
                                                        className="w-full text-sm py-1"
                                                    />
                                                </td>
                                                <td className="px-6 py-4">
                                                    <Badge variant={ev.status === 'OPEN' ? 'success' : 'gray'}>{ev.status}</Badge>
                                                </td>
                                                <td className="px-4 py-2 text-center">
                                                    <div className="flex justify-center gap-2">
                                                        <Button variant="primary" className="px-3 py-1 text-xs" onClick={() => handleEditSubmit(ev.id)}>บันทึก</Button>
                                                        <Button variant="outline" className="px-3 py-1 text-xs text-gray-500" onClick={() => setEditingId(null)}>ยกเลิก</Button>
                                                    </div>
                                                </td>
                                            </>
                                        ) : (
                                            /* Normal Display View */
                                            <>
                                                <td className="px-6 py-4 font-medium text-gray-900">{ev.name}</td>
                                                <td className="px-6 py-4">{ev.startAt ? new Date(ev.startAt).toLocaleDateString('th-TH') : '-'}</td>
                                                <td className="px-6 py-4">{ev.endAt ? new Date(ev.endAt).toLocaleDateString('th-TH') : '-'}</td>
                                                <td className="px-6 py-4">
                                                    <Badge variant={ev.status === 'OPEN' ? 'success' : 'gray'}>{ev.status}</Badge>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex justify-center items-center gap-3">
                                                        <button title="ดูรายละเอียด / แก้ไขหัวข้อ" className="text-blue-600 hover:text-blue-800" onClick={() => navigate(`/admin/evaluations/${ev.id}`)}>
                                                            <Eye size={18} />
                                                        </button>
                                                        <button title="แก้ไข" className="text-amber-500 hover:text-amber-700" onClick={() => handleEditClick(ev)}>
                                                            <Edit2 size={18} />
                                                        </button>
                                                        <button title="ลบ" className="text-red-600 hover:text-red-800" onClick={() => handleDelete(ev.id)}>
                                                            <Trash2 size={18} />
                                                        </button>
                                                    </div>
                                                </td>
                                            </>
                                        )}
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </Card>

            {/* Modal for Adding New Evaluation */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
                    <Card className="w-full max-w-md p-6 relative animate-in zoom-in-95">
                        <button
                            onClick={() => setIsModalOpen(false)}
                            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
                        >
                            <X size={20} />
                        </button>
                        <h2 className="text-xl font-bold text-gray-900 mb-6">สร้างรอบการประเมินใหม่</h2>

                        <form onSubmit={handleAddSubmit} className="space-y-4">
                            <Input
                                label="ชื่อแบบประเมิน"
                                required
                                value={newEval.name}
                                onChange={(e) => setNewEval({ ...newEval, name: e.target.value })}
                                placeholder="เช่น การประเมินผลประจำปี 2568"
                            />
                            <div className="grid grid-cols-2 gap-4">
                                <Input
                                    label="วันเปิดประเมิน"
                                    type="date"
                                    required
                                    value={newEval.startAt}
                                    onChange={(e) => setNewEval({ ...newEval, startAt: e.target.value })}
                                />
                                <Input
                                    label="วันปิดประเมิน"
                                    type="date"
                                    required
                                    value={newEval.endAt}
                                    onChange={(e) => setNewEval({ ...newEval, endAt: e.target.value })}
                                />
                            </div>

                            <div className="pt-4 flex gap-3 justify-end">
                                <Button variant="outline" type="button" onClick={() => setIsModalOpen(false)}>ยกเลิก</Button>
                                <Button type="submit">บันทึก</Button>
                            </div>
                        </form>
                    </Card>
                </div>
            )}
        </div>
    );
};
export default ManageEvaluations;
