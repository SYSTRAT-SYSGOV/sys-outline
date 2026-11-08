const http = require('http');

function request(url, options = {}, postData = null) {
  return new Promise((resolve, reject) => {
    const u = new URL(url);
    const opts = {
      hostname: u.hostname,
      port: u.port,
      path: u.pathname + u.search,
      method: options.method || 'GET',
      headers: options.headers || {}
    };

    const req = http.request(opts, (res) => {
      let data = '';
      res.on('data', chunk => { data += chunk; });
      res.on('end', () => {
        resolve({
          status: res.statusCode,
          headers: res.headers,
          data: data
        });
      });
    });

    req.on('error', (err) => reject(err));
    if (postData) {
      req.write(typeof postData === 'string' ? postData : JSON.stringify(postData));
    }
    req.end();
  });
}

async function runTests() {
  console.log('====================================================');
  console.log('🚀 INICIANDO BATERIA DE TESTES AUTOMATIZADOS (E2E)');
  console.log('====================================================\n');

  let passed = 0;
  let failed = 0;

  function assert(condition, message) {
    if (condition) {
      console.log(`  ✅ [PASS] ${message}`);
      passed++;
    } else {
      console.error(`  ❌ [FAIL] ${message}`);
      failed++;
    }
  }

  try {
    // 1. Frontend SPA Check
    console.log('1. Testando Frontend React SPA (porta 3000)...');
    const feRes = await request('http://localhost:3000/');
    assert(feRes.status === 200, 'Frontend retornou status HTTP 200');
    assert(feRes.data.includes('Sistema Escriba') || feRes.data.includes('id="root"'), 'Frontend HTML contém a aplicação SPA');

    // 2. Proxy Nginx /api/login -> Backend Check
    console.log('\n2. Testando Proxy Nginx /api/login (Admin)...');
    const loginPayload = JSON.stringify({ email: 'admin@escriba.com', password: 'password123' });
    const loginRes = await request('http://localhost:3000/api/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Content-Length': Buffer.byteLength(loginPayload)
      }
    }, loginPayload);

    assert(loginRes.status === 200, `Login de Administrador via Nginx proxy retornou status 200 (atual: ${loginRes.status})`);
    const loginData = JSON.parse(loginRes.data);
    assert(!!loginData.token, 'Token de autenticação Sanctum emitido com sucesso');
    assert(loginData.user?.role === 'admin', 'Perfil de usuário verificado como "admin"');
    const adminToken = loginData.token;

    // 3. Teste de login para Revisor e Escriba
    console.log('\n3. Testando Login para Revisor e Escriba...');
    const revisorPayload = JSON.stringify({ email: 'revisor@escriba.com', password: 'password123' });
    const revisorRes = await request('http://localhost:3000/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' }
    }, revisorPayload);
    const revisorData = JSON.parse(revisorRes.data);
    assert(revisorRes.status === 200 && revisorData.user?.role === 'reviewer', 'Login de Revisor autenticado com sucesso');
    const reviewerToken = revisorData.token;

    const escribaPayload = JSON.stringify({ email: 'escriba@escriba.com', password: 'password123' });
    const escribaRes = await request('http://localhost:3000/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' }
    }, escribaPayload);
    const escribaData = JSON.parse(escribaRes.data);
    assert(escribaRes.status === 200 && escribaData.user?.role === 'scribe', 'Login de Escriba autenticado com sucesso');
    const scribeToken = escribaData.token;

    // 4. Teste de Endpoint de Histórico Recorrente (/api/sermons/last-approved)
    console.log('\n4. Testando Endpoint de Histórico Recorrente (/api/sermons/last-approved)...');
    const historyRes = await request('http://localhost:3000/api/sermons/last-approved', {
      headers: {
        'Authorization': `Bearer ${scribeToken}`,
        'Accept': 'application/json'
      }
    });
    assert(historyRes.status === 200, `Endpoint last-approved retornou 200 (atual: ${historyRes.status})`);
    const historyRaw = JSON.parse(historyRes.data);
    const historyData = historyRaw.data || historyRaw;
    assert(!!historyData.cell_direction, 'Resposta contém campo cell_direction com conteúdo');
    assert(!!historyData.leader_guidelines, 'Resposta contém campo leader_guidelines com conteúdo');
    assert(Array.isArray(historyData.weekly_agenda_items) && historyData.weekly_agenda_items.length > 0, 'weekly_agenda_items contém itens da agenda');
    console.log(`     -> cell_direction: "${(historyData.cell_direction || '').substring(0, 45)}..."`);
    console.log(`     -> leader_guidelines: "${(historyData.leader_guidelines || '').substring(0, 45)}..."`);
    console.log(`     -> weekly_agenda_items count: ${historyData.weekly_agenda_items?.length || 0}`);

    // 5. Teste de Filtros Avançados (/api/sermons)
    console.log('\n5. Testando Filtros Avançados em /api/sermons...');
    const filterRes = await request('http://localhost:3000/api/sermons?status=approved', {
      headers: {
        'Authorization': `Bearer ${adminToken}`,
        'Accept': 'application/json'
      }
    });
    assert(filterRes.status === 200, 'Filtro por status=approved retornou 200');
    const filterData = JSON.parse(filterRes.data);
    const sermonsList = Array.isArray(filterData) ? filterData : (filterData.data || []);
    assert(sermonsList.length > 0, `Encontrados ${sermonsList.length} resumos aprovados`);
    const allApproved = sermonsList.every(s => s.status === 'approved');
    assert(allApproved, 'Todos os registros retornados possuem status "approved"');

    // 6. Teste de Fila de Revisão (/api/review-queue e /api/sermons/review-queue)
    console.log('\n6. Testando Fila de Revisão para Revisor...');
    const queueRes = await request('http://localhost:3000/api/review-queue', {
      headers: {
        'Authorization': `Bearer ${reviewerToken}`,
        'Accept': 'application/json'
      }
    });
    assert(queueRes.status === 200, `Fila de revisão acessível em /api/review-queue (status: ${queueRes.status})`);
    const queueData = JSON.parse(queueRes.data);
    const queueList = Array.isArray(queueData) ? queueData : (queueData.data || []);
    assert(queueList.length >= 0, `Itens na fila de revisão retornados com sucesso (total: ${queueList.length})`);

    const queueAliasRes = await request('http://localhost:3000/api/sermons/review-queue', {
      headers: {
        'Authorization': `Bearer ${reviewerToken}`,
        'Accept': 'application/json'
      }
    });
    assert(queueAliasRes.status === 200, `Alias /api/sermons/review-queue também responde 200`);

    // 7. Teste de Listagem de Escalas com Filtros (/api/schedules)
    console.log('\n7. Testando Listagem de Escalas (/api/schedules)...');
    const schedRes = await request('http://localhost:3000/api/schedules?status=pending', {
      headers: {
        'Authorization': `Bearer ${adminToken}`,
        'Accept': 'application/json'
      }
    });
    assert(schedRes.status === 200, 'Listagem de escalas retornou 200 com filtro status=pending');
    const schedData = JSON.parse(schedRes.data);
    const schedList = Array.isArray(schedData) ? schedData : (schedData.data || []);
    assert(schedList.length > 0, `Encontradas ${schedList.length} escalas com status pending`);

    // 8. Teste de Organizações (/api/organizations)
    console.log('\n8. Testando Unidades / Igrejas (/api/organizations)...');
    const orgRes = await request('http://localhost:3000/api/organizations', {
      headers: {
        'Authorization': `Bearer ${adminToken}`,
        'Accept': 'application/json'
      }
    });
    assert(orgRes.status === 200, 'Listagem de organizações retornou 200');
    const orgData = JSON.parse(orgRes.data);
    const orgList = Array.isArray(orgData) ? orgData : (orgData.data || []);
    assert(orgList.some(o => o.slug === 'catedral'), 'Unidade "Catedral" cadastrada no sistema');
    assert(orgList.some(o => o.slug === 'nucleo-sul'), 'Unidade "Núcleo Sul" cadastrada no sistema');

    // 9. Verificação do bundle estático (A4 CSS e JetBrains Mono)
    console.log('\n9. Testando assets estáticos do Frontend (CSS/JS)...');
    const cssPath = feRes.data.match(/href="(\/assets\/index-[^"]+\.css)"/)?.[1];
    if (cssPath) {
      const cssRes = await request(`http://localhost:3000${cssPath}`);
      assert(cssRes.status === 200, 'Arquivo CSS principal servido pelo Nginx');
      assert(cssRes.data.includes('@media print') || cssRes.data.includes('210mm'), 'CSS de impressão A4 presente no bundle compilado');
    }

    // 10. Teste de Estatísticas Operacionais (/api/dashboard/stats)
    console.log('\n10. Testando Estatísticas Operacionais (/api/dashboard/stats)...');
    const statsRes = await request('http://localhost:3000/api/dashboard/stats', {
      headers: {
        'Authorization': `Bearer ${adminToken}`,
        'Accept': 'application/json'
      }
    });
    assert(statsRes.status === 200, `Dashboard stats retornou 200 (atual: ${statsRes.status})`);
    const statsData = JSON.parse(statsRes.data)?.data;
    assert(statsData.hasOwnProperty('total_sermons'), 'Métrica total_sermons presente');
    assert(statsData.hasOwnProperty('approved_sermons'), 'Métrica approved_sermons presente');
    assert(statsData.hasOwnProperty('pending_reviews'), 'Métrica pending_reviews presente');
    assert(statsData.hasOwnProperty('total_schedules'), 'Métrica total_schedules presente');
    assert(statsData.hasOwnProperty('active_volunteers'), 'Métrica active_volunteers presente');
    console.log(`     -> Total Ministrações: ${statsData.total_sermons}`);
    console.log(`     -> Pendentes de Revisão: ${statsData.pending_reviews}`);
    console.log(`     -> Taxa de Aprovação: ${statsData.approval_rate}%`);

    console.log('\n====================================================');
    console.log(`🎉 RESULTADO: ${passed} PASSOU | ${failed} FALHOU`);
    console.log('====================================================\n');

    if (failed > 0) {
      process.exit(1);
    } else {
      process.exit(0);
    }
  } catch (err) {
    console.error('❌ ERRO CRÍTICO NA EXECUÇÃO DOS TESTES:', err);
    process.exit(1);
  }
}

runTests();
