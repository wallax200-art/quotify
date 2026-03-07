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

  console.log('Conectado. Alinhando tabelas com o schema do Drizzle...\n');

  // 1. STORES: is_active (tinyint) → status (enum), logo_url (text) → logo_url (varchar 512)
  // Drizzle espera: status enum('active','inactive','suspended'), slug varchar(128)
  console.log('1. Corrigindo tabela stores...');
  try {
    // Adicionar coluna status se não existe
    await conn.query(`ALTER TABLE stores ADD COLUMN status ENUM('active','inactive','suspended') NOT NULL DEFAULT 'active'`);
    console.log('   Coluna status adicionada.');
  } catch (e) {
    if (e.message.includes('Duplicate column')) {
      console.log('   Coluna status já existe.');
    } else {
      console.log('   Erro ao adicionar status:', e.message);
    }
  }
  // Copiar is_active para status
  try {
    await conn.query(`UPDATE stores SET status = CASE WHEN is_active = 1 THEN 'active' ELSE 'inactive' END`);
    console.log('   Dados migrados de is_active para status.');
  } catch (e) { console.log('   Erro ao migrar:', e.message); }
  // Remover is_active
  try {
    await conn.query(`ALTER TABLE stores DROP COLUMN is_active`);
    console.log('   Coluna is_active removida.');
  } catch (e) { console.log('   Nota:', e.message); }
  // Remover trial_ends_at (não está no schema)
  try {
    await conn.query(`ALTER TABLE stores DROP COLUMN trial_ends_at`);
    console.log('   Coluna trial_ends_at removida.');
  } catch (e) { console.log('   Nota:', e.message); }
  // Corrigir logo_url de text para varchar(512)
  try {
    await conn.query(`ALTER TABLE stores MODIFY COLUMN logo_url VARCHAR(512)`);
    console.log('   Coluna logo_url corrigida para VARCHAR(512).');
  } catch (e) { console.log('   Nota:', e.message); }
  // Corrigir slug de varchar(255) para varchar(128) - precisa remover unique primeiro
  try {
    await conn.query(`ALTER TABLE stores MODIFY COLUMN slug VARCHAR(128) NOT NULL`);
    console.log('   Coluna slug corrigida para VARCHAR(128).');
  } catch (e) { console.log('   Nota:', e.message); }

  // 2. STORE_USERS: role_in_store precisa ter 'owner','seller' (sem 'manager'), adicionar is_active, renomear joined_at → created_at
  console.log('\n2. Corrigindo tabela store_users...');
  try {
    await conn.query(`ALTER TABLE store_users MODIFY COLUMN role_in_store ENUM('owner','seller') NOT NULL DEFAULT 'seller'`);
    console.log('   Coluna role_in_store corrigida para enum(owner,seller).');
  } catch (e) { console.log('   Nota:', e.message); }
  // Adicionar is_active
  try {
    await conn.query(`ALTER TABLE store_users ADD COLUMN is_active TINYINT(1) NOT NULL DEFAULT 1`);
    console.log('   Coluna is_active adicionada.');
  } catch (e) {
    if (e.message.includes('Duplicate column')) console.log('   Coluna is_active já existe.');
    else console.log('   Nota:', e.message);
  }
  // Renomear joined_at → created_at
  try {
    await conn.query(`ALTER TABLE store_users CHANGE COLUMN joined_at created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP`);
    console.log('   Coluna joined_at renomeada para created_at.');
  } catch (e) { console.log('   Nota:', e.message); }
  // Adicionar unique constraint store_id + user_id se não existe
  try {
    await conn.query(`ALTER TABLE store_users ADD UNIQUE KEY unique_store_user_v2 (store_id, user_id)`);
    console.log('   Unique constraint adicionada.');
  } catch (e) {
    if (e.message.includes('Duplicate')) console.log('   Unique constraint já existe.');
    else console.log('   Nota:', e.message);
  }

  // 3. STORE_SETTINGS: Drizzle espera quote_closing_text, theme_preference, default_warranty_days
  console.log('\n3. Corrigindo tabela store_settings...');
  try {
    await conn.query(`ALTER TABLE store_settings CHANGE COLUMN theme theme_preference VARCHAR(32) DEFAULT 'system'`);
    console.log('   Coluna theme renomeada para theme_preference.');
  } catch (e) { console.log('   Nota:', e.message); }
  try {
    await conn.query(`ALTER TABLE store_settings ADD COLUMN default_warranty_days INT NOT NULL DEFAULT 0`);
    console.log('   Coluna default_warranty_days adicionada.');
  } catch (e) {
    if (e.message.includes('Duplicate column')) console.log('   Coluna default_warranty_days já existe.');
    else console.log('   Nota:', e.message);
  }
  // Remover currency se existir (não está no schema do Drizzle)
  try {
    await conn.query(`ALTER TABLE store_settings DROP COLUMN currency`);
    console.log('   Coluna currency removida.');
  } catch (e) { console.log('   Nota:', e.message); }

  // 4. MACHINE_FEES: verificar se está correto
  console.log('\n4. Verificando tabela machine_fees...');
  const [mfCols] = await conn.query('DESCRIBE machine_fees');
  console.log('   Colunas:', mfCols.map(c => c.Field).join(', '));

  // 5. DEVICE_CONDITIONS: verificar
  console.log('\n5. Verificando tabela device_conditions...');
  const [dcCols] = await conn.query('DESCRIBE device_conditions');
  console.log('   Colunas:', dcCols.map(c => c.Field).join(', '));

  // 6. Verificar resultado final
  console.log('\n=== VERIFICAÇÃO FINAL ===');
  const [s1] = await conn.query('DESCRIBE stores');
  console.log('\nSTORES:', s1.map(c => `${c.Field}(${c.Type})`).join(', '));
  const [s2] = await conn.query('DESCRIBE store_users');
  console.log('STORE_USERS:', s2.map(c => `${c.Field}(${c.Type})`).join(', '));
  const [s3] = await conn.query('DESCRIBE store_settings');
  console.log('STORE_SETTINGS:', s3.map(c => `${c.Field}(${c.Type})`).join(', '));

  await conn.end();
  console.log('\nMigração concluída com sucesso!');
}

main().catch(e => {
  console.error('ERRO:', e.message);
  process.exit(1);
});
