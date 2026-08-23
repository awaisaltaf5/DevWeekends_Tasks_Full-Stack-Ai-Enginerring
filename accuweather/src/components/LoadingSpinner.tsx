function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center min-h-[200px]">
      <div className="w-12 h-12 border-4 border-accent/30 border-t-accent rounded-full animate-spin" />
    </div>
  );
}

export default LoadingSpinner;