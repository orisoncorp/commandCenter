import styles from './Label.module.css';

export default function Label({ children, color = 'secondary', as: Tag = 'span', ...rest }) {
  return (
    <Tag className={`${styles.label} ${styles[color] || ''}`} {...rest}>
      {children}
    </Tag>
  );
}
