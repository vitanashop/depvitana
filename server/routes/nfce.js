import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import database from '../database/connection.js';
import { authenticateToken, requireAdmin } from '../middleware/auth.js';

const router = express.Router();

// Aplicar autenticação a todas as rotas
router.use(authenticateToken);

// Listar NFCe (apenas admin)
router.get('/', requireAdmin, async (req, res) => {
  try {
    const { limit = 50 } = req.query;
    
    const nfces = await database.all(`
      SELECT * FROM nfce 
      WHERE business_id = ? 
      ORDER BY created_at DESC 
      LIMIT ?
    `, [req.user.businessId, parseInt(limit)]);

    res.json(nfces);
  } catch (error) {
    console.error('Erro ao listar NFCe:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Criar NFCe (apenas admin)
router.post('/', requireAdmin, async (req, res) => {
  try {
    const { saleId, numero, serie, chaveAcesso, valorTotal, xmlGerado } = req.body;

    const nfceId = uuidv4();
    await database.run(`
      INSERT INTO nfce (id, business_id, sale_id, numero, serie, chave_acesso, valor_total, xml_gerado)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `, [nfceId, req.user.businessId, saleId, numero, serie, chaveAcesso, valorTotal, xmlGerado]);

    const nfce = await database.get('SELECT * FROM nfce WHERE id = ?', [nfceId]);
    res.status(201).json(nfce);
  } catch (error) {
    console.error('Erro ao criar NFCe:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Atualizar status da NFCe (apenas admin)
router.patch('/:id/status', requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { status, protocoloAutorizacao, motivoRejeicao, xmlAutorizado } = req.body;

    let sql = 'UPDATE nfce SET status = ?';
    const params = [status];

    if (status === 'autorizada') {
      sql += ', protocolo_autorizacao = ?, authorized_at = CURRENT_TIMESTAMP';
      params.push(protocoloAutorizacao);
      
      if (xmlAutorizado) {
        sql += ', xml_autorizado = ?';
        params.push(xmlAutorizado);
      }
    } else if (status === 'rejeitada') {
      sql += ', motivo_rejeicao = ?';
      params.push(motivoRejeicao);
    }

    sql += ' WHERE id = ? AND business_id = ?';
    params.push(id, req.user.businessId);

    await database.run(sql, params);

    const nfce = await database.get('SELECT * FROM nfce WHERE id = ?', [id]);
    res.json(nfce);
  } catch (error) {
    console.error('Erro ao atualizar NFCe:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

export default router;