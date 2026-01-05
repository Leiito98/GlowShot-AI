"use client";

import { useEffect } from "react";

type ToastProps = {
  message: string;
  onClose: () => void;
};

export function Toast({ message, onClose }: ToastProps) {
  useEffect(() => {
    const t = setTimeout(onClose, 3000);
    return () => clearTimeout(t);
  }, [onClose]);

  return (
    <div className="fixed top-6 right-6 z-50">
      <div className="bg-white shadow-xl border border-orange-300 rounded-2xl px-5 py-3">
        <p className="text-sm font-semibold text-gray-700">
          {message}
        </p>
      </div>
    </div>
  );
}
