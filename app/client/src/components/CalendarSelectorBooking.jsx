import { useState } from 'react';
import useAuth from '../utils/auth';
import Button from './ui/Button';
import Input from './ui/Input';
import styles from './CalendarSelectorUser.module.css';

const API_URL = import.meta.env.VITE_API_URL;


function CalendarSelectorBooking() {
    const { user } = useAuth();
    const [submitting, setSubmitting] = useState(false);
    const [status, setStatus] = useState(null);

    const [date, setDate] = useState('');
    const [timeFrom, setTimeFrom] = useState('');
    const [timeTo, setTimeTo] = useState('');
    const [email, setEmail] = useState("");
    const [messageToOwner, setMessageToOwner] = useState("");


    async function handleSubmit(e) {
        e.preventDefault();
        setStatus(null);

        if (!date || !timeFrom || !timeTo) {
            setStatus({ type: 'error', message: 'Fill in all fields.' });
            return;
        }
        if (timeFrom >= timeTo) {
            setStatus({ type: 'error', message: 'End time must be after start time.' });
            return;
        }

        setSubmitting(true);



        try {
            const r = await fetch(`${API_URL}/requests`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${user.token}`,
                },
                body: JSON.stringify({ ownerEmail: email.trim(), message:messageToOwner, date, timeFrom, timeTo }),
            });
            const data = await r.json();
            if (!r.ok) {
                setStatus({ type: 'error', message: data.message || "Failed to request booking", });
                return;
            }
        } catch {
            setStatus({ type: 'error', message: "Failed to request booking", });
            return;
        } finally {
            setSubmitting(false);
        }

        const params = new URLSearchParams();
        
        params.append("subject", `Request for meeting on ${date} (${timeFrom} to ${timeTo})`)
        

        
        params.append("body", messageToOwner)

        const formatedParams = params.toString().replace(/\+/g,"%20");
        const mailtoUrl = `mailto:${email.trim()}?${formatedParams}`;

        window.open(mailtoUrl);


        setStatus({ type: 'success', message: `Booking request created successfully` });
        setDate('');
        setTimeFrom('');
        setTimeTo('');
        setEmail("")
        setMessageToOwner("")

    }


    return (
        <form className={styles.form} onSubmit={handleSubmit}>
            <div className={styles.messageRow}>
                <Input
                    label="Message"
                    type="text"
                    value={messageToOwner}
                    onChange={(e) => setMessageToOwner(e.target.value)}
                    placeholder="Can we discuss the project?"
                    required />


            </div>

            <div className={styles.row}>
                <Input label="Date" type="date" value={date} onChange={(e) => setDate(e.target.value)} required />
                <Input label="From" type="time" value={timeFrom} onChange={(e) => setTimeFrom(e.target.value)} required />
                <Input label="To" type="time" value={timeTo} onChange={(e) => setTimeTo(e.target.value)} required />
                <Input
                    label="Email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="first.last@mcgill.ca"
                    required
                />
            </div>
            <div className={styles.actions}>
                <Button type="submit" variant="primary">
                    {submitting ? 'Submitting...' : 'Submit'}
                </Button>
                {status && <span className={status.type === 'success' ? styles.success : styles.error}>{status.message}</span>}
            </div>
        </form>
    );
}

export default CalendarSelectorBooking;
