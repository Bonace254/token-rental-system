const express = require('express');
const router = express.Router();
const pool = require('../db');

// Student submits a request
router.post('/request', async (req, res) => {
    try {
        const { user_id, description } = req.body;
        const newRequest = await pool.query(
            "INSERT INTO maintenance_requests (student_id, description, status) VALUES ($1, $2, 'Pending') RETURNING *",
            [user_id, description]
        );
        res.json(newRequest.rows[0]);
    } catch (err) {
        console.error(err.message);
        res.status(500).send("Server Error");
    }
});

// Student fetches their specific requests
router.get('/student/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const requests = await pool.query(
            "SELECT * FROM maintenance_requests WHERE student_id = $1 ORDER BY id DESC",
            [id]
        );
        res.json(requests.rows);
    } catch (err) {
        console.error(err.message);
        res.status(500).send("Server Error");
    }
});

// Get ALL requests for the Landlord view
router.get('/all', async (req, res) => {
    try {
        // We join with the users table to see the student's name
        const allRequests = await pool.query(
            `SELECT m.*, u.full_name 
             FROM maintenance_requests m 
             JOIN users u ON m.student_id = u.user_id 
             ORDER BY m.id DESC`
        );
        res.json(allRequests.rows);
    } catch (err) {
        console.error(err.message);
        res.status(500).send("Server Error");
    }
});

// Landlord updates the status or adds feedback
router.put('/update/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { status, landlord_notes } = req.body;
        const updated = await pool.query(
            "UPDATE maintenance_requests SET status = $1, landlord_notes = $2 WHERE id = $3 RETURNING *",
            [status, landlord_notes, id]
        );
        res.json(updated.rows[0]);
    } catch (err) {
        console.error(err.message);
        res.status(500).send("Server Error");
    }
});

module.exports = router;