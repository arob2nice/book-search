import jwt, { SignOptions } from "jsonwebtoken";
import TokenPayload from "../schemas/resolvers"; // Adjust the import path if necessary


// Define or import the TokenPayload type
interface TokenPayload {
  [key: string]: any; // Adjust this definition based on your payload structure
}


function signToken(payload: TokenPayload, secret: string, options?: SignOptions): string {
  return jwt.sign(payload, secret, options);
}

export default signToken;