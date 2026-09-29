import { useState, useEffect } from "react";
import { fetchData, ENDPOINTS } from "../utils/api.js";
import MeadowCard from "../components/cards/MeadowCard.jsx";

function HomePage() {

  const [records, setRecords] = useState([]);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    
    const loadRecords = async () => {
        try {

          const response = await fetchData(ENDPOINTS.public.bloomingMeadow);

          setRecords(response.data)

        } catch (error) {

            setErrorMsg(error.message);

            console.error("error while fetching records data", error);
        }
    }

    loadRecords();
    
  }, []);

  return <>
    <main>

      <div className="container-fluid py-5">
        <h1>The Blooming Meadow</h1>
        <h3>Celebrate our Community Bloom</h3>
      </div>
      <div className="container cards-container">
        {errorMsg && <h5>Something went wrong while fetching data from the database. <br/>
        Apologies for the inconvenience. <br/> {errorMsg}</h5>}
        {records.map((record) => {
          return <div key={record.id}>
              <MeadowCard record={record} />
          </div>
        })}
      </div>
    </main>
    
  </>;
}
export default HomePage;
