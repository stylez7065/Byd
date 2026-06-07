import React from "react";
import { Car } from "../../data/cars";
import { CarImage } from "../ui/CarImage";
import { X, Sparkles, Scale, AlertCircle } from "lucide-react";

interface CarComparisonSidebarProps {
  comparedCars: Car[];
  onRemoveCar: (car: Car) => void;
  onClearAll: () => void;
  onClose: () => void;
  onInvestTrigger: (car: Car) => void;
}

export const CarComparisonSidebar: React.FC<CarComparisonSidebarProps> = ({
  comparedCars,
  onRemoveCar,
  onClearAll,
  onClose,
  onInvestTrigger
}) => {
  if (comparedCars.length === 0) return null;

  return (
    <div className="fixed inset-y-0 right-0 z-50 w-full sm:max-w-xl md:max-w-3xl bg-[#1A1A1A] border-l border-white/10 shadow-[0_0_50px_rgba(0,0,0,0.8)] backdrop-blur-2xl flex flex-col justify-between overflow-hidden">
      {/* Header */}
      <div className="p-6 bg-[#111] border-b border-white/5 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <Scale className="text-cyan-400 w-5 h-5 animate-pulse" />
          <h3 className="text-lg font-medium text-white font-sans tracking-tight">BYD Fleet Spec Comparison</h3>
        </div>
        <div className="flex items-center gap-4">
          <button
            onClick={onClearAll}
            className="text-xs font-mono uppercase tracking-wider text-white/40 hover:text-white hover:underline transition-all"
          >
            Clear All
          </button>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-white/5 text-white/60 hover:text-white transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Comparison Grid content */}
      <div className="flex-1 p-6 overflow-y-auto space-y-6">
        {comparedCars.length < 2 && (
          <div className="flex items-center gap-2.5 p-4 rounded-xl bg-cyan-500/5 border border-cyan-400/20 text-cyan-200 text-xs">
            <AlertCircle className="w-4 h-4 text-cyan-400 shrink-0" />
            <span>Select at least 2 models below for structural comparison matrix. ({comparedCars.length}/3 selected)</span>
          </div>
        )}

        <div className="grid grid-cols-3 gap-4">
          {comparedCars.map((car) => (
            <div key={car.id} className="relative bg-[#222]/50 border border-white/5 rounded-2xl p-4 flex flex-col justify-between space-y-4">
              {/* Image & Title card */}
              <div className="space-y-2 relative">
                <button
                  type="button"
                  onClick={() => onRemoveCar(car)}
                  className="absolute -top-1.5 -right-1.5 p-1 bg-red-500/15 border border-red-500/30 text-red-400 hover:text-red-300 hover:bg-red-500/20 rounded-full transition-all"
                >
                  <X className="w-3 h-3" />
                </button>
                <div className="h-20 w-full rounded-xl overflow-hidden bg-black border border-white/5">
                  <CarImage model={car.model} alt={car.model} className="w-full h-full object-cover" />
                </div>
                <h4 className="font-semibold text-sm text-white font-sans tracking-tight truncate">
                  {car.model}
                </h4>
                <p className="text-[10px] font-mono text-cyan-400 uppercase tracking-wider">{car.category}</p>
              </div>

              {/* Specifications comparative values */}
              <div className="space-y-3 pt-3 border-t border-white/5 text-xs">
                <div>
                  <p className="text-[9px] uppercase tracking-widest text-white/35 font-mono">Base MSRP</p>
                  <p className="font-semibold text-white font-mono">${car.price.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-[9px] uppercase tracking-widest text-white/35 font-mono">Monthly Installment</p>
                  <p className="font-semibold text-yellow-400 font-mono">${car.monthlyFinance}/mo</p>
                </div>
                <div>
                  <p className="text-[9px] uppercase tracking-widest text-white/35 font-mono">Zero to Sixty</p>
                  <p className="font-medium text-white">{car.specs?.acceleration || "N/A"}</p>
                </div>
                <div>
                  <p className="text-[9px] uppercase tracking-widest text-white/35 font-mono">Range Mile Limit</p>
                  <p className="font-medium text-white">{car.range} mi</p>
                </div>
                <div>
                  <p className="text-[9px] uppercase tracking-widest text-white/35 font-mono">Top Velocity</p>
                  <p className="font-medium text-white">{car.specs?.topSpeed || "N/A"}</p>
                </div>
                <div>
                  <p className="text-[9px] uppercase tracking-widest text-white/35 font-mono">Battery capacity</p>
                  <p className="font-medium text-white truncate">{car.specs?.batteryKwh || "N/A"}</p>
                </div>
              </div>

              {/* Order buttons */}
              <button
                type="button"
                onClick={() => onInvestTrigger(car)}
                className="w-full py-2 bg-white hover:bg-white/90 text-black font-semibold text-[10px] rounded-lg tracking-wider uppercase transition-all duration-300"
              >
                Secure
              </button>
            </div>
          ))}

          {/* Placeholders for comparing additional cars */}
          {comparedCars.length < 3 &&
            Array.from({ length: 3 - comparedCars.length }).map((_, i) => (
              <div
                key={i}
                className="border border-dashed border-white/10 rounded-2xl flex flex-col items-center justify-center py-20 text-center bg-transparent text-white/10"
              >
                <Sparkles className="w-6 h-6 mb-2" />
                <span className="text-[10px] font-mono uppercase tracking-widest text-white/30">Add model</span>
              </div>
            ))}
        </div>
      </div>

      {/* Footer message */}
      <div className="p-6 bg-[#111] border-t border-white/5 text-center">
        <p className="text-white/40 text-[10px] font-mono uppercase tracking-widest">
          BYD Premium e-Platform 3.0 Standardized benchmarks
        </p>
      </div>
    </div>
  );
};
