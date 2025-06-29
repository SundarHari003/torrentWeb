import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {  addTorrent, removeTorrent } from '../features/torrentFeatureslice';
import TorrentCard from './TorrentCard';
import Loader from './Loader';

const Dashboard = () => {
  const dispatch = useDispatch();
  const { torrents, loading, error } = useSelector((state) => state.torrents);
  const [magnetURI, setMagnetURI] = useState('');


  const handleAddTorrent = () => {
    if (magnetURI.trim()) {
      dispatch(addTorrent(magnetURI)).then(()=>{
          
      })
      setMagnetURI('');
    }
  };

  console.log(torrents,"checkdash");
  
  const handleRemoveTorrent = (infoHash) => {
    dispatch(removeTorrent(infoHash));
  };

  return (
    <div className="min-h-screen bg-black text-royalblue p-8">
      <h1 className="text-4xl font-bold text-center mb-8 animate-pulse">Torrent Dashboard</h1>
      
      <div className="flex justify-center mb-6">
        <input
          type="text"
          placeholder="Enter Magnet URI"
          value={magnetURI}
          onChange={(e) => setMagnetURI(e.target.value)}
          className="p-3 rounded bg-gray-800 text-white w-2/3"
        />
        <button
          onClick={handleAddTorrent}
          className="ml-4 bg-royalblue text-white py-2 px-4 rounded hover:bg-blue-600"
        >
          Add Torrent
        </button>
      </div>

      {loading && <Loader />}
      {error && <p className="text-center text-red-500">{error}</p>}

      <div className="space-y-4">
          <TorrentCard torrent={torrents} onRemove={handleRemoveTorrent} />
      </div>
    </div>
  );
};

export default Dashboard;
