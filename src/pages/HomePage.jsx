import { useState, useEffect } from "react";
import { fetchData, ENDPOINTS } from "../utils/api.js";
import MeadowCard from "../components/cards/MeadowCard.jsx";

function HomePage() {

  const [ records, setRecords ] = useState([]);
  const [ errorMsg, setErrorMsg ] = useState('');
  const [ isLoading, setIsLoading ] = useState(false);
  const [ page, setPage ] = useState(1);
  const [ hasMore, setHasMore ] = useState(true);

      const loadRecords = async (pageToFetch) => {
        setIsLoading(true);
        try {

          const response = await fetchData(ENDPOINTS.public.bloomingMeadow, { params: { page: pageToFetch }
            }
          );

          // if pageToFetch is 1 get data, otherwise spread former data + fresh fetch
          setRecords(prev => pageToFetch === 1 ? response.data : [...prev, ...response.data ]);
          
          // check if we have more pages to load
          setHasMore(response.links.next !== null);


        } catch (error) {

            setErrorMsg(error.message);

            console.error("error while fetching records data", error);
        } finally {
          setIsLoading(false);
        }
    }

  useEffect(() => {
    
    loadRecords(1);

  }, []);

      // onClick fot show more btn
    const handleShowMore = () => {
      const nextPage = page + 1;
      setPage(nextPage);
      loadRecords(nextPage);
    }

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
            { hasMore &&  
            <div className="d-flex justify-content-center btn-wrapper py-3">
              <button type="button"
                    className="btn-action"
                    onClick={handleShowMore}
                    disabled={isLoading}
              >{isLoading ? 'Loading...' : 'Show More'} </button>
            </div>}
        </div>
      </section>
  </>;
}
export default HomePage;
