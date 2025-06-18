import React from "react";

const Stepper = ({ steps, currentStep }) => {
  return (
    <div className="flex items-center justify-between relative mb-6 px-2">
      {steps.map((step, index) => {
        const isCompleted = index < currentStep;
        const isActive = index === currentStep;
        const baseSize = isActive ? "w-10 h-10" : "w-6 h-6";

        {index < steps.length - 1 && (
                        <div className="absolute top-1/2 left-full w-[calc(100%+1rem)] h-0.5">
                          <div
                            className={`h-full bg-green-400 transition-all duration-500 origin-left
                              ${isCompleted ? "w-full" : "w-0"}`}
                          ></div>
                        </div>
                      )}

        return (
          <div key={index} className="flex-1 flex flex-col items-center relative">
            <div
              className={`rounded-full ${baseSize} mb-1 flex items-center justify-center transition-all duration-300
                ${isCompleted || isActive ? "bg-green-400" : "bg-gray-400"}`}
            ></div>
            <div className="text-xs text-white text-center">{step}</div>

            {/* Connector line */}
                    {index < steps.length - 1 && (
                      <div className="absolute top-[12px] left-1/2 w-full h-0.5">
                        <div
                          className={`bg-green-400 transition-all duration-500 ease-out origin-left h-full
                            ${isCompleted ? "w-full" : "w-0"}`}
                        ></div>
                      </div>
                    )}
          </div>
        );
      })}
    </div>
  );
};

export default Stepper;