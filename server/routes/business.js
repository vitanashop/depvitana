import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import database from '../database/connection.js';
import { authenticateToken, requireAdmin } from '../middleware/auth.js';

const router = express.Router();

// Aplicar autenticação a todas as rotas
router.use(authenticateToken);

// Obter configurações do estabelecimento
router.get('/settings', requireAdmin, async (req, res) => {
  try {
    const business = await database.get(`
      SELECT * FROM businesses WHERE id = ?
    `, [req.user.businessId]);

    if (!business) {
      return res.status(404).json({ error: 'Estabelecimento não encontrado' });
    }

    // Buscar configurações adicionais
    const settings = await database.all(`
      SELECT key, value FROM settings WHERE business_id = ?
    `, [req.user.businessId]);

    const settingsObj = settings.reduce((acc, setting) => {
      acc[setting.key] = setting.value;
      return acc;
    }, {});

    res.json({
      ...business,
      settings: settingsObj
    });
  } catch (error) {
    console.error('Erro ao obter configurações:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Atualizar configurações do estabelecimento
router.put('/settings', requireAdmin, async (req, res) => {
  try {
    const { name, subtitle, logoUrl, useCustomLogo, settings } = req.body;

    // Atualizar dados básicos do estabelecimento
    await database.run(`
      UPDATE businesses 
      SET name = ?, subtitle = ?, logo_url = ?, use_custom_logo = ?
      WHERE id = ?
    `, [name, subtitle, logoUrl, useCustomLogo, req.user.businessId]);

    // Atualizar configurações adicionais
    if (settings) {
      for (const [key, value] of Object.entries(settings)) {
        await database.run(`
          INSERT OR REPLACE INTO settings (id, business_id, key, value, updated_at)
          VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP)
        `, [uuidv4(), req.user.businessId, key, value]);
      }
    }

    res.json({ success: true, message: 'Configurações atualizadas com sucesso' });
  } catch (error) {
    console.error('Erro ao atualizar configurações:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

export default router;