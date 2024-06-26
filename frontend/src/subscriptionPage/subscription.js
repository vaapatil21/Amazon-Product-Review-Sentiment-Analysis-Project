import React, { useState, useEffect } from "react";
import Sidebar from "../Sidebar/Sidebar";
import { useNavigate } from 'react-router-dom';

const SubscriptionPage = () => {
  const [subscriptions, setSubscriptions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const userId = localStorage.getItem("userId");
  const [modalIsOpen, setModalIsOpen] = useState(false); // State to control the modal
  const [modalMessage, setModalMessage] = useState("");

  useEffect(() => {
    if (!userId) {
      navigate("/unauthorized");
      return;
    }

    fetchSubscriptions();
  }, [userId]);

  const fetchSubscriptions = async () => {
    try {
      const response = await fetch(
        `http://${process.env.REACT_APP_AWS_EC2_EIP}:5000/usersubscriptions?userId=${userId}`
      );
      const data = await response.json();
      console.log(data);
      setSubscriptions(data);
      setIsLoading(false);
    } catch (error) {
      console.error("Error fetching products:", error);
      setIsLoading(false);
    }
  };

  const handleUnsubscribe = async (productId) => {
    try {
      const response = await fetch(
        `http://${process.env.REACT_APP_AWS_EC2_EIP}:5000/unsubscribe?userId=${userId}&productId=${productId}`,
        {
          method: "POST",
        }
      );
      const message = await response.text();
      setModalMessage(message);
      setModalIsOpen(true);
      fetchSubscriptions();
    } catch (error) {
      console.error("Error unsubscribing:", error);
      setModalMessage("Error subscribing to product.");
      setModalIsOpen(true);
    }
  };

  return (
    <div>
      <Sidebar></Sidebar>
      <div className="cardmargin mb-8">
        <h1 className="mb-4 text-3xl font-extrabold text-gray-900 dark:text-black md:text-5xl lg:text-6xl">
          Subscriptions
        </h1>
      </div>
      {isLoading ? (
        <p>Loading...</p>
      ) : (
        <div className="max-w-4xl mx-auto relative">
          {subscriptions.length > 0 ? (
            <ul>
              {subscriptions.map((product) => (
                <li key={product.productId} className="relative">
                  <div className="flex items-center justify-between  py-2 px-2 border border-gray-700 rounded-lg mb-2 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-200 transition duration-300">
                    <span
                      onClick={() => {
                        navigate(`/sentiment`, {
                          state: { productId: product.productId },
                        });
                      }}
                      style={{ textAlign: "justify", color: "black" }}
                    >
                      {product.productName}
                    </span>
                    <div className="flex">
                      <div className="w-px bg-gray-400 mx-2 h-7"></div>
                      <button
                        onClick={() => {
                          navigate(`/sentiment`, {
                            state: { productId: product.productId },
                          });
                        }}
                        className="text-sm text-white bg-emerald-500 hover:bg-emerald-700 focus:ring-4 focus:outline-none focus:ring-emerald-200 dark:focus:ring-emerald-800 font-medium rounded-lg py-1 px-3 mx-2"
                      >
                        View
                      </button>
                      <button
                        onClick={() => handleUnsubscribe(product.productId)}
                        className="text-sm text-white bg-red-500 hover:bg-red-700 focus:ring-4 focus:outline-none focus:ring-red-200 dark:focus:ring-red-800 font-medium rounded-lg py-1 px-3"
                      >
                        Unsubscribe
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p>No subscriptions found.</p>
          )}
        </div>
      )}
      <div
        className={`fixed inset-0 z-50 overflow-y-auto ${
          modalIsOpen ? "block" : "hidden"
        }`}
      >
        <div className="flex items-center justify-center min-h-screen">
          <div className="fixed inset-0 bg-gray-800 opacity-75"></div>
          <div className="bg-white rounded-lg p-8 max-w-md mx-auto z-50 relative">
            <h2 className="text-xl font-semibold mb-4">{modalMessage}</h2>
            <button
              onClick={() => setModalIsOpen(false)}
              className="bg-blue-500 text-white py-2 px-4 rounded-lg focus:outline-none"
            >
              Ok
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SubscriptionPage;
