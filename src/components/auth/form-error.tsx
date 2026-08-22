interface FormErrorProps {
  message: string | null;
}

export function FormError({ message }: FormErrorProps) {
  if (!message) {
    return null;
  }
  return (
    <p
      className="flex items-start gap-2 rounded-xl border border-rose/35 bg-rose/15 px-3 py-2.5 text-sm text-rose"
      role="alert"
    >
      {message}
    </p>
  );
}
