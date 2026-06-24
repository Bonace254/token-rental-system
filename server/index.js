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

// --- TOKEN REDEMPTION ENDPOINTS ---
// 1. Get available expense categories and rates
app.get('/tokens/expenses', async (req, res) => {
    try {
        const expenses = [
            { id: 1, name: 'Utilities Bill', description: 'Electricity, water, internet', tokensRequired: 100, amount: 'KES 1000' },
            { id: 2, name: 'Internet Bundle', description: 'Monthly internet subscription', tokensRequired: 120, amount: 'KES 1200' },
            { id: 3, name: 'Cleaning Service', description: 'Professional room cleaning', tokensRequired: 80, amount: 'KES 800' },
        ];
        res.json(expenses);
    } catch (err) {
        console.error(err.message);
        res.status(500).send("Server Error");
    }
});

// 2. Redeem tokens for an expense
app.post('/tokens/redeem', async (req, res) => {
    const client = await pool.connect();
    try {
        const { student_id, expense_id, tokens_used } = req.body;

        // Check student has enough tokens
        const tokenCheck = await client.query(
            "SELECT tokens_earned FROM users WHERE user_id = $1",
            [student_id]
        );

        if (!tokenCheck.rows[0] || tokenCheck.rows[0].tokens_earned < tokens_used) {
            return res.status(400).json({ error: "Insufficient tokens for redemption" });
        }

        await client.query('BEGIN');

        // Record token redemption
        await client.query(
            "INSERT INTO token_redemptions (student_id, expense_id, tokens_used, redemption_date) VALUES ($1, $2, $3, NOW())",
            [student_id, expense_id, tokens_used]
        );

        // Deduct tokens from student
        await client.query(
            "UPDATE users SET tokens_earned = tokens_earned - $1 WHERE user_id = $2",
            [tokens_used, student_id]
        );

        await client.query('COMMIT');
        res.json({ message: "Tokens redeemed successfully for expense!" });
    } catch (err) {
        await client.query('ROLLBACK');
        console.error(err.message);
        res.status(500).send("Server Error during token redemption");
    } finally {
        client.release();
    }
});

// 3. Get student token redemption history
app.get('/tokens/history/:student_id', async (req, res) => {
    try {
        const { student_id } = req.params;
        const history = await pool.query(
            `SELECT tr.id, tr.expense_id, tr.tokens_used, tr.redemption_date FROM token_redemptions tr 
             WHERE tr.student_id = $1 ORDER BY tr.redemption_date DESC`,
            [student_id]
        );
        res.json(history.rows);
    } catch (err) {
        console.error(err.message);
        res.status(500).send("Server Error");
    }
});

// --- LANDLORD ENDPOINTS FOR REMOVING INACTIVE STUDENTS ---
// 1. Get list of inactive students (no payments in 60 days)
app.get('/admin/inactive-students', async (req, res) => {
    try {
        const inactiveStudents = await pool.query(
            `SELECT u.user_id, u.full_name, u.email, u.current_residence, 
                    MAX(p.payment_date) AS last_payment, u.rent_balance,
                    EXTRACT(DAY FROM NOW() - MAX(p.payment_date)) as days_inactive
             FROM users u
             LEFT JOIN payments p ON u.user_id = p.student_id
             WHERE u.role = 'Student'
             GROUP BY u.user_id, u.full_name, u.email, u.current_residence, u.rent_balance
             HAVING EXTRACT(DAY FROM NOW() - MAX(p.payment_date)) > 60 OR MAX(p.payment_date) IS NULL
             ORDER BY days_inactive DESC`
        );
        res.json(inactiveStudents.rows);
    } catch (err) {
        console.error(err.message);
        res.status(500).send("Server Error");
    }
});

// 2. Remove an inactive student from the system
app.delete('/admin/remove-student/:student_id', async (req, res) => {
    const client = await pool.connect();
    try {
        const { student_id } = req.params;

        await client.query('BEGIN');

        // Mark student as removed/inactive in the system
        await client.query(
            "UPDATE users SET current_residence = 'Removed', rent_balance = 0 WHERE user_id = $1",
            [student_id]
        );

        await client.query('COMMIT');
        res.json({ message: "Student removed from system successfully!" });
    } catch (err) {
        await client.query('ROLLBACK');
        console.error(err.message);
        res.status(500).send("Server Error");
    } finally {
        client.release();
    }
});

