import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import api from '../../lib/api';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import BackButton from '../../components/ui/BackButton';
import Swal from 'sweetalert2';
import { FileUp, Eye, CheckCircle, UploadCloud, DownloadCloud } from 'lucide-react';

const EvaluateeDetails = () => {
    const { id } = useParams();
    const [assignment, setAssignment] = useState(null);
    const [topics, setTopics] = useState([]);
    const [evidenceList, setEvidenceList] = useState([]);
    const [activeTab, setActiveTab] = useState(1);
    const [loading, setLoading] = useState(true);
    const [uploadingId, setUploadingId] = useState(null);

    useEffect(() => {
        let isMounted = true;

        const fetchEvalData = async () => {
            try {
                setLoading(true);
                // Fetch Evaluatee assignment details and the associated topics structure
                const resAssign = await api.get(`/me/evaluation/${id}`).catch(() => ({ data: null }));

                // Also fetch all evidence related to this user 
                const resEvidence = await api.get(`/me/evidence`).catch(() => ({ data: [] }));

                if (isMounted) {
                    const data = resAssign.data;
                    setAssignment(data);

                    if (data && data.evaluation) {
                        setTopics(data.evaluation.topics || []);
                    }

                    setEvidenceList(resEvidence.data || []);
                }
            } catch (error) {
                console.error("Failed to fetch assignment details", error);
                if (isMounted) Swal.fire('ข้อผิดพลาด', 'ไม่สามารถโหลดข้อมูลการประเมินได้', 'error');
            } finally {
                if (isMounted) setLoading(false);
            }
        };
        fetchEvalData();
        return () => { isMounted = false };
    }, [id]);

    const handleEvidenceUpload = async (indicatorId, file) => {
        if (!file) return;

        // Basic validation
        if (file.size > 10 * 1024 * 1024) { // 10MB Limit
            return Swal.fire('ข้อผิดพลาด', 'กรุณาอัปโหลดไฟล์ขนาดไม่เกิน 10MB', 'warning');
        }

        const formData = new FormData();
        formData.append('file', file);
        formData.append('indicatorId', indicatorId);

        try {
            setUploadingId(indicatorId);
            const res = await api.post('/me/evidence', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });

            // Update local evidence list
            setEvidenceList(prev => {
                const existingIndex = prev.findIndex(e => e.id === res.data.id || e.indicatorId === indicatorId);
                if (existingIndex >= 0) {
                    const newList = [...prev];
                    newList[existingIndex] = res.data;
                    return newList;
                }
                return [...prev, res.data];
            });

            Swal.fire({
                icon: 'success',
                title: 'สำเร็จ',
                text: 'อัปโหลดหลักฐานเรียบร้อยแล้ว',
                timer: 1500,
                showConfirmButton: false
            });
        } catch (error) {
            console.error('Upload Error:', error);
            Swal.fire('ข้อผิดพลาด', 'ไม่สามารถอัปโหลดไฟล์ได้', 'error');
        } finally {
            setUploadingId(null);
        }
    };

    const handleEvidenceDelete = async (evidenceId) => {
        const result = await Swal.fire({
            title: 'ยืนยันการลบ?',
            text: "คุณต้องการลบเอกสารหลักฐานนี้ใช่หรือไม่",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'ใช่, ลบเลย!',
            cancelButtonText: 'ยกเลิก'
        });

        if (result.isConfirmed) {
            try {
                await api.delete(`/me/evidence/${evidenceId}`);
                setEvidenceList(prev => prev.filter(e => e.id !== evidenceId));
                Swal.fire({
                    icon: 'success',
                    title: 'ลบสำเร็จ',
                    showConfirmButton: false,
                    timer: 1500
                });
            } catch (error) {
                console.error("Delete Error", error);
                Swal.fire('ข้อผิดพลาด', 'ไม่สามารถลบไฟล์ได้', 'error');
            }
        }
    };

    if (loading) return <div className="p-8 text-center text-gray-500">กำลังโหลด...</div>;
    if (!assignment) return <div className="p-8 text-center text-red-500">ไม่พบข้อมูล</div>;

    const isCompleted = assignment.status === 'COMPLETED';

    // Calculate generic progress for demo purposes in Results tab
    const totalIndicators = topics.reduce((acc, t) => acc + t.indicators.length, 0);
    const filledIndicators = assignment.results ? assignment.results.length : totalIndicators; // Mock complete if no results yet in mock mode
    const progressPercent = totalIndicators === 0 ? 0 : Math.round((filledIndicators / totalIndicators) * 100);
    const scorePercent = 85.50; // Mock total score %

    return (
        <div className="max-w-6xl mx-auto pb-12">
            <div className="mb-6">
                <BackButton to="/me" />
            </div>

            <Card className="mb-6 p-6 md:p-8 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-10">
                    <Eye size={100} />
                </div>
                <div className="relative z-10 flex flex-col md:flex-row justify-between md:items-center gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 mb-2">{assignment.evaluation?.name}</h1>
                        <p className="text-gray-600">ผู้ประเมิน: <span className="font-medium text-gray-900">{assignment.evaluator?.name}</span></p>
                        <p className="text-sm text-gray-500 mt-1">
                            ระยะเวลา: {new Date(assignment.evaluation?.startAt).toLocaleDateString('th-TH')} - {new Date(assignment.evaluation?.endAt).toLocaleDateString('th-TH')}
                        </p>
                    </div>
                    <div>
                        <Badge variant={isCompleted ? 'success' : 'warning'} className="text-base px-4 py-2">
                            {isCompleted ? 'ประเมินเสร็จสิ้น' : 'อยู่ระหว่างการดำเนินการ'}
                        </Badge>
                    </div>
                </div>
            </Card>

            {/* Tabs */}
            <div className="flex border-b border-gray-200 mb-6">
                <button
                    className={`py-3 px-6 font-medium text-sm transition-colors border-b-2 ${activeTab === 1 ? 'border-primary-600 text-primary-700' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
                    onClick={() => setActiveTab(1)}
                >
                    1. รายละเอียดและแนบหลักฐาน
                </button>
                <button
                    className={`py-3 px-6 font-medium text-sm transition-colors border-b-2 flex items-center gap-2 ${activeTab === 2 ? 'border-primary-600 text-primary-700' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'} ${!isCompleted && 'opacity-50 cursor-not-allowed'}`}
                    onClick={() => isCompleted && setActiveTab(2)}
                    disabled={!isCompleted}
                    title={!isCompleted ? "สามารถดูได้เมื่อผู้ประเมินให้คะแนนครบทุกข้อแล้ว" : ""}
                >
                    2. ผลการประเมิน {!isCompleted && <span className="text-xs font-normal text-gray-400">(รอสรุปผล 100%)</span>}
                </button>
            </div>

            {/* Tab 1: Indicator Details & Evidence Upload */}
            {activeTab === 1 && (
                <div className="space-y-8">
                    {topics.map((topic, tIdx) => (
                        <Card key={topic.id} className="overflow-hidden border border-gray-200 shadow-sm">
                            <div className="bg-gray-50 p-4 border-b border-gray-200">
                                <h2 className="text-xl font-bold text-gray-800">ส่วนที่ {tIdx + 1}: {topic.name}</h2>
                            </div>
                            <div className="p-4 space-y-6">
                                {topic.indicators.map((ind, iIdx) => {
                                    // Find if there is evidence for this indicator
                                    const indEvidence = evidenceList.find(e => e.indicatorId === ind.id);

                                    return (
                                        <div key={ind.id} className="flex flex-col md:flex-row gap-6 p-4 rounded-lg border border-gray-100 bg-white">
                                            <div className="flex-1">
                                                <h3 className="font-bold text-gray-800 text-lg mb-2">{tIdx + 1}.{iIdx + 1} {ind.name}</h3>
                                                <div className="flex gap-2">
                                                    <Badge variant={ind.type === 'SCALE_1_4' ? 'primary' : 'success'}>
                                                        {ind.type === 'SCALE_1_4' ? 'ระดับ 1-4' : 'ผ่าน/ไม่ผ่าน'}
                                                    </Badge>
                                                    <Badge variant="gray">น้ำหนัก {ind.weight || 1}</Badge>
                                                </div>
                                            </div>
                                            <div className="w-full md:w-1/3 min-w-[300px] border-l md:border-l-2 border-gray-100 md:pl-6">
                                                {ind.requireEvidence ? (
                                                    <div className="space-y-3">
                                                        <label className="block text-sm font-medium text-gray-700">อัปโหลดหลักฐานประกอบ</label>
                                                        <div className="flex items-center justify-center w-full">
                                                            <label htmlFor={`dropzone-file-${ind.id}`} className={`flex flex-col items-center justify-center w-full h-24 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors ${uploadingId === ind.id ? 'opacity-50 cursor-not-allowed' : ''}`}>
                                                                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                                                    <UploadCloud size={24} className="text-gray-400 mb-2" />
                                                                    <p className="mb-1 text-sm text-gray-500">
                                                                        <span className="font-semibold">{uploadingId === ind.id ? 'กำลังอัปโหลด...' : 'คลิกเพื่ออัปโหลด'}</span>
                                                                    </p>
                                                                </div>
                                                                <input
                                                                    id={`dropzone-file-${ind.id}`}
                                                                    type="file"
                                                                    className="hidden"
                                                                    disabled={uploadingId === ind.id}
                                                                    onChange={(e) => handleEvidenceUpload(ind.id, e.target.files[0])}
                                                                />
                                                            </label>
                                                        </div>
                                                        {/* Uploaded file indicator */}
                                                        {indEvidence && (
                                                            <div className="mt-2 text-sm text-green-600 flex items-center justify-between bg-green-50 p-2 rounded border border-green-100">
                                                                <div className="flex items-center gap-1 overflow-hidden">
                                                                    <CheckCircle size={14} className="shrink-0" />
                                                                    <span className="truncate" title={indEvidence.filePath.split('\\').pop().split('/').pop()}>อัปโหลดแล้ว</span>
                                                                </div>
                                                                <button
                                                                    onClick={() => handleEvidenceDelete(indEvidence.id)}
                                                                    className="text-red-500 hover:text-red-700 text-xs font-medium ml-2 shrink-0"
                                                                >
                                                                    ลบ
                                                                </button>
                                                            </div>
                                                        )}
                                                    </div>
                                                ) : (
                                                    <div className="flex flex-col items-center justify-center h-full text-gray-400 italic">
                                                        ส่วนนี้ไม่จำเป็นต้องแนบหลักฐาน
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </Card>
                    ))}
                </div>
            )}

            {/* Tab 2: Assessment Results (Matches Evaluator Form view) */}
            {activeTab === 2 && isCompleted && (
                <div className="space-y-8 animate-in fade-in">

                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 bg-primary-50 p-6 rounded-xl border border-primary-100 mb-8">
                        <div className="flex-1">
                            <div className="flex justify-between text-sm mb-2">
                                <span className="font-medium text-primary-900">การประเมินเสร็จสิ้น</span>
                                <span className="font-bold text-primary-700">{progressPercent}%</span>
                            </div>
                            <div className="w-full bg-primary-200 rounded-full h-3">
                                <div className="bg-primary-600 h-3 rounded-full" style={{ width: `${progressPercent}%` }}></div>
                            </div>
                        </div>
                        <div className="text-right">
                            <p className="text-sm text-gray-500 font-medium tracking-wide">คะแนนสุทธิ</p>
                            <p className="text-4xl font-extrabold text-secondary-600">{scorePercent}<span className="text-2xl text-secondary-400">%</span></p>
                        </div>
                    </div>

                    {topics.map((topic, tIdx) => (
                        <Card key={topic.id} className="overflow-hidden border border-gray-200 shadow-sm">
                            <div className="bg-gray-50 p-4 border-b border-gray-200">
                                <h2 className="text-xl font-bold text-gray-800">ส่วนที่ {tIdx + 1}: {topic.name}</h2>
                            </div>

                            <div className="overflow-x-auto">
                                <table className="w-full text-sm text-left">
                                    <thead className="text-xs text-gray-600 uppercase bg-gray-100 border-b">
                                        <tr>
                                            <th className="px-4 py-3 w-16 text-center">ลำดับ</th>
                                            <th className="px-4 py-3 w-1/3">ตัวชี้วัด</th>
                                            <th className="px-4 py-3 w-32">ประเภท</th>
                                            <th className="px-4 py-3 w-20 text-center">น้ำหนัก</th>
                                            <th className="px-4 py-3 w-32 text-center">ระดับที่ได้</th>
                                            <th className="px-4 py-3 w-28 text-center text-secondary-600">คะแนนสุทธิ</th>
                                            <th className="px-4 py-3 w-28 text-center">ลืงก์หลักฐาน</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200">
                                        {topic.indicators.map((ind, iIdx) => {
                                            // Mock results binding
                                            const currentVal = ind.type === 'SCALE_1_4' ? 4 : 1;
                                            const itemScoreRaw = currentVal * (ind.weight || 1);

                                            return (
                                                <tr key={ind.id} className="hover:bg-gray-50 transition-colors">
                                                    <td className="px-4 py-4 text-center font-medium text-gray-500">{tIdx + 1}.{iIdx + 1}</td>
                                                    <td className="px-4 py-4 font-medium text-gray-900 leading-relaxed">{ind.name}</td>
                                                    <td className="px-4 py-4">
                                                        <Badge variant={ind.type === 'SCALE_1_4' ? 'primary' : 'success'} className="flex items-center gap-1 w-max">
                                                            {ind.type === 'SCALE_1_4' ? 'ระดับ 1-4' : 'ผ่าน/ไม่ผ่าน'}
                                                        </Badge>
                                                    </td>
                                                    <td className="px-4 py-4 text-center">{ind.weight || 1}</td>
                                                    <td className="px-4 py-4 text-center font-bold">
                                                        {ind.type === 'SCALE_1_4' ? currentVal : (currentVal === 1 ? 'ผ่าน' : 'ไม่ผ่าน')}
                                                    </td>
                                                    <td className="px-4 py-4 text-center font-bold text-secondary-600 text-lg">
                                                        {itemScoreRaw.toFixed(1)}
                                                    </td>
                                                    <td className="px-4 py-4 text-center">
                                                        {ind.requireEvidence ? (
                                                            <a href="#" className="text-primary-600 hover:text-primary-800 flex justify-center" title="เปิดดูหลักฐาน">
                                                                <DownloadCloud size={20} />
                                                            </a>
                                                        ) : '-'}
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        </Card>
                    ))}
                </div>
            )}

        </div>
    );
};

export default EvaluateeDetails;
