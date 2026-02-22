"use client";
import Typed from "typed.js";
import { ethers } from "ethers";
import config from "./config/config";
import { toast } from "react-toastify";
import { useEffect, useState } from "react";
import CampaignCard from "./components/campaign-card";
import CreateCampaign from "./components/create-campaign";
import CampaignFactory from "../artifacts/contracts/Campaign.sol/CampaignFactory.json";

function Home() {
  const [campaigns, setCampaigns] = useState([]);
  const [showPopup, setShowPopup] = useState(false);

  useEffect(() => {
    // Typed.js initialization
    const typed = new Typed(".typed", {
      strings: ["Welcome to InvestEdge", "Invest in Your Future"],
      typeSpeed: 50,
      backSpeed: 50,
      loop: true,
    });

    // Cleanup Typed.js instance on unmount
    return () => {
      if (typed && typeof typed.destroy === "function") {
        typed.destroy();
      }
    };
  }, []);

  useEffect(() => {
    const fetchCampaigns = async () => {
      try {
        const provider = new ethers.JsonRpcProvider(config.rpcUrl);
        const contract = new ethers.Contract(
          config.contractAddress,
          CampaignFactory.abi,
          provider
        );

        // Get all campaign creation events
        const allCampaignsFilter = contract.filters.CampaignCreated();
        const allEvents = await contract.queryFilter(allCampaignsFilter);

        // Get current time and timestamp for 30 days ago
        const currentTime = Math.floor(Date.now() / 1000); // Current timestamp in seconds
        const thirtyDaysAgo = currentTime - 540 * 24 * 60 * 60; // Timestamp for 30 days ago

        // Map events and filter campaigns created within the last 30 days
        const campaigns = allEvents
          .map((event) => ({
            title: event.args.title,
            owner: event.args.owner,
            amount: ethers.formatEther(event.args.requiredAmount), // Format amount
            date: parseInt(event.args.timestamp) * 1000, // Convert to milliseconds
            id: event.args.campaignAddress,
          }))
          .filter((campaign) => campaign.date / 1000 >= thirtyDaysAgo); // Filter by 30 days ago

        toast.success("Campaigns fetched successfully!");
        setCampaigns(campaigns);

        console.log("Filtered Campaigns: ", campaigns);
      } catch (error) {
        console.error("Error fetching campaigns:", error);
        toast.error("Failed to fetch campaigns");
      }
    };
    fetchCampaigns();
  }, []);

  return (
    <div>
      {/* Hero Section */}
      <div className="flex flex-col md:flex-row h-screen py-10 bg-[url('https://images.unsplash.com/photo-1519995451813-39e29e054914?q=80&w=1470&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D')] bg-cover bg-center">
        {/* Left Section */}
        <div className="w-full md:w-1/2 p-6 md:p-10">
          <span className="typed text-xl md:text-2xl text-gray-700 font-semibold"></span>
          <h1 className="text-3xl md:text-3xl text-gray-700 font-semibold mt-4">
            Empower Your Future with
            <span className="text-orange-600 font-bold"> InvestEdge</span>
          </h1>
          <button
            className="bg-orange-500 p-2 text-white my-5 rounded text-lg md:text-xl w-full md:w-auto"
            onClick={() => setShowPopup(!showPopup)}
          >
            Start a Project
          </button>
        </div>

        {/* Right Section */}
        <div className="w-full md:w-1/2 p-6">
          {showPopup && (
            <div className="popup bg-white p-4 rounded shadow-lg max-w-sm mx-auto">
              <CreateCampaign />
            </div>
          )}
        </div>
      </div>

      {/* Campaigns Section */}
      <div className="bg-orange-50 h-max py-10">
        <h1 className="text-center text-xl md:text-2xl font-semibold">
          All Campaigns ({campaigns.length})
        </h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-3 gap-6 p-6 md:p-10">
          {campaigns.map((campaign, index) => (
            <CampaignCard key={index} campaign={campaign} id={index} />
          ))}
        </div>
      </div>
    </div>
  );
}

export default Home;
