import React, { useState, useEffect } from 'react';
import axios from 'axios';

const LandlordDashboard = () => {
    const [pendingMoves, setPendingMoves] = useState([]);
    const [maintenanceRequests, setMaintenanceRequests] = useState([]);
    const [landlordNotes, setLandlordNotes] = useState({}); // Stores notes per request ID

    const fetchRequests = async () => {
        try {
            // FIX: Match backend route /admin/relocations
            const moveRes = await axios.get('http://localhost:5000/admin/relocations');
            // Filter on frontend if you only want to display pending ones, or show all
            setPendingMoves(moveRes.data);

            // FIX: Match backend route /admin/maintenance
            const maintRes = await axios.get('http://localhost:5000/admin/maintenance');
            setMaintenanceRequests(maintRes.data);
        } catch (err) {
            console.error("Error fetching dashboard data:", err);
        }
    };

    useEffect(() => {
        fetchRequests();
    }, []);

    // Logic for Relocations
    const handleRelocationAction = async (move, status) => {
        try {
            // FIX: Match backend route /admin/relocations/:id
            // Backend expects: status ('Approved' or 'Rejected'), student_id, and new_residence
            await axios.put(`http://localhost:5000/admin/relocations/${move.id}`, { 
                status: status,
                student_id: move.student_id,
                new_residence: move.new_residence
            });
            alert(`Relocation ${status}!`);
            fetchRequests();
        } catch (err) {
            console.error(err);
            alert("Error updating relocation.");
        }
    };

    // Logic for Maintenance
    const handleMaintenanceUpdate = async (id, status) => {
        try {
            // FIX: Match backend route /admin/maintenance/:id
            await axios.put(`http://localhost:5000/admin/maintenance/${id}`, {
                status: status, // Matches backend expected payload
                landlord_notes: landlordNotes[id] || ""
            });
            alert(`Maintenance marked as ${status}!`);
            fetchRequests();
        } catch (err) {
            console.error(err);
            alert("Error updating maintenance.");
        }
    };

    const sectionStyle = { marginTop: '40px', border: '1px solid #ddd', borderRadius: '10px', overflow: 'hidden' };
    const headerStyle = { backgroundColor: '#2c3e50', color: 'white' };

    return (
        <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
            <h1>Landlord Admin Portal</h1>

            {/* --- RELOCATION SECTION --- */}
            <div style={sectionStyle}>
                <h3 style={{ padding: '15px', margin: 0, backgroundColor: '#f8f9fa' }}>Relocation Requests</h3>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead style={headerStyle}>
                        <tr>
                            <th style={{ padding: '12px' }}>Student Name</th>
                            <th style={{ padding: '12px' }}>Current Residence</th>
                            <th style={{ padding: '12px' }}>New Residence</th>
                            <th style={{ padding: '12px' }}>Status</th>
                            <th style={{ padding: '12px' }}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {pendingMoves.length === 0 ? (
                            <tr><td colSpan="5" style={{ padding: '20px', textAlign: 'center' }}>No relocation requests.</td></tr>
                        ) : (
                            pendingMoves.map((move) => (
                                <tr key={move.id} style={{ textAlign: 'center', borderBottom: '1px solid #eee' }}>
                                    <td style={{ padding: '12px' }}>{move.student_name}</td>
                                    <td style={{ padding: '12px' }}>{move.current_residence}</td>
                                    <td style={{ padding: '12px' }}>{move.new_residence}</td>
                                    <td style={{ padding: '12px', fontWeight: 'bold' }}>{move.status}</td>
                                    <td style={{ padding: '12px' }}>
                                        {move.status === 'Pending' ? (
                                            <>
                                                {/* FIX: Passed the entire move object and matching backend uppercase 'Approved' / 'Rejected' values */}
                                                <button onClick={() => handleRelocationAction(move, 'Approved')} style={{ backgroundColor: '#28a745', color: 'white', border: 'none', padding: '5px 10px', marginRight: '5px', borderRadius: '4px', cursor: 'pointer' }}>Approve</button>
                                                <button onClick={() => handleRelocationAction(move, 'Rejected')} style={{ backgroundColor: '#dc3545', color: 'white', border: 'none', padding: '5px 10px', borderRadius: '4px', cursor: 'pointer' }}>Reject</button>
                                            </>
                                        ) : (
                                            <span style={{ color: '#7f8c8d' }}>Processed</span>
                                        )}
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* --- MAINTENANCE SECTION --- */}
            <div style={sectionStyle}>
                <h3 style={{ padding: '15px', margin: 0, backgroundColor: '#f8f9fa' }}>Maintenance Issues</h3>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead style={{ backgroundColor: '#4F46E5', color: 'white' }}>
                        <tr>
                            <th style={{ padding: '12px' }}>Student</th>
                            <th style={{ padding: '12px' }}>Residence</th>
                            <th style={{ padding: '12px' }}>Description</th>
                            <th style={{ padding: '12px' }}>Status</th>
                            <th style={{ padding: '12px' }}>Landlord Notes</th>
                            <th style={{ padding: '12px' }}>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {maintenanceRequests.length === 0 ? (
                            <tr><td colSpan="6" style={{ padding: '20px', textAlign: 'center' }}>No maintenance issues reported.</td></tr>
                        ) : (
                            maintenanceRequests.map((m) => (
                                <tr key={m.id} style={{ textAlign: 'center', borderBottom: '1px solid #eee' }}>
                                    {/* FIX: Displays backend structured join student_name and current_residence fields */}
                                    <td style={{ padding: '12px' }}>{m.student_name}</td>
                                    <td style={{ padding: '12px' }}>{m.current_residence}</td>
                                    <td style={{ padding: '12px' }}>{m.description}</td>
                                    <td style={{ padding: '12px' }}>
                                        <span style={{ fontWeight: 'bold', color: m.status === 'Resolved' ? '#28a745' : '#f39c12' }}>
                                            {m.status}
                                        </span>
                                    </td>
                                    <td style={{ padding: '12px' }}>
                                        <input 
                                            type="text" 
                                            placeholder="Add feedback..."
                                            value={landlordNotes[m.id] || m.landlord_notes || ""}
                                            onChange={(e) => setLandlordNotes({...landlordNotes, [m.id]: e.target.value})}
                                            style={{ padding: '5px', borderRadius: '4px', border: '1px solid #ccc', width: '80%' }}
                                        />
                                    </td>
                                    <td style={{ padding: '12px' }}>
                                        {m.status !== 'Resolved' ? (
                                            <button 
                                                onClick={() => handleMaintenanceUpdate(m.id, 'Resolved')} 
                                                style={{ backgroundColor: '#4F46E5', color: 'white', border: 'none', padding: '5px 10px', borderRadius: '4px', cursor: 'pointer' }}
                                            >
                                                Mark Resolved
                                            </button>
                                        ) : (
                                            <span style={{ color: '#28a745' }}>✓ Fixed</span>
                                        )}
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default LandlordDashboard;