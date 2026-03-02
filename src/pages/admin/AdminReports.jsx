import React, { useState, useEffect } from 'react';
import api from '../../lib/api';
import Card from '../../components/ui/Card';

const AdminReports = () => {
    const [data, setData] = useState(null);

    useEffect(() => {
        // try to fetch some report data
        const fetchReports = async () => {
            try {
                const res = await api.get('/reports/progress');
                setData(res.data);
            } catch (error) {
                console.error("Failed to fetch reports", error);
            }
        };
        fetchReports();
    }, []);

    return (
        <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-6">รายงานผลรวบยอด</h1>
            <Card className="p-6">
                <p className="text-gray-500">
                    หน้าแสดงรายงานและการดำเนินการของการประเมิน (กำลังพัฒนา)
                </p>
            </Card>
        </div>
    );
};
export default AdminReports;
