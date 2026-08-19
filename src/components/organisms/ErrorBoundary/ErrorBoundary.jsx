import { Component } from 'react';
import styles from './ErrorBoundary.module.css';

/**
 * Contenção de falha.
 *
 * Os quatro heroes são React.lazy sob <Suspense> e não havia nenhum error
 * boundary em todo o src/. Um chunk que não carrega — deploy no meio da
 * sessão, rede instável, contexto WebGL perdido — derrubava a aplicação
 * inteira para uma tela branca.
 *
 * O escopo importa: isolando o hero, os números continuam legíveis mesmo
 * quando a camada 3D falha. Um painel de monitoramento que perde o gráfico
 * mas mantém o dado ainda cumpre a função.
 */
export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error, info) {
    console.error('[command-center] falha contida:', error, info?.componentStack);
  }

  handleRetry = () => {
    this.setState({ error: null });
    this.props.onRetry?.();
  };

  render() {
    if (!this.state.error) return this.props.children;

    return (
      <div className={styles.fallback} role="alert">
        <p className={styles.title}>{this.props.title || 'Visualização indisponível'}</p>
        <p className={styles.detail}>
          {this.props.detail || 'Não foi possível carregar esta camada. Os dados seguem atualizando.'}
        </p>
        <button type="button" className={styles.retry} onClick={this.handleRetry}>
          Tentar novamente
        </button>
      </div>
    );
  }
}
