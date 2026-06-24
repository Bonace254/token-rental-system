import React, { useState, useEffect } from 'react';
import axios from 'axios';

const theme = {
    primary: '#4F46E5',
    success: '#10B981',
    danger: '#EF4444',
    warning: '#F59E0B',
    card: '#FFFFFF',
    textMain: '#111827',
    textMuted: '#6B7280',
    bg: '#F3F4F6'
};

const TokenRedemption = ({ user, tokens = 0, onRedeemSuccess }) => {
    const [expenses, setExpenses] = useState([]);
    const [redemptionHistory, setRedemptionHistory] = useState([]);
    const [currentTokens, setCurrentTokens] = useState(tokens || user?.tokens_earned || 0);
    const [selectedExpense, setSelectedExpense] = useState(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchExpenses();
        fetchHistory();
    }, [user?.user_id]);

    const fetchExpenses = async () => {
        try {
            const res = await axios.get('http://localhost:5000/tokens/expenses');
            setExpenses(res.data);
        } catch (err) {
            console.error("Error fetching expenses:", err);
        }
    };

    const fetchHistory = async () => {
        try {
            const res = await axios.get(`http://localhost:5000/tokens/history/${user?.user_id}`);
            setRedemptionHistory(res.data || []);
        } catch (err) {
            console.error("Error fetching history:", err);
        }
    };

    useEffect(() => {
        setCurrentTokens(tokens || user?.tokens_earned || 0);
    }, [tokens, user?.tokens_earned]);

    const handleRedeem = async (expense) => {
        if (currentTokens < expense.tokensRequired) {
            alert(`Insufficient tokens! You need ${expense.tokensRequired} tokens but have ${currentTokens}`);
            return;
        }

        try {
            setLoading(true);
            await axios.post('http://localhost:5000/tokens/redeem', {
                student_id: user?.user_id,
                expense_id: expense.id,
                tokens_used: expense.tokensRequired
            });

            alert(`Successfully redeemed ${expense.tokensRequired} tokens for ${expense.name}!`);
            setCurrentTokens((prev) => prev - expense.tokensRequired);
            setSelectedExpense(null);
            fetchHistory();
            if (onRedeemSuccess) onRedeemSuccess();
        } catch (err) {
            alert(err.response?.data?.error || "Redemption failed");
        } finally {
            setLoading(false);
        }
    };

    const cardStyle = {
        backgroundColor: theme.card,
        padding: '20px',
        borderRadius: '12px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
        marginBottom: '15px'
    };

    return (
        <div style={{ fontFamily: 'Inter, sans-serif' }}>
            <h1 style={{ fontSize: '28px', fontWeight: '800', marginBottom: '10px', color: theme.textMain }}>Token Redemption</h1>
            <p style={{ color: theme.textMuted, fontSize: '18px', color: theme.textMain, marginBottom: '30px' }}>Use your earned tokens to reduce living expenses</p>

          

            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '30px' }}>
                {/* Expenses Section */}
                <div>
                    <h2 style={{ fontSize: '20px', fontWeight: '700', marginBottom: '15px', color: theme.primary }}>Available Expenses to Redeem</h2>
                    {expenses.map(expense => (
                        <div
                            key={expense.id}
                            style={{
                                ...cardStyle,
                                borderLeft: `4px solid ${currentTokens >= expense.tokensRequired ? theme.success : theme.danger}`,
                                opacity: currentTokens >= expense.tokensRequired ? 1 : 0.6
                            }}
                        >
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                                <div>
                                    <h3 style={{ margin: '0 0 5px 0', color: theme.textMain, fontWeight: '700' }}>{expense.name}</h3>
                                    <p style={{ margin: '0 0 8px 0', color: theme.textMuted, fontSize: '16px' }}>{expense.description}</p>
                                    <div style={{ display: 'flex', gap: '15px', fontSize: '12px' }}>
                                        <span><strong>Tokens:</strong> <span style={{ color: theme.warning, fontWeight: '700' }}>{expense.tokensRequired}</span></span>
                                        <span><strong>Value:</strong> <span style={{ color: theme.success, fontWeight: '700' }}>{expense.amount}</span></span>
                                    </div>
                                </div>
                                <button
                                    onClick={() => handleRedeem(expense)}
                                    disabled={currentTokens < expense.tokensRequired || loading}
                                    style={{
                                        backgroundColor: currentTokens >= expense.tokensRequired ? theme.success : theme.danger,
                                        color: 'white',
                                        border: 'none',
                                        padding: '8px 16px',
                                        borderRadius: '6px',
                                        fontWeight: '600',
                                        cursor: currentTokens >= expense.tokensRequired ? 'pointer' : 'not-allowed',
                                        opacity: currentTokens >= expense.tokensRequired ? 1 : 0.6
                                    }}
                                >
                                    Redeem
                                </button>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Redemption History */}
                <div>
                    <h2 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '15px', color: theme.primary }}>Redemption History</h2>
                    {redemptionHistory.length === 0 ? (
                        <div style={{ ...cardStyle, backgroundColor: '#F0FDF4', textAlign: 'center' }}>
                            <p style={{ color: theme.textMuted, margin: '0' }}>No redemptions yet</p>
                        </div>
                    ) : (
                        redemptionHistory.map((redemption, idx) => (
                            <div key={idx} style={{ ...cardStyle, backgroundColor: '#F0F9FF' }}>
                                <p style={{ margin: '0 0 5px 0', fontWeight: '600', color: theme.primary }}>
                                    Expense #{redemption.expense_id}
                                </p>
                                <p style={{ margin: '0 0 5px 0', fontSize: '14px', color: theme.textMuted }}>
                                    <strong>Tokens Used:</strong> {redemption.tokens_used}
                                </p>
                                <p style={{ margin: '0', fontSize: '12px', color: theme.textMuted }}>
                                    <strong>Date:</strong> {new Date(redemption.redemption_date).toLocaleDateString()}
                                </p>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};

export default TokenRedemption;
