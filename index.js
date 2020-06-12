const { startApollo } = require('./server/server.js');
const { connectToDB } = require('./server/db');

const express = require('express');
const path = require('path');
const http = require('http');

const PORT = process.env.PORT || 4000;

async function launch() {
    const app = express();

    const db = await connectToDB();
    const server = startApollo(db);

    if (process.env.NODE_ENV === "production") {
        app.use(express.static(path.join(__dirname, 'build')));
        app.get('/*', function(req, res) {
            res.sendFile(path.join(__dirname, 'build', 'index.html'));
        });
    }

    server.applyMiddleware({ app });

    const httpServer = http.createServer(app);
    server.installSubscriptionHandlers(httpServer);

    httpServer.listen({ port: PORT }, () => {
        console.log(`🚀 Server ready at :${PORT}${server.graphqlPath}`);
        console.log(`🚀 Subscriptions ready at :${PORT}${server.subscriptionsPath}`);
    });
}

// Let's go!
launch();