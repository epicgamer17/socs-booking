/* Author: Tanav Bansal and Jonathan Lamontagne-Kratz (styling and Help Section contents based on md file Thomas Nguyen Claude) in other words, wording and phrasing of help section is mostly AI generated.
*/

import { useNavigate } from 'react-router-dom'
import Button from './components/ui/Button';
import styles from './LandingPage.module.css';

function LandingPage() {
        const navigate = useNavigate();

        return (
                <div className={styles.container}>
                        <section className={styles.hero}>
                                <h1 className={styles.title}>
                                        myBookings
                                </h1>
                                <p className={styles.description}>
                                        Connect with professors, schedule office hours, and manage your meetings all in one place.
                                </p>
                                <div className={styles.actionGroup}>
                                        <Button variant="primary" onClick={() => navigate('/register')}>
                                                Get Started
                                        </Button>
                                        <Button variant="secondary" onClick={() => navigate('/login')}>
                                                Log In
                                        </Button>
                                </div>
                        </section>

                        <section className={styles.infoSection}>
                                <div className={styles.sectionHeader}>
                                        <h2>Getting Started</h2>
                                        <p>myBookings is McGill's appointment booking platform. Professors and teaching assistants publish their availability, and students reserve a time without the back-and-forth of email. Group meetings get scheduled with a quick poll instead of a thread of replies.</p>
                                </div>

                                <div className={styles.card}>
                                        <h3>Registering</h3>
                                        <p>Sign up with your McGill email. The domain on your address determines what you can do:</p>
                                        <ul>
                                                <li><strong>@mcgill.ca</strong> — register as an owner. Owners create booking slots, run office hours, and organize group meetings. They can also book slots like any student.</li>
                                                <li><strong>@mail.mcgill.ca</strong> — register as a student. Students browse owners, reserve slots, and vote on group-meeting times they're invited to.</li>
                                        </ul>
                                        <p className={styles.note}>Other email providers are not accepted. After you submit the registration form, check your inbox for a verification link. Your account stays inactive until you click it.</p>
                                </div>

                                <div className={styles.grid}>
                                        <div className={styles.card}>
                                                <h3>For Owners</h3>
                                                <p>From your dashboard you can create three kinds of bookings:</p>
                                                <dl className={styles.definitionList}>
                                                        <dt>Single slots</dt>
                                                        <dd>Pick a date and time. New slots start private — only you can see them. Activate a slot to make it visible to students. You can also generate an invitation link to share in slides or emails.</dd>

                                                        <dt>Recurring office hours</dt>
                                                        <dd>Pick weekly time blocks and a number of weeks. The system creates and activates a slot for each occurrence.</dd>

                                                        <dt>Group meetings</dt>
                                                        <dd>Propose candidate times and invite students by email. They vote; you pick the winning slot. The chosen meeting can be one-time or repeat.</dd>
                                                </dl>
                                                <p>You can also receive direct meeting requests. Pending requests appear on your dashboard. Owners receive email notifications for all bookings and requests.</p>
                                        </div>

                                        <div className={styles.card}>
                                                <h3>For Students</h3>
                                                <p>After logging in, the directory page lists every owner with active availability.</p>
                                                <ul>
                                                        <li><strong>Explore.</strong> Open an owner's page to see their open slots, reserve one in a single click, or send a meeting request.</li>
                                                        <li><strong>Vote.</strong> Group meetings you've been invited to appear on your dashboard for voting.</li>
                                                        <li><strong>Manage.</strong> Your dashboard shows every appointment you've booked. Cancel any of them with one click — the owner is notified automatically.</li>
                                                </ul>
                                                <p>Receive email updates when an owner accepts your meeting request, declines it, or finalizes a group meeting you voted in.</p>
                                        </div>
                                </div>

                                <div className={styles.tipsCard}>
                                        <h3>Pro Tips</h3>
                                        <div className={styles.tipsGrid}>
                                                <div className={styles.tipItem}>
                                                        <span className={styles.tipIcon}>📧</span>
                                                        <p>All booking notifications are sent automatically by email. Check your spam folder if you don't see one.</p>
                                                </div>
                                                <div className={styles.tipItem}>
                                                        <span className={styles.tipIcon}>🔄</span>
                                                        <p>A slot you cancel becomes available to other students immediately.</p>
                                                </div>
                                        </div>
                                </div>
                        </section>
                </div>
        );
}

export default LandingPage;