// --- PARENT ENDPOINTS FOR MULTIPLE STUDENT MONITORING ---
// 1. Get all students linked to a parent
app.get('/parent/all-students/:parent_id', async (req, res) => {
    try {
        const { parent_id } = req.params;
        const students = await pool.query(
            `SELECT u.user_id, u.full_name, u.current_residence, u.rent_balance, u.tokens_earned,
                    (SELECT COUNT(*) FROM payments p WHERE p.student_id = u.user_id) as payment_count
             FROM users u
             WHERE u.role = 'Student' AND (
                SELECT COUNT(*) FROM parent_student_links WHERE parent_id = $1 AND student_id = u.user_id
             ) > 0`,
            [parent_id]
        );
        res.json(students.rows);
    } catch (err) {
        console.error(err.message);
        res.status(500).send("Server Error");
    }
});

// 2. Add multiple students to parent account
app.post('/parent/link-multiple-students', async (req, res) => {
    const client = await pool.connect();
    try {
        const { parent_id, student_emails } = req.body;

        await client.query('BEGIN');

        const results = [];
        for (const email of student_emails) {
            const studentResult = await client.query(
                "SELECT user_id FROM users WHERE email = $1 AND role = 'Student'",
                [email]
            );

            if (studentResult.rows.length > 0) {
                const student_id = studentResult.rows[0].user_id;
                await client.query(
                    "INSERT INTO parent_student_links (parent_id, student_id) VALUES ($1, $2) ON CONFLICT DO NOTHING",
                    [parent_id, student_id]
                );
                results.push({ email, status: 'linked' });
            } else {
                results.push({ email, status: 'not_found' });
            }
        }

        await client.query('COMMIT');
        res.json({ message: "Student linking completed!", results });
    } catch (err) {
        await client.query('ROLLBACK');
        console.error(err.message);
        res.status(500).send("Server Error");
    } finally {
        client.release();
    }
});

// --- HELP & FACILITIES ENDPOINTS ---
// 1. Get help topics and navigation guides
app.get('/help/topics', async (req, res) => {
    try {
        const helpTopics = [
            { id: 1, title: 'Getting Started', category: 'beginner', content: 'Welcome to Token-Rental System! This guide will help you navigate the platform. Step 1: Complete your profile. Step 2: Link your student/children accounts. Step 3: Start managing payments and tokens.' },
            { id: 2, title: 'Payment System', category: 'payments', content: 'How to make payments: 1. Go to your dashboard 2. Enter amount in the payment field 3. Click Pay 4. Tokens will be credited automatically' },
            { id: 3, title: 'Token System', category: 'tokens', content: 'Tokens are earned with every payment. Use tokens to redeem facility expenses and reduce your rent burden. 100 KES = 1 Token' },
            { id: 4, title: 'Room Relocation', category: 'housing', content: 'Need to change rooms? Submit a relocation request. The landlord will review and approve/reject your request within 48 hours.' },
            { id: 5, title: 'Maintenance Requests', category: 'support', content: 'Report maintenance issues: Click "Report Maintenance" and describe the problem. Landlord will contact you within 24 hours.' },
            { id: 6, title: 'Parent Monitoring', category: 'parents', content: 'Parents can monitor student performance by linking their account. Use student email to create a link.' }
        ];
        res.json(helpTopics);
    } catch (err) {
        console.error(err.message);
        res.status(500).send("Server Error");
    }
});

// 2. Get facility details
app.get('/facilities/details', async (req, res) => {
    try {
        const facilities = [
            { id: 1, name: 'Kilimanjaro Hall', description: 'Main hostel with modern amenities', availableRooms: 12, pricePerMonth: 15000, utilities: 'WiFi, Water, Electricity', amenities: ['Gym', 'Lounge', 'Study Area', 'Kitchen'] },
            { id: 2, name: 'Ruwenzori Hall', description: 'Premium comfort hostel', availableRooms: 8, pricePerMonth: 18000, utilities: 'WiFi, Water, Electricity, Cable TV', amenities: ['Gym', 'Lounge', 'Study Area', 'Kitchen', 'Security'] },
            { id: 3, name: 'Mara Complex', description: 'Budget-friendly accommodation', availableRooms: 15, pricePerMonth: 12000, utilities: 'WiFi, Water, Electricity', amenities: ['Lounge', 'Study Area', 'Kitchen'] },
            { id: 4, name: 'Elgon View', description: 'Scenic location with modern rooms', availableRooms: 10, pricePerMonth: 16000, utilities: 'WiFi, Water, Electricity', amenities: ['Gym', 'Lounge', 'Study Area', 'Kitchen', 'Parking'] }
        ];
        res.json(facilities);
    } catch (err) {
        console.error(err.message);
        res.status(500).send("Server Error");
    }
});

