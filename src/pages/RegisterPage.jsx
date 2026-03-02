import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Swal from 'sweetalert2';
import api from '../lib/api';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import { Activity } from 'lucide-react';

const RegisterPage = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        role: 'EVALUATEE',
        departmentId: ''
    });
    const [departments, setDepartments] = useState([]);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchDepartments = async () => {
            try {
                const res = await api.get('/system/departments');
                setDepartments(res.data);
            } catch (error) {
                if (error.response?.status !== 404) {
                    console.warn('Failed to fetch departments:', error.message);
                }
            }
        };
        fetchDepartments();
    }, []);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const submitData = { ...formData };
            if (!submitData.departmentId) delete submitData.departmentId;

            await api.post('/auth/register', submitData);

            Swal.fire({
                icon: 'success',
                title: 'สมัครสมาชิสำเร็จ',
                text: 'กรุณาเข้าสู่ระบบด้วยบัญชีที่สมัคร',
                showConfirmButton: true,
            }).then(() => {
                navigate('/login');
            });
        } catch (error) {
            Swal.fire({
                icon: 'error',
                title: 'สมัครสมาชิกไม่สำเร็จ',
                text: error.response?.data?.message || 'เกิดข้อผิดพลาดในการสมัคร'
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
            <div className="sm:mx-auto sm:w-full sm:max-w-md">
                <div className="flex justify-center text-primary-600">
                    <Activity size={48} />
                </div>
                <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
                    สมัครสมาชิกใหม่
                </h2>
            </div>

            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
                <Card className="py-8 px-4 sm:px-10">
                    <form className="space-y-6" onSubmit={handleSubmit}>
                        <Input
                            label="ชื่อ-นามสกุล"
                            id="name"
                            name="name"
                            required
                            value={formData.name}
                            onChange={handleChange}
                            placeholder="สมชาย ใจดี"
                        />

                        <Input
                            label="อีเมล"
                            id="email"
                            name="email"
                            type="email"
                            required
                            value={formData.email}
                            onChange={handleChange}
                            placeholder="you@example.com"
                        />

                        <Input
                            label="รหัสผ่าน"
                            id="password"
                            name="password"
                            type="password"
                            required
                            value={formData.password}
                            onChange={handleChange}
                            placeholder="••••••••"
                        />

                        <div className="mb-4">
                            <label htmlFor="role" className="block mb-2 text-sm font-bold text-gray-900">
                                บทบาท (Role)
                            </label>
                            <select
                                id="role"
                                name="role"
                                value={formData.role}
                                onChange={handleChange}
                                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full p-2.5"
                            >
                                <option value="EVALUATEE">ผู้รับการประเมิน (Evaluatee)</option>
                                <option value="EVALUATOR">ผู้ประเมิน (Evaluator)</option>
                            </select>
                        </div>

                        <div className="mb-6">
                            <label htmlFor="departmentId" className="block mb-2 text-sm font-bold text-gray-900">
                                แผนก (Department) ระบุถ้ามี
                            </label>
                            <select
                                id="departmentId"
                                name="departmentId"
                                value={formData.departmentId}
                                onChange={handleChange}
                                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full p-2.5"
                            >
                                <option value="">-- ไม่ระบุ --</option>
                                {departments.map((dept) => (
                                    <option key={dept.id} value={dept.id}>
                                        {dept.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <Button type="submit" variant="primary" className="w-full" disabled={loading}>
                                {loading ? 'กำลังลงทะเบียน...' : 'สมัครสมาชิก'}
                            </Button>
                        </div>
                    </form>

                    <div className="mt-6 text-center">
                        <p className="text-sm text-gray-600">
                            มีบัญชีผู้ใช้งานอยู่แล้วใช่ไหม?{' '}
                            <Link to="/login" className="font-medium text-primary-600 hover:text-primary-500">
                                เข้าสู่ระบบ
                            </Link>
                        </p>
                    </div>
                </Card>
            </div>
        </div>
    );
};

export default RegisterPage;
