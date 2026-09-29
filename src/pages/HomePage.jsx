import { useState, useEffect } from "react";

function HomePage() {

  const API_URL = import.meta.env.VITE_API_URL;
  const [records, setRecords] = useState([]);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {

  const fetchData = async () => {

    try {
      
      const response = await fetch(`${API_URL}/blooming-meadow`);
      console.log('siamo nella prima promise');

      if (!response.ok) {

        throw new Error(`HTTP Error: ${response.status}`)
      }

      const { data } = await response.json();
      console.log('dati ricevuti', data);
      

      console.log('siamo nella seconda promise');

      setRecords(data);
      console.log(records);

    } catch (error) {

        setErrorMsg(error.message);

        console.error("error while fetching records data", error);
    }

  }


    fetchData();



  }, []);

  return <>
    <main>
      <div className="container">
        <h1>The Blooming Meadow</h1>
        <h3>Celebrate our Community Bloom</h3>
      </div>
      <div className="container cards container">
        {records.map((record) => {
          return <div key={record.id}>
            {console.log(record)}
            <h4>{record.attributes.title}</h4>
            <p>{record.attributes.description}</p>
          </div>
        })}
      </div>
    </main>
    
  </>;
}
export default HomePage;
