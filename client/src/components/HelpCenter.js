import React, { useState, useEffect } from 'react';
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

const HelpCenter = () => {
    const [helpTopics, setHelpTopics] = useState([]);
    const [selectedTopic, setSelectedTopic] = useState(null);
    const [facilities, setFacilities] = useState([]);

    useEffect(() => {
        fetchHelpTopics();
        fetchFacilities();
    }, []);

    const fetchHelpTopics = async () => {
        try {
            const res = await axios.get('http://localhost:5000/help/topics');
            setHelpTopics(res.data);
        } catch (err) {
            console.error("Error fetching help topics:", err);
        }
    };

    const fetchFacilities = async () => {
        try {
            const res = await axios.get('http://localhost:5000/facilities/details');
            setFacilities(res.data);
        } catch (err) {
            console.error("Error fetching facilities:", err);
        }
    };

    const cardStyle = {
        backgroundColor: theme.card,
        padding: '20px',
        borderRadius: '12px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
        marginBottom: '15px',
        cursor: 'pointer',
        transition: 'all 0.3s'
    };

    return (
        <div style={{ fontFamily: 'Inter, sans-serif' }}>
            <h1 style={{ fontSize: '28px', fontWeight: '800', marginBottom: '30px', color: theme.textMain }}>Help Center & Resources</h1>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px' }}>
                {/* Help Topics Section */}
                <div>
                    <h2 style={{ fontSize: '20px', fontWeight: '700', marginBottom: '15px', color: theme.primary }}>Frequently Asked Questions</h2>
                    {helpTopics.map(topic => (
                        <div 
                            key={topic.id}
                            style={{
                                ...cardStyle,
                                backgroundColor: selectedTopic?.id === topic.id ? '#EEF2FF' : theme.card,
                                borderLeft: selectedTopic?.id === topic.id ? `4px solid ${theme.primary}` : '4px solid transparent'
                            }}
                            onClick={() => setSelectedTopic(topic)}
                            onMouseOver={(e) => e.currentTarget.style.boxShadow = '0 4px 8px rgba(0,0,0,0.15)'}
                            onMouseOut={(e) => e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.1)'}
                        >
                            <h3 style={{ margin: '0 0 5px 0', color: theme.primary, fontSize: '14px', fontWeight: '700' }}>{topic.title}</h3>
                            <p style={{ margin: '0', color: theme.textMuted, fontSize: '12px' }}>Category: <strong>{topic.category}</strong></p>
                        </div>
                    ))}
                </div>

                {/* Selected Topic Detail & Facilities */}
                <div>
                    {selectedTopic ? (
                        <div style={{ ...cardStyle, backgroundColor: '#F0F9FF', borderLeft: `4px solid ${theme.primary}` }}>
                            <h2 style={{ fontSize: '20px', fontWeight: '700', margin: '0 0 15px 0', color: theme.primary }}>
                                {selectedTopic.title}
                            </h2>
                            <p style={{ margin: '0', color: theme.textMain, lineHeight: '1.6', fontSize: '14px' }}>
                                {selectedTopic.content}
                            </p>
                        </div>
                    ) : (
                        <div style={{ ...cardStyle, backgroundColor: '#FEF3C7', borderLeft: `4px solid #F59E0B` }}>
                            <p style={{ margin: '0', color: '#92400E', fontWeight: '600' }}>👈 Click on a topic to view details</p>
                        </div>
                    )}

                    <h2 style={{ fontSize: '18px', fontWeight: '700', marginTop: '25px', marginBottom: '15px', color: theme.primary }}>Our Facilities</h2>
                    {facilities.map(facility => (
                        <div key={facility.id} style={{ ...cardStyle, backgroundColor: '#F0FDF4' }}>
                            <h3 style={{ margin: '0 0 8px 0', color: theme.success, fontWeight: '700' }}>{facility.name}</h3>
                            <p style={{ margin: '0 0 8px 0', fontSize: '12px', color: theme.textMuted }}>{facility.description}</p>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', fontSize: '12px' }}>
                                <span><strong>Available Rooms:</strong> {facility.availableRooms}</span>
                                <span><strong>Price:</strong> KES {facility.pricePerMonth}</span>
                                <span colSpan="2"><strong>Utilities:</strong> {facility.utilities}</span>
                                <span colSpan="2"><strong>Amenities:</strong> {facility.amenities.join(', ')}</span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default HelpCenter;
