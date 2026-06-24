import React, { useState, useEffect } from 'react';
import axios from 'axios';
import ReportGenerator from './ReportGenerator';
import Header from './Header';

const LandlordDashboard = ({ user }) => {
    const [pendingMoves, setPendingMoves] = useState([]);
    const [maintenanceRequests, setMaintenanceRequests] = useState([]);
    const [inactiveStudents, setInactiveStudents] = useState([]);
    const [landlordNotes, setLandlordNotes] = useState({});
    const [activeTab, setActiveTab] = useState('maintenance');

    const fetchRequests = async () => {
        try {
            const moveRes = await axios.get('http://localhost:5000/admin/relocations');
            setPendingMoves(moveRes.data);

            const maintRes = await axios.get('http://localhost:5000/admin/maintenance');
            setMaintenanceRequests(maintRes.data);

            const inactiveRes = await axios.get('http://localhost:5000/admin/inactive-students');
            setInactiveStudents(inactiveRes.data);
        } catch (err) {
            console.error("Error fetching dashboard data:", err);
        }
    };

    useEffect(() => {
        fetchRequests();
    }, []);

    const handleRelocationAction = async (move, status) => {
        try {
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

    const handleMaintenanceUpdate = async (id, status) => {
        try {
            await axios.put(`http://localhost:5000/admin/maintenance/${id}`, {
                status: status,
                landlord_notes: landlordNotes[id] || ""
            });
            alert(`Maintenance marked as ${status}!`);
            fetchRequests();
        } catch (err) {
            console.error(err);
            alert("Error updating maintenance.");
        }
    };

    const handleRemoveStudent = async (studentId, studentName) => {
        if (window.confirm(`Are you sure you want to remove ${studentName} from the system? This action cannot be undone.`)) {
            try {
                await axios.delete(`http://localhost:5000/admin/remove-student/${studentId}`);
                alert(`${studentName} has been removed successfully!`);
                fetchRequests();
            } catch (err) {
                console.error(err);
                alert("Error removing student.");
            }
        }
    };

    const sectionStyle = { marginTop: '20px', border: '1px solid #ddd', borderRadius: '10px', overflow: 'hidden', backgroundColor: 'white' };
    const headerStyle = { backgroundColor: '#2c3e50', color: 'white' };
    const tabButtonStyle = (isActive) => ({
        padding: '12px 20px',
        border: 'none',
        backgroundColor: isActive ? '#4F46E5' : '#F3F4F6',
        color: isActive ? 'white' : '#374151',
        borderRadius: '8px',
        cursor: 'pointer',
        fontWeight: '600',
        fontSize: '14px',
        marginRight: '10px',
        marginBottom: '10px'
    });

    return (
        <div style={{ fontFamily: 'Inter, sans-serif' }}>
            <Header title="Landlord Dashboard" showLogo={true} />
            <div style={{ padding: '20px 28px' }}>
            <h1 style={{ fontSize: '28px', fontWeight: '800', marginBottom: '10px' }}>🏢 Landlord Admin Portal</h1>
            <p style={{ color: '#6B7280', marginBottom: '25px' }}>Manage properties, relocations, maintenance, and student accounts</p>

            {/* Tab Navigation */}
            <div style={{ marginBottom: '25px', display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                <button onClick={() => setActiveTab('maintenance')} style={tabButtonStyle(activeTab === 'maintenance')}>
                    🔧 Maintenance ({maintenanceRequests.length})
                </button>
                <button onClick={() => setActiveTab('relocations')} style={tabButtonStyle(activeTab === 'relocations')}>
                     Relocations ({pendingMoves.length})
                </button>
                <button onClick={() => setActiveTab('inactive')} style={tabButtonStyle(activeTab === 'inactive')}>
                    Inactive Students ({inactiveStudents.length})
                </button>
                <button onClick={() => setActiveTab('reports')} style={tabButtonStyle(activeTab === 'reports')}>
                    Analytics
                </button>
            </div>

            {/* --- MAINTENANCE SECTION --- */}
            {activeTab === 'maintenance' && (
                <div style={sectionStyle}>
                    <h3 style={{ padding: '15px', margin: 0, backgroundColor: '#f8f9fa', borderBottom: '1px solid #ddd' }}>🔧 Maintenance Issues</h3>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead style={headerStyle}>
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
                                <tr><td colSpan="6" style={{ padding: '20px', textAlign: 'center', color: '#6B7280' }}>No maintenance issues reported. ✓</td></tr>
                            ) : (
                                maintenanceRequests.map((m) => (
                                    <tr key={m.id} style={{ borderBottom: '1px solid #eee' }}>
                                        <td style={{ padding: '12px' }}>{m.student_name}</td>
                                        <td style={{ padding: '12px' }}>{m.current_residence}</td>
                                        <td style={{ padding: '12px', fontSize: '13px' }}>{m.description}</td>
                                        <td style={{ padding: '12px', fontWeight: 'bold', color: m.status === 'Resolved' ? '#10B981' : '#F59E0B' }}>
                                            {m.status}
                                        </td>
                                        <td style={{ padding: '12px' }}>
                                            <input 
                                                type="text" 
                                                placeholder="Add feedback..."
                                                value={landlordNotes[m.id] || m.landlord_notes || ""}
                                                onChange={(e) => setLandlordNotes({...landlordNotes, [m.id]: e.target.value})}
                                                style={{ padding: '5px', borderRadius: '4px', border: '1px solid #ccc', width: '100%', boxSizing: 'border-box' }}
                                            />
                                        </td>
                                        <td style={{ padding: '12px', textAlign: 'center' }}>
                                            {m.status !== 'Resolved' ? (
                                                <button 
                                                    onClick={() => handleMaintenanceUpdate(m.id, 'Resolved')} 
                                                    style={{ backgroundColor: '#10B981', color: 'white', border: 'none', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer', fontSize: '12px', fontWeight: '600' }}
                                                >
                                                    Mark Resolved
                                                </button>
                                            ) : (
                                                <span style={{ color: '#10B981', fontWeight: '600' }}>✓ Fixed</span>
                                            )}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            )}

            {/* --- RELOCATION SECTION --- */}
            {activeTab === 'relocations' && (
                <div style={sectionStyle}>
                    <h3 style={{ padding: '15px', margin: 0, backgroundColor: '#f8f9fa', borderBottom: '1px solid #ddd' }}>📦 Relocation Requests</h3>
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
                                <tr><td colSpan="5" style={{ padding: '20px', textAlign: 'center', color: '#6B7280' }}>No relocation requests. ✓</td></tr>
                            ) : (
                                pendingMoves.map((move) => (
                                    <tr key={move.id} style={{ borderBottom: '1px solid #eee' }}>
                                        <td style={{ padding: '12px', fontWeight: '500' }}>{move.student_name}</td>
                                        <td style={{ padding: '12px' }}>{move.current_residence}</td>
                                        <td style={{ padding: '12px' }}>{move.new_residence}</td>
                                        <td style={{ padding: '12px', fontWeight: 'bold', color: move.status === 'Pending' ? '#F59E0B' : move.status === 'Approved' ? '#10B981' : '#EF4444' }}>
                                            {move.status}
                                        </td>
                                        <td style={{ padding: '12px', textAlign: 'center' }}>
                                            {move.status === 'Pending' ? (
                                                <>
                                                    <button onClick={() => handleRelocationAction(move, 'Approved')} style={{ backgroundColor: '#10B981', color: 'white', border: 'none', padding: '6px 10px', marginRight: '5px', borderRadius: '4px', cursor: 'pointer', fontWeight: '600', fontSize: '12px' }}>Approve</button>
                                                    <button onClick={() => handleRelocationAction(move, 'Rejected')} style={{ backgroundColor: '#EF4444', color: 'white', border: 'none', padding: '6px 10px', borderRadius: '4px', cursor: 'pointer', fontWeight: '600', fontSize: '12px' }}>Reject</button>
                                                </>
                                            ) : (
                                                <span style={{ color: '#6B7280', fontWeight: '600' }}>Processed</span>
                                            )}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            )}

            {/* --- INACTIVE STUDENTS SECTION --- */}
            {activeTab === 'inactive' && (
                <div style={sectionStyle}>
                    <h3 style={{ padding: '15px', margin: 0, backgroundColor: '#f8f9fa', borderBottom: '1px solid #ddd' }}>⚠️ Inactive Students (No Payment in 60 Days)</h3>
                    {inactiveStudents.length === 0 ? (
                        <div style={{ padding: '20px', textAlign: 'center', color: '#10B981' }}>
                            <p style={{ margin: '0', fontWeight: '600' }}>All students are active! ✓</p>
                        </div>
                    ) : (
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead style={headerStyle}>
                                <tr>
                                    <th style={{ padding: '12px' }}>Student Name</th>
                                    <th style={{ padding: '12px' }}>Email</th>
                                    <th style={{ padding: '12px' }}>Residence</th>
                                    <th style={{ padding: '12px' }}>Days Inactive</th>
                                    <th style={{ padding: '12px' }}>Outstanding Balance</th>
                                    <th style={{ padding: '12px' }}>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {inactiveStudents.map((student, idx) => (
                                    <tr key={idx} style={{ borderBottom: '1px solid #eee', backgroundColor: idx % 2 === 0 ? '#FAFAFA' : 'white' }}>
                                        <td style={{ padding: '12px', fontWeight: '500' }}>{student.full_name}</td>
                                        <td style={{ padding: '12px', fontSize: '13px' }}>{student.email}</td>
                                        <td style={{ padding: '12px' }}>{student.current_residence}</td>
                                        <td style={{ padding: '12px', color: '#EF4444', fontWeight: '600', textAlign: 'center' }}>
                                            {Math.round(student.days_inactive) || 'N/A'} days
                                        </td>
                                        <td style={{ padding: '12px', color: '#EF4444', fontWeight: '600' }}>
                                            KES {student.rent_balance}
                                        </td>
                                        <td style={{ padding: '12px', textAlign: 'center' }}>
                                            <button 
                                                onClick={() => handleRemoveStudent(student.user_id, student.full_name)}
                                                style={{ backgroundColor: '#EF4444', color: 'white', border: 'none', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer', fontWeight: '600', fontSize: '12px' }}
                                            >
                                                Remove
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            )}

            {/* --- REPORTS SECTION --- */}
            {activeTab === 'reports' && <ReportGenerator user={user} />}
            </div>
        </div>
    );
};

export default LandlordDashboard;