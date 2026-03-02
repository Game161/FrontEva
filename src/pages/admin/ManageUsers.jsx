import React, { useState, useEffect } from 'react';
import Swal from 'sweetalert2';
import api from '../../lib/api';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import { Pencil, Trash2 } from 'lucide-react';

const ManageUsers = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const res = await api.get('/admin/users');
            const responseData = res.data;

            if (Array.isArray(responseData)) {
                setUsers(responseData);
            } else if (responseData && Array.isArray(responseData.data)) {
                setUsers(responseData.data);
            } else {
                setUsers([]);
            }
        } catch (error) {
            console.error('Failed to fetch users:', error);
            Swal.fire('ข้อผิดพลาด', 'ไม่สามารถดึงข้อมูลผู้ใช้ได้', 'error');
            setUsers([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const handleDelete = async (id, name) => {
        const confirm = await Swal.fire({
            title: 'ยืนยันการลบ?',
            text: `คุณต้องการลบผู้ใช้ ${name} ใช่หรือไม่?`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#ed2c2c',
            cancelButtonColor: '#d33',
            confirmButtonText: 'ลบ',
            cancelButtonText: 'ยกเลิก'
        });

        if (confirm.isConfirmed) {
            try {
                await api.delete(`/admin/users/${id}`);
                Swal.fire('ลบสำเร็จ', '', 'success');
                fetchUsers();
            } catch (error) {
                Swal.fire('ลบไม่สำเร็จ', error.response?.data?.message || 'เกิดข้อผิดพลาด', 'error');
            }
        }
    };

    const getRoleBadge = (role) => {
        switch (role) {
            case 'ADMIN': return <Badge variant="danger">ผู้ดูแลระบบ</Badge>;
            case 'EVALUATOR': return <Badge variant="primary">ผู้ประเมิน</Badge>;
            case 'EVALUATEE': return <Badge variant="secondary">ผู้รับการประเมิน</Badge>;
            default: return <Badge variant="gray">{role}</Badge>;
        }
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-900">จัดการผู้ใช้งาน</h1>
            </div>

            <Card className="overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left text-gray-500">
                        <thead className="text-xs text-gray-700 uppercase bg-gray-50 border-b">
                            <tr>
                                <th className="px-6 py-3">ชื่อ-นามสกุล</th>
                                <th className="px-6 py-3">อีเมล</th>
                                <th className="px-6 py-3">บทบาท</th>
                                <th className="px-6 py-3">แผนก</th>
                                <th className="px-6 py-3 text-right">จัดการ</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan="5" className="px-6 py-4 text-center">กำลังโหลดข้อมูล...</td>
                                </tr>
                            ) : users.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="px-6 py-4 text-center text-gray-500">ไม่พบข้อมูลผู้ใช้งาน</td>
                                </tr>
                            ) : (
                                users.map((user) => (
                                    <tr key={user.id} className="bg-white border-b hover:bg-gray-50">
                                        <td className="px-6 py-4 font-medium text-gray-900 w-1/4">
                                            {user.name}
                                        </td>
                                        <td className="px-6 py-4 w-1/4">{user.email}</td>
                                        <td className="px-6 py-4 w-1/6">{getRoleBadge(user.role)}</td>
                                        <td className="px-6 py-4 w-1/6">{user.department?.name || '-'}</td>
                                        <td className="px-6 py-4 text-right flex justify-end gap-2">
                                            <button
                                                className="text-primary-600 hover:bg-primary-50 p-2 rounded-full transition-colors"
                                                title="แก้ไข"
                                            >
                                                <Pencil size={18} />
                                            </button>
                                            <button
                                                className="text-red-600 hover:bg-red-50 p-2 rounded-full transition-colors"
                                                onClick={() => handleDelete(user.id, user.name)}
                                                title="ลบ"
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
        </div>
    );
};

export default ManageUsers;
