const express = require('express');
const cors = require('cors');
const pool = require('./db');
const app = express();

app.use(cors());
app.use(express.json());

// --- AUXILIARY ENDPOINTS ---
app.get('/rooms/available', async (req, res) => {
    try {
        const dynamicRooms = {
            hostels: ["Kilimanjaro Hall", "Ruwenzori Hall", "Mara Complex", "Elgon View"],
            rooms: ["101", "102", "201", "202", "301", "302"]
        };
        res.json(dynamicRooms);
    } catch (err) {
        console.error("Error fetching available rooms:", err.message);
        res.status(500).send("Server Error");
    }
});

// --- AUTHENTICATION ---
app.post('/auth/register', async (req, res) => {
    try {
        console.log("Incoming Registration Data:", req.body);
        const { full_name, email, password, role, hostel, room } = req.body;

        if (!full_name) {
            return res.status(400).send("Error: 'full_name' is missing.");
        }

        let assignedResidence = 'Not Assigned';
        let initialBalance = 0;

        if (role === 'Student' && hostel && room) {
            assignedResidence = `${hostel.trim()} - Room ${room.trim()}`;
            initialBalance = 15000; 
        }

        const newUser = await pool.query(
            "INSERT INTO users (full_name, email, password_hash, role, tokens_earned, current_residence, rent_balance) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *",
            [full_name, email, password, role, 0, assignedResidence, initialBalance]
        );
        
        console.log("Saved User Profile in DB:", newUser.rows[0]); 
        res.json(newUser.rows[0]);
    } catch (err) {
        console.error("Database Error:", err.message);
        res.status(500).send("Database Error: " + err.message);
    }
});

app.post('/auth/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await pool.query("SELECT user_id, full_name, email, password_hash, role, tokens_earned, current_residence, rent_balance FROM users WHERE email = $1", [email]);

        if (user.rows.length === 0 || user.rows[0].password_hash !== password) {
            return res.status(401).json("Invalid Email or Password");
        }

        console.log("User Data returning on Login:", user.rows[0]);
        res.json(user.rows[0]); 
    } catch (err) {
        console.error(err.message);
        res.status(500).send("Login Error");
    }
});

// --- STUDENT CORE METRICS ---
app.get('/student/stats/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const stats = await pool.query(
            `SELECT u.tokens_earned, u.current_residence, u.rent_balance 
             FROM users u WHERE u.user_id = $1`,
            [id]
        );
        res.json(stats.rows[0] || { tokens_earned: 0, current_residence: 'Not Assigned', rent_balance: 0 });
    } catch (err) {
        console.error(err.message);
        res.status(500).send("Server Error");
    }
});

// --- MAINTENANCE ENDPOINTS ---
app.post('/maintenance/request', async (req, res) => {
    try {
        const { user_id, description } = req.body;
        const newIssue = await pool.query(
            "INSERT INTO maintenance (student_id, description, status) VALUES ($1, $2, 'Pending') RETURNING *",
            [user_id, description]
        );
        res.json(newIssue.rows[0]);
    } catch (err) {
        console.error(err.message);
        res.status(500).send("Server Error");
    }
});

app.get('/maintenance/student/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const results = await pool.query(
            "SELECT id, description, status, landlord_notes FROM maintenance WHERE student_id = $1 ORDER BY id DESC",
            [id]
        );
        res.json(results.rows);
    } catch (err) {
        console.error(err.message);
        res.status(500).send("Server Error");
    }
});

// --- RELOCATION ENDPOINTS ---
app.post('/relocation/request', async (req, res) => {
    try {
        const { student_id, current_residence, new_residence } = req.body;
        const newMove = await pool.query(
            "INSERT INTO relocations (student_id, current_residence, new_residence, status) VALUES ($1, $2, $3, $4) RETURNING *",
            [student_id, current_residence, new_residence, 'Pending']
        );
        res.json(newMove.rows[0]);
    } catch (err) {
        console.error("Server Error:", err.message);
        res.status(500).send("Database Error");
    }
});

