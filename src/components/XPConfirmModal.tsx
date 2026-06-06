import React from "react";
import { playClickSound } from "../utils/sound";

interface XPConfirmModalProps {
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export const XPConfirmModal: React.FC<XPConfirmModalProps> = ({
  title,
  message,
  onConfirm,
  onCancel,
}) => {
  const handleConfirmClick = () => {
    playClickSound();
    onConfirm();
  };

  const handleCancelClick = () => {
    playClickSound();
    onCancel();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs select-none">
      {/* XP Window Frame */}
      <div 
        className="w-[360px] bg-[#ECE9D8] border-[3.5px] border-[#0054E3] rounded-t-lg shadow-2xl flex flex-col font-sans text-xs text-black"
        style={{
          boxShadow: "0 12px 30px -5px rgba(0, 0, 0, 0.5)",
          borderRadius: "7px 7px 0 0",
        }}
      >
        {/* XP Title Bar */}
        <div 
          className="h-[30px] flex items-center justify-between px-2 rounded-t-sm"
          style={{
            background: "linear-gradient(to right, #0058E6 0%, #3A93FF 12%, #0058E6 100%)",
            borderBottom: "1.5px solid #002D96",
            boxShadow: "inset 0 1px 0 rgba(255,255,255,0.4)",
          }}
        >
          {/* Title Text & Icon */}
          <div className="flex items-center gap-1.5 font-bold text-white text-[11.5px] select-none" style={{ textShadow: "1px 1px 1px #002D96" }}>
            <span className="text-[13px] filter drop-shadow-[1px_1px_0px_#000]">⚠️</span>
            <span>{title}</span>
          </div>
          
          {/* XP Close Button */}
          <button
            onClick={handleCancelClick}
            className="w-[21px] h-[21px] rounded-[3px] border border-[#002D96] flex items-center justify-center text-white font-bold text-[11px] shadow-[inset_-1px_-1px_1px_rgba(0,0,0,0.25),inset_1px_1px_1px_rgba(255,255,255,0.25)] hover:brightness-110 active:brightness-90 cursor-pointer transition-all duration-100"
            style={{
              background: "linear-gradient(135deg, #FF6C47 0%, #EC2800 100%)",
            }}
          >
            ✕
          </button>
        </div>

        {/* XP Dialog Content */}
        <div className="p-5 flex gap-4 items-start bg-[#ECE9D8]">
          {/* Warning Icon (Classic XP Warning Exclamation mark) */}
          <div className="shrink-0 drop-shadow-[1px_1px_1px_rgba(0,0,0,0.15)]">
            <svg width="34" height="34" viewBox="0 0 32 32" fill="none">
              <circle cx="16" cy="16" r="14" fill="#F4B400" />
              <circle cx="15.5" cy="15.5" r="13" fill="#FFD043" />
              <circle cx="15.5" cy="15.5" r="11" fill="#FFE682" />
              <path d="M15.5 8.5 V17.5" stroke="#000000" strokeWidth="2.5" strokeLinecap="round" />
              <circle cx="15.5" cy="21.5" r="1.8" fill="#000000" />
            </svg>
          </div>

          {/* Message Text */}
          <div className="flex-1 font-mono text-[11.5px] leading-relaxed text-[#000000] pt-0.5 select-text">
            {message}
          </div>
        </div>

        {/* XP Button Area */}
        <div className="px-5 pb-5 flex justify-end gap-2.5 bg-[#ECE9D8] select-none">
          {/* Yes / OK Button */}
          <button
            onClick={handleConfirmClick}
            className="w-[75px] h-[23px] rounded-[3px] flex items-center justify-center font-bold text-[11px] hover:brightness-95 active:brightness-90 cursor-pointer relative"
            style={{
              background: "linear-gradient(to bottom, #FFFFFF 0%, #ECE9D8 100%)",
              border: "1px solid #0054E3",
              boxShadow: "inset -1px -1px 1px #808080, inset 1px 1px 1px #FFFFFF, 1px 1px 1px rgba(0,0,0,0.15)",
            }}
          >
            <span className="absolute inset-[2.5px] border border-dashed border-[#808080]/60 rounded-[1px] pointer-events-none" />
            Có
          </button>
          
          {/* No / Cancel Button */}
          <button
            onClick={handleCancelClick}
            className="w-[75px] h-[23px] rounded-[3px] flex items-center justify-center font-bold text-[11px] hover:brightness-95 active:brightness-90 cursor-pointer relative"
            style={{
              background: "linear-gradient(to bottom, #FFFFFF 0%, #ECE9D8 100%)",
              border: "1px solid #707070",
              boxShadow: "inset -1px -1px 1px #808080, inset 1px 1px 1px #FFFFFF, 1px 1px 1px rgba(0,0,0,0.15)",
            }}
          >
            Không
          </button>
        </div>
      </div>
    </div>
  );
};

export default XPConfirmModal;