// 3. Book a facility room and assign the student automatically
app.post('/facilities/book', async (req, res) => {
    const { student_id, facility_id, facility_name, room_number, amount } = req.body;

    // 1. Validation check
    if (!student_id || !facility_id || !room_number) {
        return res.status(400).json({ error: "Missing required booking details." });
    }

    try {
        // 2. Check if the room is already booked using the pool instance
        const checkRoomSql = `
            SELECT id FROM bookings 
            WHERE facility_id = $1 AND room_number = $2 
            LIMIT 1;
        `;
        const roomCheckResult = await pool.query(checkRoomSql, [facility_id, room_number]);

        if (roomCheckResult.rows.length > 0) {
            return res.status(409).json({ 
                error: `Room ${room_number} is already booked. Please choose another room.` 
            });
        }

        // 3. Optional: Check if this student already booked a room anywhere else
        const checkStudentSql = `SELECT id FROM bookings WHERE student_id = $1 LIMIT 1;`;
        const studentCheckResult = await pool.query(checkStudentSql, [student_id]);
        
        if (studentCheckResult.rows.length > 0) {
            return res.status(400).json({ error: "You have already booked a room!" });
        }

        // 4. Insert utilizing your actual table columns matching pool variables
        const insertBookingSql = `
            INSERT INTO bookings (student_id, facility_id, facility_name, room_number, amount, booked_at)
            VALUES ($1, $2, $3, $4, $5, NOW())
            RETURNING *;
        `;
        const newBooking = await pool.query(insertBookingSql, [
            student_id, 
            facility_id, 
            facility_name || null, 
            room_number, 
            amount
        ]);

        // 5. Update the rent balance tracking in users table
        await pool.query(
            `UPDATE users SET rent_balance = rent_balance + $1 WHERE user_id = $2`,
            [amount, student_id]
        );

        return res.status(200).json({ 
            success: true, 
            message: "Room booked successfully!",
            booking: newBooking.rows[0]
        });

    } catch (err) {
        // Catch PostgreSQL unique constraint violation (Error code 23505)
        if (err.code === '23505') {
            return res.status(409).json({ 
                error: "This room was just taken by another student. Please reload and choose a different room." 
            });
        }
        
        console.error("Database Error:", err);
        return res.status(500).json({ error: "Internal server database failure." });
    }
});

// --- REPORT GENERATION ENDPOINTS ---
// 1. Generate student payment report
app.get('/reports/student-payment/:student_id', async (req, res) => {
    try {
        const { student_id } = req.params;
        const report = await pool.query(
            `SELECT u.full_name, u.email, u.current_residence, 
                    COUNT(p.id) as total_payments, 
                    SUM(p.amount) as total_paid,
                    SUM(p.tokens_earned) as tokens_earned,
                    u.rent_balance as outstanding_balance
             FROM users u
             LEFT JOIN payments p ON u.user_id = p.student_id
             WHERE u.user_id = $1
             GROUP BY u.user_id, u.full_name, u.email, u.current_residence, u.rent_balance`,
            [student_id]
        );
        res.json(report.rows[0] || {});
    } catch (err) {
        console.error(err.message);
        res.status(500).send("Server Error");
    }
});

// 2. Generate system-wide report
app.get('/reports/system-overview', async (req, res) => {
    try {
        const systemReport = await pool.query(
            `SELECT 
                (SELECT COUNT(*) FROM users WHERE role = 'Student') as total_students,
                (SELECT COUNT(*) FROM users WHERE role = 'Parent') as total_parents,
                (SELECT COUNT(*) FROM users WHERE role = 'Landlord') as total_landlords,
                (SELECT SUM(amount) FROM payments) as total_revenue,
                (SELECT AVG(rent_balance) FROM users WHERE role = 'Student') as avg_balance,
                (SELECT COUNT(*) FROM payments) as total_transactions`
        );
        res.json(systemReport.rows[0]);
    } catch (err) {
        console.error(err.message);
        res.status(500).send("Server Error");
    }
});

// 3. Generate landlord analytics
app.get('/reports/landlord-analytics', async (req, res) => {
    try {
        const landlordReport = await pool.query(
            `SELECT 
                (SELECT COUNT(*) FROM users WHERE role = 'Student' AND current_residence != 'Removed') as active_students,
                (SELECT COUNT(*) FROM maintenance WHERE status = 'Pending') as pending_maintenance,
                (SELECT COUNT(*) FROM relocations WHERE status = 'Pending') as pending_relocations,
                (SELECT COUNT(*) FROM maintenance WHERE status = 'Resolved') as resolved_issues,
                (SELECT SUM(amount) FROM payments) as total_collected`
        );
        res.json(landlordReport.rows[0]);
    } catch (err) {
        console.error(err.message);
        res.status(500).send("Server Error");
    }
});

app.listen(5000, () => {
    console.log("Server running smoothly on port 5000");
});