app.get('/relocation/student/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const results = await pool.query(
            "SELECT * FROM relocations WHERE student_id = $1 ORDER BY id DESC",
            [id]
        );
        res.json(results.rows);
    } catch (err) {
        console.error(err.message);
        res.status(500).send("Server Error");
    }
});

// --- PAYMENTS & TOKENS ---
app.post('/payments/pay', async (req, res) => {
    const client = await pool.connect(); 
    try {
        const { student_id, amount, tokens_earned, due_date } = req.body;
        const paymentAmount = parseInt(amount);
        const earned = parseInt(tokens_earned);

        await client.query('BEGIN'); 

        await client.query(
            "INSERT INTO payments (student_id, amount, tokens_earned, payment_date, due_date) VALUES ($1, $2, $3, NOW(), $4)",
            [student_id, paymentAmount, earned, due_date]
        );

        await client.query(
            "UPDATE users SET rent_balance = rent_balance - $1, tokens_earned = tokens_earned + $2 WHERE user_id = $3",
            [paymentAmount, earned, student_id]
        );

        await client.query('COMMIT'); 
        res.json({ message: "Payment successful and balance updated!" });
    } catch (err) {
        await client.query('ROLLBACK'); 
        console.error(err.message);
        res.status(500).send("Server Error during payment");
    } finally {
        client.release();
    }
});

app.get('/payments/history/:student_id', async (req, res) => {
    try {
        const { student_id } = req.params;
        const history = await pool.query(
            "SELECT amount, payment_date, tokens_earned FROM payments WHERE student_id = $1 ORDER BY payment_date DESC",
            [student_id]
        );
        res.json(history.rows);
    } catch (err) {
        console.error(err.message);
        res.status(500).send("Server Error");
    }
});

// --- PARENT LINKING ---
app.post('/parent/link-student', async (req, res) => {
    try {
        const { parent_id, student_email } = req.body;
        const studentResult = await pool.query(
            "SELECT user_id, full_name FROM users WHERE email = $1 AND role = 'Student'",
            [student_email]
        );

        if (studentResult.rows.length === 0) {
            return res.status(404).json({ error: "No student found with that email." });
        }

        const student_id = studentResult.rows[0].user_id; 
        await pool.query(
            "UPDATE users SET monitoring_student_id = $1 WHERE user_id = $2",
            [student_id, parent_id]
        );

        res.json({ message: "Link successful!", student_id });
    } catch (err) {
        console.error(err);
        res.status(500).send("Server Error");
    }
});

// --- PARENT ACCESS & MONITORING ---
app.get('/parent/monitored-student/:parent_id', async (req, res) => {
    try {
        const { parent_id } = req.params;

        // 1. Find who this parent is tracking
        const parentCheck = await pool.query(
            "SELECT monitoring_student_id FROM users WHERE user_id = $1 AND role = 'Parent'",
            [parent_id]
        );

        if (parentCheck.rows.length === 0 || !parentCheck.rows[0].monitoring_student_id) {
            return res.status(404).json({ error: "No student linked to this parent account yet." });
        }

        const studentId = parentCheck.rows[0].monitoring_student_id;

        // 2. Fetch student's core stats
        const studentStats = await pool.query(
            "SELECT user_id, full_name, current_residence, rent_balance, tokens_earned FROM users WHERE user_id = $1",
            [studentId]
        );

        // 3. Fetch student's payment ledger
        const paymentHistory = await pool.query(
            "SELECT amount, payment_date, tokens_earned FROM payments WHERE student_id = $1 ORDER BY payment_date DESC",
            [studentId]
        );

        res.json({
            student: studentStats.rows[0],
            payments: paymentHistory.rows
        });
    } catch (err) {
        console.error("Error fetching monitored student data:", err.message);
        res.status(500).send("Server Error");
    }
});


