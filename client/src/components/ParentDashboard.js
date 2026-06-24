import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Header from './Header';

const ParentDashboard = ({ user }) => { 
    const [data, setData] = useState(null);
    const [allStudents, setAllStudents] = useState([]);
    const [studentEmail, setStudentEmail] = useState('');
    const [multipleEmails, setMultipleEmails] = useState('');
    const [currentStudentId, setCurrentStudentId] = useState(user.monitoring_student_id);
    const [loading, setLoading] = useState(false);
    const [activeTab, setActiveTab] = useState('overview');
    
    // Payment Form States
    const [paymentAmount, setPaymentAmount] = useState('');
    const [processingPayment, setProcessingPayment] = useState(false);

    // Fetch single student data
    const fetchOversight = async () => {
        try {
            setLoading(true);
            const res = await axios.get(`http://localhost:5000/parent/monitored-student/${user.user_id}`);
            setData(res.data);
        } catch (err) {
            console.error("Fetch error:", err);
        } finally {
            setLoading(false);
        }
    };

    // Fetch all linked students
    const fetchAllStudents = async () => {
        try {
            const res = await axios.get(`http://localhost:5000/parent/all-students/${user.user_id}`);
            setAllStudents(res.data);
        } catch (err) {
            console.error("Error fetching all students:", err);
        }
    };

    useEffect(() => {
        if (currentStudentId && currentStudentId !== "undefined") {
            fetchOversight();
        }
        fetchAllStudents();
    }, [currentStudentId]);

    const handleLinkStudent = async (e) => {
        e.preventDefault();
        try {
            const res = await axios.post('http://localhost:5000/parent/link-student', {
                parent_id: user.user_id,
                student_email: studentEmail
            });
            alert("Student Linked Successfully!");
            setStudentEmail('');
            setCurrentStudentId(res.data.student_id);
            fetchAllStudents();
        } catch (err) {
            alert(err.response?.data?.error || "Error linking student. Check the email.");
        }
    };

    const handleLinkMultipleStudents = async (e) => {
        e.preventDefault();
        if (!multipleEmails) {
            alert("Please enter student emails (comma-separated)");
            return;
        }
        
        const emails = multipleEmails.split(',').map(e => e.trim()).filter(e => e);
        
        try {
            const res = await axios.post('http://localhost:5000/parent/link-multiple-students', {
                parent_id: user.user_id,
                student_emails: emails
            });
            alert(`Successfully processed: ${res.data.results.map(r => `${r.email} (${r.status})`).join(', ')}`);
            setMultipleEmails('');
            fetchAllStudents();
        } catch (err) {
            alert("Error linking students. Try again.");
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
            await axios.post('http://localhost:5000/payments/parent-pay', {
                student_id: data.student.user_id,
                amount: paymentAmount,
                due_date: new Date().toISOString().split('T')[0]
            });

            alert("Payment processed successfully!");
            setPaymentAmount('');
            await fetchOversight();
            fetchAllStudents();
        } catch (err) {
            console.error("Payment error:", err);
            alert("Failed to process payment. Try again.");
        } finally {
            setProcessingPayment(false);
        }
    };

    const cardStyle = {
        backgroundColor: '#FFFFFF',
        padding: '20px',
        borderRadius: '12px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
        marginBottom: '15px'
    };

    const tabButtonStyle = (isActive) => ({
        padding: '10px 20px',
        border: 'none',
        backgroundColor: isActive ? '#4F46E5' : '#F3F4F6',
        color: isActive ? 'white' : '#374151',
        borderRadius: '8px',
        cursor: 'pointer',
        fontWeight: '600',
        fontSize: '14px',
        marginRight: '10px'
    });

    // --- VIEW 1: No students linked yet ---
    if (allStudents.length === 0 && !currentStudentId) {
        return (
            <div style={{ padding: '40px', textAlign: 'center', background: 'white', borderRadius: '15px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
                <h2 style={{ color: '#4F46E5', marginBottom: '30px' }}>👨‍👩‍👧 Guardian Oversight Portal</h2>
                <p style={{ color: '#666', marginBottom: '30px' }}>You haven't linked any student accounts yet. Add one or more students to start monitoring.</p>
                
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px', maxWidth: '800px', margin: '0 auto' }}>
                    {/* Link Single Student */}
                    <div style={{ ...cardStyle, borderTop: '4px solid #4F46E5' }}>
                        <h3 style={{ marginTop: '0', color: '#4F46E5' }}>Link Single Student</h3>
                        <form onSubmit={handleLinkStudent}>
                            <input 
                                type="email" 
                                placeholder="Enter Student's Email"
                                value={studentEmail}
                                onChange={(e) => setStudentEmail(e.target.value)}
                                style={{ padding: '12px', width: '100%', borderRadius: '8px', border: '1px solid #ddd', marginBottom: '12px', boxSizing: 'border-box' }}
                                required
                            />
                            <button type="submit" style={{ padding: '12px 24px', background: '#4F46E5', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', width: '100%' }}>
                                Link Student
                            </button>
                        </form>
                    </div>

                    {/* Link Multiple Students */}
                    <div style={{ ...cardStyle, borderTop: '4px solid #059669' }}>
                        <h3 style={{ marginTop: '0', color: '#059669' }}>Link Multiple Students</h3>
                        <form onSubmit={handleLinkMultipleStudents}>
                            <textarea 
                                placeholder="Enter emails separated by commas&#10;e.g., student1@mail.com, student2@mail.com"
                                value={multipleEmails}
                                onChange={(e) => setMultipleEmails(e.target.value)}
                                style={{ padding: '12px', width: '100%', borderRadius: '8px', border: '1px solid #ddd', marginBottom: '12px', boxSizing: 'border-box', height: '80px', fontFamily: 'inherit' }}
                                required
                            />
                            <button type="submit" style={{ padding: '12px 24px', background: '#059669', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', width: '100%' }}>
                                Link All Students
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div style={{ fontFamily: 'sans-serif' }}>
            <Header title="Parent Dashboard" showLogo={true} />
            <div style={{ padding: '20px 28px' }}>
            <h2 style={{ color: '#1F2937', marginBottom: '20px', fontSize: '26px', fontWeight: '800' }}>
                 Guardian Oversight Portal
            </h2>

            {/* Tab Navigation */}
            <div style={{ marginBottom: '25px', display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                <button onClick={() => setActiveTab('overview')} style={tabButtonStyle(activeTab === 'overview')}>
                    Single Student View
                </button>
                <button onClick={() => setActiveTab('all')} style={tabButtonStyle(activeTab === 'all')}>
                    👥 All Students ({allStudents.length})
                </button>
                <button onClick={() => setActiveTab('add')} style={tabButtonStyle(activeTab === 'add')}>
                    ➕ Link New Student
                </button>
            </div>

            {/* TAB: Single Student Overview */}
            {activeTab === 'overview' && currentStudentId && (
                <>
                    {loading || !data ? (
                        <div style={{ textAlign: 'center', padding: '50px' }}>⏳ Syncing student records...</div>
                    ) : (
                        <div style={{ padding: '20px', border: '2px solid #E5E7EB', borderRadius: '15px', background: '#fff' }}>
                            <h2 style={{ color: '#1F2937', borderBottom: '2px solid #F3F4F6', paddingBottom: '10px', marginTop: 0 }}>
                                Guardian Oversight: <span style={{ color: '#4F46E5' }}>{data.student.full_name}</span>
                            </h2>
                            
                            {/* STUDENT METRICS CARDS */}
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '20px', marginTop: '20px' }}>
                                <div style={{ background: '#EEF2F6', padding: '15px', borderRadius: '10px', textAlign: 'center' }}>
                                    <p style={{ color: '#4B5563', margin: 0, fontWeight: '500' }}>Rent Balance</p>
                                    <h3 style={{ fontSize: '24px', color: data.student.rent_balance > 0 ? '#DC2626' : '#059669', margin: '10px 0' }}>
                                        KES {parseFloat(data.student.rent_balance).toLocaleString()}
                                    </h3>
                                </div>

                                <div style={{ background: '#EEF2F6', padding: '15px', borderRadius: '10px', textAlign: 'center' }}>
                                    <p style={{ color: '#4B5563', margin: 0, fontWeight: '500' }}>Assigned Residence</p>
                                    <h3 style={{ fontSize: '18px', color: '#1F2937', margin: '12px 0', fontWeight: 'bold' }}>
                                        {data.student.current_residence || 'Not Assigned'}
                                    </h3>
                                </div>

                                <div style={{ background: '#EEF2F6', padding: '15px', borderRadius: '10px', textAlign: 'center' }}>
                                    <p style={{ color: '#4B5563', margin: 0, fontWeight: '500' }}>Tokens Earned</p>
                                    <h3 style={{ fontSize: '24px', color: '#D97706', margin: '10px 0' }}>
                                         {data.student.tokens_earned}
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
                                            fontWeight: 'bold'
                                        }}
                                    >
                                        {processingPayment ? "Processing..." : "Confirm Payment"}
                                    </button>
                                </form>
                            </div>

                            {/* PAYMENT HISTORY TABLE */}
                            <div style={{ marginTop: '30px' }}>
                                <h3 style={{ color: '#374151', marginBottom: '15px' }}> Payment Ledger History</h3>
                                {data.payments.length === 0 ? (
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
                                                {data.payments.map((pay, idx) => (
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
                    )}
                </>
            )}

            {/* TAB: All Students Overview */}
            {activeTab === 'all' && (
                <div>
                    <h3 style={{ color: '#374151', marginBottom: '20px' }}>Monitor All Your Students</h3>
                    {allStudents.length === 0 ? (
                        <div style={{ ...cardStyle, textAlign: 'center', backgroundColor: '#FEF3C7' }}>
                            <p style={{ margin: '0', color: '#92400E' }}>No students linked yet. Use the "Link New Student" tab to add students.</p>
                        </div>
                    ) : (
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
                            {allStudents.map(student => (
                                <div key={student.user_id} style={{ ...cardStyle, borderLeft: '4px solid #4F46E5', cursor: 'pointer' }} onClick={() => {
                                    setCurrentStudentId(student.user_id);
                                    setActiveTab('overview');
                                }}>
                                    <h4 style={{ margin: '0 0 12px 0', color: '#4F46E5', fontSize: '16px' }}>👤 {student.full_name}</h4>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                                        <div>
                                            <p style={{ margin: '0 0 3px 0', fontSize: '12px', color: '#6B7280' }}>Rent Balance</p>
                                            <p style={{ margin: '0', fontSize: '18px', fontWeight: '700', color: student.rent_balance > 0 ? '#DC2626' : '#059669' }}>
                                                KES {student.rent_balance}
                                            </p>
                                        </div>
                                        <div>
                                            <p style={{ margin: '0 0 3px 0', fontSize: '12px', color: '#6B7280' }}>Tokens</p>
                                            <p style={{ margin: '0', fontSize: '18px', fontWeight: '700', color: '#D97706' }}>
                                                {student.tokens_earned}
                                            </p>
                                        </div>
                                    </div>
                                    <p style={{ margin: '0', fontSize: '13px', color: '#6B7280' }}>
                                        <strong>Residence:</strong> {student.current_residence}
                                    </p>
                                    <p style={{ margin: '8px 0 0 0', fontSize: '13px', color: '#6B7280' }}>
                                        <strong>Payments:</strong> {student.payment_count}
                                    </p>
                                    <button style={{ marginTop: '12px', padding: '8px 12px', backgroundColor: '#4F46E5', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', width: '100%', fontWeight: '600' }}>
                                        View Details →
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* TAB: Add New Student */}
            {activeTab === 'add' && (
                <div style={{ maxWidth: '600px' }}>
                    <h3 style={{ color: '#374151', marginBottom: '20px' }}>Link New Students</h3>
                    
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '30px' }}>
                        {/* Link Single Student */}
                        <div style={{ ...cardStyle, borderTop: '4px solid #4F46E5' }}>
                            <h4 style={{ marginTop: '0', color: '#4F46E5' }}>Single Student</h4>
                            <form onSubmit={handleLinkStudent}>
                                <input 
                                    type="email" 
                                    placeholder="Enter Student's Email"
                                    value={studentEmail}
                                    onChange={(e) => setStudentEmail(e.target.value)}
                                    style={{ padding: '12px', width: '100%', borderRadius: '8px', border: '1px solid #ddd', marginBottom: '12px', boxSizing: 'border-box' }}
                                    required
                                />
                                <button type="submit" style={{ padding: '12px 24px', background: '#4F46E5', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', width: '100%' }}>
                                    Link Student
                                </button>
                            </form>
                        </div>

                        {/* Link Multiple Students */}
                        <div style={{ ...cardStyle, borderTop: '4px solid #059669' }}>
                            <h4 style={{ marginTop: '0', color: '#059669' }}>Multiple Students (Bulk Link)</h4>
                            <form onSubmit={handleLinkMultipleStudents}>
                                <textarea 
                                    placeholder="Enter emails separated by commas&#10;e.g., student1@mail.com, student2@mail.com, student3@mail.com"
                                    value={multipleEmails}
                                    onChange={(e) => setMultipleEmails(e.target.value)}
                                    style={{ padding: '12px', width: '100%', borderRadius: '8px', border: '1px solid #ddd', marginBottom: '12px', boxSizing: 'border-box', height: '100px', fontFamily: 'inherit' }}
                                    required
                                />
                                <button type="submit" style={{ padding: '12px 24px', background: '#059669', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', width: '100%' }}>
                                    Link All Students
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            )}
            </div>
        </div>
    );
};

export default ParentDashboard;