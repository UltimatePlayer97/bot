import { Pool } from "pg";
import dotenv from "dotenv";
import * as config from '../../config.json'

const db = config.secrets.db;

dotenv.config();

const pool = new Pool({
  user: db.user || "postgres",
  password: db.userPaswd || "azk;#4s9d!?",
  host: db.host || "localhost",
  port: Number(db.port) || 5432,
  database: db.name || "db",
});

const query = async (text: string, params?: any[]) => {
  const client = await pool.connect();
  try {
    const res = await client.query(text, params);
    return res.rows;
  } finally {
    client.release();
  }
};

export const setAFK = async (userId: string, reason: string) => {
  await query("INSERT INTO afk (user_id, reason) VALUES ($1, $2) ON CONFLICT (user_id) DO UPDATE SET reason = $2", [userId, reason]);
};

export const getAFK = async (userId: string) => {
  const res = await query("SELECT reason FROM afk WHERE user_id = $1", [userId]);
  return res.length ? res[0].reason : null;
};

export const removeAFK = async (userId: string) => {
  await query("DELETE FROM afk WHERE user_id = $1", [userId]);
};

export const addXP = async (userId: string, xp: number) => {
  await query(`
    INSERT INTO levels (user_id, xp, level)
    VALUES ($1, $2, 1)
    ON CONFLICT (user_id) DO UPDATE 
    SET xp = levels.xp + $2, 
        level = FLOOR((levels.xp + $2) / 100) + 1`, [userId, xp]);
};

export const getLevel = async (userId: string) => {
  const res = await query("SELECT xp, level FROM levels WHERE user_id = $1", [userId]);
  return res.length ? res[0] : { xp: 0, level: 1 };
};

export const getBalance = async (userId: string) => {
  const res = await query("SELECT balance FROM bank WHERE user_id = $1", [userId]);
  return res.length ? res[0].balance : 0;
};

export const updateBalance = async (userId: string, amount: number) => {
  await query(`
    INSERT INTO bank (user_id, balance) 
    VALUES ($1, $2) 
    ON CONFLICT (user_id) DO UPDATE 
    SET balance = bank.balance + $2`, [userId, amount]);
};

export const closeDB = async () => {
  await pool.end();
};

export default { setAFK, getAFK, removeAFK, addXP, getLevel, getBalance, updateBalance, closeDB };
