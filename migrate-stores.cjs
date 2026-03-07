const mysql = require('mysql2/promise');

async function main() {
  const conn = await mysql.createConnection({
    host: 'gateway04.us-east-1.prod.aws.tidbcloud.com',
    port: 4000,
    user: '2pUNe727c8yqxdN.root',
    password: 'IsLZXG1984TrSkY1P7ry',
    database: 'ji3XHgPR7e79CMEH66Wkcf',
    ssl: { rejectUnauthorized: true }
  });

  console.log('Conectado ao banco de dados.\n');

  // 1. Criar tabela stores
  console.log('Criando tabela stores...');
  await conn.query(`
    CREATE TABLE IF NOT EXISTS stores (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      slug VARCHAR(255) NOT NULL UNIQUE,
      whatsapp VARCHAR(32),
      logo_url TEXT,
      is_active TINYINT(1) NOT NULL DEFAULT 1,
      trial_ends_at TIMESTAMP NULL,
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )
  `);
  console.log('Tabela stores criada.\n');

  // 2. Criar tabela store_users
  console.log('Criando tabela store_users...');
  await conn.query(`
    CREATE TABLE IF NOT EXISTS store_users (
      id INT AUTO_INCREMENT PRIMARY KEY,
      store_id INT NOT NULL,
      user_id INT NOT NULL,
      role_in_store ENUM('owner', 'manager', 'seller') NOT NULL DEFAULT 'owner',
      joined_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      UNIQUE KEY unique_store_user (store_id, user_id)
    )
  `);
  console.log('Tabela store_users criada.\n');

  // 3. Criar tabela store_settings
  console.log('Criando tabela store_settings...');
  await conn.query(`
    CREATE TABLE IF NOT EXISTS store_settings (
      id INT AUTO_INCREMENT PRIMARY KEY,
      store_id INT NOT NULL UNIQUE,
      quote_closing_text TEXT,
      theme VARCHAR(32) DEFAULT 'system',
      currency VARCHAR(8) DEFAULT 'BRL',
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )
  `);
  console.log('Tabela store_settings criada.\n');

  // 4. Criar tabela machine_fees
  console.log('Criando tabela machine_fees...');
  await conn.query(`
    CREATE TABLE IF NOT EXISTS machine_fees (
      id INT AUTO_INCREMENT PRIMARY KEY,
      store_id INT NOT NULL,
      installments INT NOT NULL,
      rate_percentage VARCHAR(16) NOT NULL DEFAULT '0',
      label VARCHAR(64),
      is_active TINYINT(1) NOT NULL DEFAULT 1,
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      UNIQUE KEY unique_store_installments (store_id, installments)
    )
  `);
  console.log('Tabela machine_fees criada.\n');

  // 5. Criar tabela device_conditions
  console.log('Criando tabela device_conditions...');
  await conn.query(`
    CREATE TABLE IF NOT EXISTS device_conditions (
      id INT AUTO_INCREMENT PRIMARY KEY,
      store_id INT NOT NULL,
      condition_key VARCHAR(128) NOT NULL,
      label VARCHAR(255) NOT NULL,
      description TEXT,
      deduction_value VARCHAR(16) NOT NULL DEFAULT '0',
      category ENUM('estetica', 'funcionalidade', 'garantia') NOT NULL DEFAULT 'estetica',
      icon VARCHAR(64),
      is_active TINYINT(1) NOT NULL DEFAULT 1,
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      UNIQUE KEY unique_store_condition (store_id, condition_key)
    )
  `);
  console.log('Tabela device_conditions criada.\n');

  // 6. Criar tabela store_products
  console.log('Criando tabela store_products...');
  await conn.query(`
    CREATE TABLE IF NOT EXISTS store_products (
      id INT AUTO_INCREMENT PRIMARY KEY,
      store_id INT NOT NULL,
      product_id INT NOT NULL,
      price VARCHAR(16) NOT NULL DEFAULT '0',
      \`condition\` ENUM('novo', 'seminovo') DEFAULT 'novo',
      is_active TINYINT(1) NOT NULL DEFAULT 1,
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      UNIQUE KEY unique_store_product (store_id, product_id)
    )
  `);
  console.log('Tabela store_products criada.\n');

  // 7. Criar tabelas auxiliares
  console.log('Criando tabelas auxiliares...');
  await conn.query(`
    CREATE TABLE IF NOT EXISTS products (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      storage VARCHAR(64),
      category VARCHAR(64),
      product_category VARCHAR(64),
      specs TEXT,
      is_active TINYINT(1) NOT NULL DEFAULT 1,
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
    )
  `);

  await conn.query(`
    CREATE TABLE IF NOT EXISTS trade_in_rules (
      id INT AUTO_INCREMENT PRIMARY KEY,
      store_id INT NOT NULL,
      product_name VARCHAR(255) NOT NULL,
      storage VARCHAR(64),
      trade_in_value VARCHAR(16) NOT NULL DEFAULT '0',
      category VARCHAR(64),
      is_active TINYINT(1) NOT NULL DEFAULT 1,
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      UNIQUE KEY unique_store_trade_in (store_id, product_name, storage)
    )
  `);

  await conn.query(`
    CREATE TABLE IF NOT EXISTS activity_logs (
      id INT AUTO_INCREMENT PRIMARY KEY,
      user_id INT,
      store_id INT,
      action VARCHAR(128) NOT NULL,
      details TEXT,
      ip_address VARCHAR(64),
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
    )
  `);

  await conn.query(`
    CREATE TABLE IF NOT EXISTS support_settings (
      id INT AUTO_INCREMENT PRIMARY KEY,
      setting_key VARCHAR(128) NOT NULL UNIQUE,
      setting_value TEXT,
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )
  `);

  await conn.query(`
    CREATE TABLE IF NOT EXISTS plans (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(128) NOT NULL,
      slug VARCHAR(128) NOT NULL UNIQUE,
      price_monthly VARCHAR(16) NOT NULL DEFAULT '0',
      price_yearly VARCHAR(16) NOT NULL DEFAULT '0',
      max_users INT NOT NULL DEFAULT 1,
      max_products INT NOT NULL DEFAULT 100,
      features TEXT,
      is_active TINYINT(1) NOT NULL DEFAULT 1,
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
    )
  `);

  await conn.query(`
    CREATE TABLE IF NOT EXISTS subscriptions (
      id INT AUTO_INCREMENT PRIMARY KEY,
      store_id INT NOT NULL,
      plan_id INT NOT NULL,
      status ENUM('active', 'cancelled', 'expired', 'trial') NOT NULL DEFAULT 'trial',
      starts_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      ends_at TIMESTAMP NULL,
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
    )
  `);

  await conn.query(`
    CREATE TABLE IF NOT EXISTS quotes (
      id INT AUTO_INCREMENT PRIMARY KEY,
      store_id INT NOT NULL,
      user_id INT NOT NULL,
      customer_name VARCHAR(255),
      customer_phone VARCHAR(32),
      total_amount VARCHAR(16) NOT NULL DEFAULT '0',
      status ENUM('draft', 'sent', 'accepted', 'rejected') NOT NULL DEFAULT 'draft',
      notes TEXT,
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )
  `);

  await conn.query(`
    CREATE TABLE IF NOT EXISTS quote_items (
      id INT AUTO_INCREMENT PRIMARY KEY,
      quote_id INT NOT NULL,
      product_name VARCHAR(255) NOT NULL,
      storage VARCHAR(64),
      \`condition\` VARCHAR(32),
      unit_price VARCHAR(16) NOT NULL DEFAULT '0',
      quantity INT NOT NULL DEFAULT 1,
      installments INT,
      installment_value VARCHAR(16),
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
    )
  `);

  await conn.query(`
    CREATE TABLE IF NOT EXISTS trade_ins (
      id INT AUTO_INCREMENT PRIMARY KEY,
      quote_id INT,
      store_id INT NOT NULL,
      user_id INT NOT NULL,
      device_name VARCHAR(255) NOT NULL,
      storage VARCHAR(64),
      base_value VARCHAR(16) NOT NULL DEFAULT '0',
      total_deduction VARCHAR(16) NOT NULL DEFAULT '0',
      final_value VARCHAR(16) NOT NULL DEFAULT '0',
      conditions_applied TEXT,
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
    )
  `);

  await conn.query(`
    CREATE TABLE IF NOT EXISTS app_settings (
      id INT AUTO_INCREMENT PRIMARY KEY,
      setting_key VARCHAR(128) NOT NULL UNIQUE,
      setting_value TEXT,
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )
  `);

  console.log('Todas as tabelas auxiliares criadas.\n');

  // 8. Buscar todos os usuários
  const [users] = await conn.query('SELECT id, name, email, role, storeName FROM users');
  console.log(`Encontrados ${users.length} usuários.\n`);

  // 9. Criar uma loja para cada usuário que não é admin master do sistema
  let storeCount = 0;
  for (const user of users) {
    // Pular o admin master do sistema (admin@quotify.app)
    if (user.email === 'admin@quotify.app') {
      console.log(`Pulando admin do sistema: ${user.email}`);
      continue;
    }

    // Gerar slug a partir do nome ou email
    const slug = (user.name || user.email.split('@')[0])
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '')
      .substring(0, 50);

    // Verificar se já existe loja com esse slug
    const [existing] = await conn.query('SELECT id FROM stores WHERE slug = ?', [slug]);
    let storeId;

    if (existing.length > 0) {
      // Slug já existe, adicionar sufixo
      const uniqueSlug = slug + '-' + user.id;
      const [existing2] = await conn.query('SELECT id FROM stores WHERE slug = ?', [uniqueSlug]);
      if (existing2.length > 0) {
        storeId = existing2[0].id;
        console.log(`Loja já existe para ${user.name} (${user.email}), storeId=${storeId}`);
      } else {
        const storeName = user.storeName || user.name || user.email.split('@')[0];
        const [result] = await conn.query(
          'INSERT INTO stores (name, slug, is_active) VALUES (?, ?, 1)',
          [storeName, uniqueSlug]
        );
        storeId = result.insertId;
        console.log(`Loja criada: "${storeName}" (slug: ${uniqueSlug}) → storeId=${storeId}`);
      }
    } else {
      const storeName = user.storeName || user.name || user.email.split('@')[0];
      const [result] = await conn.query(
        'INSERT INTO stores (name, slug, is_active) VALUES (?, ?, 1)',
        [storeName, slug]
      );
      storeId = result.insertId;
      console.log(`Loja criada: "${storeName}" (slug: ${slug}) → storeId=${storeId}`);
    }

    // Vincular usuário à loja
    const roleInStore = (user.role === 'master_admin') ? 'owner' : 'owner';
    try {
      await conn.query(
        'INSERT INTO store_users (store_id, user_id, role_in_store) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE role_in_store = VALUES(role_in_store)',
        [storeId, user.id, roleInStore]
      );
      console.log(`  → Usuário ${user.id} vinculado à loja ${storeId} como ${roleInStore}`);
    } catch (e) {
      console.log(`  → Erro ao vincular: ${e.message}`);
    }

    // Criar store_settings padrão
    try {
      await conn.query(
        'INSERT INTO store_settings (store_id) VALUES (?) ON DUPLICATE KEY UPDATE store_id = store_id',
        [storeId]
      );
    } catch (e) { /* ignore */ }

    storeCount++;
  }

  console.log(`\n=== MIGRAÇÃO CONCLUÍDA ===`);
  console.log(`${storeCount} lojas criadas/verificadas.`);

  // Verificar resultado
  const [stores] = await conn.query('SELECT * FROM stores');
  console.log(`\nTotal de lojas no banco: ${stores.length}`);
  stores.forEach(s => console.log(`  Loja #${s.id}: ${s.name} (slug: ${s.slug})`));

  const [su] = await conn.query('SELECT su.*, u.name, u.email FROM store_users su JOIN users u ON u.id = su.user_id');
  console.log(`\nTotal de vínculos store_users: ${su.length}`);
  su.forEach(s => console.log(`  Loja #${s.store_id} ← ${s.name} (${s.email}) [${s.role_in_store}]`));

  await conn.end();
  console.log('\nConexão encerrada.');
}

main().catch(e => {
  console.error('ERRO:', e.message);
  process.exit(1);
});
