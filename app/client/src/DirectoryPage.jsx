import { useEffect, useState } from "react"
import useAuth from "./utils/auth";
import { getDepartment, DEPARTMENT_OPTIONS } from "./utils/departments"
import './DirectoryPage.css'

const API_URL = import.meta.env.VITE_API_URL
function DirectoryPage() {
    const [owners, setOwners] = useState([]);

    const [filtered_owners, setFilteredOwners] = useState(owners)



    const [error, setError] = useState("")
    const [selectedDepartment, setSelectedDepartment] = useState("ALL")
    const { user } = useAuth()


    function handleSelectedDepartment(event) {
        setSelectedDepartment(event.target.value)
    }


    useEffect(() => {

        async function fetchOwners() {

            const r = await fetch(`${API_URL}/slots/owners`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${user.token}`
                },
            });

            const data = await r.json();
            if (!r.ok) {
                setError(data.message || "Failed to fetch data")
                return;
            }
            setOwners(data)
            setFilteredOwners(data)

        }

        if (user) {
            fetchOwners();

        }



    }, [user])




    useEffect(() => {
        if (selectedDepartment === "ALL") {
            setFilteredOwners(owners)
            return
        }
        setFilteredOwners(owners.filter(o => o.department === selectedDepartment))
    }, [selectedDepartment, owners])
    


    return (
        <div>

            <h1>Directory</h1>

            <select value={selectedDepartment} onChange={handleSelectedDepartment}>
                <option value="ALL">All Deparments</option>
                {
                    DEPARTMENT_OPTIONS.map(d => {
                        return (<option value={d.code} key={d.code}>
                            {getDepartment(d.code)}
                        </option>);
                    }
                    )
                }
            </select><br />

            <div className="header-block">

                <h2>Name</h2>
                <h2>Email</h2>
                <h2>Department</h2>
            </div>

            {filtered_owners.map((u, index) => {
                return (<div key={index} className="owner-row">
                    <p>{u.firstName} {u.lastName}</p>
                    <p>{u.email}</p>
                    <p>{getDepartment(u.department)}</p>
                </div>);
            }

            )}

        </div>);

}

export default DirectoryPage