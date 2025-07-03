import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import database from '../database/connection.js';
import { authenticateToken, requireOperator } from '../middleware/auth.js';

const router = express.Router();

// Aplicar autenticação a todas as rotas
router.use(authenticateToken);

// Listar produtos
router.get('/', requireOperator, async (req, res) => {
  try {
    const products = await database.all(`
      SELECT * FROM products 
      WHERE business_id = ? 
      ORDER BY name
    `, [req.user.businessId]);

    res.json(products);
  } catch (error) {
    console.error('Erro ao listar produtos:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Buscar produto por código de barras
router.get('/barcode/:barcode', requireOperator, async (req, res) => {
  try {
    const { barcode } = req.params;
    
    const product = await database.get(`
      SELECT * FROM products 
      WHERE business_id = ? AND barcode = ?
    `, [req.user.businessId, barcode]);

    if (!product) {
      return res.status(404).json({ error: 'Produto não encontrado' });
    }

    res.json(product);
  } catch (error) {
    console.error('Erro ao buscar produto:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Criar produto (apenas admin)
router.post('/', async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Apenas administradores podem criar produtos' });
    }

    const { name, barcode, category, brand, price, cost, stock, minStock, unit } = req.body;

    const productId = uuidv4();
    await database.run(`
      INSERT INTO products (id, business_id, name, barcode, category, brand, price, cost, stock, min_stock, unit)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [productId, req.user.businessId, name, barcode, category, brand, price, cost, stock || 0, minStock || 0, unit || 'unidade']);

    const product = await database.get('SELECT * FROM products WHERE id = ?', [productId]);
    res.status(201).json(product);
  } catch (error) {
    console.error('Erro ao criar produto:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Atualizar produto (apenas admin)
router.put('/:id', async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Apenas administradores podem editar produtos' });
    }

    const { id } = req.params;
    const { name, barcode, category, brand, price, cost, stock, minStock, unit } = req.body;

    await database.run(`
      UPDATE products 
      SET name = ?, barcode = ?, category = ?, brand = ?, price = ?, cost = ?, 
          stock = ?, min_stock = ?, unit = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ? AND business_id = ?
    `, [name, barcode, category, brand, price, cost, stock, minStock, unit, id, req.user.businessId]);

    const product = await database.get('SELECT * FROM products WHERE id = ?', [id]);
    res.json(product);
  } catch (error) {
    console.error('Erro ao atualizar produto:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Deletar produto (apenas admin)
router.delete('/:id', async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Apenas administradores podem deletar produtos' });
    }

    const { id } = req.params;

    const result = await database.run(`
      DELETE FROM products 
      WHERE id = ? AND business_id = ?
    `, [id, req.user.businessId]);

    if (result.changes === 0) {
      return res.status(404).json({ error: 'Produto não encontrado' });
    }

    res.json({ success: true, message: 'Produto deletado com sucesso' });
  } catch (error) {
    console.error('Erro ao deletar produto:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Atualizar estoque
router.patch('/:id/stock', requireOperator, async (req, res) => {
  try {
    const { id } = req.params;
    const { quantity } = req.body;

    await database.run(`
      UPDATE products 
      SET stock = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ? AND business_id = ?
    `, [quantity, id, req.user.businessId]);

    const product = await database.get('SELECT * FROM products WHERE id = ?', [id]);
    res.json(product);
  } catch (error) {
    console.error('Erro ao atualizar estoque:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

export default router;