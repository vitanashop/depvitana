import database from '../database/connection.js';
import bcrypt from 'bcryptjs';

const initDatabase = async () => {
  try {
    console.log('🔧 Inicializando banco de dados...');
    
    await database.connect();

    // Criar tabelas
    console.log('📋 Criando tabelas...');

    await database.run(`
      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        email TEXT UNIQUE NOT NULL,
        full_name TEXT NOT NULL,
        business_name TEXT NOT NULL,
        business_description TEXT,
        status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'restricted')),
        rejection_reason TEXT,
        restriction_reason TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        approved_at DATETIME,
        restricted_at DATETIME
      )
    `);

    await database.run(`
      CREATE TABLE IF NOT EXISTS user_credentials (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        username TEXT NOT NULL,
        password_hash TEXT NOT NULL,
        role TEXT NOT NULL CHECK (role IN ('admin', 'operator')),
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        last_login DATETIME,
        FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
        UNIQUE(user_id, username)
      )
    `);

    await database.run(`
      CREATE TABLE IF NOT EXISTS businesses (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        subtitle TEXT,
        logo_url TEXT,
        use_custom_logo BOOLEAN DEFAULT FALSE,
        plan TEXT DEFAULT 'free' CHECK (plan IN ('free', 'premium')),
        owner_id TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (owner_id) REFERENCES users (id)
      )
    `);

    await database.run(`
      CREATE TABLE IF NOT EXISTS products (
        id TEXT PRIMARY KEY,
        business_id TEXT NOT NULL,
        name TEXT NOT NULL,
        barcode TEXT,
        category TEXT,
        brand TEXT,
        price DECIMAL(10,2) NOT NULL,
        cost DECIMAL(10,2),
        stock INTEGER DEFAULT 0,
        min_stock INTEGER DEFAULT 0,
        unit TEXT DEFAULT 'unidade',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (business_id) REFERENCES businesses (id) ON DELETE CASCADE
      )
    `);

    await database.run(`
      CREATE TABLE IF NOT EXISTS sales (
        id TEXT PRIMARY KEY,
        business_id TEXT NOT NULL,
        user_id TEXT NOT NULL,
        total DECIMAL(10,2) NOT NULL,
        payment_method TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (business_id) REFERENCES businesses (id) ON DELETE CASCADE,
        FOREIGN KEY (user_id) REFERENCES users (id)
      )
    `);

    await database.run(`
      CREATE TABLE IF NOT EXISTS sale_items (
        id TEXT PRIMARY KEY,
        sale_id TEXT NOT NULL,
        product_id TEXT NOT NULL,
        product_name TEXT NOT NULL,
        quantity INTEGER NOT NULL,
        unit_price DECIMAL(10,2) NOT NULL,
        total DECIMAL(10,2) NOT NULL,
        FOREIGN KEY (sale_id) REFERENCES sales (id) ON DELETE CASCADE,
        FOREIGN KEY (product_id) REFERENCES products (id)
      )
    `);

    await database.run(`
      CREATE TABLE IF NOT EXISTS stock_movements (
        id TEXT PRIMARY KEY,
        business_id TEXT NOT NULL,
        product_id TEXT NOT NULL,
        type TEXT NOT NULL CHECK (type IN ('entrada', 'saida')),
        quantity INTEGER NOT NULL,
        reason TEXT,
        unit_cost DECIMAL(10,2),
        total_cost DECIMAL(10,2),
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (business_id) REFERENCES businesses (id) ON DELETE CASCADE,
        FOREIGN KEY (product_id) REFERENCES products (id)
      )
    `);

    await database.run(`
      CREATE TABLE IF NOT EXISTS nfce (
        id TEXT PRIMARY KEY,
        business_id TEXT NOT NULL,
        sale_id TEXT NOT NULL,
        numero INTEGER NOT NULL,
        serie INTEGER NOT NULL,
        chave_acesso TEXT,
        status TEXT DEFAULT 'pendente' CHECK (status IN ('pendente', 'autorizada', 'rejeitada', 'cancelada')),
        protocolo_autorizacao TEXT,
        motivo_rejeicao TEXT,
        xml_gerado TEXT,
        xml_autorizado TEXT,
        valor_total DECIMAL(10,2) NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        authorized_at DATETIME,
        FOREIGN KEY (business_id) REFERENCES businesses (id) ON DELETE CASCADE,
        FOREIGN KEY (sale_id) REFERENCES sales (id)
      )
    `);

    await database.run(`
      CREATE TABLE IF NOT EXISTS settings (
        id TEXT PRIMARY KEY,
        business_id TEXT NOT NULL,
        key TEXT NOT NULL,
        value TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (business_id) REFERENCES businesses (id) ON DELETE CASCADE,
        UNIQUE(business_id, key)
      )
    `);

    // Índices
    console.log('🔍 Criando índices...');
    await database.run('CREATE INDEX IF NOT EXISTS idx_users_email ON users (email)');
    await database.run('CREATE INDEX IF NOT EXISTS idx_users_status ON users (status)');
    await database.run('CREATE INDEX IF NOT EXISTS idx_credentials_user_id ON user_credentials (user_id)');
    await database.run('CREATE INDEX IF NOT EXISTS idx_products_business_id ON products (business_id)');
    await database.run('CREATE INDEX IF NOT EXISTS idx_products_barcode ON products (barcode)');
    await database.run('CREATE INDEX IF NOT EXISTS idx_sales_business_id ON sales (business_id)');
    await database.run('CREATE INDEX IF NOT EXISTS idx_sales_created_at ON sales (created_at)');
    await database.run('CREATE INDEX IF NOT EXISTS idx_stock_movements_product_id ON stock_movements (product_id)');

    // Dados iniciais
    console.log('📦 Inserindo dados iniciais...');
    const existingBusiness = await database.get('SELECT id FROM businesses LIMIT 1');
    
    if (!existingBusiness) {
      const businessId = 'default-business';
      await database.run(`
        INSERT INTO businesses (id, name, subtitle, plan)
        VALUES (?, ?, ?, ?)
      `, [businessId, 'Sistema de Gestão', 'Depósito de Bebidas', 'free']);

      const initialProducts = [
        {
          id: 'prod-1',
          name: 'Coca-Cola 2L',
          barcode: '7894900011517',
          category: 'Refrigerante',
          brand: 'Coca-Cola',
          price: 8.50,
          cost: 5.20,
          stock: 48,
          minStock: 10
        },
        {
          id: 'prod-2',
          name: 'Cerveja Skol Lata 350ml',
          barcode: '7891991010924',
          category: 'Cerveja',
          brand: 'Skol',
          price: 3.20,
          cost: 2.10,
          stock: 120,
          minStock: 24
        },
        {
          id: 'prod-3',
          name: 'Água Crystal 500ml',
          barcode: '7891910000147',
          category: 'Água',
          brand: 'Crystal',
          price: 2.00,
          cost: 1.20,
          stock: 8,
          minStock: 20
        },
        {
          id: 'prod-4',
          name: 'Guaraná Antarctica 2L',
          barcode: '7891991010931',
          category: 'Refrigerante',
          brand: 'Antarctica',
          price: 7.80,
          cost: 4.90,
          stock: 32,
          minStock: 15
        },
        {
          id: 'prod-5',
          name: 'Cerveja Brahma Long Neck',
          barcode: '7891991010948',
          category: 'Cerveja',
          brand: 'Brahma',
          price: 4.50,
          cost: 2.80,
          stock: 96,
          minStock: 30
        }
      ];

      for (const product of initialProducts) {
        await database.run(`
          INSERT INTO products (id, business_id, name, barcode, category, brand, price, cost, stock, min_stock, unit)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [
          product.id,
          businessId,
          product.name,
          product.barcode,
          product.category,
          product.brand,
          product.price,
          product.cost,
          product.stock,
          product.minStock,
          'unidade'
        ]);
      }

      console.log('✅ Produtos iniciais inseridos');
    }

    console.log('🎉 Banco de dados inicializado com sucesso!');
    
  } catch (error) {
    console.error('❌ Erro ao inicializar banco:', error);
    throw error;
  } finally {
    await database.close();
  }
};

// Executar se chamado diretamente
if (process.argv[1] === new URL(import.meta.url).pathname) {
  initDatabase().catch(console.error);
}

export default initDatabase;
