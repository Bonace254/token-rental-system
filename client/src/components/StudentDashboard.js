import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';

const theme = {
    primary: '#4F46E5',
    success: '#10B981',
    danger: '#EF4444',
    card: '#FFFFFF',
    textMain: '#111827',
    textMuted: '#6B7280',
    bg: '#F3F4F6'
};

const StudentDashboard = ({ user }) => {
    const [stats, setStats] = useState({ tokens_earned: 0, current_residence: 'Not Assigned', rent_balance: 0 });
    const [paymentHistory, setPaymentHistory] = useState([]);
    const [payAmount, setPayAmount] = useState("");
    const [request, setRequest] = useState("");
    
    // RELOCATION & MAINTENANCE STATES
    const [newResidenceRequest, setNewResidenceRequest] = useState("");
    const [myRelocations, setMyRelocations] = useState([]); 
    const [myMaintenance, setMyMaintenance] = useState([]); 

    // Unified & Safe Data Fetcher
    const fetchStats = useCallback(async () => {
        if (!user || !user.user_id) return;

        // 1. Get user core balance, tokens, and current assigned residence
        try {
            const res = await axios.get(`http://localhost:5000/student/stats/${user.user_id}`);
            if (res.data) {
                setStats(res.data);
            }
        } catch (err) {
            console.error("Error fetching student stats panel:", err);
        }
        
        // 2. Get payment historical ledger entries
        try {
            const historyRes = await axios.get(`http://localhost:5000/payments/history/${user.user_id}`);
            setPaymentHistory(historyRes.data || []);
        } catch (err) {
            console.error("Error fetching payment history details:", err);
        }

        // 3. Get pending and historical room relocation choices
        try {
            const relocationRes = await axios.get(`http://localhost:5000/relocation/student/${user.user_id}`);
            setMyRelocations(relocationRes.data || []);
        } catch (err) {
            console.error("Error fetching relocation status rows:", err);
        }

        // 4. Get tracking data for active maintenance request tickets
        try {
            const maintenanceRes = await axios.get(`http://localhost:5000/maintenance/student/${user.user_id}`);
            setMyMaintenance(maintenanceRes.data || []);
        } catch (err) {
            console.error("Error fetching maintenance feed states:", err);
        }
    }, [user?.user_id]);

    useEffect(() => {
        fetchStats();
    }, [fetchStats]);

    const handlePayment = async () => {
        if (!payAmount || payAmount <= 0) return alert("Enter a valid amount");
        try {
            await axios.post('http://localhost:5000/payments/pay', {
                student_id: user.user_id,
                amount: payAmount,
                tokens_earned: Math.floor(payAmount / 100), 
                due_date: '2026-05-01' 
            });
            alert(`Success! KES ${payAmount} paid.`);
            setPayAmount("");
            fetchStats();
        } catch (err) {
            console.error(err);
            alert("Payment failed.");
        }
    };

    const handleRelocation = async () => {
        if (!newResidenceRequest) return alert("Please specify where you want to move or why.");
        try {
            await axios.post('http://localhost:5000/relocation/request', {
                student_id: user.user_id,
                current_residence: stats.current_residence,
                new_residence: newResidenceRequest
            });
            alert("Relocation request submitted successfully!");
            setNewResidenceRequest("");
            fetchStats();
        } catch (err) {
            console.error(err);
            alert("Failed to submit relocation request.");
        }
    };

    const handleMaintenance = async () => {
        if (!request) return alert("Please describe the issue.");
        try {
            await axios.post('http://localhost:5000/maintenance/request', {
                user_id: user.user_id,
                description: request
            });
            alert("Maintenance request sent!");
            setRequest("");
            fetchStats(); 
        } catch (err) {
            console.error(err);
            alert("Failed to send request.");
        }
    };

    const cardStyle = {
        backgroundColor: theme.card,
        padding: '24px',
        borderRadius: '12px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
        marginBottom: '20px'
    };

    return (
        <div style={{ fontFamily: 'Inter, sans-serif' }}>
            <div style={{ marginBottom: '32px' }}>
                <h1 style={{ fontSize: '26px', fontWeight: '800' }}>Welcome, {user.full_name}</h1>
                <p style={{ color: theme.textMuted }}>
                    Residence: <strong>{stats.current_residence || "Not Assigned"}</strong>
                </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px', marginBottom: '32px' }}>
                <div style={{ ...cardStyle, borderTop: `4px solid ${theme.danger}` }}>
                    <p style={{ color: theme.textMuted, fontSize: '12px', fontWeight: '700' }}>OUTSTANDING BALANCE</p>
                    <h2 style={{ fontSize: '32px', margin: '10px 0' }}>KES {stats.rent_balance}</h2>
                    <div style={{ display: 'flex', gap: '10px' }}>
                        <input 
                            type="number" 
                            placeholder="Amount..."
                            value={payAmount}
                            onChange={(e) => setPayAmount(e.target.value)}
                            style={{ flex: 1, padding: '10px', borderRadius: '6px', border: '1px solid #D1D5DB' }}
                        />
                        <button onClick={handlePayment} style={{ backgroundColor: theme.success, color: 'white', border: 'none', padding: '10px 20px', borderRadius: '6px', fontWeight: '700', cursor: 'pointer' }}>Pay</button>
                    </div>
                </div>

                <div style={{ ...cardStyle, borderTop: `4px solid ${theme.primary}` }}>
                    <p style={{ color: theme.textMuted, fontSize: '12px', fontWeight: '700' }}>YOUR REWARDS</p>
                    <h2 style={{ fontSize: '32px', margin: '10px 0', color: theme.primary }}>
                        {stats.tokens_earned} <span style={{fontSize: '18px'}}>Tokens</span>
                    </h2>
                    <p style={{ fontSize: '13px', color: theme.textMuted }}>Earn 1 token for every KES 100 paid!</p>
                </div>
            </div>

            {/* MAINTENANCE SECTION */}
            <section style={cardStyle}>
                <h3 style={{ marginBottom: '12px' }}>Maintenance Request</h3>
                <textarea 
                    value={request}
                    onChange={(e) => setRequest(e.target.value)}
                    placeholder="Describe the issue (e.g., Broken lock in Room 10)..."
                    style={{ width: '100%', height: '80px', margin: '10px 0', padding: '10px', borderRadius: '8px', border: '1px solid #ddd', fontFamily: 'inherit' }}
                />
                <button 
                    onClick={handleMaintenance}
                    style={{ backgroundColor: theme.textMain, color: 'white', padding: '10px 20px', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: '600', width: '100%' }}
                >
                    Submit Issue
                </button>

                {/* MAINTENANCE HISTORY */}
                <div style={{ marginTop: '20px', borderTop: '1px solid #eee', paddingTop: '15px' }}>
                    <h4 style={{ fontSize: '14px', marginBottom: '10px' }}>Issue Tracking</h4>
                    {myMaintenance.length > 0 ? (
                        myMaintenance.map((m, index) => (
                            <div key={index} style={{ padding: '10px', borderBottom: '1px solid #f9f9f9', fontSize: '13px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <strong>{m.description ? m.description.substring(0, 35) : "Issue Item"}...</strong>
                                    <span style={{ 
                                        fontWeight: 'bold', 
                                        color: m.status === 'Completed' ? theme.success : '#F59E0B' 
                                    }}>
                                        {m.status}
                                    </span>
                                </div>
                                {m.landlord_notes && (
                                    <p style={{ backgroundColor: '#F3F4F6', padding: '8px', borderRadius: '6px', marginTop: '5px', fontSize: '12px' }}>
                                        <strong>Feedback:</strong> {m.landlord_notes}
                                    </p>
                                )}
                            </div>
                        ))
                    ) : (
                        <p style={{ fontSize: '12px', color: theme.textMuted }}>No issues reported.</p>
                    )}
                </div>
            </section>

            {/* RELOCATION SECTION */}
            <section style={{ ...cardStyle, borderLeft: `6px solid ${theme.primary}` }}>
                <h3 style={{ marginBottom: '12px' }}>Relocation Request</h3>
                <textarea 
                    value={newResidenceRequest}
                    onChange={(e) => setNewResidenceRequest(e.target.value)}
                    placeholder="Where would you like to move or reason for relocating?"
                    style={{ width: '100%', height: '80px', marginBottom: '10px', padding: '10px', borderRadius: '8px', border: '1px solid #ddd', fontFamily: 'inherit' }}
                />
                <button 
                    onClick={handleRelocation}
                    style={{ backgroundColor: theme.primary, color: 'white', padding: '10px 20px', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: '600', width: '100%' }}
                >
                    Request Relocation
                </button>

                <div style={{ marginTop: '20px', borderTop: '1px solid #eee', paddingTop: '15px' }}>
                    <h4 style={{ fontSize: '14px', marginBottom: '10px' }}>Relocation History</h4>
                    {myRelocations.length > 0 ? (
                        myRelocations.map((req, index) => (
                            <div key={index} style={{ 
                                padding: '12px', 
                                borderRadius: '8px', 
                                marginBottom: '10px',
                                backgroundColor: req.status === 'Approved' ? '#ECFDF5' : req.status === 'Rejected' ? '#FEF2F2' : '#FFFBEB',
                                border: `1px solid ${req.status === 'Approved' ? '#A7F3D0' : req.status === 'Rejected' ? '#FECACA' : '#FDE68A'}`
                            }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <span style={{ fontWeight: 'bold', fontSize: '13px' }}>To: {req.new_residence}</span>
                                    <span style={{ fontSize: '11px', fontWeight: '800', color: req.status === 'Approved' ? theme.success : req.status === 'Rejected' ? theme.danger : '#B45309'}}>
                                        {req.status ? req.status.toUpperCase() : 'PENDING'}
                                    </span>
                                </div>
                                <p style={{ fontSize: '12px', marginTop: '5px', color: '#374151' }}>
                                    <strong>Landlord Notes:</strong> {req.landlord_notes || "No feedback yet."}
                                </p>
                            </div>
                        ))
                    ) : (
                        <p style={{ fontSize: '12px', color: theme.textMuted }}>No previous requests.</p>
                    )}
                </div>
            </section>

            {/* PAYMENTS HISTORY SECTION */}
            <section style={cardStyle}>
                <h3 style={{ marginBottom: '16px' }}>Recent Payments</h3>
                <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
                        <thead>
                            <tr style={{ textAlign: 'left', borderBottom: `2px solid ${theme.bg}` }}>
                                <th style={{ padding: '12px' }}>Date</th>
                                <th style={{ padding: '12px' }}>Amount</th>
                                <th style={{ padding: '12px' }}>Tokens</th>
                            </tr>
                        </thead>
                        <tbody>
                            {paymentHistory.length > 0 ? (
                                paymentHistory.map((pay, index) => (
                                    <tr key={index} style={{ borderBottom: `1px solid ${theme.bg}` }}>
                                        <td style={{ padding: '12px' }}>{new Date(pay.payment_date).toLocaleDateString()}</td>
                                        <td style={{ padding: '12px', fontWeight: 'bold' }}>KES {pay.amount}</td>
                                        <td style={{ padding: '12px', color: theme.success }}>+{pay.tokens_earned}</td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="3" style={{ padding: '20px', textAlign: 'center', color: theme.textMuted }}>No payments recorded yet.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </section>
        </div>
    );
};

export default StudentDashboard;