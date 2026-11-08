const http = require('http');

function post(path, body, token) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify(body);
    const req = http.request({
      hostname: 'localhost',
      port: 3000,
      path: path,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Content-Length': Buffer.byteLength(data),
        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
      }
    }, (res) => {
      let raw = '';
      res.on('data', chunk => raw += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, body: JSON.parse(raw) });
        } catch(e) {
          resolve({ status: res.statusCode, raw });
        }
      });
    });
    req.on('error', reject);
    req.write(data);
    req.end();
  });
}

function put(path, body, token) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify(body);
    const req = http.request({
      hostname: 'localhost',
      port: 3000,
      path: path,
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Content-Length': Buffer.byteLength(data),
        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
      }
    }, (res) => {
      let raw = '';
      res.on('data', chunk => raw += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, body: JSON.parse(raw) });
        } catch(e) {
          resolve({ status: res.statusCode, raw });
        }
      });
    });
    req.on('error', reject);
    req.write(data);
    req.end();
  });
}

async function run() {
  console.log('--- TESTANDO SALVAMENTO DE RASCUNHO (DRAFT) ---');

  // 1. Login como escriba
  const loginRes = await post('/api/login', {
    email: 'escriba@escriba.com',
    password: 'password123'
  });
  const token = loginRes.body.token || loginRes.body.access_token;
  console.log('Login escriba status:', loginRes.status, 'Token obtido:', !!token);

  // 2. Tentar salvar rascunho com campos em branco / formato frontend (exatamente o que deu erro antes)
  const draftPayloadFrontend = {
    status: 'draft',
    title_theme: '',
    preacher_title: 'pela',
    preacher_name: '',
    service_date: '2026-11-03',
    location: 'Casa de Israel - Catedral',
    cell_aim: '',
    leader_guidelines: '',
    scripture_reference: '',
    summary_text: '',
    questions: [{ question_text: '' }],
    agenda: [{ day_label: '', event_description: '' }],
    organization_id: 1,
  };

  const createRes = await post('/api/sermons', draftPayloadFrontend, token);
  console.log('Criar rascunho vazio/parcial status:', createRes.status);
  console.log('Mensagem:', createRes.body?.message);
  if (createRes.status !== 201) {
    console.error('ERRO:', JSON.stringify(createRes.body, null, 2));
    process.exit(1);
  }

  const createdId = createRes.body.data?.id;
  console.log('Rascunho criado com ID:', createdId);
  console.log('Propriedades retornadas (ambos os formatos):');
  console.log(' - theme:', createRes.body.data?.theme);
  console.log(' - title_theme:', createRes.body.data?.title_theme);
  console.log(' - minister_name:', createRes.body.data?.minister_name);
  console.log(' - preacher_name:', createRes.body.data?.preacher_name);

  // 3. Atualizar rascunho adicionando aos poucos
  const updatePayload = {
    ...draftPayloadFrontend,
    id: createdId,
    title_theme: 'Meu Novo Tema Em Andamento',
    preacher_name: 'Pastor João',
    summary_text: 'Começando a digitar o resumo da palavra...',
  };

  const updateRes = await put(`/api/sermons/${createdId}`, updatePayload, token);
  console.log('Atualizar rascunho status:', updateRes.status);
  console.log('Mensagem:', updateRes.body?.message);
  console.log('Tema atualizado:', updateRes.body.data?.theme);
  console.log('Title theme atualizado:', updateRes.body.data?.title_theme);

  if (updateRes.status !== 200) {
    console.error('ERRO UPDATE:', JSON.stringify(updateRes.body, null, 2));
    process.exit(1);
  }

  console.log('✅ TESTE DE RASCUNHO CONCLUÍDO COM 100% DE SUCESSO!');
}

run().catch(console.error);
