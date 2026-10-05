import { useState, useEffect } from "react";
import { fetchData, ENDPOINTS } from "../utils/api.js";
import MeadowCard from "../components/cards/MeadowCard.jsx";
import RecordModal from "../components/records/RecordModal.jsx";

function HomePage() {

  const [ records, setRecords ] = useState([]);

  /* The record currently on show in the detail modal. Lifted here rather than
     held per card so exactly ONE modal exists for the whole feed, and one
     record is ever rendered inside it. Kept after close instead of cleared:
     the hidden dialog keeps its content, so the next open has something to
     show immediately rather than a frame that fills in a tick later. */
  const [ openRecord, setOpenRecord ] = useState(null);
  const [ errorMsg, setErrorMsg ] = useState('');
  const [ isLoading, setIsLoading ] = useState(false);
  const [ page, setPage ] = useState(1);
  const [ hasMore, setHasMore ] = useState(true);

      const loadPagedRecords = async (pageToFetch) => {
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
    
    loadPagedRecords(page);

  }, []);

      // onClick fot show more btn
    const handleShowMore = () => {
      const nextPage = page + 1;
      setPage(nextPage);
      loadPagedRecords(nextPage);
    }

  return <>
      <section className="home-hero-banner w-100 d-flex align-items-end p-3 p-md-4">
        <div className="home-hero-banner-copy glass-card m-3 m-md-0 p-3 p-md-4">
            <h1 className="mb-2">Welcome in <span className="fst-italic fs-1">Bloom</span></h1>
            <p className="fs-5 mb-2">A place to remember how far you've bloomed.</p>
            <p className="fst-italic mb-0">A space to pause and linger: the paths walked, the lessons gathered, and the soft shimmer that remains.</p>
        </div>
      </section>
      <section className="feed mt-4">
        <div className="feed-meadow-container px-4 pb-5 pt-3">
          <div className="container-fluid py-3 mb-3">
            <h2 className="feed-title">The Blooming Meadow</h2>
            <p className="feed-subtitle">Celebrate our Community</p>
          </div>
            <div className="row row-cols-1 row-cols-md-2 row-cols-lg-3 cards-container h-100 g-4">
              {/* fetch error */}
              {errorMsg && <h5>Something went wrong while fetching data from the database. <br/>
              {/* cards */}
              Apologies for the inconvenience. <br/> {errorMsg}</h5>}
              {records.map((record) => {
                return <div key={record.id} className="col">
                    <MeadowCard record={record} onOpen={ () =>setOpenRecord(record)} />
                </div>
              })}
            </div>
            {/* show more cards */}
            { hasMore &&  
            <div className="d-flex justify-content-center btn-wrapper py-3">
              <button type="button"
                    className="btn-action"
                    onClick={handleShowMore}
                    disabled={isLoading}
              >{isLoading ? 'Loading...' : 'Show More'} </button>
            </div>}
            {/* CTA Register Banner */}
            <section className="cta-register">
              <div className="banner w-100 d-flex justify-content-center pt-5">
                <div className="cta-register-card glass-card text-center w-100 mx-3 mx-md-auto p-3 p-md-4">
                    <h2 className="mb-2">Join <span className="fst-italic fs-1">Bloom</span></h2>
                    <p className="fs-5 mb-2">Start your journal <span className="fst-italic">now</span>.</p>
                    <button type="button" className="btn-action mt-3">Register</button>
                </div>
              </div>
            </section>
        </div>
      </section>

      {/* One modal for every card. It has to sit above the feed rather than
          inside a card, because Bootstrap resolves `data-bs-target` against
          the whole document — a modal nested in a single card would work, but
          only by being duplicated into every other card. */}
      <RecordModal record={openRecord} />
  </>;
}
export default HomePage;
