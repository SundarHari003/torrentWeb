import React from 'react';

const TorrentCard = ({ torrent, onRemove }) => {
  console.log(torrent,"checkcard");
  const handleDownload = async(magnetURI) => {
            if (!magnetURI) {
                alert('Please enter a magnet link');
                return;
            }

            try {
                const response = await fetch(`/api/download?magnet=${encodeURIComponent(magnetURI)}`);
                const data = await response.json();
               
            } catch (error) {
            }
  };

  return (
    <div className="p-4 rounded bg-gray-800 text-white flex justify-between items-center shadow-lg">
      <div>
        <h2 className="text-xl font-bold">{torrent.name}</h2>
        <p>Progress: {torrent.progress}%</p>
        <p>Peers: {torrent.peers}</p>
        <p>Speed: {torrent.downloadSpeed}</p>
        
        {/* Ensure 'files' exists before trying to map */}
        <div className="mt-4">
              <div  className="flex justify-between items-center">
                <button
                  onClick={() =>handleDownload(torrent.magnetURI)}
                  className="bg-royalblue text-white py-1 px-3 rounded hover:bg-blue-600"
                >
                  Download
                </button>
              </div>
        </div>
      </div>
      
      <button
        onClick={() => onRemove(torrent.infoHash)}
        className="bg-red-600 text-white py-1 px-3 rounded hover:bg-red-800"
      >
        Remove
      </button>
    </div>
  );
};

export default TorrentCard;
