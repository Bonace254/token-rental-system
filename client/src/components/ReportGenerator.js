import React, { useState, useEffect } from 'react';
import axios from 'axios';

const theme = {
    primary: '#4F46E5',
    success: '#10B981',
    danger: '#EF4444',
    warning: '#F59E0B',
    card: '#FFFFFF',
    textMain: '#111827',
    textMuted: '#6B7280',
    bg: '#F3F4F6'
};

const ReportGenerator = ({ user }) => {
    const [reportData, setReportData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchReportDetails = async () => {
            if (!user || !user.user_id) return;
            try {
                // Fetch basic status and payment ledger history for this student
                const [statsRes, historyRes] = await Promise.all([
                    axios.get(`http://localhost:5000/student/stats/${user.user_id}`),
                    axios.get(`http://localhost:5000/payments/history/${user.user_id}`)
                ]);

                setReportData({
                    stats: statsRes.data || { tokens_earned: 0, current_residence: 'Not Assigned', rent_balance: 0 },
                    payments: historyRes.data || []
                });
            } catch (err) {
                console.error("Error compilation failing for printable report generation:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchReportDetails();
    }, [user]);

    const handlePrint = () => {
        window.print();
    };

    if (loading) return <p style={{ color: theme.textMuted }}>Compiling document layout sheets...</p>;
    if (!reportData) return <p style={{ color: theme.danger }}>Error loading student record structures.</p>;

    return (
        <div>
            {/* Inject Global CSS Styles to properly handle screen vs print output layout streams */}
            <style>{`
                @media print {
                    /* Hide everything except our specific printable context boundary wrapper */
                    body * {
                        visibility: hidden;
                    }
                    #printable-student-statement, #printable-student-statement * {
                        visibility: visible;
                    }
                    #printable-student-statement {
                        position: absolute;
                        left: 0;
                        top: 0;
                        width: 100%;
                    }
                    .no-print {
                        display: none !important;
                    }
                }
            `}</style>

            {/* Print Trigger Button Control Block Layer */}
            <div className="no-print" style={{ marginBottom: '20px', display: 'flex', justifyContent: 'flex-end' }}>
                <button 
                    onClick={handlePrint}
                    style={{
                        backgroundColor: theme.success,
                        color: 'white',
                        border: 'none',
                        padding: '12px 24px',
                        borderRadius: '8px',
                        fontWeight: '700',
                        cursor: 'pointer',
                        fontSize: '14px',
                        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                    }}
                >
                    🖨️ Print Financial Statement Report
                </button>
            </div>

            {/* Document Print Target Wrapper Viewport Frame */}
            <div id="printable-student-statement" style={{ backgroundColor: '#fff', padding: '30px', borderRadius: '12px', border: '1px solid #E5E7EB' }}>
                
                {/* Document Header Panel Block */}
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '3px solid #111827', paddingBottom: '20px', marginBottom: '25px' }}>
                    <div>
                        <h1 style={{ margin: '0 0 5px 0', fontSize: '24px', fontWeight: '800', color: theme.textMain }}>OFFICIAL STATEMENT OF ACCOUNT</h1>
                        <p style={{ margin: 0, color: theme.textMuted, fontSize: '13px' }}>Token-Based Accommodation Housing System</p>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                        <p style={{ margin: '0 0 5px 0', fontSize: '14px', fontWeight: '700' }}>Date: {new Date().toLocaleDateString()}</p>
                        <p style={{ margin: 0, fontSize: '12px', color: theme.textMuted }}>Status: Verified Active</p>
                    </div>
                </div>

                {/* Account Entity Information Grid Section */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '30px', background: '#F9FAFB', padding: '15px', borderRadius: '8px' }}>
                    <div>
                        <h3 style={{ margin: '0 0 8px 0', fontSize: '12px', color: theme.textMuted, letterSpacing: '0.05em' }}>STUDENT DETAILS</h3>
                        <p style={{ margin: '0 0 4px 0', fontWeight: '700', fontSize: '15px' }}>{user?.full_name || 'System User'}</p>
                        <p style={{ margin: 0, fontSize: '13px', color: '#374151' }}>ID Account Ref: #{user?.user_id}</p>
                    </div>
                    <div>
                        <h3 style={{ margin: '0 0 8px 0', fontSize: '12px', color: theme.textMuted, letterSpacing: '0.05em' }}>ALLOCATION METRICS</h3>
                        <p style={{ margin: '0 0 4px 0', fontWeight: '700', fontSize: '15px' }}>Residence: {reportData.stats.current_residence}</p>
                        <p style={{ margin: 0, fontSize: '13px', color: '#374151' }}>Accumulated Balance Tokens: {reportData.stats.tokens_earned} Units</p>
                    </div>
                </div>

                {/* Financial Summary Highlight Cards View block */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '35px' }}>
                    <div style={{ padding: '15px', border: '1px solid #E5E7EB', borderRadius: '8px', textAlign: 'center' }}>
                        <span style={{ fontSize: '12px', fontWeight: '700', color: theme.textMuted }}>OUTSTANDING ARREARS BALANCE</span>
                        <h2 style={{ margin: '10px 0 0 0', fontSize: '24px', color: theme.danger }}>KES {reportData.stats.rent_balance}</h2>
                    </div>
                    <div style={{ padding: '15px', border: '1px solid #E5E7EB', borderRadius: '8px', textAlign: 'center' }}>
                        <span style={{ fontSize: '12px', fontWeight: '700', color: theme.textMuted }}>TOTAL REMITTANCE TRANSACTIONS</span>
                        <h2 style={{ margin: '10px 0 0 0', fontSize: '24px', color: theme.success }}>{reportData.payments.length} Payments</h2>
                    </div>
                </div>

                {/* Ledger Historical Transactions Table Representation Sheet */}
                <h3 style={{ fontSize: '15px', marginBottom: '12px', borderBottom: '1px solid #E5E7EB', paddingBottom: '6px' }}>Ledger Historical Payments Breakdown</h3>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                    <thead>
                        <tr style={{ backgroundColor: '#F3F4F6', textAlign: 'left' }}>
                            <th style={{ padding: '10px', border: '1px solid #E5E7EB' }}>Transaction Posting Date</th>
                            <th style={{ padding: '10px', border: '1px solid #E5E7EB' }}>Reference Allocator ID</th>
                            <th style={{ padding: '10px', border: '1px solid #E5E7EB' }}>Earned Incentive Tokens</th>
                            <th style={{ padding: '10px', border: '1px solid #E5E7EB', textAlign: 'right' }}>Amount Paid</th>
                        </tr>
                    </thead>
                    <tbody>
                        {reportData.payments.length > 0 ? (
                            reportData.payments.map((pay, index) => (
                                <tr key={index} style={{ borderBottom: '1px solid #E5E7EB' }}>
                                    <td style={{ padding: '10px', border: '1px solid #E5E7EB' }}>{new Date(pay.payment_date).toLocaleDateString()}</td>
                                    <td style={{ padding: '10px', border: '1px solid #E5E7EB', color: theme.textMuted }}>TXN-{pay.id || index + 1042}</td>
                                    <td style={{ padding: '10px', border: '1px solid #E5E7EB', color: theme.success, fontWeight: '600' }}>+{pay.tokens_earned} Tokens</td>
                                    <td style={{ padding: '10px', border: '1px solid #E5E7EB', textAlign: 'right', fontWeight: '700' }}>KES {pay.amount}</td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="4" style={{ padding: '20px', textAlign: 'center', color: theme.textMuted }}>No audited clearance transactions found in ledger history.</td>
                            </tr>
                        )}
                    </tbody>
                </table>

                {/* Document Footer Verification Clause Stamp Block */}
                <div style={{ marginTop: '50px', paddingTop: '15px', borderTop: '1px solid #E5E7EB', display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: theme.textMuted }}>
                    <p>Computer-generated statement. No physical signature baseline stamp required.</p>
                    <p>© 2026 Housing Rental Ledger Management Hub</p>
                </div>
            </div>
        </div>
    );
};

export default ReportGenerator;