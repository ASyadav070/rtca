export default function Loading() {
  return (
    <div className="min-h-screen bg-yellow-50 p-6 flex flex-col items-center justify-center font-mono">
      <div className="p-8 bg-white border-8 border-black shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] animate-bounce">
        <h1 className="text-4xl font-black uppercase tracking-tighter text-black">
          Loading the Void...
        </h1>
      </div>
    </div>
  );
}
