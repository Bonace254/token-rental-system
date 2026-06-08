import React, { useState, useEffect } from 'react';
import axios from 'axios';

const TestRelocation = () => {
    const [currentRes, setCurrentRes] = useState('');
    const [newRes, setNewRes] = useState('');
    const [pendingMoves, setPendingMoves] = useState([]);

    // 1. Function to fetch pending moves for the Landlord view
    const refreshLandlordList = () => {
        axios.get('http://localhost:5000/relocation/pending')
            .then(res => setPendingMoves(res.data))
            .catch(err => console.error(err));
    };

    useEffect(() => { refreshLandlordList(); }, []);

    // 3. Landlord Verification Logic
    const handleVerify = async (id) => {
        await axios.put(`http://localhost:5000/relocation/verify/${id}`);
        alert("Move Verified!");
        refreshLandlordList();
    };

    const handleStudentSubmit = async (e) => {
    e.preventDefault();
    try {
        const response = await axios.post('http://localhost:5000/relocation/request', {
            student_id: 1, 
            current_residence: currentRes,
            new_residence: newRes
        });
        console.log("Success:", response.data);
        alert("Request Sent Successfully!");
        refreshLandlordList();
    } catch (err) {
        // This will tell you if it's a Network Error or a Server Error
        console.error("Full Error:", err);
        alert("Failed to send: " + (err.response ? err.response.data : err.message));
    }
};

    return (
        <div style={{ padding: '40px', display: 'flex', gap: '50px' }}>
            {/* Left Side: Student Form */}
            <div style={{ flex: 1, border: '2px solid #007bff', padding: '20px', borderRadius: '10px' }}>
                <h2>[Student] Submit Move</h2>
                <input type="text" placeholder="From (e.g. Hostel A)" value={currentRes} onChange={(e)=>setCurrentRes(e.target.value)} style={{display:'block', marginBottom:'10px'}} />
                <input type="text" placeholder="To (e.g. Apartment B)" value={newRes} onChange={(e)=>setNewRes(e.target.value)} style={{display:'block', marginBottom:'10px'}} />
                <button onClick={handleStudentSubmit} style={{backgroundColor:'#007bff', color:'white', padding:'10px'}}>Send to Landlord</button>
            </div>

            {/* Right Side: Landlord View */}
            <div style={{ flex: 1, border: '2px solid #28a745', padding: '20px', borderRadius: '10px' }}>
                <h2>[Landlord] Pending Approval</h2>
                {pendingMoves.length === 0 ? <p>No moves to verify.</p> : (
                    <ul>
                        {pendingMoves.map(move => (
                            <li key={move.relocation_id} style={{marginBottom:'10px'}}>
                                {move.current_residence} → {move.new_residence} 
                                <button onClick={() => handleVerify(move.relocation_id)} style={{marginLeft:'10px'}}>Verify</button>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </div>
    );
};

export default TestRelocation;