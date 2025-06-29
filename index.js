const express = require('express');
const WebTorrent = require('webtorrent');
const multer = require('multer');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = 5000;

// Torrent client
const client = new WebTorrent();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('torrents'));

// Multer setup for file uploads
const upload = multer({
    dest: path.join(__dirname, 'torrents/uploaded'),
});

// In-memory torrent list
const torrents = [];

// Utility to format torrent data
const formatTorrentData = (torrent) => ({
    name: torrent.name,
    magnetURI: torrent.magnetURI,
    progress: (torrent.progress * 100).toFixed(2),
    downloadSpeed: (torrent.downloadSpeed / 1024).toFixed(2) + ' KB/s',
    uploadSpeed: (torrent.uploadSpeed / 1024).toFixed(2) + ' KB/s',
    peers: torrent.numPeers,
    infoHash: torrent.infoHash,
});

// Routes

// 1. Get active torrents
app.get('/api/torrents', (req, res) => {
    try {
        const torrentList = torrents.map(formatTorrentData);
        res.json(torrentList);
    } catch (error) {
        console.error('Error fetching torrents:', error.message);
        res.status(500).json({ error: 'Failed to fetch torrents' });
    }
});

app.get('/api/download', (req, res) => {
    const { magnetURI } = req.query;

    if (!magnetURI) {
        return res.status(400).json({ error: 'Magnet URI is required' });
    }

    client.add(magnetURI, (torrent) => {
        console.log(`Starting download for: ${torrent.name}`);

        // Wait for the torrent to finish downloading
        torrent.on('done', () => {
            console.log(`Download completed for: ${torrent.name}`);

            // Get the first file in the torrent (or all files if needed)
            const file = torrent.files[0]; // Adjust logic if there are multiple files
            const filePath = path.join(__dirname, 'torrents/downloads', file.name);

            // Save the file to the server or stream it directly to the client
            file.getBuffer((err, buffer) => {
                if (err) {
                    console.error('Error getting file buffer:', err.message);
                    return res.status(500).json({ error: 'Failed to download file.' });
                }

                // Stream the file to the client
                res.setHeader('Content-Disposition', `attachment; filename="${file.name}"`);
                res.setHeader('Content-Type', 'application/octet-stream');
                res.send(buffer);
            });
        });
    }).on('error', (err) => {
        console.error('Error adding torrent:', err.message);
        res.status(500).json({ error: 'Error downloading torrent. Please try again later.' });
    });
});


// 2. Add a torrent via Magnet URI
app.post('/api/torrents', (req, res) => {
    const { magnetURI } = req.body;

    if (!magnetURI) {
        return res.status(400).json({ error: 'Magnet URI is required' });
    }

    client.add(magnetURI, (torrent) => {
        torrents.push(torrent);
        console.log(`Torrent added: ${torrent.name}`);
        res.status(201).json({ message: 'Torrent added successfully', torrent: formatTorrentData(torrent) });
    }).on('error', (err) => {
        console.error('Error downloading torrent:', err.message);
        res.status(500).json({ error: 'Error downloading torrent. Please try again later.' });
    });
});

// 3. Add a torrent via .torrent file
app.post('/api/upload', upload.single('file'), (req, res) => {
    const filePath = req.file.path;

    client.add(filePath, (torrent) => {
        torrents.push(torrent);
        console.log(`Torrent added: ${torrent.name}`);
        res.status(201).json({ message: 'Torrent added successfully', torrent: formatTorrentData(torrent) });
    }).on('error', (err) => {
        console.error('Error adding torrent:', err.message);
        res.status(500).json({ error: 'Error adding torrent. Please try again later.' });
    });
});

// 4. Remove a torrent
app.delete('/api/torrents/:infoHash', (req, res) => {
    const { infoHash } = req.params;

    const torrent = client.torrents.find((t) => t.infoHash === infoHash);

    if (torrent) {
        torrent.destroy();
        const index = torrents.findIndex((t) => t.infoHash === infoHash);
        if (index !== -1) torrents.splice(index, 1);

        console.log(`Torrent removed: ${torrent.name}`);
        res.json({ message: 'Torrent removed successfully' });
    } else {
        res.status(404).json({ error: 'Torrent not found' });
    }
});



// 5. Get files in a torrent
app.get('/api/torrents/:infoHash/files', (req, res) => {
    const { infoHash } = req.params;

    const torrent = client.torrents.find((t) => t.infoHash === infoHash);

    if (torrent) {
        const files = torrent.files.map((file) => ({
            name: file.name,
            length: file.length,
        }));
        res.json(files);
    } else {
        res.status(404).json({ error: 'Torrent not found' });
    }
});

// Start server
app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