// --- LANDLORD/ADMIN: VIEW ALL MAINTENANCE REQUESTS ---
app.get('/admin/maintenance', async (req, res) => {
    try {
        const results = await pool.query(
            `SELECT m.id, m.description, m.status, m.landlord_notes, u.full_name AS student_name, u.current_residence 
             FROM maintenance m
             JOIN users u ON m.student_id = u.user_id
             ORDER BY m.id DESC`
        );
        res.json(results.rows);
    } catch (err) {
        console.error(err.message);
        res.status(500).send("Server Error");
    }
});

// --- LANDLORD/ADMIN: UPDATE MAINTENANCE STATUS ---
app.put('/admin/maintenance/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { status, landlord_notes } = req.body; 
        const updated = await pool.query(
            "UPDATE maintenance SET status = $1, landlord_notes = $2 WHERE id = $3 RETURNING *",
            [status, landlord_notes, id]
        );
        res.json(updated.rows[0]);
    } catch (err) {
        console.error(err.message);
        res.status(500).send("Server Error");
    }
});

// --- LANDLORD/ADMIN: VIEW ALL RELOCATION REQUESTS ---
app.get('/admin/relocations', async (req, res) => {
    try {
        const results = await pool.query(
            `SELECT r.id, r.current_residence, r.new_residence, r.status, u.full_name AS student_name, u.user_id AS student_id
             FROM relocations r
             JOIN users u ON r.student_id = u.user_id
             ORDER BY r.id DESC`
        );
        res.json(results.rows);
    } catch (err) {
        console.error(err.message);
        res.status(500).send("Server Error");
    }
});

// --- LANDLORD/ADMIN: APPROVE/REJECT RELOCATION ---
app.put('/admin/relocations/:id', async (req, res) => {
    const client = await pool.connect();
    try {
        const { id } = req.params;
        const { status, student_id, new_residence } = req.body; 

        await client.query('BEGIN');

        // 1. Update the relocation status record
        const updatedRelocation = await client.query(
            "UPDATE relocations SET status = $1 WHERE id = $2 RETURNING *",
            [status, id]
        );

        // 2. If approved, instantly update the student's current_residence profile
        if (status === 'Approved') {
            await client.query(
                "UPDATE users SET current_residence = $1 WHERE user_id = $2",
                [new_residence, student_id]
            );
        }

        await client.query('COMMIT');
        res.json({ message: `Relocation request ${status.toLowerCase()} successfully!` });
    } catch (err) {
        await client.query('ROLLBACK');
        console.error(err.message);
        res.status(500).send("Server Error processing relocation");
    } finally {
        client.release();
    }
});

// Process a payment made by a parent on behalf of a student
app.post('/payments/parent-pay', async (req, res) => {
    const client = await pool.connect();
    try {
        const { student_id, amount, due_date } = req.body;
        const paymentAmount = parseInt(amount);
        const earnedTokens = Math.floor(paymentAmount / 100); 

        if (!student_id || paymentAmount <= 0) {
            return res.status(400).json({ error: "Invalid student reference or amount." });
        }

        await client.query('BEGIN');

        // Insert record into payments ledger
        await client.query(
            "INSERT INTO payments (student_id, amount, tokens_earned, payment_date, due_date) VALUES ($1, $2, $3, NOW(), $4)",
            [student_id, paymentAmount, earnedTokens, due_date || '2026-05-01']
        );

        // Deduct balance and update student tokens instantly
        await client.query(
            "UPDATE users SET rent_balance = rent_balance - $1, tokens_earned = tokens_earned + $2 WHERE user_id = $3",
            [paymentAmount, earnedTokens, student_id]
        );

        await client.query('COMMIT');
        res.json({ message: "Payment processed successfully! Changes reflected instantly." });
    } catch (err) {
        await client.query('ROLLBACK');
        console.error("Parent payment process crash:", err.message);
        res.status(500).send("Server Error processing parent payment");
    } finally {
        client.release();
    }
});

app.listen(5000, () => {
    console.log("Server running smoothly on port 5000");
});