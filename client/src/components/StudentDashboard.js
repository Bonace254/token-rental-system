import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import TokenRedemption from './TokenRedemption';
import HelpCenter from './HelpCenter';
import ReportGenerator from './ReportGenerator';
import Header from './Header';

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
    const [activeTab, setActiveTab] = useState('overview');
    const [facilities, setFacilities] = useState([]);
    const [selectedFacility, setSelectedFacility] = useState(null);
    const [roomChoice, setRoomChoice] = useState('');
    const [bookingLoading, setBookingLoading] = useState(false);
    const [bookingSuccess, setBookingSuccess] = useState('');
    
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

    const fetchFacilities = async () => {
        try {
            const res = await axios.get('http://localhost:5000/facilities/details');
            const normalizedFacilities = (res.data || []).map((facility) => ({
                ...facility,
                // Best practice: structure data backend-side as objects: { number: 'Room 1', isBooked: false }
                roomOptions: facility.roomOptions || Array.from(
                    { length: facility.availableRooms || 0 },
                    (_, idx) => ({ number: `Room ${idx + 1}`, isBooked: false })
                )
            }));
            setFacilities(normalizedFacilities);
        } catch (err) {
            console.error("Error fetching facilities:", err);
        }
    };

    useEffect(() => {
        fetchStats();
        fetchFacilities();
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

    const handleBookFacility = async () => {
        if (!selectedFacility) return;
        if (!roomChoice) return alert('Please choose or enter a room number.');

        setBookingLoading(true);
        setBookingSuccess('');
        try {
            const res = await axios.post('http://localhost:5000/facilities/book', {
                student_id: user.user_id,
                facility_id: selectedFacility.id,
                room_number: roomChoice,
                amount: selectedFacility.pricePerMonth
            });
            
            const assignedResidence = res.data?.assignedResidence || `${selectedFacility.name} - ${roomChoice}`;
            setBookingSuccess(`Booked ${roomChoice} successfully in ${selectedFacility.name}.`);
            setStats((prev) => ({
                ...prev,
                current_residence: assignedResidence,
                rent_balance: (Number(prev.rent_balance) || 0) + Number(selectedFacility.pricePerMonth || 0)
            }));
            alert(`Booked ${selectedFacility.name} ${roomChoice}.`);
            setSelectedFacility(null);
            setRoomChoice('');
            fetchStats();
            fetchFacilities(); // Re-fetch to clear newly booked rooms out of the local pool
        } catch (err) {
            console.error(err);
            // Captures dynamic server side errors ("This room is already taken")
            const errorMsg = err.response?.data?.error || "Failed to book selected room. Please try again.";
            alert(errorMsg);
        } finally {
            setBookingLoading(false);
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
        padding: '20px',
        borderRadius: '12px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
        marginBottom: '16px'
    };

    const tabButtonStyle = (isActive) => ({
        padding: '10px 18px',
        border: 'none',
        backgroundColor: isActive ? theme.primary : theme.bg,
        color: isActive ? 'white' : theme.textMain,
        borderRadius: '8px',
        cursor: 'pointer',
        fontWeight: '600',
        fontSize: '13px',
        transition: 'all 0.3s',
        marginRight: '8px'
    });

    // Facility Preview Modal
    const FacilityPreview = ({ facility }) => {
        if (!facility) return null;
        return (
            <div style={{
                ...cardStyle,
                backgroundColor: '#F0FDF4',
                borderLeft: `4px solid ${theme.success}`,
                marginBottom: '20px'
            }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                    <div>
                        <h3 style={{ margin: '0 0 8px 0', color: theme.success, fontSize: '18px', fontWeight: '700' }}>
                            📍 {facility.name}
                        </h3>
                        <p style={{ margin: '0 0 12px 0', color: theme.textMuted, fontSize: '14px' }}>
                            {facility.description}
                        </p>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', fontSize: '13px' }}>
                            <div>
                                <strong>Monthly Rent:</strong>
                                <p style={{ margin: '5px 0 0 0', color: theme.success, fontWeight: '700', fontSize: '18px' }}>KES {facility.pricePerMonth}</p>
                            </div>
                            <div>
                                <strong>Available Rooms:</strong>
                                <p style={{ margin: '5px 0 0 0', fontSize: '16px', fontWeight: '700' }}>{facility.availableRooms}</p>
                            </div>
                            <div colSpan="2">
                                <strong>Utilities Included:</strong>
                                <p style={{ margin: '5px 0 0 0' }}>{facility.utilities}</p>
                            </div>
                            <div colSpan="2">
                                <strong>Amenities:</strong>
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '8px' }}>
                                    {facility.amenities.map((amenity, idx) => (
                                        <span key={idx} style={{ backgroundColor: '#ECFDF5', padding: '4px 12px', borderRadius: '20px', fontSize: '12px', color: theme.success, fontWeight: '600' }}>
                                            ✓ {amenity}
                                        </span>
                                    ))}
                                </div>
                            </div>

                            <div style={{ marginTop: '20px', padding: '20px', background: 'white', borderRadius: '16px', border: '1px solid #E5E7EB' }}>
                                <h3 style={{ margin: '0 0 12px 0', fontSize: '18px', color: '#111827' }}>Book Room</h3>
                                <p style={{ margin: '0 0 16px 0', color: '#475569', fontSize: '14px', lineHeight: '1.7' }}>
                                    Select an unbooked room number and reserve it now.
                                </p>
                                <div style={{ display: 'grid', gap: '12px' }}>
                                    {facility.roomOptions?.length ? (
                                        <select value={roomChoice} onChange={(e) => setRoomChoice(e.target.value)} style={{ padding: '12px', borderRadius: '10px', border: '1px solid #CBD5E1', fontSize: '14px' }}>
                                            <option value="">Choose a room</option>
                                            {facility.roomOptions.map((room, idx) => {
                                                // Handles room structure if structured as object or fallback primitive strings
                                                const roomNumber = room?.number || room;
                                                const isDisabled = room?.isBooked === true;
                                                return (
                                                    <option key={idx} value={roomNumber} disabled={isDisabled}>
                                                        {roomNumber} {isDisabled ? '(Occupied)' : ''}
                                                    </option>
                                                );
                                            })}
                                        </select>
                                    ) : (
                                        <input
                                            type="text"
                                            placeholder="Enter room number"
                                            value={roomChoice}
                                            onChange={(e) => setRoomChoice(e.target.value)}
                                            style={{ padding: '12px', borderRadius: '10px', border: '1px solid #CBD5E1', fontSize: '14px' }}
                                        />
                                    )}
                                    <button
                                        onClick={handleBookFacility}
                                        disabled={bookingLoading}
                                        style={{
                                            backgroundColor: theme.primary,
                                            color: 'white',
                                            border: 'none',
                                            padding: '14px 18px',
                                            borderRadius: '12px',
                                            fontWeight: '700',
                                            cursor: bookingLoading ? 'not-allowed' : 'pointer'
                                        }}
                                    >
                                        {bookingLoading ? 'Booking...' : 'Book Room'}
                                    </button>
                                    {bookingSuccess && <p style={{ margin: 0, color: theme.success, fontWeight: '600' }}>{bookingSuccess}</p>}
                                </div>
                            </div>
                        </div>
                    </div>
                    <button
                        onClick={() => setSelectedFacility(null)}
                        style={{
                            backgroundColor: theme.danger,
                            color: 'white',
                            border: 'none',
                            width: '30px',
                            height: '30px',
                            borderRadius: '50%',
                            cursor: 'pointer',
                            fontWeight: 'bold'
                        }}
                    >
                        ×
                    </button>
                </div>
            </div>
        );
    };

    return (
        <div style={{ fontFamily: 'Inter, sans-serif' }}>
            <Header title="Student Dashboard" showLogo={true} />
            <div style={{ padding: '20px 28px' }}>
            {/* Navigation Tabs */}
<div style={{ marginBottom: '30px', display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
    <button 
        onClick={() => setActiveTab('overview')} 
        style={{ ...tabButtonStyle(activeTab === 'overview'), fontSize: '18px' }}
    >
        Overview
    </button>
    <button 
        onClick={() => setActiveTab('facilities')} 
        style={{ ...tabButtonStyle(activeTab === 'facilities'), fontSize: '18px' }}
    >
        Facilities
    </button>
    <button 
        onClick={() => setActiveTab('tokens')} 
        style={{ ...tabButtonStyle(activeTab === 'tokens'), fontSize: '18px' }}
    >
        Tokens
    </button>
    <button 
        onClick={() => setActiveTab('reports')} 
        style={{ ...tabButtonStyle(activeTab === 'reports'), fontSize: '18px' }}
    >
        📄 Reports
    </button>
    <button 
        onClick={() => setActiveTab('help')} 
        style={{ ...tabButtonStyle(activeTab === 'help'), fontSize: '18px' }}
    >
        ❓ Help
    </button>
</div>

            {/* TAB: OVERVIEW */}
            {activeTab === 'overview' && (
                <>
                    <div style={{ marginBottom: '32px' }}>
                        <h1 style={{ fontSize: '26px', fontWeight: '800' }}>Welcome, {user.full_name}</h1>
                        <p style={{ color: theme.textMuted }}>
                            Residence: <strong>{stats.current_residence || "Not Assigned"}</strong>
                        </p>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px', marginBottom: '32px' }}>
                        <div style={{ ...cardStyle, borderTop: `4px solid ${theme.danger}` }}>
                            <p style={{ color: theme.textMuted, fontSize: '14px', fontWeight: '700' }}>OUTSTANDING BALANCE</p>
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
                            <p style={{ color: theme.textMuted, fontSize: '14px', fontWeight: '700' }}>YOUR REWARDS</p>
                            <h2 style={{ fontSize: '32px', margin: '10px 0', color: theme.primary }}>
                                {stats.tokens_earned} <span style={{fontSize: '18px'}}>Tokens</span>
                            </h2>
                            <p style={{ fontSize: '14px', color: theme.textMuted }}>Earn 1 token for every KES 100 paid!</p>
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
                            <h4 style={{ fontSize: '16px', marginBottom: '10px' }}>Issue Tracking</h4>
                            {myMaintenance.length > 0 ? (
                                myMaintenance.map((m, index) => (
                                    <div key={index} style={{ padding: '10px', borderBottom: '1px solid #f9f9f9', fontSize: '14px' }}>
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
                                            <p style={{ backgroundColor: '#F3F4F6', padding: '8px', borderRadius: '6px', marginTop: '5px', fontSize: '14px' }}>
                                                <strong>Feedback:</strong> {m.landlord_notes}
                                            </p>
                                        )}
                                    </div>
                                ))
                            ) : (
                                <p style={{ fontSize: '14px', color: theme.textMuted }}>No issues reported.</p>
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
                            <h4 style={{ fontSize: '16px', marginBottom: '10px' }}>Relocation History</h4>
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
                                            <span style={{ fontWeight: 'bold', fontSize: '14px' }}>To: {req.new_residence}</span>
                                            <span style={{ fontSize: '14px', fontWeight: '800', color: req.status === 'Approved' ? theme.success : req.status === 'Rejected' ? theme.danger : '#B45309'}}>
                                                {req.status ? req.status.toUpperCase() : 'PENDING'}
                                            </span>
                                        </div>
                                        <p style={{ fontSize: '14px', marginTop: '5px', color: '#374151' }}>
                                            <strong>Landlord Notes:</strong> {req.landlord_notes || "No feedback yet."}
                                        </p>
                                    </div>
                                ))
                            ) : (
                                <p style={{ fontSize: '14px', color: theme.textMuted }}>No previous requests.</p>
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
                </>
            )}

            {/* TAB: FACILITIES */}
            {activeTab === 'facilities' && (
                <>
                    <h1 style={{ fontSize: '26px', fontWeight: '800', marginBottom: '20px' }}>Browse Facilities</h1>
                    <p style={{ color: theme.textMuted, marginBottom: '25px', fontSize: '18px' }}>
                        View detailed information about available facilities before making your payment. Click on a facility to see complete details.
                    </p>

                    {selectedFacility && <FacilityPreview facility={selectedFacility} />}

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
                        {facilities.map(facility => (
                            <div 
                                key={facility.id}
                                style={{
                                    ...cardStyle,
                                    borderTop: `4px solid ${theme.primary}`,
                                    cursor: 'pointer',
                                    transition: 'all 0.3s'
                                }}
                                onClick={() => {
                                    setSelectedFacility(facility);
                                    setRoomChoice('');
                                    setBookingSuccess('');
                                }}
                                onMouseOver={(e) => e.currentTarget.style.boxShadow = '0 8px 16px rgba(0,0,0,0.15)'}
                                onMouseOut={(e) => e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.1)'}
                            >
                                <h3 style={{ margin: '0 0 10px 0', color: theme.primary, fontSize: '18px', fontWeight: '700' }}>
                                    {facility.name}
                                </h3>
                                <p style={{ margin: '0 0 12px 0', color: theme.textMuted, fontSize: '16px' }}>
                                    {facility.description}
                                </p>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '12px', borderTop: '1px solid #E5E7EB' }}>
                                    <div>
                                        <p style={{ margin: '0', fontSize: '14px', color: theme.textMuted }}>Monthly</p>
                                        <p style={{ margin: '5px 0 0 0', fontSize: '20px', fontWeight: '800', color: theme.success }}>
                                            KES {facility.pricePerMonth}
                                        </p>
                                    </div>
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setSelectedFacility(facility);
                                        }}
                                        style={{
                                            backgroundColor: theme.primary,
                                            color: 'white',
                                            border: 'none',
                                            padding: '8px 16px',
                                            borderRadius: '6px',
                                            fontWeight: '600',
                                            cursor: 'pointer'
                                        }}
                                    >
                                        View Details →
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </>
            )}

            {/* TAB: TOKENS */}
            {activeTab === 'tokens' && (
                <TokenRedemption
                    user={user}
                    tokens={stats.tokens_earned}
                    onRedeemSuccess={fetchStats}
                />
            )}

            {/* TAB: HELP */}
            {activeTab === 'help' && <HelpCenter />}

            {/* TAB: REPORTS */}
            {activeTab === 'reports' && <ReportGenerator user={user} />}
            </div>
        </div>
    );
};

export default StudentDashboard;