/* Author: Tanav Bansal and Jonathan Lamontagne-Kratz (linking styling only) */

import { useEffect, useState } from "react"
import useAuth from "./utils/auth";
import { getDepartment, DEPARTMENT_OPTIONS } from "./utils/departments"
import styles from './DirectoryPage.module.css'
import { useNavigate } from "react-router-dom";
import { fetchWithAuth } from "./utils/api";

const API_URL = import.meta.env.VITE_API_URL
function DirectoryPage() {
  const navigate = useNavigate()
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

      const r = await fetchWithAuth(`${API_URL}/slots/owners`, {
        method: "GET",
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




  useEffect(() => {
    document.title = "Directory"
  }, [])

  return (
    <div className={styles.container}>
      <div className={styles.pageHeader}>
        <h1>Directory</h1>

        <select className={styles.select} value={selectedDepartment} onChange={handleSelectedDepartment}>
          <option value="ALL">All Departments</option>
          {
            DEPARTMENT_OPTIONS.map(d => {
              return (<option value={d.code} key={d.code}>
                {getDepartment(d.code)}
              </option>);
            })
          }
        </select>
      </div>

      <div className={styles.grid}>
        {filtered_owners.map((u, index) => {
          return (
            <div key={index} className={styles.userCard} onClick={() => navigate(`/bookingPage/${u.inviteToken}`)}>
              <p className={styles.userName}>{u.firstName} {u.lastName}</p>
              <p className={styles.userDept}>{getDepartment(u.department)}</p>
              <p>{u.email}</p>
            </div>
          );
        })}
      </div>
    </div>);

}

export default DirectoryPage
