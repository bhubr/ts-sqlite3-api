import dotenv from "dotenv";

dotenv.config();

export const isTest = process.env.NODE_ENV === "test";
export const dbFile = isTest ? "test.db" : "dev.db";
export const port = process.env.PORT || 8000;
