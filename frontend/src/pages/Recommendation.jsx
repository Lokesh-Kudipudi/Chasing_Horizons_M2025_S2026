import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useLocation, useNavigate } from "react-router";
import { setRecommendations, resetRecommendations } from "../redux/slices/recommendationSlice";
import TourCard from "../components/tours/TourCard";
import HotelCard from "../components/hotels/HotelCard";
import Header from "../components/Header"; 
import Footer from "../components/Footer"; 
import { API } from "../config/api";
import Chatbot from "../components/Chatbot";
import Loader from "../components/shared/Loader";
import NoRecommendations from "../components/shared/NoRecommendations";

const RecommendationPage = () => {
  const dispatch = useDispatch();
  const location = useLocation();
  const navigate = useNavigate();
  const { tours, hotels } = useSelector((state) => state.recommendation);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRecommendations = async () => {
      setLoading(true);
      try {
        const { tourIds, hotelIds } = location.state || {}; 
        if (!tourIds && !hotelIds) {
          setLoading(false);
          return;
        }

        const response = await fetch(API.RECOMMENDATION, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
             preferences: { tourIds, hotelIds }
          }),
        });
        const data = await response.json();        

        dispatch(setRecommendations({
          tours: data?.data?.tours?.data || [],
          hotels: data?.data?.hotels?.data || []
        }));
      } catch (error) {
        console.error("Error fetching recommendations:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchRecommendations();
  }, [dispatch, location.state]);

  const handleReset = () => {
    navigate(location.pathname, { replace: true, state: null });
    dispatch(resetRecommendations());
  };

  return (
    <div className="min-h-screen flex flex-col">
      <div className="relative flex justify-center">
        <div className="absolute top-0 z-10 w-[90%]">
          <Header />
        </div>
      </div>

      <section className="flex-grow mx-auto max-w-[900px] mt-24 mb-12 px-4">
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <Loader size="large" />
          </div>
        ) : tours.length === 0 && hotels.length === 0 ? (
          <NoRecommendations />
        ) : (
          <>
            <div className="flex justify-end mb-6">
              <button 
                onClick={handleReset}
                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors shadow-sm text-sm font-medium"
              >
                Reset Recommendations
              </button>
            </div>

            {tours.length > 0 && (
              <>
                <h1 className="text-3xl font-bold mb-8 text-center">
                  Recommended Tours
                </h1>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-12">
                  {tours.map((tour) => (
                    <TourCard key={tour._id} tour={tour} />
                  ))}
                </div>
              </>
            )}

            {hotels.length > 0 && (
              <>
                <h1 className="text-3xl font-bold mb-8 text-center">
                  Recommended Hotels
                </h1>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {hotels.map((hotel) => (
                    <HotelCard key={hotel._id} hotel={hotel} />
                  ))}
                </div>
              </>
            )}
          </>
        )}
      </section>

      <Footer />
      <Chatbot />
    </div>
  );
};

export default RecommendationPage;
