import styles from './CommandCenter.module.css';
import HeaderBar from '../../organisms/HeaderBar/HeaderBar';
import Panel from '../../organisms/Panel/Panel';
import HeroContainer from '../../organisms/HeroContainer/HeroContainer';
import BottomBar from '../../organisms/BottomBar/BottomBar';
import KpiSimple from '../../molecules/KpiSimple/KpiSimple';
import KpiSpark from '../../molecules/KpiSpark/KpiSpark';
import KpiRing from '../../molecules/KpiRing/KpiRing';
import KpiMetric from '../../molecules/KpiMetric/KpiMetric';
import ChartBar from '../../molecules/ChartBar/ChartBar';
import DataTable from '../../molecules/DataTable/DataTable';
import EventFeed from '../../molecules/EventFeed/EventFeed';
import InsightCard from '../../molecules/InsightCard/InsightCard';
import { lazy, Suspense, useCallback, useMemo, memo } from 'react';
import { useData } from '../../../data/DataProvider';

const Globe = lazy(() => import('../../../heroes/Globe/Globe'));

const HERO_MAP = { globe: Globe };
const GLOBE_FALLBACK = <div style={{ position: 'absolute', inset: 0, background: '#0a0a0a' }} />;

const WIDGET_MAP = {
  'kpi-simple': KpiSimple,
  'kpi-spark': KpiSpark,
  'kpi-ring': KpiRing,
  'kpi-metric': KpiMetric,
  'chart-bar': ChartBar,
  'data-table': DataTable,
  'insight': InsightCard,
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

const Widget = memo(function Widget({ widgetConfig, data, table, insights }) {
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
  if (!source) return null;

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
  return config.header.kpis.map(key => {
    const src = data[key];
    if (!src) return null;
    return { label: src.label, value: src.value, format: FORMAT_MAP[key] };
  }).filter(Boolean);
}

const MONTH_LABELS = ['Nov', 'Dez', 'Jan', 'Fev', 'Mar', 'Abr', 'Mai'];
function getPipelineChart(data) {
  if (!data?.pipeline?.sparkline) return [];
  return data.pipeline.sparkline.map((v, i) => ({ value: v, label: MONTH_LABELS[i] || '' }));
}

export default function CommandCenter({ config }) {
  const { data, table, events, insights, streaming, startStream, stopStream } = useData();

  const headerKpis = useMemo(() => buildHeaderKpis(config, data), [config, data]);
  const pipelineChart = useMemo(() => getPipelineChart(data), [data]);
  const leftWidgets = useMemo(() => config?.panels?.left || [], [config]);
  const rightWidgets = useMemo(() => config?.panels?.right || [], [config]);
  const bottomConfig = config?.bottom;
  const heroComponent = useMemo(() => HERO_MAP[config?.hero], [config]);

  const handleToggleStream = useCallback(() => {
    streaming ? stopStream() : startStream();
  }, [streaming, startStream, stopStream]);

  return (
    <div className={styles.root}>
      <HeaderBar
        title={config?.title || 'COMMAND CENTER'}
        kpis={headerKpis}
        streaming={streaming}
        onToggleStream={handleToggleStream}
      />

      <div className={styles.body}>
        <Panel position="left">
          {leftWidgets.map((w, i) => (
            <Widget key={i} widgetConfig={w} data={data} table={table} insights={insights} />
          ))}
          <ChartBar label="PIPELINE MENSAL" data={pipelineChart} />
        </Panel>

        <Suspense fallback={GLOBE_FALLBACK}>
          <HeroContainer hero={heroComponent} />
        </Suspense>

        <Panel position="right">
          {rightWidgets.map((w, i) => (
            <Widget key={i} widgetConfig={w} data={data} table={table} insights={insights} />
          ))}
        </Panel>
      </div>

      <BottomBar>
        <div className={styles.bottomInner}>
          {bottomConfig && data && (
            <Widget widgetConfig={bottomConfig} data={data} table={table} insights={insights} />
          )}
          <EventFeed events={events} />
        </div>
      </BottomBar>
    </div>
  );
}
