/* Author: Jonathan Lamontagne-Kratz */
import { useState } from 'react';
import useAuth from '../utils/auth';
import Button from './ui/Button';
import Input from './ui/Input';
import { fetchWithAuth } from '../utils/api';
import styles from './CalendarSelector.module.css';

const API_URL = import.meta.env.VITE_API_URL;

function addWeeks(isoDate, weeks) {
    const [y, m, d] = isoDate.split('-').map(Number);
    const dt = new Date(Date.UTC(y, m - 1, d));
    dt.setUTCDate(dt.getUTCDate() + weeks * 7);
    return dt.toISOString().slice(0, 10);
}

function CalendarSelector({ onCreated }) {
    const { user } = useAuth();
    const [date, setDate] = useState('');
    const [timeFrom, setTimeFrom] = useState('');
    const [timeTo, setTimeTo] = useState('');
    const [weeks, setWeeks] = useState(1);
    const [submitting, setSubmitting] = useState(false);
    const [status, setStatus] = useState(null);

    async function handleSubmit(e) {
        e.preventDefault();
        setStatus(null);

        const weekCount = Math.max(1, Number(weeks) || 1);
        if (!date || !timeFrom || !timeTo) {
            setStatus({ type: 'error', message: 'Fill in all fields.' });
            return;
        }
        if (timeFrom >= timeTo) {
            setStatus({ type: 'error', message: 'End time must be after start time.' });
            return;
        }

        setSubmitting(true);
        const failures = [];
        for (let i = 0; i < weekCount; i++) {
            const slotDate = addWeeks(date, i);
            try {
                const r = await fetchWithAuth(`${API_URL}/slots/create`, {
                    method: 'POST',
                    body: JSON.stringify({ date: slotDate, timeFrom, timeTo }),
                });
                if (!r.ok) {
                    const data = await r.json().catch(() => ({}));
                    failures.push({ date: slotDate, message: data.message || `HTTP ${r.status}` });
                }
            } catch (err) {
                failures.push({ date: slotDate, message: err.message });
            }
        }

        setSubmitting(false);

        const created = weekCount - failures.length;
        if (failures.length === 0) {
            setStatus({ type: 'success', message: `Created ${created} slot${created === 1 ? '' : 's'}.` });
            setDate('');
            setTimeFrom('');
            setTimeTo('');
            setWeeks(1);
        } else if (created > 0) {
            setStatus({
                type: 'error',
                message: `Created ${created} of ${weekCount} slots. Failed: ${failures.map((f) => f.date).join(', ')}.`,
            });
        } else {
            setStatus({ type: 'error', message: `Failed to create slots: ${failures[0].message}` });
        }

        if (created > 0) onCreated?.();
    }

    return (
        <form className={styles.form} onSubmit={handleSubmit}>
            <div className={styles.row}>
                <Input label="Date" type="date" value={date} onChange={(e) => setDate(e.target.value)} required />
                <Input label="From" type="time" value={timeFrom} onChange={(e) => setTimeFrom(e.target.value)} required />
                <Input label="To" type="time" value={timeTo} onChange={(e) => setTimeTo(e.target.value)} required />
                <Input
                    label="Repeat weekly (weeks)"
                    type="number"
                    value={weeks}
                    onChange={(e) => setWeeks(e.target.value)}
                    placeholder="1"
                />
            </div>
            <div className={styles.actions}>
                <Button type="submit" variant="primary">
                    {submitting ? 'Creating…' : 'Create Slot(s)'}
                </Button>
                {status && <span className={status.type === 'success' ? styles.success : styles.error}>{status.message}</span>}
            </div>
        </form>
    );
}

export default CalendarSelector;
