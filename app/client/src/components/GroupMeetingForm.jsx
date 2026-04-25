import { useState } from 'react';
import useAuth from '../utils/auth';
import Button from './ui/Button';
import Input from './ui/Input';
import styles from './CalendarSelector.module.css';

const API_URL = import.meta.env.VITE_API_URL;

function emptyWindow() {
    return { date: '', timeFrom: '', timeTo: '' };
}

function GroupMeetingForm({ onCreated }) {
    const { user } = useAuth();
    const [title, setTitle] = useState('');
    const [windows, setWindows] = useState([emptyWindow()]);
    const [emailsText, setEmailsText] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [status, setStatus] = useState(null);

    function updateWindow(index, patch) {
        setWindows((prev) => prev.map((w, i) => (i === index ? { ...w, ...patch } : w)));
    }

    function addWindow() {
        setWindows((prev) => [...prev, emptyWindow()]);
    }

    function removeWindow(index) {
        setWindows((prev) => (prev.length === 1 ? prev : prev.filter((_, i) => i !== index)));
    }

    function parseEmails(text) {
        return text
            .split(/[\s,;]+/)
            .map((e) => e.trim())
            .filter(Boolean);
    }

    async function handleSubmit(e) {
        e.preventDefault();
        setStatus(null);

        if (!title.trim()) {
            setStatus({ type: 'error', message: 'Enter a poll title.' });
            return;
        }

        const emails = parseEmails(emailsText);
        if (emails.length === 0) {
            setStatus({ type: 'error', message: 'Add at least one student email.' });
            return;
        }

        for (const w of windows) {
            if (!w.date || !w.timeFrom || !w.timeTo) {
                setStatus({ type: 'error', message: 'Fill in date and times for every candidate slot.' });
                return;
            }
            if (w.timeFrom >= w.timeTo) {
                setStatus({ type: 'error', message: 'End time must be after start time for every candidate.' });
                return;
            }
        }

        setSubmitting(true);
        try {
            const r = await fetch(`${API_URL}/groupMeetings/group`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${user.token}`,
                },
                body: JSON.stringify({
                    title: title,
                    timeWindows: windows,
                    invitedUserEmails: emails,
                }),
            });
            const data = await r.json();
            if (!r.ok) {
                setStatus({ type: 'error', message: data.message || `HTTP ${r.status}` });
                return;
            }
            setStatus({ type: 'success', message: 'Poll created. Students can now vote.' });
            setTitle('');
            setWindows([emptyWindow()]);
            setEmailsText('');
            onCreated?.(data.groupMeetingID);
        } catch (err) {
            setStatus({ type: 'error', message: err.message || 'Failed to create poll' });
        } finally {
            setSubmitting(false);
        }
    }

    return (
        <form className={styles.form} onSubmit={handleSubmit}>
            <Input
                label="Poll Title"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g., Weekly office hours - Week of April 25"
                required
            />

            {windows.map((w, i) => (
                <div key={i} className={styles.row}>
                    <Input
                        label={i === 0 ? 'Candidate date' : ''}
                        type="date"
                        value={w.date}
                        onChange={(e) => updateWindow(i, { date: e.target.value })}
                        required
                    />
                    <Input
                        label={i === 0 ? 'From' : ''}
                        type="time"
                        value={w.timeFrom}
                        onChange={(e) => updateWindow(i, { timeFrom: e.target.value })}
                        required
                    />
                    <Input
                        label={i === 0 ? 'To' : ''}
                        type="time"
                        value={w.timeTo}
                        onChange={(e) => updateWindow(i, { timeTo: e.target.value })}
                        required
                    />
                    <Button
                        type="button"
                        variant="danger"
                        onClick={() => removeWindow(i)}
                        disabled={windows.length === 1}
                    >
                        Remove
                    </Button>
                </div>
            ))}

            <div className={styles.actions}>
                <Button type="button" variant="primary" onClick={addWindow}>
                    + Add another time
                </Button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', marginTop: '1rem' }}>
                <label>Invited student emails (comma-, space-, or newline-separated)</label>
                <textarea
                    value={emailsText}
                    onChange={(e) => setEmailsText(e.target.value)}
                    placeholder="alice@mail.mcgill.ca, bob@mail.mcgill.ca"
                    rows={3}
                    style={{ padding: '0.5rem', fontFamily: 'inherit' }}
                />
            </div>

            <div className={styles.actions}>
                <Button type="submit" variant="primary" disabled={submitting}>
                    {submitting ? 'Creating…' : 'Create Poll'}
                </Button>
                {status && (
                    <span className={status.type === 'success' ? styles.success : styles.error}>
                        {status.message}
                    </span>
                )}
            </div>
        </form>
    );
}

export default GroupMeetingForm;
