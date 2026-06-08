import React, { useState } from 'react';
import axios from 'axios';

const RelocationForm = ({ studentId }) => {
    const [currentRes, setCurrentRes] = useState('');
    const [newRes, setNewRes] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await axios.post('http://localhost:5000/relocation/request', {
                student_id: studentId,
                current_residence: currentRes,
                new_residence: newRes
            });
            alert("Relocation request sent to Landlord!");
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <form onSubmit={handleSubmit} style={{ marginTop: '20px', borderTop: '1px solid #eee' }}>
            <h3>Request Relocation</h3>
            <input 
                type="text" 
                placeholder="Current Residence" 
                value={currentRes} 
                onChange={(e) => setCurrentRes(e.target.value)} 
                required 
            /><br/>
            <input 
                type="text" 
                placeholder="New Residence" 
                value={newRes} 
                onChange={(e) => setNewRes(e.target.value)} 
                required 
            /><br/>
            <button type="submit">Submit Move</button>
        </form>
    );
};

export default RelocationForm;