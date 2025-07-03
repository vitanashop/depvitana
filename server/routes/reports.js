import express from 'express';
import database from '../database/connection.js';
import { authenticateToken, requireAdmin } from '../middleware/auth.js';

const router = express.Router();

// Aplicar autenticação a todas as rotas
router.use(authenticateToken);

// Relatório de vendas (apenas admin)
router.get('/sales', requireAdmin, async (req, res) => {
  try {
    const { startDate, endDate, groupBy = 'day' } = req.query;
    
    let dateFormat;
    switch (groupBy) {
      case 'month':
        dateFormat = '%Y-%m';
        break;
      case 'year':
        dateFormat = '%Y';
        break;
      default:
        dateFormat = '%Y-%m-%d';
    }
    
    let sql = `
      SELECT 
        strftime('${dateFormat}', created_at) as period,
        COUNT(*) as total_sales,
        SUM(total) as total_revenue,
        AVG(total) as average_sale,
        payment_method
      FROM sales 
      WHERE business_id = ?
    `;
    
    const params = [req.user.businessId];
    
    if (startDate) {
      sql += ' AND created_at >= ?';
      params.push(startDate);
    }
    
    if (endDate) {
      sql += ' AND created_at <= ?';
      params.push(endDate);
    }
    
    sql += ` GROUP BY period, payment_method ORDER BY period DESC`;

    const salesData = await database.all(sql, params);
    res.json(salesData);
  } catch (error) {
    console.error('Erro no relatório de vendas:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Relatório de produtos mais vendidos (apenas admin)
router.get('/top-products', requireAdmin, async (req, res) => {
  try {
    const { startDate, endDate, limit = 10 } = req.query;
    
    let sql = `
      SELECT 
        si.product_id,
        si.product_name,
        SUM(si.quantity) as total_quantity,
        SUM(si.total) as total_revenue,
        COUNT(DISTINCT si.sale_id) as sales_count,
        AVG(si.unit_price) as average_price
      FROM sale_items si
      JOIN sales s ON si.sale_id = s.id
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
    
    sql += ` 
      GROUP BY si.product_id, si.product_name 
      ORDER BY total_quantity DESC 
      LIMIT ?
    `;
    params.push(parseInt(limit));

    const topProducts = await database.all(sql, params);
    res.json(topProducts);
  } catch (error) {
    console.error('Erro no relatório de produtos:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Relatório de estoque (apenas admin)
router.get('/inventory', requireAdmin, async (req, res) => {
  try {
    const inventory = await database.all(`
      SELECT 
        id,
        name,
        category,
        brand,
        stock,
        min_stock,
        price,
        cost,
        (stock * cost) as inventory_value,
        CASE 
          WHEN stock <= min_stock AND min_stock > 0 THEN 'low'
          WHEN stock = 0 THEN 'out'
          ELSE 'ok'
        END as stock_status
      FROM products 
      WHERE business_id = ?
      ORDER BY name
    `, [req.user.businessId]);

    // Calcular totais
    const totals = {
      totalProducts: inventory.length,
      totalValue: inventory.reduce((sum, item) => sum + (item.inventory_value || 0), 0),
      lowStockItems: inventory.filter(item => item.stock_status === 'low').length,
      outOfStockItems: inventory.filter(item => item.stock_status === 'out').length
    };

    res.json({
      inventory,
      totals
    });
  } catch (error) {
    console.error('Erro no relatório de estoque:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Dashboard resumo (apenas admin)
router.get('/dashboard', requireAdmin, async (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0];
    const thisMonth = new Date().toISOString().substring(0, 7);
    const thisYear = new Date().getFullYear();

    // Estatísticas básicas
    const [
      dailyStats,
      monthlyStats,
      yearlyStats,
      productCount,
      lowStockCount
    ] = await Promise.all([
      // Vendas de hoje
      database.get(`
        SELECT COUNT(*) as sales, COALESCE(SUM(total), 0) as revenue
        FROM sales 
        WHERE business_id = ? AND DATE(created_at) = ?
      `, [req.user.businessId, today]),
      
      // Vendas do mês
      database.get(`
        SELECT COUNT(*) as sales, COALESCE(SUM(total), 0) as revenue
        FROM sales 
        WHERE business_id = ? AND strftime('%Y-%m', created_at) = ?
      `, [req.user.businessId, thisMonth]),
      
      // Vendas do ano
      database.get(`
        SELECT COUNT(*) as sales, COALESCE(SUM(total), 0) as revenue
        FROM sales 
        WHERE business_id = ? AND strftime('%Y', created_at) = ?
      `, [req.user.businessId, thisYear.toString()]),
      
      // Total de produtos
      database.get(`
        SELECT COUNT(*) as count
        FROM products 
        WHERE business_id = ?
      `, [req.user.businessId]),
      
      // Produtos com estoque baixo
      database.get(`
        SELECT COUNT(*) as count
        FROM products 
        WHERE business_id = ? AND stock <= min_stock AND min_stock > 0
      `, [req.user.businessId])
    ]);

    res.json({
      today: {
        sales: dailyStats.sales,
        revenue: dailyStats.revenue
      },
      thisMonth: {
        sales: monthlyStats.sales,
        revenue: monthlyStats.revenue
      },
      thisYear: {
        sales: yearlyStats.sales,
        revenue: yearlyStats.revenue
      },
      products: {
        total: productCount.count,
        lowStock: lowStockCount.count
      }
    });
  } catch (error) {
    console.error('Erro no dashboard:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

export default router;