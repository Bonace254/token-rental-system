import RelocationForm from './RelocationForm';
import React, { useState, useEffect } from 'react';
import axios from 'axios';

const Dashboard = () => {
    // State to store student data
    const [student, setStudent] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Function to fetch data from your Node.js server
        const fetchStudentData = async () => {
            try {
                // For now, we fetch the first user in the database
                const response = await axios.get('http://localhost:5000/auth/user/1');
                setStudent(response.data);
                setLoading(false);
            } catch (err) {
                console.error("Error fetching data", err);
                setLoading(false);
            }
        };
        fetchStudentData();
    }, []);

    if (loading) return <div>Loading Dashboard...</div>;

    const handlePayment = async () => {
    try {
        // Simulating a payment for a due date in the future (to earn tokens)
        await axios.post('http://localhost:5000/payments/pay', {
            student_id: 1,
            amount: 5000,
            due_date: '2026-05-01' 
        });
        alert("Payment Processed!");
        // You might want to refresh the student data here to see the new token count
    } catch (err) {
        console.error(err);
    }
};

    return (
    <div style={{ padding: '20px', fontFamily: 'Arial' }}>
        <h1>Welcome, {student ? student.full_name : 'Student'}!</h1>
        
        <div style={{ border: '1px solid #ccc', padding: '15px', borderRadius: '8px', width: '300px' }}>
            <h3>Token Balance</h3>
            <p style={{ fontSize: '24px', color: 'green', fontWeight: 'bold' }}>
                {student ? student.tokens_earned : 0} Tokens
            </p>
            <button style={{ backgroundColor: '#007bff', color: 'white', border: 'none', padding: '10px', cursor: 'pointer' }}>
                Pay Rent
            </button>
        </div>

        <div style={{ marginTop: '20px' }}>
            <h3>Relocation Status</h3>
            <p>Status: <strong>Verified</strong></p>

            {/* ✅ ADD IT HERE */}
            {student && (
                <RelocationForm studentId={student.user_id} />
            )}
        </div>
    </div>
);
};

export default Dashboard;