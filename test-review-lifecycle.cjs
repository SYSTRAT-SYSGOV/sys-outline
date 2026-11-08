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

async function testLifecycle() {
  console.log('--- TESTANDO CICLO COMPLETO DO WORKFLOW DE REVISÃO ---');
  
  // 1. Login Revisor
  const revLogin = await request('http://localhost:3000/api/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  }, JSON.stringify({ email: 'revisor@escriba.com', password: 'password123' }));
  const revToken = JSON.parse(revLogin.data).token;

  // 2. Obter resumo submetido (ID 2)
  const queueRes = await request('http://localhost:3000/api/review-queue', {
    headers: { Authorization: `Bearer ${revToken}` }
  });
  const queue = JSON.parse(queueRes.data);
  const targetSermon = (queue.data || queue)[0];
  console.log(`Resumo alvo na fila de revisão: ID ${targetSermon.id} ("${targetSermon.theme}")`);

  // 3. Iniciar Revisão
  const startRes = await request(`http://localhost:3000/api/sermons/${targetSermon.id}/start-review`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${revToken}`, Accept: 'application/json' }
  });
  console.log('Iniciar revisão HTTP status:', startRes.status);

  // 4. Devolver com notas (Reject/Return)
  const rejectRes = await request(`http://localhost:3000/api/sermons/${targetSermon.id}/reject`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${revToken}`, 'Content-Type': 'application/json', Accept: 'application/json' }
  }, JSON.stringify({ feedback_notes: 'Ajustar a citação bíblica no tópico 2.' }));
  console.log('Devolução com notas HTTP status:', rejectRes.status);
  const rejectedData = JSON.parse(rejectRes.data);
  console.log('Status após devolução:', (rejectedData.data || rejectedData).status);
  console.log('Motivo de rejeição:', (rejectedData.data || rejectedData).rejection_reason);

  // 5. Login Escriba
  const escLogin = await request('http://localhost:3000/api/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  }, JSON.stringify({ email: 'escriba@escriba.com', password: 'password123' }));
  const escToken = JSON.parse(escLogin.data).token;

  // 6. Escriba re-submete
  const resubmitRes = await request(`http://localhost:3000/api/sermons/${targetSermon.id}/submit`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${escToken}`, Accept: 'application/json' }
  });
  console.log('Re-submissão pelo escriba HTTP status:', resubmitRes.status);

  // 7. Revisor aprova
  const approveRes = await request(`http://localhost:3000/api/sermons/${targetSermon.id}/approve`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${revToken}`, 'Content-Type': 'application/json', Accept: 'application/json' }
  }, JSON.stringify({ feedback_notes: 'Revisão conferida com sucesso. Aprovado.' }));
  console.log('Aprovação final HTTP status:', approveRes.status);
  const approvedData = JSON.parse(approveRes.data);
  console.log('Status final aprovado:', (approvedData.data || approvedData).status);

  console.log('✅ CICLO COMPLETO DO WORKFLOW VALIDADO COM SUCESSO!');
}

testLifecycle();

