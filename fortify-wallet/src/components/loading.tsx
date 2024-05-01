export default function Loading() {
  return (
    <div className="relative w-full py-[1rem] flex justify-center">
      <p className="text-xs absolute top-1/2 transform -translate-y-1/2">
        loading...
      </p>
      <div className="animate-spin rounded-full h-24 w-24 border-4 border-transparent border-t-sky-500 border-r-sky-500"></div>
    </div>
  );
}
