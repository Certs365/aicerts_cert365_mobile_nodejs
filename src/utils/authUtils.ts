import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';

dotenv.config();

function generateJwtToken() {
  try {
    const expiresInMinutes = process.env.JWT_EXPIRE;
    const claims = { authType: "User" };
    const token = jwt.sign(claims, process.env.ACCESS_TOKEN_SECRET as string, {
      expiresIn: `${expiresInMinutes}${process.env.JWT_EXPIRE_TIME}`
    });
    return token;
  } catch (error) {
    console.error("Error generating JWT token:", error);
    throw error; 
  }
}

export {
  generateJwtToken
};
