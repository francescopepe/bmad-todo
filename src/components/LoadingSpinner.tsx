export function LoadingSpinner() {
  return (
    <div className="flex justify-center py-12" role="status" aria-label="Loading tasks">
      <div className="h-8 w-8 border-4 border-border border-t-primary rounded-full animate-spin" />
    </div>
  );
}
