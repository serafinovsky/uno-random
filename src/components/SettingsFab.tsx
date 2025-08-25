import type { JSX } from "solid-js";
import styles from "./SettingsFab.module.css";

interface SettingsFabProps {
  isOpen: boolean;
  onToggle: () => void;
  label?: string;
}

export default function SettingsFab(props: SettingsFabProps): JSX.Element {
  const label = () => props.label ?? "Settings";

  return (
    <button
      class={`${styles.fab} ${styles.bottomRight}`}
      classList={{ [styles.open]: props.isOpen }}
      aria-label={props.isOpen ? "Hide settings" : "Open settings"}
      aria-expanded={props.isOpen}
      onClick={props.onToggle}
    >
      <span class={styles.label}>{label()}</span>
      <span class={styles.arrow} aria-hidden="true">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <polyline points="6 15 12 9 18 15" />
        </svg>
      </span>
    </button>
  );
}
