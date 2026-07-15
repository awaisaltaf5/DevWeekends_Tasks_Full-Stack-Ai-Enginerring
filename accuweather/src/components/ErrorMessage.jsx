import { AlertCircle } from 'lucide-react';

function ErrorMessage({ message, onRetry }) {
  return (
    <div className="glass rounded-2xl p-6 text-center animate-fade-in">
      <AlertCircle className="w-12 h-12 text-rose-400 mx-auto mb-4" />
      <p className="text-white font-semibold mb-2">Oops!</p>
      <p className="text-slate-400 mb-4">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="bg-accent hover:bg-accent-hover text-black font-semibold py-2 px-6 rounded-full transition-all duration-200 hover:scale-105 active:scale-95"
        >
          Try Again
        </button>
      )}
    </div>
  );
}

export default ErrorMessage;