//Author: Tanav bansal 
// Jonathan Lamontagne-Kratz modified the fetch function for useAutoRefresh
// Jonathan Lamontagne-Kratz modified it to include the fetching with auth
// Jonathan Lamontagne-Kratz modified to include exporting of calendar

import { useNavigate } from "react-router-dom"
import useAuth from "./utils/auth"
import useAutoRefresh from "./utils/useAutoRefresh"
import { useCallback, useEffect, useState } from "react"
import { fetchWithAuth } from "./utils/api";

import Button from './components/ui/Button';
import MailtoButton from "./components/ui/MailtoButton";
import styles from './UserDashboard.module.css';
import CalendarSelectorBooking from "./components/CalendarSelectorBooking";

const API_URL = import.meta.env.VITE_API_URL;

function UserDashboard() {
    const navigate = useNavigate()
    const { user, logout } = useAuth()
    const [bookings, setBookings] = useState([])
    const [error, setError] = useState()
    const [loading, setLoading] = useState(true)

    const [selectedVotes, setSelectedVotes] = useState({})
    const [errorTimeSlot, setErrorTimeSlot] = useState({})

    const [groupMeetings, setGroupMeetings] = useState([]);

    const fetchDashboardData = useCallback(async () => {
        if (!user?.token) return;
        try {
            const r = await fetchWithAuth(`${API_URL}/dashboard/student`, {
                method: "GET",
            });

            const data = await r.json();
            if (!r.ok) {
                setError(data.message || "Failed to fetch Dashboard")
                return;
            }

            setBookings(data.bookingRows);
            setGroupMeetings(data.groupMeetingRows)
        }
        catch (err) {
            setError("Failed to fetch Dashboard")
        }
        finally {
            setLoading(false);
        }
    }, [user?.token]);

    useEffect(() => { fetchDashboardData(); }, [fetchDashboardData]);

    useAutoRefresh([fetchDashboardData], 5_000);

    async function handleCancel(bookingID, date, timeFrom, timeTo) {
        const confirm = window.confirm("Are you sure you want to cancel this booking?")
        if (!confirm) {
            return;
        }

        try {
            const r = await fetchWithAuth(`${API_URL}/bookings/${bookingID}`, {
                method: "DELETE",
            });

            const data = await r.json();

            if (!r.ok) {
                setError(data.message || "Failed to Cancel booking")
                return;
            }

            const newBookingList = bookings.filter((b) => b.bookingID !== bookingID)
            setBookings(newBookingList);
        }
        catch {
            setError("Failed to cancel the booking")
        }
    }

    function handleVoteToggle(candidateIdVotedList, candidateID) {
        setErrorTimeSlot({});
        if (candidateIdVotedList.includes(candidateID)) {
            return candidateIdVotedList.filter(i => i !== candidateID)
        } else {
            return [...candidateIdVotedList, candidateID]
        }
    }

    async function handleSubmitVote(group, voteList) {
        setErrorTimeSlot({});
        if (voteList.length === 0) {
            setErrorTimeSlot({
                groupID: group.id,
                message: "Please select at least one time slot."
            });
            return;
        }
        const confirmation = window.confirm("Are you sure you want to submit the votings?")
        if (!confirmation) {
            return;
        }

        try {
            const r = await fetchWithAuth(`${API_URL}/groupMeetings/group/${group.id}/vote`, {
                method: "POST",
                body: JSON.stringify({ timeWindowIDs: voteList })
            });

            const data = await r.json();

            if (!r.ok) {
                setErrorTimeSlot({
                    groupID: group.id,
                    message: data.message || "Failed to submit votes"
                });
                return;
            }

            const newGroupList = groupMeetings.filter((g) => g.id !== group.id)
            setGroupMeetings(newGroupList)
        }
        catch {
            setErrorTimeSlot({
                groupID: group.id,
                message: "Failed to submit votes"
            });
        }
    }

    // handle exporting of calendar with backend, aligns with current system and returns and ics file. it is from the student perspective, so it will return the bookings that the student has made.
    async function handleExportCalendar() {
        try {
            const r = await fetchWithAuth(`${API_URL}/calendar/export`);
            if (!r.ok) {
                setError("Failed to export calendar");
                return;
            }
            const blob = await r.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'meetings.ics';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);
        } catch {
            setError("Failed to export calendar");
        }
    }

    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <div>
                    <h1 className={styles.title}>Student Dashboard</h1>
                    <p className={styles.subtitle}>Welcome back, Student</p>
                </div>
                <Button variant="primary" onClick={handleExportCalendar}>
                    Export Calendar (.ics)
                </Button>
            </header>

            {error && <p style={{ color: "red" }}>{error}</p>}

            <div className={styles.grid}>
                <div className={styles.statCard}>
                    <h3>Total Bookings</h3>
                    <p className={styles.statValue}>{bookings.length}</p>
                </div>
            </div>

            <section className={styles.section} style={{ marginBottom: '2rem' }}>
                <h2>Request Booking</h2>
                <p>Create a booking request</p>
                <CalendarSelectorBooking />
            </section>

            <section className={styles.section} style={{ marginBottom: '2rem' }}>
                <h2>Meeting Polls</h2>
                <p>Vote for time slot(s) that works for your.</p>
                {groupMeetings.length === 0 && <p>No active polls.</p>}
                <div className={styles.activityList}>
                    {groupMeetings.map((g) => {
                        const maxVotes = Math.max(...g.candidates.map((c) => c.votes));

                        return (
                            <div key={g.id} className={styles.pollCard}>
                                <div className={styles.pollHeader}>
                                    <strong>{g.title}</strong>
                                </div>

                                <div className={styles.pollCandidates}>
                                    {g.candidates.map((candidate) => {
                                        const isLeader = candidate.votes === maxVotes && maxVotes > 0;
                                        return (
                                            <div
                                                key={candidate.candidateID}
                                                className={`${styles.activityItem}`}
                                            >
                                                <span>
                                                    {candidate.date} · {candidate.timeFrom} – {candidate.timeTo}
                                                </span>
                                                <span className={styles.activityTime}>
                                                    {candidate.votes} vote{candidate.votes === 1 ? '' : 's'}
                                                    {isLeader && ' · leading'}
                                                </span>
                                                <Button variant="primary" onClick={() => {
                                                    setSelectedVotes((prev) => ({
                                                        ...prev, [g.id]: handleVoteToggle(prev[g.id] || [], candidate.candidateID)
                                                    })
                                                    )
                                                }}>
                                                    {(selectedVotes[g.id] || []).includes(candidate.candidateID) ? `Cancel` : `Vote`}
                                                </Button>
                                            </div>
                                        );
                                    })}
                                </div>

                                <Button variant="danger" onClick={() => handleSubmitVote(g, selectedVotes[g.id] || [])}>
                                    Submit Vote
                                </Button>
                                {errorTimeSlot.groupID === g.id && <p style={{ color: "red" }}>{errorTimeSlot.message}</p>}
                            </div>
                        );
                    })}
                </div>
            </section>

            <section className={styles.section}>
                <h2>Your Bookings</h2>
                {loading && <p>Loading..</p>}
                {!loading && bookings.length === 0 && <p>No Bookings</p>}

                <div className={styles.activityList}>
                    {bookings.map((b) => {
                        return <div key={b.bookingID} className={styles.activityItem}>
                            <span>
                                {b.date} · {b.timeFrom} - {b.timeTo}
                            </span>

                            <span className={styles.activityTime}>
                                {b.ownerEmail}
                            </span>

                            <div className={styles.actionGroup}>
                                <MailtoButton variant="primary" email={b.ownerEmail}>
                                    Mail
                                </MailtoButton>

                                <Button variant="danger" onClick={() => handleCancel(b.bookingID, b.date, b.timeFrom, b.timeTo)}>
                                    Cancel
                                </Button>
                            </div>
                        </div>
                    })}
                </div>
            </section>
        </div>
    );
}

export default UserDashboard;
