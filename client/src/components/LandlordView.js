import React, { useState, useEffect } from 'react';
import axios from 'axios';

const LandlordView = () => {
    const [requests, setRequests] = useState([]);

    // Fetch all relocation requests from the database
    useEffect(() => {
        axios.get('http://localhost:5000/relocation/pending')
            .then(res => setRequests(res.data))
            .catch(err => console.error(err));
    }, []);

    const verifyMove = async (id) => {
        try {
            await axios.put(`http://localhost:5000/relocation/verify/${id}`);
            alert("Residence Verified!");
            // Refresh the list
            setRequests(requests.filter(req => req.relocation_id !== id));
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <div style={{ padding: '20px' }}>
            <h2>Landlord: Pending Relocations</h2>
            <table border="1" cellPadding="10" style={{ width: '100%', textAlign: 'left' }}>
                <thead>
                    <tr>
                        <th>Student ID</th>
                        <th>From</th>
                        <th>To</th>
                        <th>Action</th>
                    </tr>
                </thead>
                <tbody>
                    {requests.map(req => (
                        <tr key={req.relocation_id}>
                            <td>{req.student_id}</td>
                            <td>{req.current_residence}</td>
                            <td>{req.new_residence}</td>
                            <td>
                                <button onClick={() => verifyMove(req.relocation_id)}>Verify Move</button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default LandlordView;