import styles from "./LoadingFallback.module.css";

function LoadingFallback() {
  return (
    <div class={styles.splash} role="status" aria-live="polite">
      <div class={styles.loader} aria-hidden="true" />
    </div>
  );
}

export default LoadingFallback;
