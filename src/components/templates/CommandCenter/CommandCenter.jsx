import styles from './CommandCenter.module.css';
import HeaderBar from '../../organisms/HeaderBar/HeaderBar';
import Panel from '../../organisms/Panel/Panel';
import HeroContainer from '../../organisms/HeroContainer/HeroContainer';
import BottomBar from '../../organisms/BottomBar/BottomBar';
import ErrorBoundary from '../../organisms/ErrorBoundary/ErrorBoundary';
import KpiSimple from '../../molecules/KpiSimple/KpiSimple';
import KpiSpark from '../../molecules/KpiSpark/KpiSpark';
import KpiRing from '../../molecules/KpiRing/KpiRing';
import KpiMetric from '../../molecules/KpiMetric/KpiMetric';
import ChartBar from '../../molecules/ChartBar/ChartBar';
import DataTable from '../../molecules/DataTable/DataTable';
import EventFeed from '../../molecules/EventFeed/EventFeed';
import InsightCard from '../../molecules/InsightCard/InsightCard';
import HeroToggle from '../../organisms/HeroToggle/HeroToggle';
import { KpiSkeleton, HeroSkeleton } from '../../molecules/Skeleton/Skeleton';
import { Suspense, useCallback, useMemo, memo, useState, useTransition } from 'react';
import { useData } from '../../../data/contexts';
import { HERO_MAP, HERO_KEYS } from '../../../heroes/registry';

const WIDGET_MAP = {
  'kpi-simple': KpiSimple,
  'kpi-spark': KpiSpark,
  'kpi-ring': KpiRing,
  'kpi-metric': KpiMetric,
  'chart-bar': ChartBar,
  'data-table': DataTable,
  insight: InsightCard,
};

const FORMAT_MAP = {
  mrr: 'currency',
  pipeline: 'currency',
  ticket: 'currency',
  conversao: 'percent',
  churn: 'percent',
  contratos: 'number',
  meta: 'number',
  nps: 'number',
};

const Widget = memo(function Widget({ widgetConfig, data, table, insights, loading }) {
  const Component = WIDGET_MAP[widgetConfig.type];
  if (!Component) return null;

  if (widgetConfig.type === 'data-table') {
    return <Component data={table} columns={widgetConfig.columns || []} />;
  }

  if (widgetConfig.type === 'insight') {
    const item = insights?.[widgetConfig.index ?? 0];
    if (!item) return null;
    return <Component {...item} />;
  }

  const source = data?.[widgetConfig.source];
  // Enquanto o dado não chegou, ocupa o espaço em vez de sumir.
  if (!source) return loading ? <KpiSkeleton /> : null;

  return (
    <Component
      label={widgetConfig.label || source.label}
      value={source.value}
      delta={source.delta}
      compare={source.compare}
      target={source.target}
      sparkline={source.sparkline}
      format={FORMAT_MAP[widgetConfig.source] || 'number'}
    />
  );
});

function buildHeaderKpis(config, data) {
  if (!config?.header?.kpis || !data) return [];
  return config.header.kpis
    .map(key => {
      const src = data[key];
      if (!src) return null;
      return { label: src.label, value: src.value, format: FORMAT_MAP[key] };
    })
    .filter(Boolean);
}

const MONTH_LABELS = ['Nov', 'Dez', 'Jan', 'Fev', 'Mar', 'Abr', 'Mai'];
function getPipelineChart(data) {
  if (!data?.pipeline?.sparkline) return [];
  return data.pipeline.sparkline.map((v, i) => ({ value: v, label: MONTH_LABELS[i] || '' }));
}

export default function CommandCenter({ config }) {
  const { data, table, events, insights, streaming, startStream, stopStream } = useData();
  const [activeHero, setActiveHero] = useState(config?.hero || 'globe');
  const [heroEpoch, setHeroEpoch] = useState(0);
  const [isPending, startTransition] = useTransition();

  const loading = data == null;

  const headerKpis = useMemo(() => buildHeaderKpis(config, data), [config, data]);
  const pipelineChart = useMemo(() => getPipelineChart(data), [data]);
  const leftWidgets = useMemo(() => config?.panels?.left || [], [config]);
  const rightWidgets = useMemo(() => config?.panels?.right || [], [config]);
  const bottomConfig = config?.bottom;
  const heroComponent = useMemo(() => HERO_MAP[activeHero] || HERO_MAP.globe, [activeHero]);

  const handleToggleStream = useCallback(() => {
    if (streaming) stopStream();
    else startStream();
  }, [streaming, startStream, stopStream]);

  // startTransition mantém o hero anterior na tela enquanto o próximo chunk
  // carrega, em vez de piscar um retângulo preto.
  const handleHeroChange = useCallback(key => {
    startTransition(() => setActiveHero(key));
  }, []);

  // Remonta o boundary após um retry, para que o chunk seja pedido de novo.
  const handleHeroRetry = useCallback(() => setHeroEpoch(n => n + 1), []);

  return (
    <div className={styles.root}>
      <HeaderBar
        title={config?.title || 'Command Center'}
        kpis={headerKpis}
        streaming={streaming}
        onToggleStream={handleToggleStream}
      >
        <HeroToggle
          heroes={HERO_KEYS}
          active={activeHero}
          onChange={handleHeroChange}
          disabled={isPending}
        />
      </HeaderBar>

      <div className={styles.body}>
        <Panel position="left" label="Indicadores primários">
          {leftWidgets.map(w => (
            <Widget
              key={`${w.type}-${w.source ?? w.index ?? ''}`}
              widgetConfig={w}
              data={data}
              table={table}
              insights={insights}
              loading={loading}
            />
          ))}
          <ChartBar label="Pipeline mensal" data={pipelineChart} format="currency" />
        </Panel>

        {/* O hero é o conteúdo principal — antes era um div sem landmark. */}
        <main className={styles.main}>
          <ErrorBoundary
            key={heroEpoch}
            title="Visualização indisponível"
            detail="Não foi possível carregar esta camada 3D. Os indicadores seguem atualizando."
            onRetry={handleHeroRetry}
          >
            <Suspense fallback={<HeroSkeleton />}>
              <HeroContainer hero={heroComponent} />
            </Suspense>
          </ErrorBoundary>
        </main>

        <Panel position="right" label="Indicadores secundários">
          {rightWidgets.map(w => (
            <Widget
              key={`${w.type}-${w.source ?? w.index ?? ''}`}
              widgetConfig={w}
              data={data}
              table={table}
              insights={insights}
              loading={loading}
            />
          ))}
        </Panel>
      </div>

      <BottomBar>
        {/* Classes explícitas por slot. Antes eram :first-child/:nth-child(2)/
            :last-child contra três slots renderizados condicionalmente — se a
            tabela esvaziasse, o feed casava com dois seletores ao mesmo tempo
            e o rodapé inteiro reflowava errado. */}
        <div className={styles.bottomInner}>
          <div className={styles.slotInsight}>
            {insights?.[0] && <InsightCard {...insights[0]} variant="bottom" />}
          </div>
          <div className={styles.slotTable}>
            {bottomConfig && (
              <Widget
                widgetConfig={bottomConfig}
                data={data}
                table={table}
                insights={insights}
                loading={loading}
              />
            )}
          </div>
          <div className={styles.slotFeed}>
            <EventFeed events={events} />
          </div>
        </div>
      </BottomBar>
    </div>
  );
}
