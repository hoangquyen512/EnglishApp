interface FormErrorProps {
  message: string | null;
}

export function FormError({ message }: FormErrorProps) {
  if (!message) {
    return null;
  }
  return (
    <p className="flex items-start gap-2 rounded-xl bg-rose-50 px-3 py-2.5 text-sm text-rose-700" role="alert">
      {message}
    </p>
  );
}
