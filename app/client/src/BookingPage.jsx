import { useParams } from "react-router-dom"
import useAuth from "./utils/auth"
import { useEffect, useState } from "react"
import Button from "./components/ui/Button";
import styles from "./BookingPage.module.css"



const API_URL = import.meta.env.VITE_API_URL
function BookingPage() {
    const { ownerId } = useParams()
    const { user } = useAuth()
    const [slots, setSlots] = useState([])
    const [error, setError] = useState("")


    // useEffect(()=>{

    //     async function fetchSlots() {

    //         const r = await fetch(`${API_URL}/slots/owner/${ownerId}`, {
    //             method: "GET",
    //             headers: {
    //                 "Content-Type": "application/json",
    //                 "Authorization": `Bearer ${user.token}`
    //             },
    //         });

    //         const data = await r.json();
    //         if (!r.ok) {
    //             setError(data.message || "Failed to fetch data")
    //             return;
    //         }
    //         setSlots(data)

    //     }

    //     if (user?.token && ownerId) {
    //         fetchSlots();

    //     }

    // },[user,ownerId])

    useEffect(() => {
        const dummySlots = [
            {
                id: 1,
                date: "2026-04-22",
                timeFrom: "10:00",
                timeTo: "10:30",
            },
            {
                id: 2,
                date: "2026-04-22",
                timeFrom: "11:00",
                timeTo: "11:30",
            },
            {
                id: 3,
                date: "2026-04-23",
                timeFrom: "09:00",
                timeTo: "09:30",
            },
            {
                id: 4,
                date: "2026-04-23",
                timeFrom: "14:00",
                timeTo: "14:30",
            },
        ];

        setSlots(dummySlots);
    }, []);

    async function handleBooking(slotId) {
        const confirmation = window.confirm("Are you sure you want to book this slot?")
        if (!confirmation) {
            return;
        }

        const r = await fetch(`${API_URL}/bookings`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${user.token}`
            },
            body: JSON.stringify({ id: slotId }),
        });

        const data = await r.json();
        if (!r.ok) {
            setError(data.message || "Failed to fetch data")
            return;
        }

        if (data.mailtoUrl) {
            window.open(data.mailtoUrl)
        }

        setSlots((prev) => prev.filter(s => s.id !== slotId))

    }




    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h1 className={styles.title}>Booking Page</h1>
                <p className={styles.subtitle}>Select an available time slot to book your appointment.</p>
            </div>

            {error && <p className={styles.error}>{error}</p>}

            {slots.length === 0 ? (
                <p className={styles.emptyState}>No active slots available for this owner.</p>
            ) : (
                <div className={styles.slotList}>
                    {slots.map((s) => {
                        return (
                            <div key={s.id} className={styles.slotCard}>
                                <div className={styles.slotInfo}>
                                    <div className={styles.infoBlock}>
                                        <span className={styles.infoLabel}>Date</span>
                                        <span className={styles.infoValue}>{s.date}</span>
                                    </div>
                                    <div className={styles.infoBlock}>
                                        <span className={styles.infoLabel}>From</span>
                                        <span className={styles.infoValue}>{s.timeFrom}</span>
                                    </div>
                                    <div className={styles.infoBlock}>
                                        <span className={styles.infoLabel}>To</span>
                                        <span className={styles.infoValue}>{s.timeTo}</span>
                                    </div>
                                </div>
                                <Button onClick={() => handleBooking(s.id)}>
                                    Book Slot
                                </Button>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    )



}


export default BookingPage