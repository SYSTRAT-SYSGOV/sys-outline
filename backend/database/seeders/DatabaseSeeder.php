<?php

namespace Database\Seeders;

use App\Models\DutySchedule;
use App\Models\Organization;
use App\Models\ReviewAuditLog;
use App\Models\SermonSummary;
use App\Models\SharingQuestion;
use App\Models\User;
use App\Models\WeeklyAgendaItem;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // Se a base já foi populada, encerra para evitar duplicatas
        if (Organization::where('slug', 'catedral')->exists()) {
            return;
        }

        // 1. Organizações (Catedral e Núcleos)
        $catedral = Organization::create([
            'name' => 'Casa de Israel - Catedral',
            'slug' => 'catedral',
            'type' => 'catedral',
            'address' => 'Av. Principal, 1000 - Centro',
            'city' => 'São Paulo',
            'state' => 'SP',
            'pix_key' => 'cigenerosidade@gmail.com',
            'active' => true,
        ]);

        $nucleoSul = Organization::create([
            'name' => 'Casa de Israel - Núcleo Sul',
            'slug' => 'nucleo-sul',
            'type' => 'nucleo',
            'address' => 'Rua Sul, 250 - Bairro Sul',
            'city' => 'São Paulo',
            'state' => 'SP',
            'pix_key' => 'pix.sul@casadeisrael.com.br',
            'active' => true,
        ]);

        $nucleoNorte = Organization::create([
            'name' => 'Casa de Israel - Núcleo Norte',
            'slug' => 'nucleo-norte',
            'type' => 'nucleo',
            'address' => 'Av. Norte, 500 - Santana',
            'city' => 'São Paulo',
            'state' => 'SP',
            'pix_key' => 'pix.norte@casadeisrael.com.br',
            'active' => true,
        ]);

        // 2. Usuários nos três perfis
        $admin = User::create([
            'organization_id' => null,
            'name' => 'Administrador Geral',
            'email' => 'admin@escriba.com',
            'password' => Hash::make('password123'),
            'role' => 'admin',
            'phone' => '(11) 99999-0001',
            'active' => true,
        ]);

        $revisorCatedral = User::create([
            'organization_id' => $catedral->id,
            'name' => 'Revisor Voluntário Catedral',
            'email' => 'revisor@escriba.com',
            'password' => Hash::make('password123'),
            'role' => 'reviewer',
            'phone' => '(11) 99999-0002',
            'active' => true,
        ]);

        $escribaCatedral = User::create([
            'organization_id' => $catedral->id,
            'name' => 'Escriba Voluntário Catedral',
            'email' => 'escriba@escriba.com',
            'password' => Hash::make('password123'),
            'role' => 'scribe',
            'phone' => '(11) 99999-0003',
            'active' => true,
        ]);

        $escribaNucleo = User::create([
            'organization_id' => $nucleoSul->id,
            'name' => 'Escriba Núcleo Sul',
            'email' => 'escriba.nucleo@escriba.com',
            'password' => Hash::make('password123'),
            'role' => 'scribe',
            'phone' => '(11) 99999-0004',
            'active' => true,
        ]);

        // 3. Escala Dominical de Exemplo
        $schedule = DutySchedule::create([
            'organization_id' => $catedral->id,
            'scribe_user_id' => $escribaCatedral->id,
            'service_date' => '2026-10-18',
            'service_time' => '19:00:00',
            'deadline_at' => '2026-10-20 12:00:00',
            'status' => 'completed',
            'notes' => 'Escala dominical do culto da família.',
        ]);

        // 4. Resumo de Pregação de Exemplo (Aprovado)
        $summaryText = "A ministração da Pastora Kelli trata da transição do povo de Israel. Após a morte de Moisés, Deus ordena a Josué: **\"Passa este Jordão\"** (Js 1:2). O rio é a fronteira entre sair do Egito e possuir a terra prometida. Chegamos até aqui pela graça e pela presença de Deus, e não por recursos ou méritos próprios.\n\n" .
            "**1. A Barreira da Mentalidade:** A pastora destaca que muitos saíram do Egito (o lugar da escravidão), mas o Egito ainda não saiu deles. Ela define o Jordão não apenas como um rio geográfico, mas como uma barreira mental e espiritual. Atravessar o Jordão exige **\"desmontar\"** a mentalidade de escravo - a pessoa que murmura, que tem saudades do passado de dor e que se sente inferior diante dos gigantes. A vitória começa na mente: é preciso saber quem você é em Deus para saber para onde você está indo.\n\n" .
            "**2. Coragem como Decisão:** Josué teve medo de assumir o legado de Moisés, e Deus repetiu: **\"Sê forte e corajoso\"** (Js 1:6-9), pois o Senhor está conosco por onde andarmos. Coragem é decisão, não sentimento: a emoção engana, e vivemos pelo que Deus disse. Quem fica paralisado no choro e na vitimização não avança, porque Deus se move pela Sua Palavra.\n\n" .
            "**3. A Presenção de Deus e o Jordão de Cada Um:** Em um momento profundo, a ministração identifica que o \"Jordão\" de muitos hoje são as águas amargas da falta de perdão, do orgulho, do ressentimento entre casais e do distanciamento entre pais e filhos. Essas **\"águas\"** impedem a família de entrar na Terra Prometida. Atravessar o Jordão significa posicionar-se, renunciar ao orgulho e pedir perdão, entendendo que a obediência gera consequências para as próximas gerações.\n\n" .
            "**4. A Dinâmica do Milagre:** O milagre da abertura das águas só aconteceu quando os sacerdotes colocaram os pés no rio. A lição é clara: Deus não abre o caminho para quem fica parado na margem chorando. O milagre exige o **\"passo de fé\"** em meio à incerteza. A estação da espera acabou; agora é tempo de avançar sob a luz da Palavra, permitindo que o Espírito Santo faça uma **\"faxina\"** no coração para que a vida espiritual flua como água viva.\n\n" .
            "**5. Mudança de Estação:** Em Eclesiastes 3:1, há tempo determinado para tudo. A transição é um processo que exige paciência e perseverança. Israel chorou 30 dias por Moisés e precisou se levantar. Quem plantou em choro voltará com alegria (Sl 126:5). Esquecendo o que ficou para trás (Fp 3:13), a igreja é chamada a ver a **\"coisa nova\"** que Deus faz (Is 43:19).\n\n" .
            "**Conclusão:** A palavra encerra-se com uma poderosa ativação de identidade. Atravessar o Jordão significa tomar posse daquilo que já foi prometido. A igreja é desafiada a declarar que a estação da seca terminou e que o tempo da colheita e da posse sobre as famílias e finanças chegou. Egito e mentalidade de escravo, nunca mais.";

        $summary = SermonSummary::create([
            'duty_schedule_id' => $schedule->id,
            'organization_id' => $catedral->id,
            'scribe_user_id' => $escribaCatedral->id,
            'reviewer_user_id' => $revisorCatedral->id,
            'status' => 'approved',
            'theme' => 'Seja forte e corajoso: atravessando o Jordão rumo à terra prometida',
            'minister_title' => 'pela',
            'minister_name' => 'Pastora Kelli Mendes',
            'service_date' => '2026-10-18',
            'location_name' => 'Casa de Israel - Catedral',
            'cell_direction' => "Quebra gelo / Oração pela liderança / Louvor / Oferta / Kilo do Amor / Palavra / Avisos / DNA.",
            'leader_guidelines' => "As ofertas das células são direcionadas para o projeto visão do futuro. Participe e divulgue nas células sobre a carteira de generosidade (cigenerosidade@gmail.com). As ofertas feitas pelo QrCode Pix devem ser contabilizadas em anexo no envelope e no relatório das células.",
            'scripture_text' => 'Josué 1:1-9',
            'summary_text' => $summaryText,
            'approved_at' => '2026-10-19 14:00:00',
        ]);

        // Perguntas de compartilhamento
        $perguntas = [
            'Qual é o meu "Jordão" hoje (mágua, falta de perdão, medo, vergonha, incredulidade)? Que passo concreto de coragem e obediência posso dar esta semana para atravessá-lo, confiando que Deus vai à frente (Js 1:9)?',
            'Há algo do "Egito" (mentalidade de escravo, murmuração, vontade de voltar atrás) que ainda me prende? Oremos uns pelos outros, declarando a Palavra sobre a casa e a família, e aguardemos com paciência a estação de Deus.',
            'Como posso apoiar alguém da célula que está "paralisado no choro" e precisa de encorajamento para seguir adiante?',
        ];

        foreach ($perguntas as $idx => $p) {
            SharingQuestion::create([
                'sermon_summary_id' => $summary->id,
                'order_index' => $idx + 1,
                'question_text' => $p,
            ]);
        }

        // Agenda semanal de avisos
        $avisos = [
            ['dia' => 'Terça (20h):', 'aviso' => 'Terça Do Avivamento - "Fé Sobrenatural"'],
            ['dia' => 'Quarta (20h):', 'aviso' => 'Culto De Ensino Bíblico'],
            ['dia' => 'Quinta e Sexta:', 'aviso' => 'Células nos Lares'],
            ['dia' => 'Domingo (18h):', 'aviso' => 'Culto da Família e Celebração da Palavra'],
        ];

        foreach ($avisos as $idx => $av) {
            WeeklyAgendaItem::create([
                'sermon_summary_id' => $summary->id,
                'order_index' => $idx + 1,
                'day_time_text' => $av['dia'],
                'description_text' => $av['aviso'],
            ]);
        }

        ReviewAuditLog::create([
            'sermon_summary_id' => $summary->id,
            'user_id' => $escribaCatedral->id,
            'action' => 'submitted',
            'feedback_notes' => 'Resumo submetido no prazo.',
            'created_at' => '2026-10-19 09:30:00',
        ]);

        ReviewAuditLog::create([
            'sermon_summary_id' => $summary->id,
            'user_id' => $revisorCatedral->id,
            'action' => 'approved',
            'feedback_notes' => 'Ortografia e coerência conferidas. Aprovado para as células.',
            'created_at' => '2026-10-19 14:00:00',
        ]);

        // 5. Escala Futura Ativa (Pending)
        DutySchedule::create([
            'organization_id' => $catedral->id,
            'scribe_user_id' => $escribaCatedral->id,
            'service_date' => \Carbon\Carbon::now()->addDays(12)->format('Y-m-d'),
            'service_time' => '19:00:00',
            'deadline_at' => \Carbon\Carbon::now()->addDays(14)->format('Y-m-d H:i:s'),
            'status' => 'pending',
            'notes' => 'Escala do próximo domingo à noite.',
        ]);

        // 6. Resumo Submetido para Fila de Revisão (Catedral)
        $schedSubmitted = DutySchedule::create([
            'organization_id' => $catedral->id,
            'scribe_user_id' => $escribaCatedral->id,
            'service_date' => '2026-10-18',
            'service_time' => '10:00:00',
            'deadline_at' => '2026-10-20 12:00:00',
            'status' => 'completed',
            'notes' => 'Culto matutino da Catedral.',
        ]);

        $summarySubmitted = SermonSummary::create([
            'duty_schedule_id' => $schedSubmitted->id,
            'organization_id' => $catedral->id,
            'scribe_user_id' => $escribaCatedral->id,
            'status' => 'submitted',
            'theme' => 'Edificando sobre a Rocha',
            'minister_title' => 'pelo',
            'minister_name' => 'Pastor Marcos',
            'service_date' => '2026-10-18',
            'location_name' => 'Casa de Israel - Catedral',
            'cell_direction' => 'Louvor / Testemunhos / Estudo / Oração mútua.',
            'leader_guidelines' => 'Reforçar o compromisso com os discípulos nas células.',
            'scripture_text' => 'Mateus 7:24-27',
            'summary_text' => 'Todo aquele que ouve estas minhas palavras e as pratica será comparado a um homem prudente que edificou a sua casa sobre a rocha. As tempestades virão sobre todos, mas a estrutura que resiste é aquela alicerçada na obediência.',
        ]);

        ReviewAuditLog::create([
            'sermon_summary_id' => $summarySubmitted->id,
            'user_id' => $escribaCatedral->id,
            'action' => 'submitted',
            'feedback_notes' => 'Submetido para revisão da Catedral.',
            'created_at' => '2026-10-19 11:00:00',
        ]);
    }
}
