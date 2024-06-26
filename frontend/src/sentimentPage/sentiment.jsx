import React, { useState, useEffect } from "react";
import { format } from "date-fns";
import BarChart from "../graphPage/graph";
import loader from "../loadingPage/loader.gif";
import Sidebar from "../Sidebar/Sidebar";
import { useLocation } from "react-router-dom";
import { useNavigate } from "react-router-dom";

const SentimentsPage = () => {
  const [sentiments, setSentiment] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [topFive, setReviews] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const productId = location.state.productId;

  useEffect(() => {
    if (!productId) {
      navigate("/unauthorized");
      return;
    }
    const fetchSentiments = async () => {
      try {
        const response = await fetch(
          `http://${process.env.REACT_APP_AWS_EC2_EIP}:5000/sentiments/${productId}`
        );
        const data = await response.json();
        setReviews(data);
        console.log(data);
        const sortedSentiments = data.sort((a, b) => {
          return new Date(a.reviewDate) - new Date(b.reviewDate);
        });
        const groupSentiment = groupSentimentByDate(sortedSentiments);
        const formatedData = sentimentCalculator(groupSentiment);
        setSentiment(formatedData);
        setIsLoading(false);
      } catch (error) {
        console.error("Error fetching sentiments:", error);
        setIsLoading(false);
      }
    };

    fetchSentiments();
  }, [productId]);

  const openModal = () => {
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
  };

  const groupSentimentByDate = (sentiments) => {
    return sentiments.reduce((acc, sentiment) => {
      const date = format(new Date(sentiment.reviewDate), "MMM yyyy");
      acc[date] = acc[date] || [];
      acc[date].push(sentiment);
      return acc;
    }, {});
  };

  const sentimentCalculator = (groupSentiments) => {
    const calculatedData = [];
    for (const date in groupSentiments) {
      const sentiments = groupSentiments[date];
      const sentimentCounts = {
        POSITIVE: 0,
        NEGATIVE: 0,
        MIXED: 0,
        NEUTRAL: 0,
      };
      sentiments.forEach((sentiment) => {
        sentimentCounts[sentiment.sentiment]++;
      });
      const percentages = {
        POSITIVE: (sentimentCounts.POSITIVE / sentiments.length) * 100,
        NEGATIVE: (sentimentCounts.NEGATIVE / sentiments.length) * -100,
        // MIXED: (sentimentCounts.MIXED / sentiments.length) *100,
        NEUTRAL:
          ((sentimentCounts.NEUTRAL + sentimentCounts.MIXED) /
            sentiments.length) *
          100,
      };
      const sentimentVal = calculateSentimentValue(sentiments);
      calculatedData.push({
        date,
        percentages,
        sentimentVal,
      });
    }
    return calculatedData;
  };

  const calculateSentimentValue = (sentiments) => {
    let sentimentSum = 0;
    let totalSentiments = 0;

    sentiments.forEach((sentiment) => {
      if (sentiment.sentiment === "POSITIVE") {
        sentimentSum += 1;
        totalSentiments++;
      } else if (sentiment.sentiment === "NEGATIVE") {
        sentimentSum -= 1;
        totalSentiments++;
      } else if (
        sentiment.sentiment === "MIXED" ||
        sentiment.sentiment === "NEUTRAL"
      ) {
        totalSentiments++;
      }
    });

    return sentimentSum / totalSentiments;
  };

  const topFiveReviews = (reviews) => {
    const filteredReviews = reviews.filter(
      (review) => review.reviewText.length < 2000
    );
    const sortedReviews = filteredReviews.sort((a, b) => {
      return b.sentimentScore.Positive - a.sentimentScore.Positive;
    });

    const topPositiveReviews = sortedReviews.slice(0, 5);
    const negReviews = filteredReviews.sort((a, b) => {
      return b.sentimentScore.Negative - a.sentimentScore.Negative;
    });
    const topNegativeReviews = negReviews.slice(0, 5);

    return { topPositiveReviews, topNegativeReviews };
  };

  const { topPositiveReviews, topNegativeReviews } = topFiveReviews(topFive);
  console.log("Top 5 Positive Reviews:", topPositiveReviews);
  console.log("Top 5 Negative Reviews:", topNegativeReviews);

  return (
    <div>
      <Sidebar />
      <div className="cardmargin">
        <h1 className="mb-4 text-3xl font-extrabold text-gray-900 dark:text-black md:text-5xl lg:text-6xl">
          Sentiment
        </h1>

        {isLoading ? (
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              height: "80vh",
            }}
          >
            <img style={{ display: "inline" }} src={loader} alt="Loading..." />
          </div>
        ) : (
          <>
            <div className="block space-y-4 md:flex md:space-y-0 md:space-x-4 md:rtl:space-x-reverse">
              <button
                onClick={openModal}
                className=" reviewmargin block w-full md:w-auto text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
                type="button"
              >
                Reviews
              </button>
            </div>
            {showModal && (
              <div
                id="top-left-modal"
                data-modal-placement="top-left"
                className="fixed top-0 left-0 right-0 bottom-0 z-50 w-full bg-black bg-opacity-50 flex justify-center items-center"
              >
                <div className="bg-white rounded-lg border border-gray-500 shadow-md p-8 max-w-5xl w-full max-h-screen overflow-y-auto">
                  <div className="flex items-center justify-between pb-4 border-b">
                    <h3 className="text-4xl font-medium">Top 5 Reviews</h3>
                    <button
                      onClick={closeModal}
                      className="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm w-8 h-8 ms-auto inline-flex justify-center items-center dark:hover:bg-gray-600 dark:hover:text-white"
                      data-modal-hide="top-left-modal"
                    >
                      <svg
                        className="w-3 h-3"
                        aria-hidden="true"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 14 14"
                      >
                        <path
                          stroke="currentColor"
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          stroke-width="2"
                          d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6"
                        />
                      </svg>
                      <span className="sr-only">Close modal</span>
                    </button>
                  </div>
                  <div className="mt-4 flex justify-between">
                    <div className="w-1/2 mr-2 p-4 bg-green-100 border border-green-300 rounded-lg shadow sm:p-6 md:p-8 dark:bg-green-100 dark:border-green-300">
                      <h4 className="text-4xl font-semibold mb-2">
                        Positive Reviews{" "}
                        <hr className="h-px my-6 bg-gray-500 border-0 dark:bg-gray-500" />
                      </h4>
                      <ul>
                        {topPositiveReviews.map((review, index) => (
                          <li
                            key={index}
                            className="mb-2"
                            style={{ textAlign: "center" }}
                          >
                            {review.reviewText}{" "}
                            <hr className="h-px my-6 bg-green-300 border-0 dark:bg-green-300" />
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div className="w-1/2 ml-2 bg-red-100 border border-red-300 rounded-lg shadow sm:p-6 md:p-8 dark:bg-red-100 dark:border-red-300">
                      <h4 className="text-4xl font-semibold mb-2">
                        Negative Reviews{" "}
                        <hr className="h-px my-6 bg-gray-500 border-0 dark:bg-gray-500" />
                      </h4>
                      <ul>
                        {topNegativeReviews.map((review, index) => (
                          <li
                            key={index}
                            className="mb-2"
                            style={{ textAlign: "center" }}
                          >
                            {review.reviewText}{" "}
                            <hr className="h-px my-6 bg-red-300 border-0 dark:bg-red-300" />
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <BarChart data={sentiments} />
          </>
        )}
      </div>
    </div>
  );
};

export default SentimentsPage;
