import { useState, useEffect } from "react";
import { NavLink } from "react-router";
import { useAuthContext } from "../contexts/AuthContext.jsx";
import { fetchData, ENDPOINTS } from "../utils/api.js";
import CategoriesPieChart from "../components/charts/CategoryPieChart.jsx";


function Dashboard() {
    const { user } = useAuthContext();
    const [ period, setPeriod ] = useState('all_time');
    const [ chartsData, setChartsData ] = useState([]);
    const [ isLoading, setIsLoading ] = useState(false);
    const [ errorMsg, setErrorMsg ] = useState('');


    // fetch
    useEffect( () => {
        let cancelled = false;
        
        const loadChartsData = async (period ) => {
            setIsLoading(true);

            try {
                const response = await fetchData(ENDPOINTS.private.dashboardStats, { params: {
                    time_range: period
                }
                });

                // drop this if cancelled.
                if (cancelled) return;

                setChartsData(response);

            } catch (error) {

                if (cancelled) return;

                setErrorMsg(error.message);

                console.error("error while fetching charts data", error);

            } finally {
                
                if (!cancelled) setIsLoading(false);
            }

        }

        loadChartsData(period);
        // Runs on unmount too, so a request that resolves after the page is
        // gone cannot set state on a component that no longer exists.
        return () => { cancelled = true; };

    }, [period])


    return <>

    <div className="page-container flex-grow-1 w-100  px-4 feed-meadow-container">
            {/* Welcome section with cockpit
     */}
        <section className="welcome-section  d-flex justify-content-between align-items-start">
            <div className="welcome-par">
                <h2 className="feed-title">Hi, {user.name}</h2>
                <h5 className="feed-subtitle">
                    May your bloom cherish your Soul. <br /> Enjoy your stay!
                </h5>
            </div>
            <div className="profile-overview text-end d-flex flex-column">
                <div className="title">
                    <h5>{user.name}</h5>
                </div>

                { user.bio && <div>
                <small className="fst-italic">&#8220;{user.bio}&#8221;</small> 
                </div> }
                <div className="navlink">
                <NavLink className="small fst-italic" to="/profile">My Profile</NavLink>
                </div> 
            </div>   
            </section>
        {/* navigation to My Records & Emotion Prism Views */}
        <section className="cockpit-nav">
            <p className="cockpit py-4">navigation placeholder</p>
            <button className="btn-action">My Records</button>
            <button className="btn-action ms-2">Emotion Prism</button>
        </section>
            {/* charts */}
            <section className="charts mt-4">
                <div className="period-select-wrapper">
                            <div className="select-group d-flex flex-column align-items-start">
                                <label htmlFor="time_range" className="pb-1">
                                    Select period
                                </label>
                                <select name="time_range"
                                        id="time_range"
                                        className="my-2"
                                        value={period}
                                        onChange={ (e) => setPeriod(e.target.value)}>
                                    <option value="all_time">All</option>
                                    <option value="last_six_months">Last 6 Months</option>
                                </select>
                            </div>
                    

                </div>
                
                <div className="charts-container glass-card p-4">
                    <div className="row row-cols row-cols-sm-1 row-cols-md-2 row-cols-xl-3">
                        {/* Spider Chart - EMOTION DISTRIBUTION ACROSS RECORDS */}

                        {/* Pie Chart - RECORDS DISTRIBUTION ACROSS CATEGORIES */}
                            <h3 className="chart-title text-center">
                                Categories Distribution
                            </h3>
                            { isLoading ? ( <div><p>Chart is loading...</p></div> ) : ( <CategoriesPieChart rawData={chartsData?.charts?.pie} /> )}

                        {/* Area Chart - VELOCITY VS. IMPACT */}
                    </div>
                </div>
            </section>
        </div>
    </>
}


export default Dashboard;