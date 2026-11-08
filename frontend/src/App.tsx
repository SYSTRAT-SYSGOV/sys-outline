import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Login } from './pages/Login';
import { AppLayout, TabKey } from './components/AppLayout';
import { SermonEditor } from './components/SermonEditor';
import { ReviewQueue } from './components/ReviewQueue';
import { DutyRoster, DutyScheduleItem } from './components/DutyRoster';
import { OrganizationsManager } from './components/OrganizationsManager';
import { SermonsLibrary } from './components/SermonsLibrary';
import { UsersManager } from './components/UsersManager';
import { PublicSermon } from './pages/PublicSermon';
import { A4PreviewModal } from './components/A4PreviewModal';
import { StatsOverview } from './components/StatsOverview';
import { ErrorBoundary } from './components/ErrorBoundary';
import { TooltipProvider, Toaster } from '@sysgov/ui';
import { SermonData } from './lib/sermonUtils';

function AppContent() {
  const { user, loading } = useAuth();
  const [currentTab, setCurrentTab] = useState<TabKey>('editor');
  const [editingSermon, setEditingSermon] = useState<SermonData | null>(null);
  const [publicSermonId, setPublicSermonId] = useState<number | null>(null);
  const [globalPreviewOpen, setGlobalPreviewOpen] = useState(false);

  // Verificação de acesso a link público da mensagem (?public=1 ou #/public/1)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const pubId = params.get('public');
    if (pubId && !isNaN(Number(pubId))) {
      setPublicSermonId(Number(pubId));
      return;
    }

    const hash = window.location.hash;
    const match = hash.match(/#\/public\/(\d+)/);
    if (match && match[1]) {
      setPublicSermonId(Number(match[1]));
    }
  }, []);

  // Se visualizando rota pública, não exige login
  if (publicSermonId) {
    return (
      <PublicSermon
        sermonId={publicSermonId}
        onBack={() => {
          setPublicSermonId(null);
          window.history.pushState({}, '', window.location.pathname);
        }}
      />
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center text-foreground text-sm font-sans font-bold">
        Carregando SYS-OUTLINE...
      </div>
    );
  }

  if (!user) {
    return <Login />;
  }

  const handleSelectScheduleForWriting = (sch: DutyScheduleItem) => {
    const newSermon: SermonData = {
      duty_schedule_id: sch.id,
      organization_id: sch.organization_id,
      scribe_id: sch.user_id,
      status: 'draft',
      title_theme: '',
      preacher_title: 'pela',
      preacher_name: '',
      service_date: sch.service_date,
      service_time: sch.shift === 'manha' ? '09:00' : '18:30',
      location: sch.organization?.name || 'Casa de Israel - Catedral',
      cell_aim: '',
      leader_guidelines: '',
      scripture_reference: '',
      summary_text: '',
      questions: [{ question_text: '' }],
      agenda: [{ day_label: '', event_description: '' }],
      organization: sch.organization as SermonData['organization'],
    };

    setEditingSermon(newSermon);
    setCurrentTab('editor');
  };

  return (
    <AppLayout
      currentTab={currentTab}
      onSelectTab={setCurrentTab}
      onOpenA4Preview={() => setGlobalPreviewOpen(true)}
      hasSermonToPreview={Boolean(editingSermon)}
    >
      {currentTab === 'editor' && (
        <SermonEditor
          initialSermon={editingSermon}
          onSaved={saved => setEditingSermon(saved)}
        />
      )}

      {currentTab === 'schedules' && (
        <div className="space-y-6">
          <StatsOverview onNavigateToTab={tab => setCurrentTab(tab as TabKey)} />
          <DutyRoster onSelectScheduleForWriting={handleSelectScheduleForWriting} />
        </div>
      )}

      {currentTab === 'review' && ['admin', 'unit_admin', 'reviewer'].includes(user.role) && (
        <div className="space-y-6">
          <StatsOverview onNavigateToTab={tab => setCurrentTab(tab as TabKey)} />
          <ReviewQueue />
        </div>
      )}

      {currentTab === 'sermons' && (
        <div className="space-y-6">
          <StatsOverview onNavigateToTab={tab => setCurrentTab(tab as TabKey)} />
          <SermonsLibrary
            onSelectForEdit={s => {
              setEditingSermon(s);
              setCurrentTab('editor');
            }}
          />
        </div>
      )}

      {currentTab === 'organizations' && ['admin', 'unit_admin'].includes(user.role) && (
        <OrganizationsManager />
      )}

      {currentTab === 'users' && ['admin', 'unit_admin'].includes(user.role) && (
        <UsersManager />
      )}

      {/* Modal Global de Pré-visualização A4 */}
      <A4PreviewModal
        isOpen={globalPreviewOpen}
        onClose={() => setGlobalPreviewOpen(false)}
        sermon={editingSermon}
      />
    </AppLayout>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <TooltipProvider>
        <AuthProvider>
          <AppContent />
          <Toaster richColors position="top-right" />
        </AuthProvider>
      </TooltipProvider>
    </ErrorBoundary>
  );
}
