import styles from './Value.module.css';

/**
 * Valor numérico. Existe para que a receita não seja reescrita em cada
 * molécula — antes eram quatro cópias byte-idênticas do mesmo bloco.
 *
 * `tabular` só quando os números empilham verticalmente (colunas). Em um
 * número grande e isolado, largura fixa por dígito deixa "121" frouxo.
 */
export default function Value({
  children,
  size = 'lg',
  color = 'primary',
  tabular = false,
  className = '',
  ...rest
}) {
  const cls = [
    styles.value,
    styles[size],
    styles[color],
    tabular ? styles.tabular : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <span className={cls} {...rest}>
      {children}
    </span>
  );
}
