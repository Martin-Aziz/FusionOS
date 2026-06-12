export default function Footer() {
  return (
    <footer className="border-t border-gray-200 bg-white mt-16">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-gray-500">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-gray-700">FusionOS</span>
          <span className="text-gray-300">·</span>
          <span>Alpha — compatibility-first Linux OS</span>
        </div>
        <div className="flex items-center gap-4">
          <span className="bg-amber-50 text-amber-700 text-xs px-2 py-0.5 rounded-full font-medium">
            macOS support is experimental — not an Alpha promise
          </span>
          <a
            href="https://github.com"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-gray-700 transition-colors"
          >
            MIT License
          </a>
        </div>
      </div>
    </footer>
  );
}
