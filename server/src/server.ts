import express from "express";
import path from "node:path";
import { ApolloServer } from "@apollo/server";
import { expressMiddleware } from "@apollo/server/express4";
import db from "./config/connection.js";
import { typeDefs } from "./schemas"; 
import { resolvers } from "./schemas"; 
import authMiddleware from "./services/auth.js";

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware for parsing requests
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Serve static files in production
if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "../client/build")));
}

// Initialize Apollo Server
const server = new ApolloServer({
  typeDefs,
  resolvers,
  
});

const startServer = async () => {
  await server.start();

  // Apply authentication and GraphQL middleware
  app.use(
    "/graphql",
    authMiddleware, // Attach user to request
    expressMiddleware(server, {
      context: async ({ req }) => ({ user: req.user }), // Pass user to resolvers
    })
  );

  // Start Express server after DB connection
  db.once("open", () => {
    app.listen(PORT, () => console.log(`🚀 Server running at http://localhost:${PORT}/graphql`));
  });
};

startServer().catch((error) => {
  console.error("Error starting server:", error);
});
