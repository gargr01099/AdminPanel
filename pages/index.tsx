import Head from "next/head";
import { useCallback, useEffect, useState } from "react";
import { Filter } from "../components/Filter";
import { MarketCard } from "../components/MarketCard";
import Navbar from "../components/Navbar";
import { useData } from "../contexts/DataContext";
import styles from "../styles/Home.module.css";
import MarketList from "../components/MarketList";
import { createMarket } from "./create-market";
export interface MarketProps {
  id: string;
  title: string;
  imageHash: string;
  totalAmount: string;
  totalYes: string;
  totalNo: string;
}

export default function Home() {
  const { polymarket, account, loadWeb3, loading } = useData();
  const [markets, setMarkets] = useState<MarketProps[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredMarkets, setFilteredMarkets] = useState<MarketProps[]>([]);
  const [isCreatingMarket, setIsCreatingMarket] = useState(false);
  const [newMarketTitle, setNewMarketTitle] = useState("");

  const getMarkets = useCallback(async () => {
    var totalQuestions = await polymarket.methods
      .totalQuestions()
      .call({ from: account });
    var dataArray: MarketProps[] = [];
    for (var i = 0; i < totalQuestions; i++) {
      var data = await polymarket.methods.questions(i).call({ from: account });
      dataArray.push({
        id: data.id,
        title: data.question,
        imageHash: data.creatorImageHash,
        totalAmount: data.totalAmount,
        totalYes: data.totalYesAmount,
        totalNo: data.totalNoAmount,
      });
    }
    setMarkets(dataArray);
  }, [account, polymarket]);

  useEffect(() => {
    setFilteredMarkets(
      markets.filter((market) =>
        market.title.toLowerCase().includes(searchQuery.toLowerCase())
      )
    );
  }, [searchQuery, markets]);

  useEffect(() => {
    loadWeb3().then(() => {
      if (!loading) getMarkets();
    });
  }, [loading]);

  const handleCreateMarket = async () => {
    if (newMarketTitle.trim() === "") {
      alert("Market title cannot be empty");
      return;
    }

    setIsCreatingMarket(true);
    try {
      const marketCreated = await createMarket(polymarket, account, newMarketTitle);
      if (marketCreated) {
        setNewMarketTitle(""); // Clear the input
        getMarkets(); // Reload the markets after creating a new one
      }
    } catch (error) {
      console.error("Error creating market", error);
    } finally {
      setIsCreatingMarket(false);
    }
  };

  return (
    <div className={styles.container}>
      <Head>
        <title>Soren</title>
        <meta name="description" content="Generated by create next app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Navbar />
      <main className="w-full flex flex-col sm:flex-row flex-wrap sm:flex-nowrap py-4 flex-grow max-w-5xl">
        <div className="w-full flex flex-col flex-grow pt-1">
          <div className="relative text-gray-500 focus-within:text-gray-400 w-full">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3">
              <svg
                fill="none"
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                viewBox="0 0 24 24"
                className="w-5 h-5"
              >
                <path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
              </svg>
            </span>
            <input
              type="search"
              name="q"
              className="w-full py-3 px-3 text-base text-gray-700 bg-gray-100 rounded-md pl-10 focus:outline-none"
              placeholder="Search markets..."
              autoComplete="off"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="flex flex-row space-x-2 md:space-x-5 items-center flex-wrap mt-4">
            <Filter
              list={["All", "Crypto", "Football", "Covid 19", "Politics"]}
              activeItem="All"
              category="Category"
              onChange={() => {}}
            />
            <Filter
              list={["Volume", "Newest", "Expiring"]}
              activeItem="Volume"
              category="Sort By"
              onChange={() => {}}
            />
          </div>
          <div className="flex flex-wrap overflow-hidden sm:-mx-1 md:-mx-2 mt-4">
            {filteredMarkets.map((market) => {
              return (
                <MarketCard
                  id={market.id}
                  key={market.id}
                  title={market.title}
                  totalAmount={market.totalAmount}
                  totalYes={market.totalYes}
                  totalNo={market.totalNo}
                  imageHash={market.imageHash}
                />
              );
            })}
          </div>
          <div className="mt-6">
            <MarketList searchQuery={searchQuery} />
          </div>
        </div>
      </main>
    </div>
  );
}
