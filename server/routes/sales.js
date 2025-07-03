import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import database from '../database/connection.js';
import { authenticateToken, requireOperator } from '../middleware/auth.js';

const router = express.Router();

// Aplicar autenticação a todas as rotas
router.use(authenticateToken);

// Listar vendas
router.get('/', requireOperator, async (req, res) => {
  try {
    const { startDate, endDate, limit = 50 } = req.query;
    
    let sql = `
      SELECT s.*, 
             GROUP_CONCAT(
               json_object(
                 'id', si.id,
                 'productId', si.product_id,
                 'productName', si.product_name,
                 'quantity', si.quantity,
                 'unitPrice', si.unit_price,
                 'total', si.total
               )
             ) as items
      FROM sales s
      LEFT JOIN sale_items si ON s.id = si.sale_id
      WHERE s.business_id = ?
    `;
    
    const params = [req.user.businessId];
    
    if (startDate) {
      sql += ' AND s.created_at >= ?';
      params.push(startDate);
    }
    
    if (endDate) {
      sql += ' AND s.created_at <= ?';
      params.push(endDate);
    }
    
    sql += ' GROUP BY s.id ORDER BY s.created_at DESC LIMIT ?';
    params.push(parseInt(limit));

    const sales = await database.all(sql, params);
    
    // Processar itens JSON
    const processedSales = sales.map(sale => ({
      ...sale,
      items: sale.items ? JSON.parse(`[${sale.items}]`) : []
    }));

    res.json(processedSales);
  } catch (error) {
    console.error('Erro ao listar vendas:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Criar venda
router.post('/', requireOperator, async (req, res) => {
  try {
    const { items, total, paymentMethod } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({ error: 'Venda deve ter pelo menos um item' });
    }

    const saleId = uuidv4();
    
    // Iniciar transação
    const operations = [
      // Inserir venda
      {
        sql: `INSERT INTO sales (id, business_id, user_id, total, payment_method)
              VALUES (?, ?, ?, ?, ?)`,
        params: [saleId, req.user.businessId, req.user.id, total, paymentMethod]
      }
    ];

    // Inserir itens e atualizar estoque
    for (const item of items) {
      // Inserir item da venda
      operations.push({
        sql: `INSERT INTO sale_items (id, sale_id, product_id, product_name, quantity, unit_price, total)
              VALUES (?, ?, ?, ?, ?, ?, ?)`,
        params: [uuidv4(), saleId, item.productId, item.productName, item.quantity, item.unitPrice, item.total]
      });

      // Atualizar estoque do produto
      operations.push({
        sql: `UPDATE products 
              SET stock = stock - ?, updated_at = CURRENT_TIMESTAMP
              WHERE id = ? AND business_id = ?`,
        params: [item.quantity, item.productId, req.user.businessId]
      });

      // Registrar movimentação de estoque
      operations.push({
        sql: `INSERT INTO stock_movements (id, business_id, product_id, type, quantity, reason)
              VALUES (?, ?, ?, 'saida', ?, 'Venda')`,
        params: [uuidv4(), req.user.businessId, item.productId, item.quantity]
      });
    }

    await database.transaction(operations);

    // Buscar venda criada com itens
    const sale = await database.get(`
      SELECT s.*, 
             GROUP_CONCAT(
               json_object(
                 'id', si.id,
                 'productId', si.product_id,
                 'productName', si.product_name,
                 'quantity', si.quantity,
                 'unitPrice', si.unit_price,
                 'total', si.total
               )
             ) as items
      FROM sales s
      LEFT JOIN sale_items si ON s.id = si.sale_id
      WHERE s.id = ?
      GROUP BY s.id
    `, [saleId]);

    const processedSale = {
      ...sale,
      items: sale.items ? JSON.parse(`[${sale.items}]`) : []
    };

    res.status(201).json(processedSale);
  } catch (error) {
    console.error('Erro ao criar venda:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Obter estatísticas de vendas
router.get('/stats', requireOperator, async (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0];
    const thisMonth = new Date().toISOString().substring(0, 7);
    const thisYear = new Date().getFullYear();

    // Receita diária
    const dailyRevenue = await database.get(`
      SELECT COALESCE(SUM(total), 0) as revenue
      FROM sales 
      WHERE business_id = ? AND DATE(created_at) = ?
    `, [req.user.businessId, today]);

    // Receita mensal
    const monthlyRevenue = await database.get(`
      SELECT COALESCE(SUM(total), 0) as revenue
      FROM sales 
      WHERE business_id = ? AND strftime('%Y-%m', created_at) = ?
    `, [req.user.businessId, thisMonth]);

    // Receita anual
    const yearlyRevenue = await database.get(`
      SELECT COALESCE(SUM(total), 0) as revenue
      FROM sales 
      WHERE business_id = ? AND strftime('%Y', created_at) = ?
    `, [req.user.businessId, thisYear.toString()]);

    // Vendas por forma de pagamento (último mês)
    const paymentMethods = await database.all(`
      SELECT payment_method, COUNT(*) as count, SUM(total) as total
      FROM sales 
      WHERE business_id = ? AND created_at >= date('now', '-30 days')
      GROUP BY payment_method
    `, [req.user.businessId]);

    res.json({
      dailyRevenue: dailyRevenue.revenue,
      monthlyRevenue: monthlyRevenue.revenue,
      yearlyRevenue: yearlyRevenue.revenue,
      paymentMethods
    });
  } catch (error) {
    console.error('Erro ao obter estatísticas:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

export default router;