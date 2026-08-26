export type ToastType = "success" | "error" | "info" | "warning";

export interface ToastMessage {
  id: string;
  type: ToastType;
  title: string;
  description?: string;
  duration?: number;
}

type ToastListener = (toast: ToastMessage) => void;

class ToastManager {
  private listeners: ToastListener[] = [];

  subscribe(listener: ToastListener) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  show(type: ToastType, title: string, description?: string, duration: number = 4000) {
    const toast: ToastMessage = {
      id: `toast-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      type,
      title,
      description,
      duration,
    };
    this.listeners.forEach((listener) => listener(toast));
  }

  success(title: string, description?: string, duration?: number) {
    this.show("success", title, description, duration);
  }

  error(title: string, description?: string, duration?: number) {
    this.show("error", title, description, duration);
  }

  info(title: string, description?: string, duration?: number) {
    this.show("info", title, description, duration);
  }

  warning(title: string, description?: string, duration?: number) {
    this.show("warning", title, description, duration);
  }
}

export const toast = new ToastManager();
