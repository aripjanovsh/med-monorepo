type ProfileFieldProps = {
  label: string;
  value?: string | number | null;
};

export const ProfileField = ({ label, value }: ProfileFieldProps) => {
  const display =
    value === null || value === undefined || value === ""
      ? "-"
      : String(value);

  return (
    <div className="min-w-0">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="text-sm font-medium truncate">{display}</p>
    </div>
  );
};
