import React, { useState, useEffect } from 'react';
import axios from 'axios';

const ParentDashboard = ({ user }) => { 
    const [data, setData] = useState(null); // Will hold { student, payments }
    const [studentEmail, setStudentEmail] = useState('');
    const [currentStudentId, setCurrentStudentId] = useState(user.monitoring_student_id);
    const [loading, setLoading] = useState(false);
    
    // Payment Form States
    const [paymentAmount, setPaymentAmount] = useState('');
    const [processingPayment, setProcessingPayment] = useState(false);

    // Fetch student data, history, and room metrics based on parent's ID
    const fetchOversight = async () => {
        try {
            setLoading(true);
            // Points to the exact backend endpoint defined in your index.js
            const res = await axios.get(`http://localhost:5000/parent/monitored-student/${user.user_id}`);
            setData(res.data);
        } catch (err) {
            console.error("Fetch error:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (currentStudentId && currentStudentId !== "undefined") {
            fetchOversight();
        }
    }, [currentStudentId]);

    const handleLinkStudent = async (e) => {
        e.preventDefault();
        try {
            const res = await axios.post('http://localhost:5000/parent/link-student', {
                parent_id: user.user_id,
                student_email: studentEmail
            });
            alert("Student Linked Successfully!");
            setCurrentStudentId(res.data.student_id); 
        } catch (err) {
            alert(err.response?.data?.error || "Error linking student. Check the email.");
        }
    };

    const handlePayRent = async (e) => {
        e.preventDefault();
        if (!paymentAmount || parseInt(paymentAmount) <= 0) {
            alert("Please enter a valid payment amount.");
            return;
        }

        try {
            setProcessingPayment(true);
            
            // Send payment request to backend
            await axios.post('http://localhost:5000/payments/parent-pay', {
                student_id: data.student.user_id,
                amount: paymentAmount,
                due_date: new Date().toISOString().split('T')[0] // today's date placeholder
            });

            alert("Payment processed successfully!");
            setPaymentAmount(''); // Clear input
            
            // Re-fetch data instantly to show the updated balance and payment history row
            await fetchOversight(); 
        } catch (err) {
            console.error("Payment error:", err);
            alert("Failed to process payment. Try again.");
        } finally {
            setProcessingPayment(false);
        }
    };

    // --- VIEW 1: No student linked yet ---
    if (!currentStudentId) {
        return (
            <div style={{ padding: '40px', textAlign: 'center', background: 'white', borderRadius: '15px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
                <h2 style={{ color: '#4F46E5' }}>Guardian Oversight Portal</h2>
                <p style={{ color: '#666' }}>You haven't linked a student account yet.</p>
                <form onSubmit={handleLinkStudent} style={{ marginTop: '20px' }}>
                    <input 
                        type="email" 
                        placeholder="Enter Student's Email"
                        value={studentEmail}
                        onChange={(e) => setStudentEmail(e.target.value)}
                        style={{ padding: '12px', width: '280px', borderRadius: '8px', border: '1px solid #ddd', marginRight: '10px' }}
                        required
                    />
                    <button type="submit" style={{ padding: '12px 24px', background: '#4F46E5', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>
                        Link Student
                    </button>
                </form>
            </div>
        );
    }

    // --- VIEW 2: Loading State ---
    if (loading || !data) {
        return <div style={{ textAlign: 'center', padding: '50px' }}>Syncing student records...</div>;
    }

    // Destructure variables for cleaner JSX code matching backend JSON structure
    const { student, payments } = data;

    // --- VIEW 3: Actual Dashboard (Connected to data) ---
    return (
        <div style={{ padding: '20px', border: '2px solid #E5E7EB', borderRadius: '15px', background: '#fff', maxWidth: '900px', margin: '0 auto', fontFamily: 'sans-serif' }}>
            <h2 style={{ color: '#1F2937', borderBottom: '2px solid #F3F4F6', paddingBottom: '10px', marginTop: 0 }}>
                Guardian Oversight: <span style={{ color: '#4F46E5' }}>{student.full_name}</span>
            </h2>
            
            {/* STUDENT METRICS CARDS */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '20px', marginTop: '20px' }}>
                <div style={{ background: '#EEF2F6', padding: '15px', borderRadius: '10px', textAlign: 'center' }}>
                    <p style={{ color: '#4B5563', margin: 0, fontWeight: '500' }}>Rent Balance</p>
                    <h3 style={{ fontSize: '24px', color: student.rent_balance > 0 ? '#DC2626' : '#059669', margin: '10px 0' }}>
                        KES {parseFloat(student.rent_balance).toLocaleString()}
                    </h3>
                </div>

                <div style={{ background: '#EEF2F6', padding: '15px', borderRadius: '10px', textAlign: 'center' }}>
                    <p style={{ color: '#4B5563', margin: 0, fontWeight: '500' }}>Assigned Residence</p>
                    <h3 style={{ fontSize: '18px', color: '#1F2937', margin: '12px 0', fontWeight: 'bold' }}>
                        {student.current_residence || 'Not Assigned'}
                    </h3>
                </div>

                <div style={{ background: '#EEF2F6', padding: '15px', borderRadius: '10px', textAlign: 'center' }}>
                    <p style={{ color: '#4B5563', margin: 0, fontWeight: '500' }}>Tokens Earned</p>
                    <h3 style={{ fontSize: '24px', color: '#D97706', margin: '10px 0' }}>
                         {student.tokens_earned}
                    </h3>
                </div>
            </div>

            {/* QUICK RENT PAYMENT SECTION */}
            <div style={{ marginTop: '30px', padding: '20px', border: '1px solid #E5E7EB', borderRadius: '10px', background: '#F9FAFB' }}>
                <h3 style={{ margin: '0 0 15px 0', color: '#374151' }}> Pay Rent on Behalf of Student</h3>
                <form onSubmit={handlePayRent} style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
                    <div style={{ flex: 1 }}>
                        <input 
                            type="number" 
                            placeholder="Amount (KES)"
                            value={paymentAmount}
                            onChange={(e) => setPaymentAmount(e.target.value)}
                            disabled={processingPayment}
                            style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #D1D5DB', boxSizing: 'border-box' }}
                            required
                        />
                    </div>
                    <button 
                        type="submit" 
                        disabled={processingPayment}
                        style={{ 
                            padding: '12px 30px', 
                            background: processingPayment ? '#9CA3AF' : '#059669', 
                            color: 'white', 
                            border: 'none', 
                            borderRadius: '8px', 
                            cursor: processingPayment ? 'not-allowed' : 'pointer', 
                            fontWeight: 'bold',
                            transition: 'background 0.2s'
                        }}
                    >
                        {processingPayment ? "Processing..." : "Confirm Payment"}
                    </button>
                </form>
            </div>

            {/* PAYMENT HISTORY TABLE */}
            <div style={{ marginTop: '30px' }}>
                <h3 style={{ color: '#374151', marginBottom: '15px' }}> Payment Ledger History</h3>
                {payments.length === 0 ? (
                    <p style={{ color: '#6B7280', fontStyle: 'italic' }}>No payment records found for this student.</p>
                ) : (
                    <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                            <thead>
                                <tr style={{ backgroundColor: '#F3F4F6', borderBottom: '2px solid #E5E7EB' }}>
                                    <th style={{ padding: '12px', color: '#4B5563' }}>Date</th>
                                    <th style={{ padding: '12px', color: '#4B5563' }}>Amount Paid</th>
                                    <th style={{ padding: '12px', color: '#4B5563' }}>Tokens Accrued</th>
                                </tr>
                            </thead>
                            <tbody>
                                {payments.map((pay, idx) => (
                                    <tr key={idx} style={{ borderBottom: '1px solid #E5E7EB' }}>
                                        <td style={{ padding: '12px', color: '#1F2937' }}>
                                            {new Date(pay.payment_date).toLocaleDateString(undefined, {
                                                year: 'numeric', month: 'long', day: 'numeric'
                                            })}
                                        </td>
                                        <td style={{ padding: '12px', color: '#059669', fontWeight: 'bold' }}>
                                            KES {parseFloat(pay.amount).toLocaleString()}
                                        </td>
                                        <td style={{ padding: '12px', color: '#D97706' }}>
                                            +{pay.tokens_earned} Tokens
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ParentDashboard;