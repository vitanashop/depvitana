import sqlite3 from 'sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Garantir que o diretório do banco existe
const dbDir = path.dirname(process.env.DATABASE_PATH || './database/vitana.db');
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

const dbPath = process.env.DATABASE_PATH || path.join(__dirname, 'vitana.db');

// Configurar SQLite para modo verbose em desenvolvimento
const sqlite = process.env.NODE_ENV === 'development' ? sqlite3.verbose() : sqlite3;

class Database {
  constructor() {
    this.db = null;
  }

  connect() {
    return new Promise((resolve, reject) => {
      this.db = new sqlite.Database(dbPath, (err) => {
        if (err) {
          console.error('❌ Erro ao conectar com o banco:', err.message);
          reject(err);
        } else {
          console.log('✅ Conectado ao banco SQLite:', dbPath);
          
          // Configurar WAL mode para melhor performance
          this.db.run('PRAGMA journal_mode = WAL;');
          this.db.run('PRAGMA synchronous = NORMAL;');
          this.db.run('PRAGMA cache_size = 1000;');
          this.db.run('PRAGMA foreign_keys = ON;');
          
          resolve();
        }
      });
    });
  }

  close() {
    return new Promise((resolve, reject) => {
      if (this.db) {
        this.db.close((err) => {
          if (err) {
            reject(err);
          } else {
            console.log('🔒 Conexão com banco fechada');
            resolve();
          }
        });
      } else {
        resolve();
      }
    });
  }

  run(sql, params = []) {
    return new Promise((resolve, reject) => {
      this.db.run(sql, params, function(err) {
        if (err) {
          console.error('❌ Erro SQL:', err.message);
          console.error('📝 Query:', sql);
          console.error('📋 Params:', params);
          reject(err);
        } else {
          resolve({ id: this.lastID, changes: this.changes });
        }
      });
    });
  }

  get(sql, params = []) {
    return new Promise((resolve, reject) => {
      this.db.get(sql, params, (err, row) => {
        if (err) {
          console.error('❌ Erro SQL:', err.message);
          console.error('📝 Query:', sql);
          console.error('📋 Params:', params);
          reject(err);
        } else {
          resolve(row);
        }
      });
    });
  }

  all(sql, params = []) {
    return new Promise((resolve, reject) => {
      this.db.all(sql, params, (err, rows) => {
        if (err) {
          console.error('❌ Erro SQL:', err.message);
          console.error('📝 Query:', sql);
          console.error('📋 Params:', params);
          reject(err);
        } else {
          resolve(rows);
        }
      });
    });
  }

  // Método para executar transações
  async transaction(operations) {
    await this.run('BEGIN TRANSACTION');
    try {
      const results = [];
      for (const operation of operations) {
        const result = await this.run(operation.sql, operation.params);
        results.push(result);
      }
      await this.run('COMMIT');
      return results;
    } catch (error) {
      await this.run('ROLLBACK');
      throw error;
    }
  }
}

// Instância singleton
const database = new Database();

export default database;