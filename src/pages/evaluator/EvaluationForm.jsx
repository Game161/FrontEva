import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../lib/api';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import BackButton from '../../components/ui/BackButton';
import Swal from 'sweetalert2';
import { DownloadCloud, CheckCircle, AlertCircle } from 'lucide-react';

const EvaluationForm = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [assignment, setAssignment] = useState(null);
    const [topics, setTopics] = useState([]);
    const [scores, setScores] = useState({}); // indicator_id -> score
    const [loading, setLoading] = useState(true);

    // Example placeholder for fetching
    useEffect(() => {
        const fetchAssignmentData = async () => {
            try {
                setLoading(true);
                // GET /evaluator/assignments/:id
                const resAssign = await api.get(`/evaluator/assignments/${id}`);
                setAssignment(resAssign.data);

                // This is a simplified mocking. Normally you'd get the evaluation structure
                // Let's assume the backend provides the period, topics, indicators attached
                const resTopics = await api.get(`/evaluator/assignments/${id}`);

                // Build topics structure from assignment if it exists, or mock it purely for UI design demo.
                // For the sake of the specification, let's assume `resTopics.data.evaluation.topics` is populated
                const fetchedTopics = resAssign.data.evaluation?.topics || [];
                setTopics(fetchedTopics);

                // Pre-fill existing scores if any
                const initialScores = {};
                if (resAssign.data.results) {
                    resAssign.data.results.forEach(r => {
                        initialScores[r.indicatorId] = r.score;
                    });
                }
                setScores(initialScores);

            } catch (error) {
                console.error("Failed to fetch assignment details", error);
                Swal.fire('ข้อผิดพลาด', 'ไม่สามารถโหลดข้อมูลการประเมินได้', 'error');
            } finally {
                setLoading(false);
            }
        };
        fetchAssignmentData();
    }, [id]);

    const handleScoreChange = (indicatorId, val) => {
        setScores(prev => ({ ...prev, [indicatorId]: val }));
    };

    const handleSave = async (submit = false) => {
        try {
            const results = Object.keys(scores).map(indId => ({
                indicatorId: parseInt(indId),
                score: parseInt(scores[indId])
            }));

            await api.post(`/evaluator/assignments/${id}/result`, { results });

            Swal.fire('สำเร็จ', 'บันทึกข้อมูลเรียบร้อยแล้ว', 'success');

            if (submit) {
                navigate('/evaluator');
            }
        } catch (error) {
            console.error(error);
            Swal.fire('ข้อผิดพลาด', 'ไม่สามารถบันทึกข้อมูลได้', 'error');
        }
    };

    if (loading) return <div className="p-8 text-center text-gray-500">กำลังโหลด...</div>;
    if (!assignment) return <div className="p-8 text-center text-red-500">ไม่พบข้อมูลการประเมิน</div>;

    // Calculate Progress
    // Assuming full topics mapping
    let totalIndicators = 0;
    let filledIndicators = 0;
    let totalRawScore = 0;
    let totalMaxScore = 0;

    topics.forEach(t => {
        t.indicators.forEach(ind => {
            totalIndicators++;
            if (scores[ind.id] !== undefined) {
                filledIndicators++;
                totalRawScore += scores[ind.id] * (ind.weight || 1); // rough estimate
            }
            // rough max estimate, assuming SCALE_1_4 means max 4, YES_NO means max 1
            const maxRaw = ind.type === 'SCALE_1_4' ? 4 : 1;
            totalMaxScore += maxRaw * (ind.weight || 1);
        });
    });

    const progressPercent = totalIndicators === 0 ? 0 : Math.round((filledIndicators / totalIndicators) * 100);
    const scorePercent = totalMaxScore === 0 ? 0 : ((totalRawScore / totalMaxScore) * 100).toFixed(2);

    return (
        <div className="max-w-6xl mx-auto pb-12">
            <div className="mb-6 flex items-center justify-between">
                <BackButton to="/evaluator" />
            </div>

            <Card className="mb-6 p-6 md:p-8 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-10">
                    <AlertCircle size={100} />
                </div>
                <div className="relative z-10">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">{assignment.evaluation?.name}</h1>
                    <p className="text-lg text-gray-600 mb-6">ผู้รับการประเมิน: <span className="font-medium text-gray-900">{assignment.evaluatee?.name}</span></p>

                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 bg-primary-50 p-6 rounded-xl border border-primary-100">
                        <div className="flex-1">
                            <div className="flex justify-between text-sm mb-2">
                                <span className="font-medium text-primary-900">ความคืบหน้าการประเมิน</span>
                                <span className="font-bold text-primary-700">{progressPercent}%</span>
                            </div>
                            <div className="w-full bg-primary-200 rounded-full h-3">
                                <div className="bg-primary-600 h-3 rounded-full transition-all duration-500" style={{ width: `${progressPercent}%` }}></div>
                            </div>
                            <p className="text-xs text-primary-600 mt-2">ทำสำเร็จ {filledIndicators} จาก {totalIndicators} ตัวชี้วัด</p>
                        </div>

                        <div className="text-right">
                            <p className="text-sm text-gray-500 font-medium tracking-wide">คะแนนประเมินปัจจุบัน</p>
                            <p className="text-4xl font-extrabold text-secondary-600">{scorePercent}<span className="text-2xl text-secondary-400">%</span></p>
                        </div>
                    </div>
                </div>
            </Card>

            {/* Render topics */}
            {topics.map((topic, tIdx) => (
                <Card key={topic.id} className="mb-8 overflow-hidden border border-gray-200 shadow-sm">
                    <div className="bg-gray-50 p-4 border-b border-gray-200">
                        <h2 className="text-xl font-bold text-gray-800">ส่วนที่ {tIdx + 1}: {topic.name}</h2>
                        {topic.description && <p className="text-sm text-gray-500 mt-1">{topic.description}</p>}
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="text-xs text-gray-600 uppercase bg-gray-100 border-b">
                                <tr>
                                    <th className="px-4 py-3 w-16 text-center">ลำดับ</th>
                                    <th className="px-4 py-3 w-1/3">ตัวชี้วัด</th>
                                    <th className="px-4 py-3 w-32">ประเภท</th>
                                    <th className="px-4 py-3 w-20 text-center">น้ำหนัก</th>
                                    <th className="px-4 py-3 w-40 text-center">คะแนนที่ได้</th>
                                    <th className="px-4 py-3 w-28 text-center text-secondary-600">สรุปคะแนน</th>
                                    <th className="px-4 py-3 w-28 text-center">หลักฐาน</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {topic.indicators.map((ind, iIdx) => {
                                    const currentVal = scores[ind.id] !== undefined ? scores[ind.id] : '';
                                    let itemScoreRaw = 0;
                                    if (currentVal !== '') {
                                        itemScoreRaw = parseFloat(currentVal) * parseFloat(ind.weight || 1);
                                    }

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
                                            <td className="px-4 py-4 text-center">
                                                {ind.type === 'SCALE_1_4' ? (
                                                    <select
                                                        className="bg-white border text-center border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full p-2"
                                                        value={currentVal}
                                                        onChange={(e) => handleScoreChange(ind.id, e.target.value)}
                                                    >
                                                        <option value="">- เลือกระดับ -</option>
                                                        <option value="1">ระดับ 1</option>
                                                        <option value="2">ระดับ 2</option>
                                                        <option value="3">ระดับ 3</option>
                                                        <option value="4">ระดับ 4</option>
                                                    </select>
                                                ) : (
                                                    <div className="flex gap-2 justify-center">
                                                        <button
                                                            onClick={() => handleScoreChange(ind.id, 1)}
                                                            className={`px-3 py-1.5 rounded text-xs font-bold border transition-colors ${currentVal === 1 ? 'bg-green-500 text-white border-green-500' : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50'}`}>
                                                            ผ่าน
                                                        </button>
                                                        <button
                                                            onClick={() => handleScoreChange(ind.id, 0)}
                                                            className={`px-3 py-1.5 rounded text-xs font-bold border transition-colors ${currentVal === 0 ? 'bg-red-500 text-white border-red-500' : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50'}`}>
                                                            ไม่ผ่าน
                                                        </button>
                                                    </div>
                                                )}
                                            </td>
                                            <td className="px-4 py-4 text-center font-bold text-secondary-600 text-lg">
                                                {currentVal !== '' ? itemScoreRaw.toFixed(1) : '-'}
                                            </td>
                                            <td className="px-4 py-4 text-center">
                                                {/* In real app, we check if evidence exists for this indicator from the evaluatee */}
                                                <div className="flex justify-center flex-col items-center gap-1">
                                                    <button className="text-primary-600 hover:bg-primary-50 p-2 rounded-full transition-colors flex flex-col items-center" title="ดาวน์โหลดหลักฐาน">
                                                        <DownloadCloud size={20} />
                                                    </button>
                                                    <span className="text-[10px] text-gray-400">ไม่มีไฟล์</span>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </Card>
            ))}

            <div className="flex justify-end gap-4 mt-8">
                <Button variant="outline" onClick={() => handleSave(false)}>บันทึกร่าง</Button>
                <Button onClick={() => handleSave(true)} className="flex items-center gap-2">
                    <CheckCircle size={18} /> ยืนยันผลการประเมิน
                </Button>
            </div>

        </div>
    );
};

export default EvaluationForm;
