import QuickAddTransaction from "@/components/forms/QuickAddTransaction";
import StatementUploader from "@/components/dashboard/StatementUploader";
import { TrendingUp } from "lucide-react";

export default function Home() {
  return (
    <main className="min-h-screen bg-slate-950 text-white p-4 md:p-8">
      {/* Header Area */}
      <div className="flex items-center gap-4 mb-8">
        <div className="p-3 bg-blue-600/20 rounded-full text-blue-500">
          <TrendingUp size={32} />
        </div>
        <h1 className="text-3xl font-bold tracking-tight">WealthFolio</h1>
      </div>

      {/* Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column (Main Content) - 2 columns on large screens */}
        <div className="lg:col-span-2 space-y-6">
          {/* Chart Placeholder */}
          <div className="w-full h-96 bg-slate-900 border border-slate-800 rounded-xl flex items-center justify-center text-slate-500">
            <p>Chart Placeholder</p>
          </div>

          {/* Statement Uploader Section */}
          <StatementUploader />
        </div>

        {/* Right Column (Sidebar) - 1 column on large screens */}
        <div className="space-y-6">
          <QuickAddTransaction />
        </div>
      </div>
    </main>
  );
}