import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import api from '../../lib/api';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import Input from '../../components/ui/Input';
import BackButton from '../../components/ui/BackButton';
import Swal from 'sweetalert2';
import { Trash2, Edit2, Plus, GripVertical, CheckCircle, X } from 'lucide-react';

const ManageEvaluationDetails = () => {
    const { id } = useParams();
    const [evaluation, setEvaluation] = useState(null);
    const [topics, setTopics] = useState([]);
    const [loading, setLoading] = useState(true);

    // Topic Modal
    const [isTopicModalOpen, setIsTopicModalOpen] = useState(false);
    const [editingTopicId, setEditingTopicId] = useState(null);
    const [topicForm, setTopicForm] = useState({ name: '', description: '', orderIndex: 1 });

    // Indicator Inline Form State
    const [addingIndicatorToTopic, setAddingIndicatorToTopic] = useState(null); // Topic ID
    const [indicatorForm, setIndicatorForm] = useState({
        name: '',
        type: 'SCALE_1_4', // SCALE_1_4, YES_NO
        weight: '1',
        requireEvidence: true
    });

    const fetchData = async () => {
        try {
            setLoading(true);
            const res = await api.get(`/admin/periods/${id}`);

            // Mock structure handling. Adjust based on real backend API
            const evalData = res.data;
            setEvaluation(evalData);

            // Assume backend returns topics within the evaluation.
            setTopics(evalData.topics || []);
        } catch (error) {
            console.error("Failed to fetch evaluation details", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [id]);

    // ===== Topic Handlers =====
    const handleSaveTopic = async (e) => {
        e.preventDefault();
        try {
            if (editingTopicId) {
                await api.put(`/admin/topics/${editingTopicId}`, {
                    ...topicForm,
                    orderIndex: parseInt(topicForm.orderIndex)
                });
                Swal.fire({ toast: true, position: 'top-end', icon: 'success', title: 'แก้ไขหัวข้อเสร็จสิ้น', showConfirmButton: false, timer: 1500 });
            } else {
                await api.post(`/admin/periods/${id}/topics`, {
                    ...topicForm,
                    orderIndex: parseInt(topicForm.orderIndex)
                });
                Swal.fire('สำเร็จ', 'เพิ่มหัวข้อประเมินเรียบร้อย', 'success');
            }
            setIsTopicModalOpen(false);
            setTopicForm({ name: '', description: '', orderIndex: topics.length + 2 });
            setEditingTopicId(null);
            fetchData();
        } catch (error) {
            Swal.fire('ข้อผิดพลาด', 'ไม่สามารถบันทึกหัวข้อได้', 'error');
        }
    };

    const handleEditTopicClick = (t) => {
        setEditingTopicId(t.id);
        setTopicForm({ name: t.name, description: t.description || '', orderIndex: t.orderIndex || 1 });
        setIsTopicModalOpen(true);
    };

    const handleDeleteTopic = async (topicId) => {
        const result = await Swal.fire({
            title: 'ลบหัวข้อนี้?',
            text: "ตัวชี้วัดทั้งหมดภายใต้หัวข้อนี้จะถูกลบไปด้วย",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'ลบข้อมูล'
        });
        if (result.isConfirmed) {
            try {
                await api.delete(`/admin/topics/${topicId}`);
                fetchData();
                Swal.fire('ลบสำเร็จ!', '', 'success');
            } catch (error) {
                Swal.fire('ข้อผิดพลาด', 'ไม่สามารถลบหัวข้อได้', 'error');
            }
        }
    };

    // ===== Indicator Handlers =====
    const handleSaveIndicator = async (topicId) => {
        if (!indicatorForm.name.trim() || !indicatorForm.weight) {
            return Swal.fire('แจ้งเตือน', 'กรุณากรอกข้อมูลให้ครบสมบูรณ์', 'warning');
        }

        const weightVal = parseFloat(indicatorForm.weight);
        if (weightVal <= 0) return Swal.fire('แจ้งเตือน', 'น้ำหนักต้องมากกว่า 0', 'warning');

        try {
            await api.post(`/admin/topics/${topicId}/indicators`, {
                name: indicatorForm.name,
                type: indicatorForm.type,
                weight: weightVal,
                requireEvidence: indicatorForm.requireEvidence === true || indicatorForm.requireEvidence === 'true'
            });
            Swal.fire({ toast: true, position: 'top-end', icon: 'success', title: 'เพิ่มตัวชี้วัดสำเร็จ', showConfirmButton: false, timer: 1500 });

            // Reset form
            setAddingIndicatorToTopic(null);
            setIndicatorForm({ name: '', type: 'SCALE_1_4', weight: '1', requireEvidence: true });
            fetchData();
        } catch (error) {
            Swal.fire('ข้อผิดพลาด', 'ไม่สามารถบันทึกตัวชี้วัดได้', 'error');
        }
    };

    const handleDeleteIndicator = async (indId) => {
        const result = await Swal.fire({
            title: 'ลบตัวชี้วัดนี้?',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'ลบข้อมูล'
        });
        if (result.isConfirmed) {
            try {
                await api.delete(`/admin/indicators/${indId}`);
                fetchData();
            } catch (error) {
                Swal.fire('ข้อผิดพลาด', 'ไม่สามารถลบตัวชี้วัดได้', 'error');
            }
        }
    };

    if (loading) return <div className="p-8 text-center text-gray-500">กำลังโหลดข้อมูล...</div>;
    if (!evaluation) return <div className="p-8 text-center text-red-500">ไม่พบข้อมูลการประเมิน</div>;

    return (
        <div className="max-w-6xl mx-auto pb-12">
            <div className="mb-6 flex items-center justify-between">
                <BackButton to="/admin/evaluations" />
            </div>

            <Card className="mb-6 p-6 md:p-8">
                <div className="flex justify-between items-start">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 mb-2">โครงสร้างตัวชี้วัด: {evaluation.name}</h1>
                        <p className="text-gray-500 mb-4">
                            ระยะเวลา: {evaluation.startAt ? new Date(evaluation.startAt).toLocaleDateString() : '-'} - {evaluation.endAt ? new Date(evaluation.endAt).toLocaleDateString() : '-'}
                        </p>
                    </div>
                    <Button
                        onClick={() => {
                            setEditingTopicId(null);
                            setTopicForm({ name: '', description: '', orderIndex: topics.length + 1 });
                            setIsTopicModalOpen(true);
                        }}
                    >
                        + เพิ่มหัวข้อใหม่
                    </Button>
                </div>
            </Card>

            {topics.length === 0 ? (
                <div className="text-center p-12 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200 text-gray-500">
                    ยังไม่มีหัวข้อการประเมิน กรุณาเพิ่มหัวข้อเพื่อเริ่มต้นสร้างตัวชี้วัด
                </div>
            ) : (
                topics.map((topic, tIdx) => (
                    <Card key={topic.id} className="mb-8 overflow-hidden border border-gray-200 shadow-sm">
                        <div className="bg-primary-50 p-4 border-b border-primary-100 flex justify-between items-center group">
                            <div>
                                <h2 className="text-lg font-bold text-primary-900">หัวข้อที่ {topic.orderIndex || tIdx + 1}: {topic.name}</h2>
                                {topic.description && <p className="text-sm text-primary-700 mt-1">{topic.description}</p>}
                            </div>
                            <div className="flex gap-2">
                                <button onClick={() => handleEditTopicClick(topic)} className="p-2 text-primary-600 hover:bg-primary-100 rounded transition-colors" title="แก้ไขหัวข้อ">
                                    <Edit2 size={18} />
                                </button>
                                <button onClick={() => handleDeleteTopic(topic.id)} className="p-2 text-red-500 hover:bg-red-50 rounded transition-colors" title="ลบหัวข้อ">
                                    <Trash2 size={18} />
                                </button>
                            </div>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left">
                                <thead className="text-xs text-gray-600 bg-gray-50 border-b">
                                    <tr>
                                        <th className="px-4 py-3 w-16 text-center">ลำดับ</th>
                                        <th className="px-4 py-3 w-1/3">ชื่อตัวชี้วัด</th>
                                        <th className="px-4 py-3 w-32">ประเภท</th>
                                        <th className="px-4 py-3 w-24 text-center">น้ำหนัก</th>
                                        <th className="px-4 py-3 w-32 text-center">หลักฐาน</th>
                                        <th className="px-4 py-3 w-28 text-center text-primary-600 border-l border-gray-200">จัดการ</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200 align-middle">
                                    {topic.indicators && topic.indicators.length > 0 ? (
                                        topic.indicators.map((ind, iIdx) => (
                                            <tr key={ind.id} className="hover:bg-gray-50">
                                                <td className="px-4 py-3 text-center text-gray-500">{iIdx + 1}</td>
                                                <td className="px-4 py-3 font-medium text-gray-900">{ind.name}</td>
                                                <td className="px-4 py-3">
                                                    <Badge variant={ind.type === 'SCALE_1_4' ? 'primary' : 'success'}>
                                                        {ind.type === 'SCALE_1_4' ? 'ระดับ 1-4' : 'ผ่าน/ไม่ผ่าน'}
                                                    </Badge>
                                                </td>
                                                <td className="px-4 py-3 text-center">{ind.weight}</td>
                                                <td className="px-4 py-3 text-center">
                                                    {ind.requireEvidence ? (
                                                        <span className="text-amber-600 text-xs font-bold flex items-center justify-center gap-1">
                                                            <CheckCircle size={12} /> ข้อมูลต้องแนบ
                                                        </span>
                                                    ) : '-'}
                                                </td>
                                                <td className="px-4 py-3 text-center border-l border-gray-200">
                                                    <button onClick={() => handleDeleteIndicator(ind.id)} className="text-red-500 hover:bg-red-50 p-1.5 rounded" title="ลบตัวชี้วัด">
                                                        <Trash2 size={16} />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr><td colSpan="6" className="px-4 py-6 text-center text-gray-400 italic">ยังไม่มีตัวชี้วัดในหัวข้อนี้</td></tr>
                                    )}

                                    {/* Inline Add Indicator Form Row */}
                                    {addingIndicatorToTopic === topic.id ? (
                                        <tr className="bg-blue-50/50">
                                            <td className="px-4 py-3 text-center text-gray-400"><Plus size={16} className="mx-auto" /></td>
                                            <td className="px-4 py-3">
                                                <Input
                                                    placeholder="กรอกชื่อตัวชี้วัด..."
                                                    value={indicatorForm.name}
                                                    onChange={(e) => setIndicatorForm({ ...indicatorForm, name: e.target.value })}
                                                    className="w-full text-sm py-1.5 bg-white"
                                                    autoFocus
                                                />
                                            </td>
                                            <td className="px-4 py-3">
                                                <select
                                                    className="bg-white border border-gray-300 text-gray-900 text-sm rounded-md focus:ring-primary-500 focus:border-primary-500 block w-full p-1.5"
                                                    value={indicatorForm.type}
                                                    onChange={(e) => setIndicatorForm({ ...indicatorForm, type: e.target.value })}
                                                >
                                                    <option value="SCALE_1_4">ระดับ 1-4</option>
                                                    <option value="YES_NO">ผ่าน/ไม่ผ่าน</option>
                                                </select>
                                            </td>
                                            <td className="px-4 py-3">
                                                <Input
                                                    type="number"
                                                    step="0.1"
                                                    min="0.1"
                                                    value={indicatorForm.weight}
                                                    onChange={(e) => setIndicatorForm({ ...indicatorForm, weight: e.target.value })}
                                                    className="w-full text-sm py-1.5 text-center bg-white"
                                                />
                                            </td>
                                            <td className="px-4 py-3 text-center">
                                                <select
                                                    className="bg-white border border-gray-300 text-gray-900 text-xs rounded-md focus:ring-primary-500 focus:border-primary-500 block w-full p-1.5"
                                                    value={indicatorForm.requireEvidence}
                                                    onChange={(e) => setIndicatorForm({ ...indicatorForm, requireEvidence: e.target.value === 'true' })}
                                                >
                                                    <option value="true">ต้องการ</option>
                                                    <option value="false">ไม่ต้องการ</option>
                                                </select>
                                            </td>
                                            <td className="px-4 py-2 text-center border-l bg-white">
                                                <div className="flex justify-center flex-col gap-1 items-center">
                                                    <Button variant="primary" className="px-2 py-1 text-xs w-full" onClick={() => handleSaveIndicator(topic.id)}>บันทึก</Button>
                                                    <button className="text-xs text-gray-500 hover:text-gray-700 underline" onClick={() => setAddingIndicatorToTopic(null)}>ยกเลิก</button>
                                                </div>
                                            </td>
                                        </tr>
                                    ) : (
                                        <tr>
                                            <td colSpan="6" className="p-0 border-t border-dashed border-gray-200 bg-gray-50">
                                                <button
                                                    onClick={() => setAddingIndicatorToTopic(topic.id)}
                                                    className="w-full py-3 text-sm font-medium text-primary-600 hover:bg-primary-50 transition-colors flex justify-center items-center gap-2"
                                                >
                                                    <Plus size={16} /> แทรกข้อมูลตัวชี้วัด (Indicator) ใหม่ในแถวนี้
                                                </button>
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </Card>
                ))
            )}

            {/* Topic Form Modal */}
            {isTopicModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
                    <Card className="w-full max-w-md p-6 relative animate-in zoom-in-95">
                        <button
                            onClick={() => setIsTopicModalOpen(false)}
                            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
                        >
                            <X size={20} />
                        </button>
                        <h2 className="text-xl font-bold text-gray-900 mb-6">
                            {editingTopicId ? 'แก้ไขหัวข้อประเมิน' : 'สร้างหัวข้อประเมินใหม่'}
                        </h2>

                        <form onSubmit={handleSaveTopic} className="space-y-4">
                            <Input
                                label="ชื่อหัวข้อ (Topic)"
                                required
                                value={topicForm.name}
                                onChange={(e) => setTopicForm({ ...topicForm, name: e.target.value })}
                                placeholder="เช่น การทำงานร่วมกับผู้อื่น"
                            />
                            <Input
                                label="คำอธิบาย (ทางเลือก)"
                                value={topicForm.description}
                                onChange={(e) => setTopicForm({ ...topicForm, description: e.target.value })}
                                placeholder="รายละเอียดเพิ่มเติม"
                            />
                            <Input
                                label="ลำดับที่"
                                type="number"
                                min="1"
                                required
                                value={topicForm.orderIndex}
                                onChange={(e) => setTopicForm({ ...topicForm, orderIndex: e.target.value })}
                            />

                            <div className="pt-4 flex gap-3 justify-end">
                                <Button variant="outline" type="button" onClick={() => setIsTopicModalOpen(false)}>ยกเลิก</Button>
                                <Button type="submit">บันทึกหัวข้อ</Button>
                            </div>
                        </form>
                    </Card>
                </div>
            )}
        </div>
    );
};

export default ManageEvaluationDetails;
