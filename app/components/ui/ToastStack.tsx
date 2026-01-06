"use client";

export type ToastType = "warning" | "info" | "success" | "error";

export type ToastMessage = {
  id: number;
  type: ToastType;
  message: string;
};

type ToastStackProps = {
  toasts: ToastMessage[];
  onClose: (id: number) => void;
};

function getToastStyles(type: ToastType) {
  switch (type) {
    case "success":
      return {
        container: "bg-emerald-50 border-emerald-300",
        iconBg: "bg-emerald-100",
        icon: "✔",
        text: "text-emerald-900",
      };
    case "info":
      return {
        container: "bg-blue-50 border-blue-300",
        iconBg: "bg-blue-100",
        icon: "ℹ",
        text: "text-blue-900",
      };
    case "error":
      return {
        container: "bg-red-50 border-red-300",
        iconBg: "bg-red-100",
        icon: "✖",
        text: "text-red-900",
      };
    case "warning":
    default:
      return {
        container: "bg-orange-50 border-orange-300",
        iconBg: "bg-orange-100",
        icon: "⚠",
        text: "text-orange-900",
      };
  }
}

export function ToastStack({ toasts, onClose }: ToastStackProps) {
  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-6 right-6 z-50 flex flex-col gap-2">
      {toasts.map((t) => {
        const styles = getToastStyles(t.type);

        return (
          <div
            key={t.id}
            className={`flex items-start gap-3 px-4 py-3 rounded-2xl border shadow-lg ${styles.container}`}
          >
            <div
              className={`flex items-center justify-center w-8 h-8 rounded-full text-sm ${styles.iconBg} ${styles.text}`}
            >
              {styles.icon}
            </div>
            <div className="flex-1">
              <p className={`text-xs font-medium ${styles.text}`}>
                {t.message}
              </p>
            </div>
            <button
              onClick={() => onClose(t.id)}
              className="text-xs text-gray-400 hover:text-gray-600"
            >
              ✕
            </button>
          </div>
        );
      })}
    </div>
  );
}
