import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import database from '../database/connection.js';
import { authenticateToken, requireAdmin } from '../middleware/auth.js';

const router = express.Router();

// Aplicar autenticação a todas as rotas
router.use(authenticateToken);

// Listar movimentações de estoque (apenas admin)
router.get('/movements', requireAdmin, async (req, res) => {
  try {
    const { productId, startDate, endDate, limit = 50 } = req.query;
    
    let sql = `
      SELECT sm.*, p.name as product_name
      FROM stock_movements sm
      JOIN products p ON sm.product_id = p.id
      WHERE sm.business_id = ?
    `;
    
    const params = [req.user.businessId];
    
    if (productId) {
      sql += ' AND sm.product_id = ?';
      params.push(productId);
    }
    
    if (startDate) {
      sql += ' AND sm.created_at >= ?';
      params.push(startDate);
    }
    
    if (endDate) {
      sql += ' AND sm.created_at <= ?';
      params.push(endDate);
    }
    
    sql += ' ORDER BY sm.created_at DESC LIMIT ?';
    params.push(parseInt(limit));

    const movements = await database.all(sql, params);
    res.json(movements);
  } catch (error) {
    console.error('Erro ao listar movimentações:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Adicionar movimentação de estoque (apenas admin)
router.post('/movements', requireAdmin, async (req, res) => {
  try {
    const { productId, type, quantity, reason, unitCost } = req.body;

    if (!['entrada', 'saida'].includes(type)) {
      return res.status(400).json({ error: 'Tipo deve ser "entrada" ou "saida"' });
    }

    const movementId = uuidv4();
    const totalCost = unitCost ? unitCost * quantity : null;

    // Iniciar transação
    const operations = [
      // Inserir movimentação
      {
        sql: `INSERT INTO stock_movements (id, business_id, product_id, type, quantity, reason, unit_cost, total_cost)
              VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        params: [movementId, req.user.businessId, productId, type, quantity, reason, unitCost, totalCost]
      }
    ];

    // Atualizar estoque do produto
    const stockChange = type === 'entrada' ? quantity : -quantity;
    operations.push({
      sql: `UPDATE products 
            SET stock = stock + ?, updated_at = CURRENT_TIMESTAMP
            WHERE id = ? AND business_id = ?`,
      params: [stockChange, productId, req.user.businessId]
    });

    // Se for entrada com custo, atualizar custo do produto
    if (type === 'entrada' && unitCost) {
      operations.push({
        sql: `UPDATE products 
              SET cost = ?, updated_at = CURRENT_TIMESTAMP
              WHERE id = ? AND business_id = ?`,
        params: [unitCost, productId, req.user.businessId]
      });
    }

    await database.transaction(operations);

    // Buscar movimentação criada
    const movement = await database.get(`
      SELECT sm.*, p.name as product_name
      FROM stock_movements sm
      JOIN products p ON sm.product_id = p.id
      WHERE sm.id = ?
    `, [movementId]);

    res.status(201).json(movement);
  } catch (error) {
    console.error('Erro ao adicionar movimentação:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Obter produtos com estoque baixo
router.get('/low-stock', requireAdmin, async (req, res) => {
  try {
    const products = await database.all(`
      SELECT * FROM products 
      WHERE business_id = ? AND stock <= min_stock AND min_stock > 0
      ORDER BY (stock - min_stock) ASC
    `, [req.user.businessId]);

    res.json(products);
  } catch (error) {
    console.error('Erro ao obter produtos com estoque baixo:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

export default router;