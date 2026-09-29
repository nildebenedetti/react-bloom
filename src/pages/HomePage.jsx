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
      <section className="feed">
        <div className="container-fluid py-3">
          <h1>The Blooming Meadow</h1>
          <h3>Celebrate our Community Bloom</h3>
        </div>
        <div className="feed-meadow-container px-4 pb-5">
            <div className="row row-cols-1 row-cols-md-2 row-cols-lg-3 cards-container h-100 g-4">
              {errorMsg && <h5>Something went wrong while fetching data from the database. <br/>
              Apologies for the inconvenience. <br/> {errorMsg}</h5>}
              {records.map((record) => {
                return <div key={record.id} className="col">
                    <MeadowCard record={record} />
                </div>
              })}
            </div>
        </div>
      </section>
  </>;
}
export default HomePage;
